import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pool, { connectDB } from './config/database';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { createAuthRouter } from './routes/auth.routes';
import { TokenRepository } from './repository/token.repository';
import { TemplateRepository } from './repository/template.repository';
import { TemplateService } from './services/template.service';
import { EmailService } from './services/email.service';
import { TemplateController } from './controllers/templelate.controller';
import { createTemplateRouter } from './routes/template.routes';
import { HistoryRepository } from './repository/history.repository';
import { createAttachmentRouter } from './routes/attachments.routes';
import { AttachmentController } from './controllers/attachment.controller';
import { AttachmentService } from './services/attachment.service';
import { AttachmentRepository } from './repository/attachment.repository';
import { MediaStorage } from './config/media-storage';
import { EmailController } from './controllers/email.controller';
import { createEmailRouter } from './routes/email.routes';
import { LogHistoryService } from './services/LogHistory.service';
import { LogHistoryController } from './controllers/logHistory.controller';
import { createLogHistoryRouter } from './routes/logHistory.routes';

dotenv.config();

const app: Application = express();


app.use(cookieParser());
app.use(cors({
  origin : process.env.CLIENT_URL,
  credentials: true, 
  
}));
app.use(express.json());


connectDB();

const firebaseStorage = new MediaStorage();

 const userRepository = new UserRepository(pool);
 const tokenRepository = new TokenRepository(pool);
 const templateRepository = new TemplateRepository(pool);
 const historyRepository = new HistoryRepository(pool)
 const attachmentsRepository = new AttachmentRepository(pool)
 const logHistoryRepository = new HistoryRepository(pool)

const authService = new AuthService(userRepository, tokenRepository);
const templateService = new TemplateService(templateRepository,attachmentsRepository);
const attachmentService = new AttachmentService(attachmentsRepository ,firebaseStorage);
const emailService = new EmailService(tokenRepository, templateRepository,historyRepository,attachmentsRepository,attachmentService );
const logHistoryService = new LogHistoryService(logHistoryRepository)


const authController = new AuthController(authService);
const templateController = new TemplateController(templateService, emailService, attachmentService);
const attachmentController = new AttachmentController(attachmentService);
const emailController = new EmailController(emailService)
const logHistoryController = new LogHistoryController(logHistoryService)



app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express Server');
});


app.use('/api/auth', createAuthRouter(authController));
app.use('/api/templates', createTemplateRouter(templateController));
app.use('/api/files',createAttachmentRouter(attachmentController))
app.use('/api/email',createEmailRouter(emailController))
app.use('/api/loghistory', createLogHistoryRouter(logHistoryController))

const port = process.env.PORT || 8000;
  app.listen(port, () => {
  console.log(`mail-app server is running at http://localhost:${port}`);
});