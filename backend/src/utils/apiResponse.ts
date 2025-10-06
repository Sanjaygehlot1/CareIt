export class apiResponse{

    data : any;
    message : string;
    statusCode : number;
    success : boolean

    constructor(data : any, message : string = "", statusCode : number){
            this.data = data,
            this.message = message,
            this.statusCode = statusCode,
            this.success = statusCode < 400
            
    }
}