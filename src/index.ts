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
  cors: { origin: 'http://localhost:3000', credentials: true },
});

const onlineUsers = new Map<string, string>();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
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

  socket.on("joinRoom", (roomId: string) => {
    socket.join(roomId);
    console.log(`Joined room: ${roomId}`);
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

      //  Emit to room
      io.to(roomId).emit("receiveMessage", {
        content: message.content,
        senderId: account.kindeId,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("Send message error:", err);
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
server.listen(8000, () => {
  console.log(`Server is running on port 8000`);
});