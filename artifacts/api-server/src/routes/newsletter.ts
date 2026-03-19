import { Router, type IRouter } from "express";
import { db, newsletterSubscribersTable } from "@workspace/db";
import { SubscribeNewsletterBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/subscribe", async (req, res) => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid email address" });
    return;
  }

  const { email } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "This email is already subscribed" });
      return;
    }

    await db.insert(newsletterSubscribersTable).values({ email });

    res.json({ success: true, message: "Successfully subscribed! Welcome to EthicalHacking.ai." });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    res.status(500).json({ error: "Failed to subscribe. Please try again." });
  }
});

export default router;
