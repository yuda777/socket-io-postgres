const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Pool } = require('pg');
const cors = require('cors'); // Import the cors middleware

const app = express();

// Enable CORS for all routes
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server);

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dashboard',
  password: 'postgres',
  port: 5432,
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Simulate real-time data (replace with your data source)
  setInterval(async () => {
    try {
      const result = await pool.query('SELECT NOW() as now');
      console.log('Query result:', result.rows);
  
      if (result.rows && result.rows.length > 0) {
        const currentTime = result.rows[0].now;
        console.log('Current time:', currentTime);
  
        socket.emit('realTimeData', { time: currentTime });
      } else {
        console.error('No rows returned from the query.');
      }
    } catch (error) {
      console.error('Error executing query:', error.message);
    }
  }, 1000);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Socket.IO server is running on http://localhost:${PORT}`);
});