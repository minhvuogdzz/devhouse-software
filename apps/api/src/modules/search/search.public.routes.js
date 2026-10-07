import { Router } from 'express';
import { searchController } from './search.controller.js';

export const searchPublicRoutes = Router();

searchPublicRoutes.get('/', searchController.universalSearch);
searchPublicRoutes.post('/ai', searchController.aiSearch);
searchPublicRoutes.get('/ai', searchController.aiSearch);
searchPublicRoutes.post('/chat', searchController.aiChat);

