require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 5000;

//IMPORTS
const authRoutes = require('./routes/authroutes');

app.use(express.json());
app.use(cors())

//ENPOINTS
app.use('/api/auth', authRoutes);


async function startServer() {
  try {

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
