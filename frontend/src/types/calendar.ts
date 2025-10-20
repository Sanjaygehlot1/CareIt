export type Events =
    {
        id: string,
        summary: string,
        created: Date,
        updated: Date,
        description: string,
        location: string,
        creator: { email: string, self?: boolean },
        start: { date: Date, dateTime: Date },
        end: { date: Date, dateTime: Date },
        colorId: string
    }

export interface ExtendedEvents extends Events {
    conferenceData: {
        conferenceId: string,
        conferenceSolution: {
            iconUri: string,
            name: 'string'
        },
        
    },
    hangoutLink: string,
    status: 'confirmed' | 'rejected' | 'pending',
    attachments: [
        {
            fileId: string,
            fileUrl: string,
            iconUrl: string,
            title: string
      ,
      }
    ],
    source : {
        url : string
    },
    attendees : [{
        email : string
    }]

}
