import { Request, Response, NextFunction } from 'express'
import { UnauthorizedException } from '../../exceptions/errorExceptions';
import { ErrorCodes } from '../../exceptions/root';
import { calendar_v3, google } from 'googleapis';
import { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../secrets';
import { apiResponse } from '../../utils/apiResponse';
import { Octokit } from '@octokit/rest';

type AuthType = {
    googleRefreshToken?: string | null;
    githubAccessToken?: string | null;
}



interface FreeBlock {
    start: Date;
    end: Date;
    durationMinutes: number;
}

export const calculateFocusPoints = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { day }: any = req.query;
        const user = req.user as AuthType;


        if (!user || !user.googleRefreshToken) {
            next(new UnauthorizedException("Invalid user", ErrorCodes.UNAUTHORIZED_ACCESS))
        }

        const OAuth2 = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_CALLBACK_URL
        )

        OAuth2.setCredentials({
            refresh_token: user.googleRefreshToken
        })

        const timeMin = new Date(day);
        timeMin.setHours(0, 0, 0, 0);

        const timeMax = new Date(timeMin);
        timeMax.setDate(timeMin.getDate() + 1);

        const calendar = google.calendar({ version: "v3", auth: OAuth2 });

        let pageToken: any = null;
        let allEvents: calendar_v3.Schema$Event[] = [];

        do {
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                maxResults: 1000,
                singleEvents: true,
                orderBy: 'startTime',
                pageToken: pageToken,
                fields: 'nextPageToken,items(id, summary, start, end)'
            });

            console.log("Response::", response)

            allEvents = allEvents.concat(response.data.items || []);
            pageToken = response.data.nextPageToken!;
        } while (pageToken);

        const startTime = new Date(day);
        startTime.setHours(0, 0, 0, 0);

        const endTime = new Date(day);
        endTime.setHours(23, 0, 0, 0);

        let freeBlocks: FreeBlock[] = [];
        let lastEventEndTime = startTime;

        allEvents.forEach(event => {
            const start = new Date(event.start?.dateTime!);
            if (start < lastEventEndTime) {
                freeBlocks.push({
                    start: lastEventEndTime,
                    end: start,
                    durationMinutes: (start.getTime() - lastEventEndTime.getTime()) / 60000

                })
            }

            lastEventEndTime = new Date(event.end?.dateTime!);

        });

        if (endTime > lastEventEndTime) {
            freeBlocks.push({
                start: lastEventEndTime,
                end: endTime,
                durationMinutes: (endTime.getTime() - lastEventEndTime.getTime()) / 60000,
            });
        }

        const octoKit = new Octokit({ auth: user.githubAccessToken })

        
    } catch (error) {
        console.error(error);
        next(error);
    }

}