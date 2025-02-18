import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  // router.post('/google-signin', authController.googleSignIn);
  router.get('/google/url', authController.getAuthUrl);
  router.get('/google/callback', authController.handleCallback);

  return router;
};