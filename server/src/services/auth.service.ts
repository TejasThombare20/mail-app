import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from '../repository/user.repository';
import { IUser } from '../types/users.types';
import { auth } from '../config/firebase-config';
import { DecodedIdToken } from "firebase-admin/auth";
import { TokenRepository } from '../repository/token.repository';
import { IGoogleUserInfo } from '../types/auth.types';



export class AuthService {
  private oauth2Client: OAuth2Client;

  constructor(private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {
    this.oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
  }
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose'
      ],
      prompt: 'consent' // Force to show consent screen to get refresh_token
    });


  }

  async handleGoogleCallback(code: string): Promise<{ user: IUser; token: string }> {
    // Exchange code for tokens
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens); 
    const userInfo = await this.getUserInfo(tokens.access_token!);

    let user = await this.userRepository.findUserByEmail(userInfo.email);
    
    if (!user) {

      user = await this.userRepository.createUser({
        email: userInfo?.email,
        name: userInfo?.name,
        picture: userInfo?.picture,
        id :userInfo?.id
      }); 

      await this.tokenRepository.saveUserToken(
        user.id,
        tokens.access_token!,
        new Date(tokens.expiry_date!),
        tokens.refresh_token!
      ); 
    }

    // Generate JWT for API authentication
    const jwtToken = this.generateJWT(user);
    
    console.log("jwt token generated", jwtToken)

    return { user, token: jwtToken };
  }

  private async getUserInfo(accessToken: string): Promise<IGoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  async refreshAccessToken(userId: string): Promise<string> {
    const userToken = await this.tokenRepository.getUserToken(userId);
    if (!userToken?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      this.oauth2Client.setCredentials({
        refresh_token: userToken.refresh_token
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Update tokens in database
      await this.tokenRepository.saveUserToken(
        userId,
        credentials.access_token!,
        new Date(credentials.expiry_date!),
        userToken.refresh_token // Keep existing refresh token
      );

      return credentials.access_token!;
    } catch (error) {
      throw new Error('Failed to refresh access token');
    }
  }


  async verifyFirebaseToken(token: string): Promise<DecodedIdToken> {
    const data = await auth.verifyIdToken(token);
    console.log("data",data)
    return data
  }

  async handleGoogleSignIn(firebaseUser: DecodedIdToken ,code : string): Promise<{ user: IUser; token: string }> {
    console.log("HelLo")
    let user = await this.userRepository.findUserByEmail(firebaseUser.email!);

    const { tokens } = await this.oauth2Client.getToken(code);
    console.log("Hello2")
    if (!user) {
      console.log("Hello3 ")
      
      console.log("token", tokens)
      
      user = await this.userRepository.createUser({
        email: firebaseUser.email!,
        name: firebaseUser.name!,
        picture: firebaseUser.picture,
        id : firebaseUser?.uid

      });

       // Store Google tokens
    await this.tokenRepository.saveUserToken(
      user?.id,
      tokens?.access_token!,
      new Date(tokens.expiry_date!),
      tokens?.refresh_token!
    );
    }

    const token = this.generateJWT(user);

    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 1 hour
    // console.log({userId : user.id, token : firebaseUser?.accessToken, tokenExpiry, refreshToken :firebaseUser?.refreshToken  })
    // await this.tokenRepository.saveUserToken(
    //   user?.id,
    //   firebaseUser?.accessToken!, // Firebase token includes Google access token
    //   tokenExpiry,
    //   firebaseUser?.refreshToken
    // );
    console.log("hello4")
    return { user, token };

  }

  private generateJWT(user: IUser): string {
    return jwt.sign(
      { userId: user?.id, email: user?.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  }
}