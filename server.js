require('dotenv').config();
const express = require('express');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

async function startServer() {
  try {
    // Test DB connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(' Failed to connect to the database');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
