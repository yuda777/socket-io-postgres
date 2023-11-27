import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/postgres-adapter";
import { Pool } from "pg";

const io = new Server({
	cors: { origin: "*" },
});

// PostgreSQL connection setup
const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "dashboard",
	password: "postgres",
	port: 5432,
});

io.on("connection", (socket: Socket) => {
	console.log("A user connected");

	// Emit the current timestamp from PostgreSQL every second
	const intervalId = setInterval(() => {
		pool.query(
			"select user_id,name,performance_score from employee_performance order by performance_id",
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
	}, 500);

	socket.on("disconnect", () => {
		console.log("A user disconnected");
		clearInterval(intervalId); // Stop emitting data when the client disconnects
	});
});

io.adapter(createAdapter(pool));
io.listen(3000);
