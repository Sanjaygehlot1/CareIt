import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../../exceptions/errorExceptions';
import { ErrorCodes } from '../../exceptions/root';
import { google } from 'googleapis';
import { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../secrets';
import { apiResponse } from '../../utils/apiResponse';

export const getCalendarEvents = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const user = req.user as any;

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
        });

        let pageToken : any = null;
        let allEvents : any = [];

        const calendar = google.calendar({ version: "v3", auth: OAuth2 })

        const now = new Date;
        const oneYearBefore = new Date(now).setFullYear(now.getFullYear() - 1)
        const oneYearAfter = new Date(now).setFullYear(now.getFullYear() + 1)

       do {
         const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            timeMax: new Date(oneYearAfter).toISOString(),
            maxResults: 1000,
            singleEvents: true,
            orderBy: 'startTime',
            pageToken : pageToken,
            fields : 'nextPageToken,items(id,summary,description,location,start,end,creator,organizer,attendees,status,hangoutLink,conferenceData,colorId,recurrence,transparency,attachments,source,extendedProperties)'
        });


        allEvents = allEvents.concat(response.data.items);
        pageToken = response.data.nextPageToken!;
       } while (pageToken);

        res.status(200).json(new apiResponse(
            allEvents,
            "Events Fetched successfully",
            200
        ));
    } catch (error: any) {
        console.error("Failed to fetch calendar events", error);
        next(error);
    }
}