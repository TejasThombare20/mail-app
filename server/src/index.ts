import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

 connectDB();

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express Server');
});

app.listen(port, () => {
  console.log(`mail-app server is running at http://localhost:${port}`);
});