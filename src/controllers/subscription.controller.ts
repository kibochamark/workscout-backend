import { Request, Response } from "express";
import {
    getaccountbyemail,
    getaccountbycustomerId,
    createaccountSubscription,
    getaccountSubscriptionStatus,
    getupdateAccountSubscription,
    deleteAccountSubscription
} from "../services/account.service";
import { Subscription } from "@prisma/client";

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
        console.log(req.body, "creating sub")
        const result = await createaccountSubscription(req.body);
        // console.log(result)

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
        const { kindeId } = req.body;
        const result = await getaccountSubscriptionStatus(kindeId);

        if (result.error) {
            return res.status(404).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Internal server error while checking subscription status." });
    }
};

export const handleUpdateSubscription = async (req: Request, res: Response): Promise<any> => {
    try {
        const filtered = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => !key.includes("email"))
        );

    

        let subscriptionData: {
            plan?: "FREE" | "BASIC" | "PRO" | "STANDARD";
            stripecustomerId?: string
            active?:boolean
        } = {
            ...filtered,
        };


        let { email } = req.body
        const result = await getupdateAccountSubscription(subscriptionData, email);

        console.log(result, "result")

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Internal server error while updating subscription." });
    }
};



export const handleAccountSubscriptionDeletion = async (req: Request, res: Response): Promise<any> => {
    try {
       
    

        

        let { email } = req.params
        console.log(email, 'email')
        const result = await deleteAccountSubscription(email);


        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Internal server error while updating subscription." });
    }
};


