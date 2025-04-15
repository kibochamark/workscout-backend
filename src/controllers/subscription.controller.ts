import { Request, Response } from "express";
import {
  getaccountbyemail,
  getaccountbycustomerId,
  createaccountSubscription,
  getaccountSubscriptionStatus,
  getupdateAccountSubscription
} from "../services/account.service";

export const handleGetAccountByEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.params;
    const result = await getaccountbyemail(email);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error while fetching account by email." });
  }
};

export const handleGetAccountByCustomerId = async (req: Request, res: Response): Promise<any> => {
  try {
    const { customerId } = req.params;
    const result = await getaccountbycustomerId(customerId);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error while fetching account by Stripe customer ID." });
  }
};

export const handleCreateAccountSubscription = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await createaccountSubscription(req.body);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error while creating account subscription." });
  }
};

export const handleGetSubscriptionStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { kindeId } = req.params;
    const result = await getaccountSubscriptionStatus(kindeId);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error while checking subscription status." });
  }
};

export const handleUpdateSubscription = async (req: Request, res: Response):Promise<any> => {
  try {
    const result = await getupdateAccountSubscription(req.body);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error while updating subscription." });
  }
};
