import { Pool } from "pg";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432, 
});


export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    logger.info("PostgreSQL connected successfully!");
    client.release();
  } catch (err) {
    logger.error("Error connecting to PostgreSQL:", err);
    process.exit(1); 
  }
};

export default pool;
