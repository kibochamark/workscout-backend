import { Router, Request, Response } from "express";

import { createAccount, onboardingStatusController, UpdateAccountOnboardingController } from "../controllers/account.controller";
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
  updateSubscriptionSchema,
  updateAccountOnboardingSchema
} from "../validators/subscription.validator";
import { requireAuthAndEnsureAccount } from "../middleware/kinde/kindeverify";
import { accountIdSchema, createJobSchema, deleteJobSchema, getJobSchema, updateJobSchema } from "../validators/jobSchema.validator";
import { handleCreateJob, handleDeleteJob, handleGetAllJobs, handleGetBookmarkedJobs, handleGetJobById, handleUpdateJob } from "../controllers/job.controller";

const routes = Router();


routes.post("/account", createAccount);
routes.post("/create", upload.single("file"), createProfile);



 


routes.get("/account/:email", validate(getAccountByEmailSchema, "params"), handleGetAccountByEmail);
routes.get("/customer/:customerId", validate(getAccountByCustomerIdSchema, "params"), handleGetAccountByCustomerId);
routes.post("/subscription", validate(createAccountSubscriptionSchema), handleCreateAccountSubscription);
routes.post("/status", requireAuthAndEnsureAccount, validate(getSubscriptionStatusSchema), handleGetSubscriptionStatus);
routes.put("/subscription",  validate(updateSubscriptionSchema), handleUpdateSubscription);

routes.post("/onboardingstatus",requireAuthAndEnsureAccount, validate(getSubscriptionStatusSchema), onboardingStatusController);
routes.put("/updateonboardingstatus",requireAuthAndEnsureAccount, validate(updateAccountOnboardingSchema), UpdateAccountOnboardingController)



routes.post("/job", requireAuthAndEnsureAccount, validate(createJobSchema), handleCreateJob);
routes.put("/job", requireAuthAndEnsureAccount, validate(updateJobSchema), handleUpdateJob);
routes.get("/jobs", requireAuthAndEnsureAccount, handleGetAllJobs);
routes.get("/job/:jobid", requireAuthAndEnsureAccount, validate(getJobSchema, "params"), handleGetJobById);
routes.get("/job/bookmarked/:accountId", requireAuthAndEnsureAccount, validate(accountIdSchema, "params"), handleGetBookmarkedJobs);
routes.delete("/job/:jobid/:accountId", requireAuthAndEnsureAccount, validate(deleteJobSchema, "params"), handleDeleteJob);


// routes.get("/protected", requireAuthAndEnsureAccount, (req: Request, res: Response) => {

//     const user = (req as any).user
//     res.json({ message: "You are authenticated!", user: user });
// });

export default routes