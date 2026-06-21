/**
 * Steps for Database Connection:
 * 1. Import necessary Prisma and PostgreSQL connection modules.
 * 2. Create a new PostgreSQL connection pool using the DATABASE_URL environment variable.
 * 3. Initialize the Prisma Pg adapter with the connection pool.
 * 4. Instantiate the Prisma Client using the initialized adapter.
 * 5. Define an async connectDB function to establish and verify the database connection.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connection established successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};