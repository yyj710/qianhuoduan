import serverless from 'serverless-http';
import { app } from './backend/dist/app.js';

export const handler = serverless(app);
