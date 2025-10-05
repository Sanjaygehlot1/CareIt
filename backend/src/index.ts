import express from 'express';
import type {Express, NextFunction, Request, Response} from 'express'
import {prisma} from './prisma'
import { PORT } from './secrets';
import { BadRequestExceptions } from './exceptions/errorExceptions';
import { ErrorCodes, HttpExceptions } from './exceptions/root';
import { errorMiddleware } from './middlewares/errors.middleware';


const app : Express = express();



app.get('/',  async (req: Request, res: Response, next: NextFunction) => {
  
});



app.use(errorMiddleware)


app.listen(PORT, ()=>{
    console.log('Server is running on port 3000')
})