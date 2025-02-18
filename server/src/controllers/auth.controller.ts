import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  getAuthUrl = (req: Request, res: Response): void => {
    try {
      const url = this.authService.getAuthUrl();
      res.json({ url });
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Failed to get authorization URL" });
    }
  };

handleCallback = async (req: Request, res: Response): Promise<void> => {
    try {

      const { code } = req.query;

      if (!code || typeof code !== "string") {
        res.status(400).json({ error: "Authorization code required" });
        return;
      }

      const { token: JWT_token } = await this.authService.handleGoogleCallback(
        code
      );

      res.cookie("auth_token", JWT_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      res.redirect("http://localhost:3000/dashboard");
      // res.json(result);
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  };

  // googleSignIn = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { token } = req.body;

  //     if (!token) {
  //       res.status(400).json({ error: 'Firebase token is required' });
  //       return;
  //     }

  //     const firebaseUser = await this.authService.verifyFirebaseToken(token);
  //     const { user, token:JWTtoken } = await this.authService.handleGoogleSignIn(firebaseUser ,token );

  //     res.cookie("auth_token", JWTtoken, {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       sameSite: "strict",
  //       maxAge: 24 * 60 * 60 * 1000
  //     });
  //     res.status(200).json({ user, JWTtoken });
  //   } catch (error) {
  //     console.error('Auth error:', error);
  //     res.status(500).json({ error: 'Authentication failed' });
  //   }
  // };
}
