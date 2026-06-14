import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config()

const postgresURI = process.env.DATABASE_URL
export const pool = new Pool({
    connectionString: postgresURI,
    ssl: {
        rejectUnauthorized: false, // required for Neon
    },
})
pool.connect()
    .then(() => {
        console.log("POOL CONNECTED SUCCESSFULLY");
    })
    .catch((err) => {
        console.error("DATABASE CONNECTION ERROR:", err);
    });