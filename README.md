# Social Media Project - Complete Guide

## 📚 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Architecture](#project-architecture)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [Core Features](#core-features)
7. [File Structure](#file-structure)
8. [How It Works - Step by Step](#how-it-works---step-by-step)

---

## 🎯 Project Overview

This is a **full-stack social media application** built with the MERN stack (MongoDB, Express, React, Node.js). It includes:
- User authentication (Register/Login)
- Post creation and management
- Reels (video posts)
- Like and comment functionality
- Real-time messaging with Socket.IO
- Follow/Unfollow system
- AI-powered content moderation
- Domain-based user isolation

---

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Cloudinary** - Image/video storage
- **Multer** - File upload handling
- **Google Gemini AI** - Content moderation

### Frontend
- **React 19** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Vite** - Build tool

---

## 🏗 Project Architecture

```
SocialMedia/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Auth & file upload
│   ├── utils/           # Helper functions
│   ├── Socket/          # WebSocket server
│   └── index.js         # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page components
    │   ├── context/     # State management
    │   └── App.jsx      # Main app component
    └── package.json
```

---

## 💾 Database Schema

### 1. User Model (`userModel.js`)
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  gender: String (enum: "male" | "female"),
  followers: [ObjectId] (ref: User),      // Array of user IDs
  followings: [ObjectId] (ref: User),    // Array of user IDs
  profilePic: {
    id: String,    // Cloudinary public_id
    url: String    // Cloudinary secure_url
  },
  emailDomain: String,  // e.g., "gmail.com"
  timestamps: true      // createdAt, updatedAt
}
```

**Key Features:**
- Self-referencing: Users can follow other users
- Email domain isolation: Users can only interact with same domain
- Profile picture stored in Cloudinary

### 2. Post Model (`postModel.js`)
```javascript
{
  caption: String,
  post: {
    id: String,    // Cloudinary public_id
    url: String   // Cloudinary secure_url
  },
  type: String (required),  // "post" or "reel"
  owner: ObjectId (ref: User),
  likes: [ObjectId] (ref: User),
  comments: [{
    user: ObjectId (ref: User),
    name: String,
    comment: String
  }],
  createdAt: Date
}
```

**Key Features:**
- Supports both images (posts) and videos (reels)
- Embedded comments (not separate collection)
- Like tracking with user IDs

### 3. Chat Model (`ChatModel.js`)
```javascript
{
  users: [ObjectId] (ref: User),  // Array of 2 users
  latestMessage: {
    text: String,
    sender: ObjectId (ref: User)
  },
  timestamps: true
}
```

### 4. Messages Model (`Messages.js`)
```javascript
{
  chatId: ObjectId (ref: Chat),
  sender: ObjectId (ref: User),
  text: String,
  timestamps: true
}
```

---

## 🔐 Authentication System

### Flow:
1. **Registration:**
   - User provides: name, email, password, gender, profile picture
   - Password is hashed with bcrypt (10 rounds)
   - Email domain extracted (e.g., "gmail.com")
   - Profile pic uploaded to Cloudinary
   - JWT token generated and stored in HTTP-only cookie
   - Token expires in 15 days

2. **Login:**
   - Email and password verified
   - JWT token generated and sent as cookie
   - User data returned

3. **Authentication Middleware (`isAuth.js`):**
   - Extracts token from cookies
   - Verifies JWT signature
   - Finds user from database
   - Attaches user to `req.user`
   - Protects routes

4. **Logout:**
   - Clears token cookie (maxAge: 0)

### Security Features:
- Passwords never stored in plain text
- HTTP-only cookies (prevents XSS)
- JWT expiration (15 days)
- Domain-based isolation

---

## ✨ Core Features

### 1. **User Management**

#### Registration (`/api/auth/register`)
- Uploads profile picture to Cloudinary
- Extracts email domain for isolation
- Creates user account
- Returns JWT token

#### Login (`/api/auth/login`)
- Validates credentials
- Returns JWT token

#### Profile Management
- **Update Profile Picture:** `/api/user/:id` (PUT)
- **Update Name:** `/api/user/:id` (PUT)
- **Update Password:** `/api/user/:id` (POST)
- **Get Profile:** `/api/user/me` (GET)
- **View Other User:** `/api/user/:id` (GET)

#### Follow System
- **Follow/Unfollow:** `/api/user/follow/:id` (POST)
  - Toggles follow status
  - Updates both users' followers/followings arrays
- **Get Followers/Following:** `/api/user/followdata/:id` (GET)
- **Domain Restriction:** Only same email domain users can follow each other

### 2. **Post Management**

#### Create Post (`/api/post/new?type=post`)
**Flow:**
1. File uploaded via Multer
2. Converted to Data URI
3. Uploaded to Cloudinary (temp folder)
4. **AI Moderation Check:**
   - Image analyzed by Google Gemini AI
   - Caption checked for inappropriate content
   - If blocked: temp file deleted, error returned
5. If approved: Uploaded to "posts" folder
6. Post saved to database

#### Create Reel (`/api/post/new?type=reel`)
- Similar to post but for videos
- AI moderation only checks caption (not video)

#### Get All Posts (`/api/post/all`)
- Returns posts and reels
- Filtered by email domain
- Populated with owner and comment user data
- Sorted by newest first

#### Like/Unlike (`/api/post/like/:id`)
- Toggles user ID in likes array
- Returns success message

#### Comment (`/api/post/comment/:id`)
- Adds comment to post's comments array
- Includes user ID, name, and comment text

#### Delete Comment (`/api/post/comment/:id?commentId=xxx`)
- Only post owner or comment owner can delete
- Removes from comments array

#### Edit Caption (`/api/post/:id` PUT)
- Only post owner can edit
- Updates caption field

#### Delete Post (`/api/post/:id` DELETE)
- Only post owner can delete
- Deletes from Cloudinary
- Removes from database

### 3. **Real-Time Messaging**

#### Socket.IO Setup
- Server: `backend/Socket/socket.js`
- Client: `frontend/src/context/SocketContext.jsx`

#### How It Works:
1. **Connection:**
   - Client connects with `userId` in query
   - Server stores `userId → socketId` mapping
   - Broadcasts online users list

2. **Create Chat:**
   - When user starts conversation
   - Creates Chat document with both user IDs
   - Returns chat object

3. **Send Message:**
   - Creates Messages document
   - Updates Chat's latestMessage
   - Emits "newMessage" to receiver's socket
   - Receiver gets real-time notification

4. **Get Messages:**
   - Fetches all messages for a chat
   - Sorted by timestamp

5. **Online Status:**
   - Server tracks connected users
   - Broadcasts online users list
   - Shows green dot for online users

### 4. **AI Content Moderation**

**File:** `backend/utils/aiModeration.js`

**Process:**
1. **Keyword Check:** Quick scan for obvious inappropriate words
2. **Gemini AI Analysis:**
   - Image analyzed (if image post)
   - Caption analyzed
   - Safety filters applied
3. **Response:**
   - Returns `{ allowed: boolean, reasons: [] }`
   - If blocked, upload is rejected

**Safety Categories:**
- Harassment
- Hate Speech
- Sexually Explicit
- Dangerous Content

### 5. **Domain Isolation**

**Feature:** Users can only interact with users from the same email domain.

**Implementation:**
- `emailDomain` extracted during registration
- All queries filter by `emailDomain`
- Follow, message, post visibility all restricted

**Example:**
- `user1@gmail.com` can only see/interact with other `@gmail.com` users
- `user2@company.com` can only see/interact with other `@company.com` users

---

## 📁 File Structure Deep Dive

### Backend Structure

```
backend/
├── index.js                    # Main server file
├── dataabse/
│   └── db.js                   # MongoDB connection
├── controllers/
│   ├── authControllers.js      # Register, Login, Logout
│   ├── userControllers.js      # Profile, Follow, User operations
│   ├── postControllers.js       # Post CRUD, Like, Comment
│   └── messageController.js    # Send message, Get messages
├── models/
│   ├── userModel.js            # User schema
│   ├── postModel.js            # Post schema
│   ├── ChatModel.js            # Chat schema
│   └── Messages.js             # Message schema
├── routes/
│   ├── authRoutes.js           # /api/auth/*
│   ├── userRoutes.js           # /api/user/*
│   ├── postRoutes.js           # /api/post/*
│   └── messageRoutes.js        # /api/messages/*
├── middlewares/
│   ├── isAuth.js               # JWT verification
│   └── multer.js               # File upload handler
├── utils/
│   ├── generateToken.js        # JWT token creation
│   ├── urlGenrator.js          # File to Data URI converter
│   ├── aiModeration.js         # Content moderation
│   └── TryCatch.js             # Error handler wrapper
└── Socket/
    └── socket.js               # Socket.IO server setup
```

### Frontend Structure

```
frontend/src/
├── App.jsx                     # Main app, routing
├── main.jsx                   # React entry point
├── components/
│   ├── PostCard.jsx           # Post/reel display component
│   ├── AddPost.jsx            # Create post/reel form
│   ├── NavigationBar.jsx     # Bottom navigation
│   ├── Modal.jsx              # Followers/Following modal
│   ├── SimpleModal.jsx        # Edit/Delete options
│   ├── Loading.jsx            # Loading spinner
│   ├── NotFound.jsx          # 404 page
│   ├── UsersSideBar.jsx       # User list sidebar
│   └── chat/
│       ├── Chat.jsx           # Chat list item
│       ├── Message.jsx        # Individual message
│       ├── MessageContainer.jsx # Chat window
│       └── MessageInput.jsx  # Message input form
├── pages/
│   ├── Home.jsx              # Posts feed
│   ├── Reels.jsx             # Reels feed
│   ├── Account.jsx          # Own profile
│   ├── UserAccount.jsx      # Other user's profile
│   ├── Search.jsx           # User search
│   ├── ChatPage.jsx         # Messaging page
│   ├── Login.jsx            # Login page
│   └── Register.jsx         # Registration page
└── context/
    ├── UserContext.jsx       # User state management
    ├── PostContext.jsx        # Posts state management
    ├── ChatContext.jsx        # Chat state management
    └── SocketContext.jsx      # Socket.IO connection
```

---

## 🔄 How It Works - Step by Step

### 1. Application Startup

**Backend (`backend/index.js`):**
1. Loads environment variables
2. Configures Cloudinary
3. Sets up Express middleware (JSON, cookies)
4. Connects to MongoDB
5. Sets up Socket.IO server
6. Registers routes
7. Starts server on port 7000

**Frontend (`frontend/src/main.jsx`):**
1. Wraps app in context providers:
   - UserContextProvider
   - PostContextProvider
   - ChatContextProvider
   - SocketContextProvider
2. Renders App component

### 2. User Registration Flow

```
User fills form → Frontend (Register.jsx)
  ↓
FormData created with file
  ↓
POST /api/auth/register
  ↓
Backend (authControllers.js)
  ↓
1. Validates input
2. Checks if user exists
3. Converts file to Data URI
4. Uploads to Cloudinary
5. Hashes password
6. Extracts email domain
7. Creates user in DB
8. Generates JWT token
9. Sets cookie
  ↓
Returns user data
  ↓
Frontend updates UserContext
  ↓
Redirects to Home page
```

### 3. Post Creation Flow

```
User clicks "Add Post" → AddPost.jsx
  ↓
File selected → Preview shown
  ↓
Form submitted → PostContext.addPost()
  ↓
POST /api/post/new?type=post
  ↓
Backend (postControllers.js)
  ↓
1. File uploaded via Multer
2. Converted to Data URI
3. Uploaded to Cloudinary (temp)
4. AI Moderation:
   - Gemini analyzes image + caption
   - Returns allowed/rejected
5. If allowed:
   - Upload to "posts" folder
   - Create Post document
   - Return success
6. If rejected:
   - Delete temp file
   - Return error
  ↓
Frontend refreshes posts list
```

### 4. Like Post Flow

```
User clicks like button → PostCard.jsx
  ↓
handleLike() → PostContext.likePost()
  ↓
POST /api/post/like/:id
  ↓
Backend (postControllers.js)
  ↓
1. Find post by ID
2. Check if user ID in likes array
3. If yes: Remove (unlike)
4. If no: Add (like)
5. Save post
  ↓
Frontend:
1. Stores scroll position
2. Refreshes posts
3. Restores scroll position
```

### 5. Real-Time Messaging Flow

```
User opens chat → ChatPage.jsx
  ↓
Socket connects with userId
  ↓
Server stores: userSocketMap[userId] = socketId
  ↓
User sends message → MessageInput.jsx
  ↓
POST /api/messages
  ↓
Backend (messageController.js)
  ↓
1. Find or create Chat
2. Create Messages document
3. Update Chat's latestMessage
4. Get receiver's socketId
5. Emit "newMessage" to receiver
  ↓
Receiver's socket receives event
  ↓
MessageContainer.jsx updates UI
```

### 6. Follow User Flow

```
User clicks "Follow" → UserAccount.jsx
  ↓
UserContext.followUser()
  ↓
POST /api/user/follow/:id
  ↓
Backend (userControllers.js)
  ↓
1. Check if already following
2. If following:
   - Remove from both arrays (unfollow)
3. If not following:
   - Add to both arrays (follow)
4. Save both users
  ↓
Frontend refreshes user data
```

---

## 🔑 Key Concepts

### 1. **Context API (State Management)**
- **UserContext:** Manages authentication, user data, profile updates
- **PostContext:** Manages posts, reels, likes, comments
- **ChatContext:** Manages chat list, selected chat
- **SocketContext:** Manages Socket.IO connection, online users

### 2. **Protected Routes**
- Routes check `isAuth` from UserContext
- If not authenticated, redirect to Login
- Backend routes use `isAuth` middleware

### 3. **File Upload Flow**
```
File → Multer → Buffer → Data URI → Cloudinary → URL → Database
```

### 4. **Error Handling**
- `TryCatch` wrapper catches async errors
- Returns consistent error responses
- Frontend shows toast notifications

### 5. **Real-Time Updates**
- Socket.IO for instant messaging
- Manual refresh for posts (after like/comment)
- Scroll position preserved during updates

---

## 🚀 Running the Project

### Backend:
```bash
cd SocialMedia
npm install
npm run dev
```

### Frontend:
```bash
cd SocialMedia/frontend
npm install
npm run dev
```

### Environment Variables Needed:
```env
MONGO_URL=mongodb://localhost:27017
JWT_SEC=your_secret_key
Cloudinary_Cloud_Name=your_cloud_name
Cloudinary_Api=your_api_key
Cloudinary_Secret=your_secret
GOOGLE_API_KEY=your_gemini_key
```

---

## 📝 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user

### User
- `GET /api/user/me` - Get current user
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update profile
- `POST /api/user/:id` - Update password
- `POST /api/user/follow/:id` - Follow/Unfollow
- `GET /api/user/followdata/:id` - Get followers/following
- `GET /api/user/all` - Get all users (search)

### Posts
- `POST /api/post/new?type=post|reel` - Create post/reel
- `GET /api/post/all` - Get all posts and reels
- `DELETE /api/post/:id` - Delete post
- `POST /api/post/like/:id` - Like/Unlike
- `POST /api/post/comment/:id` - Add comment
- `DELETE /api/post/comment/:id?commentId=xxx` - Delete comment
- `PUT /api/post/:id` - Edit caption

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:id` - Get messages
- `GET /api/messages/chats` - Get all chats

---

## 🎨 UI/UX Features

1. **Responsive Design:** Works on mobile and desktop
2. **Dark Theme:** Modern gradient backgrounds
3. **Loading States:** Spinners during async operations
4. **Toast Notifications:** Success/error feedback
5. **Scroll Preservation:** Maintains position after updates
6. **Grid/List View:** Toggle for posts display
7. **Real-Time Indicators:** Online status, new messages

---

## 🔒 Security Features

1. **Password Hashing:** bcrypt with 10 rounds
2. **JWT Tokens:** Secure, expiring tokens
3. **HTTP-Only Cookies:** Prevents XSS attacks
4. **Domain Isolation:** Users can't access other domains
5. **AI Moderation:** Blocks inappropriate content
6. **File Validation:** Multer validates file types
7. **Authentication Middleware:** Protects all routes

---

## 🐛 Common Issues & Solutions

1. **Page refreshes on like/comment:**
   - Fixed by preserving scroll position in PostContext

2. **Socket connection fails:**
   - Check CORS settings in socket.js
   - Verify userId is sent in query

3. **Cloudinary upload fails:**
   - Check environment variables
   - Verify file size limits

4. **AI moderation blocks valid content:**
   - Adjust safety thresholds in aiModeration.js
   - Modify keyword list

---

## 📚 Learning Path

1. **Start with:** Database models (understand data structure)
2. **Then:** Authentication flow (core security)
3. **Next:** Post creation (file upload, AI moderation)
4. **Then:** Real-time messaging (Socket.IO)
5. **Finally:** Frontend state management (Context API)

---

This guide covers the complete project from basics to advanced features. Each component works together to create a full-featured social media application!
