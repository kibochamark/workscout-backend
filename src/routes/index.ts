import { Router, Request, Response } from "express";

import { createAccount,onboardingStatusController, onboardingStepController, UpdateAccountOnboardingController } from "../controllers/account.controller";
import { upload } from "../utils/fileUpload/multerupload";
import { createProfile, getProfile } from "../controllers/profile.controller";
import {
  handleGetAccountByEmail,
  handleGetAccountByCustomerId,
  handleCreateAccountSubscription,
  handleGetSubscriptionStatus,
  handleUpdateSubscription,
  handleAccountSubscriptionDeletion
} from "../controllers/subscription.controller";

import validate from "../middleware/validate";
import {
  getAccountByEmailSchema,
  getAccountByCustomerIdSchema,
  createAccountSubscriptionSchema,
  getSubscriptionStatusSchema,
  updateSubscriptionSchema,
  updateAccountOnboardingSchema
} from "../validators/subscription.validator";
import { requireAuthAndEnsureAccount } from "../middleware/kinde/kindeverify";
import { accountIdSchema, createJobSchema, deleteJobSchema, getJobSchema, updateJobSchema } from "../validators/jobSchema.validator";
import { handleCreateJob, handleDeleteJob, handleGetAllJobs, handleGetBookmarkedJobs, handleGetJobById, handleUpdateJob } from "../controllers/job.controller";
import { createChatRoom, handleGetUnreadMessages } from "../controllers/chatroom.controller";
import { messageSchema } from "../validators/chatSchema.validators";

import {
  createRoomController,
  creetaMessageController,
  getMessagesController,
  getMessageController,
  getNotificationsController,
  readNotificationController,
  readNotificationsController,
  deleteMessageController,
  deleteRoomController,
  getAllMessagesController
} from "../controllers/chat.controller";
import {
  createMessageSchema,
  getMessagesSchema,
  getMessageSchema,
  getNotificationsSchema,
  readNotificationSchema,
  readNotificationsSchema,
  deleteMessageSchema,
  deleteRoomSchema,
  getAllMessagesSchema
} from "../validators/newchatschema.validators";


const routes = Router();


routes.post("/account", createAccount);
routes.post("/create", upload.single("file"), createProfile);
routes.get("/profile/:kindeId", getProfile);


routes.post("/create-room", createChatRoom);


 


routes.get("/account/:email", validate(getAccountByEmailSchema, "params"), handleGetAccountByEmail);

routes.get("/customer/:customerId", validate(getAccountByCustomerIdSchema, "params"), handleGetAccountByCustomerId);
routes.post("/subscription", validate(createAccountSubscriptionSchema), handleCreateAccountSubscription);
routes.post("/status", requireAuthAndEnsureAccount, validate(getSubscriptionStatusSchema), handleGetSubscriptionStatus);
routes.put("/subscription",  validate(updateSubscriptionSchema), handleUpdateSubscription);
routes.delete("/subscription/:email", requireAuthAndEnsureAccount,  validate(getAccountByEmailSchema,"params"), handleAccountSubscriptionDeletion);

routes.post("/onboardingstatus",requireAuthAndEnsureAccount, validate(getSubscriptionStatusSchema), onboardingStatusController);
routes.post("/onboardingstep",requireAuthAndEnsureAccount, validate(getSubscriptionStatusSchema), onboardingStepController);
routes.put("/updateonboardingstatus",requireAuthAndEnsureAccount, validate(updateAccountOnboardingSchema), UpdateAccountOnboardingController)



routes.post("/job", requireAuthAndEnsureAccount, validate(createJobSchema), handleCreateJob);
routes.put("/job", requireAuthAndEnsureAccount, validate(updateJobSchema), handleUpdateJob);
routes.get("/jobs", requireAuthAndEnsureAccount, handleGetAllJobs);
routes.get("/job/:jobid", requireAuthAndEnsureAccount, validate(getJobSchema, "params"), handleGetJobById);
routes.get("/job/bookmarked/:accountId", requireAuthAndEnsureAccount, validate(accountIdSchema, "params"), handleGetBookmarkedJobs);
routes.delete("/job/:jobid/:accountId", requireAuthAndEnsureAccount, validate(deleteJobSchema, "params"), handleDeleteJob);


routes.get("/messages/unread/:kindeId", requireAuthAndEnsureAccount, validate(messageSchema), handleGetUnreadMessages)



routes.post("/room", createRoomController);

routes.post("/message", validate(createMessageSchema, "body"), creetaMessageController);

routes.get("/allmessages/:userid", validate(getAllMessagesSchema, "params"), getAllMessagesController);

routes.get("/messages/:roomId", validate(getMessagesSchema, "params"), getMessagesController);

routes.get("/message/:messageId", validate(getMessageSchema, "params"), getMessageController);

routes.get("/notifications/:accountId", validate(getNotificationsSchema, "params"), getNotificationsController);

routes.delete("/notification/:notificationId", validate(readNotificationSchema, "params"), readNotificationController);

routes.post("/notifications/read", validate(readNotificationsSchema, "body"), readNotificationsController);

routes.delete("/message/:messageId", validate(deleteMessageSchema, "params"), deleteMessageController);

routes.delete("/room/:roomId", validate(deleteRoomSchema, "params"), deleteRoomController);




// routes.get("/protected", requireAuthAndEnsureAccount, (req: Request, res: Response) => {

//     const user = (req as any).user
//     res.json({ message: "You are authenticated!", user: user });
// });

export default routes