import express from "express";
import http from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:9291",
        "https://workscout-ui.vercel.app",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
      methods: ["GET", "POST"],
    credentials: true
  },
});

const onlineUsers = new Map<string, string>();

app.use(cors());
app.use(bodyParser.json());
app.use(compression());
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api/v1', routes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (kindeId: string) => {
    onlineUsers.set(kindeId, socket.id);
    console.log(`${kindeId} joined`);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("joinRoom", async (roomId: string) => {
    socket.join(roomId);
    console.log(`Joined room: ${roomId}`);

    // Send chat history to the newly joined client
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { roomId },
        orderBy: { createdAt: 'asc' },
        include: { sender: true },
      });

      const formattedMessages = messages.map(msg => ({
        content: msg.content,
        senderId: msg.sender.kindeId,
        createdAt: msg.createdAt,
      }));

      socket.emit("chatHistory", formattedMessages);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  });

  socket.on("typing", ({ roomId, senderId }) => {
    socket.to(roomId).emit("userTyping", senderId);
  });

  socket.on("sendMessage", async ({ content, roomId, senderId }) => {
    try {
      console.log("Received message request:", { content, roomId, senderId });

      // Lookup sender's Mongo ObjectId from kindeId
      const account = await prisma.account.findUnique({ where: { kindeId: senderId } });

      if (!account) {
        console.warn("No account found for kindeId:", senderId);
        return;
      }

      // Create message using actual Mongo ObjectId
      const message = await prisma.chatMessage.create({
        data: {
          content,
          sender: { connect: { id: account.id } },
          room: { connect: { id: roomId } },
        },
      });

      console.log("Message saved:", message);

      // Emit to room
      io.to(roomId).emit("receiveMessage", {
        content: message.content,
        senderId: account.kindeId,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("Send message error:", err);
    }
  });


  // Handle message sending
  socket.on('sendNewMessage', async ({ conversationId, recipientId, senderId, content }) => {
    try {
      console.log(conversationId, recipientId, senderId, content);
      // 1. Save to DB using your chatMessage.create logic
      const message = await prisma.chatNewMessage.create({
        data: {
          content,
          senderId,
          conversationId,
        },
        include: {
          sender: {
            select: {
              id: true,
              profile: {
                select: { name: true, email: true },
              },
            },
          },
        },
      });

      // 2. Emit to recipient’s room
      io.to(recipientId).emit('receiveMessage', message);

      // Optional: also emit back to sender to confirm
      socket.emit('messageSent', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on("disconnect", () => {
    for (const [kindeId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(kindeId);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(9291, () => {
  console.log(`Server is running on port 8000`);
});
