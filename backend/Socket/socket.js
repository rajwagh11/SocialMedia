import { Server } from "socket.io";
import http from "http"; //Node’s built-in HTTP module, needed to integrate Socket.IO with Express.
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {                                        //io → Socket.IO server instance.
    origin: "*",
    methods: ["GET", "POST"],
  },
});

export const getReciverSocketId = (reciverId) => {
  return userSocketMap[reciverId];
};


const userSocketMap = {}; //keeps track of online users and their socket IDs.

io.on("connection", (socket) => {  
    console.log("User Connected", socket.id);

    const userId = socket.handshake.query.userId;  //gets the user ID sent by the frontend when connecting.

    if (userId != "undefined") userSocketMap[userId] = socket.id;

    io.emit("getOnlineUser", Object.keys(userSocketMap)); //[1,2,3,4]

    socket.on("disconnect", () => {
    console.log("User disconnected");
    delete userSocketMap[userId];
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  });
})

io.on("connection", (socket) => {
     console.log("User Connected", socket.id);

})

export { io, server, app };