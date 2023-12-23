import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/postgres-adapter";
import { Pool } from "pg";
import { config } from "dotenv";

config();

const io = new Server({
	cors: { origin: "*" },
});

// PostgreSQL connection setup
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASSWORD,
	port: +(process.env.DB_PORT ?? "5432"),
});

io.on("connection", (socket: Socket) => {
	console.log("A user connected");

	// Emit the current timestamp from PostgreSQL every second
	const intervalId = setInterval(() => {
		pool.query(
			`SELECT 
			user_id,
			photo,
			CONCAT('#', colorhex) as fill,
			SPLIT_PART(name, ' ', 1) AS name,
			performance_score AS score 
			FROM employee_performance 
			ORDER BY performance_score DESC`,
			(err, result) => {
				if (err) {
					console.error("Error fetching real-time data:", err.message);
					return;
				}
				io.emit("realTimeData", result.rows);
				// const currentTimestamp = result.rows[0].now;
				// socket.emit("realTimeData", currentTimestamp);
			}
		);
	}, 1000);

	socket.on("disconnect", () => {
		console.log("A user disconnected");
		clearInterval(intervalId); // Stop emitting data when the client disconnects
	});
});

io.adapter(createAdapter(pool));
io.listen(3000);
