import { Router } from 'express';
import { getSessionsHandler } from '../controllers/session.controller';

const sessionRoutes = Router();

sessionRoutes.get('/', getSessionsHandler);

export default sessionRoutes;
