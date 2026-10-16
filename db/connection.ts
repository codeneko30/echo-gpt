
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = 'postgresql://neondb_owner:npg_PfRYb4xhXBl2@ep-little-violet-b3czv514-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = postgres(connectionString);
export const db = drizzle(client, { schema })
