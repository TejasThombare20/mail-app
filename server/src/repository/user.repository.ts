import { Pool } from 'pg';
import { ICreateUser, IUser } from '../types/users.types';


export class UserRepository {
  constructor(private pool: Pool) {}

  async createUser(userData: ICreateUser): Promise<IUser> {
    const query = `
      INSERT INTO users (email, name, picture , id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [userData.email, userData.name, userData.picture , userData.id];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    console.log({email})
    if (!email) {
      return null;
    }
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.pool.query(query, [email]);
    return result.rows[0] || null;
  }
}
