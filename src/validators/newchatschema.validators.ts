    import Joi from "joi";

// Create message
export const createMessageSchema = Joi.object({
  roomId: Joi.string().required(),
  content: Joi.string().required(),
  senderId: Joi.string().required(),
  receiverId: Joi.string().required()
});

// Get messages in room
export const getMessagesSchema = Joi.object({
  roomId: Joi.string().required()
});

// Get single message
export const getMessageSchema = Joi.object({
  messageId: Joi.string().required()
});

// Get notifications
export const getNotificationsSchema = Joi.object({
  accountId: Joi.string().required()
});

// Read a single notification
export const readNotificationSchema = Joi.object({
  notificationId: Joi.string().required()
});

// Read many notifications
export const readNotificationsSchema = Joi.object({
  notifications: Joi.array().items(Joi.string().required()).required()
});

// Delete a message
export const deleteMessageSchema = Joi.object({
  messageId: Joi.string().required()
});

// Delete a room
export const deleteRoomSchema = Joi.object({
  roomId: Joi.string().required()
});
