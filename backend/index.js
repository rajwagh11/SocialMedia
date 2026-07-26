import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import cookieParser from 'cookie-parser';

// Database & Models
import { connectDb } from './dataabse/db.js';
import { Chat } from './models/ChatModel.js';
import { User } from './models/userModel.js';

// Middlewares
import { isAuth } from './middlewares/isAuth.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Socket setup
import { app, server } from "./Socket/socket.js";

// --- Absolute Path Resolution for .env ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Checks for .env in the root project folder (one level up from backend)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug output
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URL:', process.env.MONGO_URL ? 'Loaded' : 'Undefined');
console.log('JWT_SEC:', process.env.JWT_SEC ? 'Loaded' : 'Not loaded');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.Cloudinary_Cloud_Name,  
    api_key: process.env.Cloudinary_Api,            
    api_secret: process.env.Cloudinary_Secret       
});

app.use(express.json());
app.use(cookieParser());

// --- CORS Configuration ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Allow matching origin, or default to first allowed origin instead of wildcard '*' when credentials are used
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
        res.header('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// --- Base Test Route ---
app.get("/", (req, res) => {
    res.send("Server is running smoothly!");
});

// --- Message & Chat Inline Routes ---
app.get("/api/messages/chats", isAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const chats = await Chat.find({
      users: req.user._id,
    }).populate({
      path: "users",
      select: "name profilePic emailDomain",
    });

    const filteredChats = chats.filter((chat) => {
      const otherUsers = chat.users.filter(
        (user) => user._id.toString() !== req.user._id.toString()
      );
      return otherUsers.length > 0 && otherUsers.every(
        (user) => user.emailDomain === currentUser.emailDomain
      );
    });

    filteredChats.forEach((e) => {
      e.users = e.users.filter(
        (user) => user._id.toString() !== req.user._id.toString()
      );
    });

    res.json(filteredChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/user/all", isAuth, async (req, res) => {
  try {
    const search = req.query.search || "";
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const users = await User.find({
      name: { 
        $regex: search, 
        $options: "i"
      },
      emailDomain: currentUser.emailDomain,
      _id: { $ne: req.user._id }
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- API Route Handlers ---
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/messages", messageRoutes);

// --- Start Server ---
const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    connectDb();
});