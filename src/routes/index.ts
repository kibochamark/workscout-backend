import { Router, Request, Response } from "express";
import { requireAuthAndEnsureAccount } from "../middleware/kinde/kindeverify";
import { createAccount } from "../controllers/account.controller";
import { upload } from "../utils/fileUpload/multerupload";
import { createProfile } from "../controllers/profile.controller";

const routes = Router();


routes.post("/account", createAccount);
routes.post("/create", upload.single("file"), createProfile);


// routes.get("/protected", requireAuthAndEnsureAccount, (req: Request, res: Response) => {

//     const user = (req as any).user
//     res.json({ message: "You are authenticated!", user: user });
// });

export default routes