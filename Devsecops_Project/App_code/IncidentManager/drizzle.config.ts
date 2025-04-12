import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();
console.log("DATABASE_URL =", process.env.DATABASE_URL); 

export default defineConfig({
  schema: './shared/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
