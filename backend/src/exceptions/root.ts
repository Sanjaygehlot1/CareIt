export class HttpExceptions extends Error {
    errorCode: ErrorCodes;
    message: string;
    statusCode: number;
    errors: any

    constructor(errorCode: ErrorCodes, message: string, statusCode: number, errors: any) {
        super(message)
        this.errorCode = errorCode
        this.message = message
        this.statusCode = statusCode
        this.errors = errors


    }

}

export enum ErrorCodes {
    USER_NOT_FOUND = 1001,
    INVALID_CREDENTIALS = 1002,
    USER_ALREADY_EXISTS = 1003,
    UNAUTHORIZED_ACCESS = 401,
    BAD_REQUEST = 301

}