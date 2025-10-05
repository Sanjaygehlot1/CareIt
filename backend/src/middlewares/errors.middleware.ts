import { NextFunction, Request, Response } from "express";
import { HttpExceptions } from "../exceptions/root";

export const errorMiddleware = (error : HttpExceptions, req : Request, res : Response, next : NextFunction) =>{
    res.status(error.statusCode || 500).json({
        message : error.message,
        errorCode : error.errorCode,
        errors : error.errors
        
    })
}