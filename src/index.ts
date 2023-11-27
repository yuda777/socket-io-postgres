import express from "express";
import http from "http";
import { Pool } from "pg"; // Import PostgreSQL's Pool from 'pg'
import { Server, Socket, ServerOptions } from "socket.io";

const app = express();
const server = http.createServer(app);
const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "dashboard",
	password: "postgres",
	port: 5432,
});
const ioOptions: Partial<
	ServerOptions & { handlePreflightRequest: (req: any, res: any) => void }
> = {
	handlePreflightRequest: (req, res) => {
		const headers = {
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Origin": req.headers.origin as string, // or the specific origin you want to give access to,
			"Access-Control-Allow-Credentials": "true",
		};
		res.writeHead(200, headers);
		res.end();
	},
};

const io = new Server(server, ioOptions as ServerOptions);

io.on("connection", (socket: Socket) => {
	console.log("A user connected");

	// Emit real-time data every second
	const intervalId = setInterval(() => {
		// Replace this query with your actual query to fetch real-time data from PostgreSQL
		const query = "SELECT NOW()";

		pool.query(query, (err, result) => {
			if (err) {
				console.error("Error fetching real-time data:", err.message);
				return;
			}

			// Assuming your result.rows contains the real-time data
			const realTimeData = result.rows[0];

			// Emit the real-time data to connected clients
			socket.emit("realTimeData", realTimeData);
		});
	}, 1000); // Adjust the interval as needed

	socket.on("disconnect", () => {
		console.log("A user disconnected");
		clearInterval(intervalId); // Stop emitting data when the client disconnects
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
