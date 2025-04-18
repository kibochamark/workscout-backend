import { Request, Response } from "express";
import { prisma } from "../utils/prisma/client";
import { getOnboardingStatus, updateOnboardingStatus } from "../services/onboarding.service";

export async function createAccount(req: Request, res: Response): Promise<void> {
  console.log(req.body, "body");
  const { kindeId, email } = req.body;

  try {
    const existing = await prisma.account.findUnique({ where: { kindeId } });
    if (existing) {
      res.status(200).json(existing);
      return;
    }

    const account = await prisma.account.create({
      data: {
        kindeId,
        email
      },
    });

    res.status(201).json(account);
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
}




// get account onboarding status



export const onboardingStatusController = async (req: Request, res: Response): Promise<any> => {
  const { kindeId } = req.body;

  const { error, data } = await getOnboardingStatus(kindeId);
  try {
    if (error) {
      return res.status(404).json({ error: error });
    }

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ error: "Internal server error while checking onboarding status." });
  }
}




// create account subscription



// get account by email



// get customer by cust id



// update a/c subscription


// update onboarding status

export async function UpdateAccountOnboardingController(req: Request, res: Response):Promise<any>{
  try {
    const { isOnboarded, onboardingstep, kindeId } = req.body

    const updateacc = await updateOnboardingStatus(kindeId, { isOnboarded, onboardingstep })
    if (updateacc.error) {
      return res.status(404).json({ error: updateacc.error });
    }

    res.status(200).json(updateacc);
  } catch (e) {
    res.status(500).json({ error: JSON.stringify(e) });

  }
}

