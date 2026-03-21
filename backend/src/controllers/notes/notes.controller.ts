import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../../exceptions/errorExceptions';
import { ErrorCodes } from '../../exceptions/root';
import { prisma } from '../../prisma';
import { apiResponse } from '../../utils/apiResponse';

export const getNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const notes = await prisma.note.findMany({
            where: { userId: user.id },
            orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        });

        return res.status(200).json(new apiResponse(notes, 'Notes retrieved', 200));
    } catch (error) {
        next(error);
    }
};

export const createNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const { title, content } = req.body;

        const note = await prisma.note.create({
            data: {
                userId: user.id,
                title: title || 'Untitled',
                content: content || '',
            },
        });

        return res.status(201).json(new apiResponse(note, 'Note created', 201));
    } catch (error) {
        next(error);
    }
};

export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const { id } = req.params;
        const { title, content, isPinned } = req.body;

        const existing = await prisma.note.findFirst({ where: { id: Number(id), userId: user.id } });
        if (!existing) return res.status(404).json(new apiResponse({}, 'Note not found', 404));

        const updated = await prisma.note.update({
            where: { id: Number(id) },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...(isPinned !== undefined && { isPinned }),
            },
        });

        return res.status(200).json(new apiResponse(updated, 'Note updated', 200));
    } catch (error) {
        next(error);
    }
};

export const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any;
        if (!user) return next(new UnauthorizedException('Unauthorized', ErrorCodes.UNAUTHORIZED_ACCESS));

        const { id } = req.params;
        const existing = await prisma.note.findFirst({ where: { id: Number(id), userId: user.id } });
        if (!existing) return res.status(404).json(new apiResponse({}, 'Note not found', 404));

        await prisma.note.delete({ where: { id: Number(id) } });

        return res.status(200).json(new apiResponse({}, 'Note deleted', 200));
    } catch (error) {
        next(error);
    }
};
