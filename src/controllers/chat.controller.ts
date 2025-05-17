// create room controller

import { Request, Response } from "express";
import { createroom, getMessages, sendMessage, getMessage, getNotifications, deleteNotification, deleteManyNotifications, deleteMessage, deleteRoom } from "../services/newchat.service";

export async function createRoomController(req: Request, res: Response): Promise<void> {

    const room = await createroom()
    if (room.error) {
        res.status(room.status).json({ error: room.error });
    }
    res.status(room.status).json(room);
}



export async function creetaMessageController(req: Request, res: Response): Promise<void> {
    const { roomId, content, senderId, receiverId } = req.body;
    const message = await sendMessage(roomId, content, senderId, receiverId);
    if (message.error) {
        res.status(message.status).json({ error: message.error });
    }
    res.status(message.status).json(message);
}



export async function getMessagesController(req: Request, res: Response): Promise<void> {

    const { roomId } = req.params;
    const messages = await getMessages(roomId);
    if (messages.error) {
        res.status(messages.status).json({ error: messages.error });
    }
    res.status(messages.status).json(messages); 
}


export async function getMessageController(req: Request, res: Response): Promise<void> {
    const { messageId } = req.params;
    const message = await getMessage(messageId);
    if (message.error) {
        res.status(message.status).json({ error: message.error });
    }
    res.status(message.status).json(message);
    
}


export async function getNotificationsController(req: Request, res: Response): Promise<void> {
    const { accountId } = req.params;
    const notifications = await getNotifications(accountId);
    if (notifications.error) {
        res.status(notifications.status).json({ error: notifications.error });
    }
    res.status(notifications.status).json(notifications);
    
}



export async function readNotificationController(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    const notification = await deleteNotification(notificationId);
    if (notification.error) {
        res.status(notification.status).json({ error: notification.error });
    }
    res.status(notification.status).json(notification);
    
}


export async function readNotificationsController(req: Request, res: Response): Promise<void> {
    const { notifications } = req.body;
    const notification = await deleteManyNotifications(notifications as string[]);
    if (notification.error) {
        res.status(notification.status).json({ error: notification.error });
    }
    res.status(notification.status).json(notification);
    
}


export async function deleteMessageController(req: Request, res: Response): Promise<void> {
    const { messageId } = req.params;
    const message = await deleteMessage(messageId);
    if (message.error) {
        res.status(message.status).json({ error: message.error });
    }
    res.status(message.status).json(message);
}



export async function deleteRoomController(req: Request, res: Response): Promise<void> {
    const { roomId } = req.params;
    const room = await deleteRoom(roomId);
    if (room.error) {
        res.status(room.status).json({ error: room.error });
    }
    res.status(room.status).json(room);
}