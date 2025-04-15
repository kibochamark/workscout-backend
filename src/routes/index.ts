import { Router, Request, Response } from "express";

import { createAccount } from "../controllers/account.controller";
import { upload } from "../utils/fileUpload/multerupload";
import { createProfile } from "../controllers/profile.controller";
import {
  handleGetAccountByEmail,
  handleGetAccountByCustomerId,
  handleCreateAccountSubscription,
  handleGetSubscriptionStatus,
  handleUpdateSubscription
} from "../controllers/subscription.controller";

import validate from "../middleware/validate";
import {
  getAccountByEmailSchema,
  getAccountByCustomerIdSchema,
  createAccountSubscriptionSchema,
  getSubscriptionStatusSchema,
  updateSubscriptionSchema
} from "../validators/subscription.validator";
import { requireAuthAndEnsureAccount } from "../middleware/kinde/kindeverify";

const routes = Router();


routes.post("/account", createAccount);
routes.post("/create", upload.single("file"), createProfile);






routes.get("/account/:email", requireAuthAndEnsureAccount, validate(getAccountByEmailSchema, "params"), handleGetAccountByEmail);
routes.get("/customer/:customerId", requireAuthAndEnsureAccount,validate(getAccountByCustomerIdSchema, "params"), handleGetAccountByCustomerId);
routes.post("/subscription",requireAuthAndEnsureAccount, validate(createAccountSubscriptionSchema), handleCreateAccountSubscription);
routes.post("/status", requireAuthAndEnsureAccount, validate(getSubscriptionStatusSchema), handleGetSubscriptionStatus);
routes.put("/subscription", requireAuthAndEnsureAccount,  validate(updateSubscriptionSchema), handleUpdateSubscription);




// routes.get("/protected", requireAuthAndEnsureAccount, (req: Request, res: Response) => {

//     const user = (req as any).user
//     res.json({ message: "You are authenticated!", user: user });
// });

export default routes