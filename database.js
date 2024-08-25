import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

pool.connect((error) => {
  if (error) throw error;
  console.log("Connect to Postgres successfully!");
});

export default pool;
