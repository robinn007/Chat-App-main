// import express from "express";
// import { Server } from "socket.io";
// import { createServer } from "http";
// import cors from "cors";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";

// const PORT = 3000;

// const app = express();
// const server = createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Adjust this to your client URL
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true,
//   },
// });

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );

// app.get("/", (req, res) => {
//   res.send("hello bhai ji");
// });

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);
//   // console.log("Socket ID: " + socket.id);
//   // socket.emit("welcome", `Welcome to the Socket.IO server!`);
//   // socket.broadcast.emit("welcome", `${socket.id} has joined the server!`);

//   socket.on("message", ({ message, room }) => {
//     console.log("Message received: ", message);
//     // Broadcast the message to all connected clients
//     // socket.broadcast.emit("recieve-message", data);
//      socket.to(room).emit("receive-message", message);   
//   });

//   socket.on("join-room", (room) => {
//     socket.join(room);
//     console.log(`User joined room ${room}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//   });

//   // socket.on("message", (msg) => {
//   //     console.log("Message received: " + msg);
//   //     io.emit("message", msg); // Broadcast the message to all connected clients
//   // });
// });

// server.listen(PORT, () => {
//   console.log(`Server is running on PORT ${PORT}`);
// });





import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const secretKeyJWT = "asdasdsadasdasdasdsa";
const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "asdasjdhkasdasdas" }, secretKeyJWT);

  res
    .cookie("token", token, { 
      httpOnly: true, 
      secure: false, // Changed to false for development (HTTP)
      sameSite: "lax" // Changed from "none" to "lax" for development
    })
    .json({
      message: "Login Success",
    });
});

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res || {}, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication Error"));

    try {
      const decoded = jwt.verify(token, secretKeyJWT);
      socket.user = decoded; // Store user info in socket
      next();
    } catch (error) {
      next(new Error("Invalid Token"));
    }
  });
});

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("message", ({ room, message }) => {
    console.log({ room, message });
    // Also emit to the sender so they can see their own message
    socket.to(room).emit("receive-message", message);
    socket.emit("receive-message", message); // Add this line to show message to sender
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});