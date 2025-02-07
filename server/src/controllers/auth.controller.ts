import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';


export class AuthController {
  constructor(private authService: AuthService) {}

  googleSignIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'Firebase token is required' });
        return;
      }

      const firebaseUser = await this.authService.verifyFirebaseToken(token);
      const result = await this.authService.handleGoogleSignIn(firebaseUser);

      res.status(200).json(result);
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  };
}