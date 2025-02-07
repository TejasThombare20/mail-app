export interface IUser {
    id: string;
    email: string;
    name: string;
    picture?: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface ICreateUser {
    email: string;
    name: string;
    picture?: string;
  }