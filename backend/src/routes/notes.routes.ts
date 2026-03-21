import { Router } from 'express';
import { authMiddleWare } from '../middlewares/auth.middleware';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/notes/notes.controller';

export const router: Router = Router();

router.get('/', authMiddleWare, getNotes);
router.post('/', authMiddleWare, createNote);
router.patch('/:id', authMiddleWare, updateNote);
router.delete('/:id', authMiddleWare, deleteNote);
