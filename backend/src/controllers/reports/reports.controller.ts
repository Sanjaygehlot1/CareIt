import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException, BadRequestExceptions } from '../../exceptions/errorExceptions';
import { ErrorCodes } from '../../exceptions/root';
import { calendar_v3, google } from 'googleapis';
import { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../secrets';
import { apiResponse } from '../../utils/apiResponse';
import { Octokit } from '@octokit/rest';


type AuthType = {
    id: string;
    googleRefreshToken?: string | null;
    githubAccessToken?: string | null;
    githubUsername?: string | null;
};

interface FreeBlock {
    start: Date;
    end: Date;
    durationMinutes: number;
    commits: CommitInfo[];
    score: number;
    contextSwitches: number;
    repositories: Set<string>;
}

interface CommitInfo {
    timestamp: Date;
    repository: string;
}

export const calculateFocusPoints = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { day } = req.query;
        const user = req.user as AuthType;

        if (!day || typeof day !== 'string' || isNaN(Date.parse(day))) {
            return next(new BadRequestExceptions("A valid 'day' query parameter (YYYY-MM-DD) is required.", ErrorCodes.BAD_REQUEST));
        }
        if (!user) {
            return next(new UnauthorizedException("User not authenticated.", ErrorCodes.UNAUTHORIZED_ACCESS));
        }
        if (!user.googleRefreshToken && !user.githubAccessToken) {
            return next(new BadRequestExceptions("Connect Google Calendar or GitHub to calculate focus.", ErrorCodes.BAD_REQUEST));
        }


        const timeMin = new Date(day);
        timeMin.setHours(0, 0, 0, 0);
        const timeMax = new Date(timeMin);
        timeMax.setDate(timeMin.getDate() + 1); 
        // Define Workday Boundaries (e.g., 9 AM to 5 PM - adjust as needed)
        const workDayStart = new Date(day);
        workDayStart.setHours(9, 0, 0, 0);
        const workDayEnd = new Date(day);
        workDayEnd.setHours(17, 0, 0, 0);


        let allEvents: calendar_v3.Schema$Event[] = [];
        let response: any = null;
        if (user.googleRefreshToken) {
            const OAuth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);
            OAuth2.setCredentials({ refresh_token: user.googleRefreshToken });
            const calendar = google.calendar({ version: "v3", auth: OAuth2 });
            let pageToken: string | null | undefined = null;
            do {
                try {
                    response = await calendar.events.list({
                        calendarId: 'primary',
                        timeMin: timeMin.toISOString(),
                        timeMax: timeMax.toISOString(),
                        maxResults: 250,
                        singleEvents: true,
                        orderBy: 'startTime',
                        pageToken: pageToken!,
                        fields: 'nextPageToken,items(id, summary, start, end)'
                    });
                    allEvents = allEvents.concat(response.data.items || []);
                    pageToken = response.data.nextPageToken;
                } catch (calendarError) {
                    console.warn("Could not fetch Google Calendar events:", calendarError);
                    pageToken = null; // Stop pagination on error
                }
            } while (pageToken);
        } else {
            console.log("Google Refresh Token not found, skipping calendar fetch.");
        }

        const sortedEvents = allEvents
            .filter(event => event.start?.dateTime && event.end?.dateTime) // Filter out all-day events without specific times
            .map(event => ({
                start: new Date(event.start!.dateTime!),
                end: new Date(event.end!.dateTime!),
            }))
            .sort((a, b) => a.start.getTime() - b.start.getTime());

        let freeBlocks: FreeBlock[] = [];
        let lastEventEndTime = workDayStart; // Start tracking from the beginning of the workday

        sortedEvents.forEach(event => {
            // Ensure the event starts after the last known busy time and within the workday
            if (event.start > lastEventEndTime && event.start < workDayEnd) {
                const blockEnd = event.start > workDayEnd ? workDayEnd : event.start; // Cap block at workday end
                if (blockEnd > lastEventEndTime) { // Ensure block has positive duration
                    freeBlocks.push({
                        start: lastEventEndTime,
                        end: blockEnd,
                        durationMinutes: Math.round((blockEnd.getTime() - lastEventEndTime.getTime()) / 60000),
                        commits: [], score: 0, contextSwitches: 0, repositories: new Set()
                    });
                }
            }
            // Update the last known busy time, but don't go past workday end
            lastEventEndTime = event.end > lastEventEndTime ? (event.end > workDayEnd ? workDayEnd : event.end) : lastEventEndTime;
        });

        // Add the final block from the last event's end to the workday end
        if (workDayEnd > lastEventEndTime) {
            freeBlocks.push({
                start: lastEventEndTime,
                end: workDayEnd,
                durationMinutes: Math.round((workDayEnd.getTime() - lastEventEndTime.getTime()) / 60000),
                commits: [], score: 0, contextSwitches: 0, repositories: new Set()
            });
        }

        freeBlocks = freeBlocks.filter(block => block.durationMinutes >= 15);


        let allCommits: CommitInfo[] = [];
        if (user.githubAccessToken && user.githubUsername) {
            console.log("ACCESSTOKEN::", user.githubAccessToken)
            const octokit = new Octokit({ auth: user.githubAccessToken });
            try {
                const { data: repos } = await octokit.repos.listForAuthenticatedUser({
                    sort: 'pushed',
                    per_page: 100, 
                });

                for (const repo of repos) {
                    // Fetch commits for this repo within the specified day
                    // Use `listCommits` which seems more appropriate than iterating through events
                    const { data: commits } = await octokit.repos.listCommits({
                        owner: repo.owner.login,
                        repo: repo.name,
                        author: user.githubUsername,
                        since: timeMin.toISOString(),
                        until: timeMax.toISOString(), // Use 'until' for the end date
                    });

                    commits.forEach(commit => {
                        if (commit.commit.author?.date) {
                            allCommits.push({
                                timestamp: new Date(commit.commit.author.date),
                                repository: repo.name // Store repo name
                            });
                        }
                    });
                }
                // Sort commits chronologically
                allCommits.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            } catch (githubError) {
                console.warn("Could not fetch GitHub data:", githubError);
                // Proceed without GitHub data if it fails
            }
        } else {
            console.log("GitHub Token or Username not found, skipping commit fetch.");
        }


        // --- 6. Assign Commits to Free Blocks ---
        allCommits.forEach(commit => {
            for (const block of freeBlocks) {
                if (commit.timestamp >= block.start && commit.timestamp < block.end) {
                    block.commits.push(commit);
                    block.repositories.add(commit.repository); // Track unique repos
                    break; // Assign commit to the first matching block
                }
            }
        });


        // --- 7. Calculate Score for Each Block ---
        const CONTEXT_SWITCH_PENALTY = 0.20; // 20% penalty
        freeBlocks.forEach(block => {
            if (block.durationMinutes > 0) {
                // Base score (reward longer blocks exponentially)
                let baseScore = Math.pow(block.durationMinutes, 1.2);

                // Check for context switches only if there are commits
                if (block.commits.length > 0) {
                    block.contextSwitches = block.repositories.size - 1; // Switches = unique repos - 1
                    if (block.contextSwitches > 0) {
                        baseScore *= (1 - CONTEXT_SWITCH_PENALTY);
                    }
                } else {
                    // Optional: Penalize blocks with no commits? Or give zero score?
                    baseScore = 0; // Or adjust as needed - maybe a small score for just being free?
                }


                block.score = Math.round(baseScore);
            } else {
                block.score = 0;
            }
        });

        // --- 8. Calculate Total Score and Prepare Response ---
        const totalScore = freeBlocks.reduce((sum, block) => sum + block.score, 0);

        const getQualityLabel = (score: number) => {
            if (score > 300) return 'Deep Focus';
            if (score > 150) return 'Productive Flow';
            if (score > 0) return 'Light Work';
            return 'Scattered';
        };

        const responsePayload = {
            date: day,
            score: totalScore,
            qualityLabel: getQualityLabel(totalScore),
            analysis: {
                totalFocusMinutes: freeBlocks.reduce((sum, block) => sum + block.durationMinutes, 0),
                totalMeetingMinutes: sortedEvents.reduce((sum, event) => sum + (event.end.getTime() - event.start.getTime()) / 60000, 0),
                focusBlockCount: freeBlocks.length,
                totalCommits: allCommits.length,
                contextSwitches: freeBlocks.reduce((sum, block) => sum + block.contextSwitches, 0),
            },
            // Optional: Include detailed blocks in response for frontend visualization
            // blocks: freeBlocks.map(b => ({ start: b.start, end: b.end, duration: b.durationMinutes, score: b.score, commits: b.commits.length, repos: Array.from(b.repositories) }))
        };

        res.status(200).json(new apiResponse(responsePayload, "Focus score calculated successfully", 200));

    } catch (error) {
        console.error("Error in calculateFocusPoints:", error);
        next(error);
    }
};