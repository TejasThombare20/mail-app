import jwt from 'jsonwebtoken';
import { UserRepository } from '../repository/user.repository';
import { IUser } from '../types/users';
import { auth } from '../config/firebase-config';
import { DecodedIdToken } from "firebase-admin/auth";


export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async verifyFirebaseToken(token: string): Promise<DecodedIdToken> {
    return await auth.verifyIdToken(token);
  }

  async handleGoogleSignIn(firebaseUser: DecodedIdToken): Promise<{ user: IUser; token: string }> {
    console.log("HelLo")
    let user = await this.userRepository.findUserByEmail(firebaseUser.email!);
    console.log("Hello2")
    if (!user) {
      user = await this.userRepository.createUser({
        email: firebaseUser.email!,
        name: firebaseUser.name!,
        picture: firebaseUser.picture
      });
    }

    const token = this.generateJWT(user);
    return { user, token };
  }

  private generateJWT(user: IUser): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  }
}