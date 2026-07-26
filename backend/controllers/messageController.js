import { Chat } from "../models/ChatModel.js";
import { Messages } from "../models/Messages.js";
import { User } from "../models/userModel.js";
import { getReciverSocketId, io } from "../Socket/socket.js";
import TryCatch from "../utils/TryCatch.js";

export const sendMessage = TryCatch(async (req, res) => {
  const { recieverId, message } = req.body;
  const senderId = req.user._id; 

  if (!recieverId)
    return res.status(400).json({ message: "Please give receiver id" });

  const sender = await User.findById(senderId);
  const receiver = await User.findById(recieverId);
  
  if (!sender || !receiver) {
    return res.status(404).json({ message: "User not found" });
  }
  
  if (sender.emailDomain !== receiver.emailDomain) {
    return res.status(403).json({ message: "Cannot message user from a different domain" });
  }

  let chat = await Chat.findOne({
    users: { $all: [senderId, recieverId] },
  });

  if (!chat) {
    chat = new Chat({
      users: [senderId, recieverId],
      latestMessage: {
        text: message,
        sender: senderId,
      },
    });
    await chat.save(); 
  }

  const newMessage = new Messages({
    chatId: chat._id,
    sender: senderId,
    text: message,
  });

  await newMessage.save(); 


  await chat.updateOne({
    latestMessage: {
      text: message,
      sender: senderId,
    },
  });

  const reciverSocketId = getReciverSocketId(recieverId);
  
  if (reciverSocketId) {
    io.to(reciverSocketId).emit("newMessage", newMessage); 
  }

  res.status(201).json(newMessage);
});


export const getAllMessages = TryCatch(async(req,res)=>{
    const { id } = req.params;
    const userId = req.user._id;

    const currentUser = await User.findById(userId);
    const otherUser = await User.findById(id);
    
    if (!currentUser || !otherUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (currentUser.emailDomain !== otherUser.emailDomain) {
      return res.status(403).json({ message: "Cannot access messages from a different domain" });
    }

    const chat = await Chat.findOne({
        users:{$all:[userId, id]},
    });

    if(!chat) return res.status(404).json({
        message:"No Chat with these users"
    });

    const messages = await Messages.find({
        chatId: chat._id,
    })

    res.json(messages);
});









