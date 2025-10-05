import { ErrorCodes, HttpExceptions } from "./root";

export class BadRequestExceptions extends HttpExceptions {
    constructor(message : string, errorCode : ErrorCodes){
        super(errorCode, message, 400, null)
       
    }
}

export class NotFoundException extends HttpExceptions {
    constructor(message : string, errorCode : ErrorCodes){
        super(errorCode, message, 404, null)
       
    }
}

export class UnauthorizedException extends HttpExceptions {
    constructor(message : string, errorCode : ErrorCodes){
        super(errorCode, message, 401, null)
       
    }
}

export class ForbiddenException extends HttpExceptions {
    constructor(message : string, errorCode : ErrorCodes){
        super(errorCode, message, 403, null)
       
    }
}

export class InternalServerError extends HttpExceptions {
    constructor(message : string, errorCode : ErrorCodes){
        super(errorCode, message, 500, null)
       
    }
}