import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Pool } from "pg"; // Import PostgreSQL's Pool from 'pg'

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// PostgreSQL connection setup
const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "dashboard",
	password: "postgres",
	port: 5432,
});

// Example query
pool.query("SELECT NOW()", (err, res) => {
	console.log(err, res);
	// You can handle the result here if needed.
});

// Socket.IO setup
io.on("connection", (socket) => {
	console.log("A user connected");
	// Handle socket events here.
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
