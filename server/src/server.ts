import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool, { connectDB } from './config/database';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { createAuthRouter } from './routes/auth.routes';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());


 connectDB();

 const userRepository = new UserRepository(pool);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express Server');
});
app.use('/api/auth', createAuthRouter(authController));

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`mail-app server is running at http://localhost:${port}`);
});