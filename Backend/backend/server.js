import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";



// Import routes
import router from "./routes/authRoute.js";
import addRouter from "./routes/addRoute.js";
import getRoute from "./routes/getRoutes.js";
import recentRoute from "./routes/recentRoute.js";
import saveRoute from "./routes/saveRoute.js";
import editRoutes from "./routes/editProfileRoute.js";
import serviceRoutes from "./routes/serviceRoute.js";
import boughtRoute from "./routes/boughtRoute.js";
import chatRouter from "./routes/chatRoute.js";
import sellRoute from "./routes/sellRoute.js";
import rentRoute from "./routes/rentRoute.js";
import revenueRoute from "./routes/revenueRoute.js";
import userRoute from "./routes/userRoute.js";
import employeeRoute from "./routes/employeeRoute.js";
import changePasswordRoute from "./routes/changePasswordRoute.js";
import adminAuthRoute from "./routes/adminAuthRoute.js";
import hrAuthRoute from "./routes/hrAuthRoute.js";
import paymentRoute from "./routes/paymentRoute.js"
import inquiryRoute from "./routes/inquiryRoute.js"; 
import reminderRoute from "./routes/reminderRoute.js";
import notificationRoute from "./routes/notificationRoute.js"; 
import "./cron/reminderCron.js"
import fcmRoute from "./routes/fcmRoute.js";
import updateNotificationRoute from "./routes/updateNotificationRoute.js";

// Load environment variables
dotenv.config();

const app = express();

//  Middleware


app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow your frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key", // move to .env later
    resave: false,
    saveUninitialized: false,
  })
);

//  MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_CONN) {
      throw new Error(" MONGO_CONN not found in .env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_CONN, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(" MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Stop server if DB fails
  }
};

connectDB();

// Attach socket.io instance to req
app.use((req, res, next) => {
  req.io = io;
  next();
});



//  API Routes
app.use("/api/auth", router);
app.use("/api/hr-auth", hrAuthRoute);
app.use("/property", addRouter);
app.use("/api/properties", getRoute);
app.use("/api/properties", recentRoute);
app.use("/api/properties", saveRoute);
app.use("/api/services", serviceRoutes);
app.use("/api/properties", boughtRoute);
app.use("/api/chat", chatRouter);
app.use("/api/users", editRoutes);
app.use("/api/users", userRoute);
app.use("/api/employees", employeeRoute);
app.use("/api/properties", sellRoute);
app.use("/api/properties", rentRoute);
app.use("/api/properties", revenueRoute);
app.use("/api", changePasswordRoute);
app.use("/admin", adminAuthRoute);
app.use("/api/payment", paymentRoute);
//  Serve Uploaded Files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use("/api/inquiry", inquiryRoute);

app.use("/api/reminder", reminderRoute);
app.use("/api/notification", notificationRoute);
app.use("/api", fcmRoute);
app.use("/application", updateNotificationRoute)



//  Socket.io Setup
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // replace with your frontend URL in production
    methods: ["GET", "POST"],
  },
});


// // Attach socket.io instance to req
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });



//  Socket.io Events
io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.chatId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});

//  Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

export { io };
