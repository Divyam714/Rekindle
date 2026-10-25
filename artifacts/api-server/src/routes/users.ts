import { Router } from "express";
import { db, users } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// 1. GET all users (Admin view)
router.get("/", async (_req, res, next) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json({ ok: true, users: allUsers });
  } catch (error) {
    next(error);
  }
});

// 2. GET user by phone number
router.get("/:phone", async (req, res, next) => {
  try {
    const { phone } = req.params;
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    res.json({ ok: true, user: existing });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/users/login - Handles new login or returns existing user
router.post("/login", async (req, res, next) => {
  try {
    const { phone, name } = req.body;
    if (!phone) {
      return res.status(400).json({ ok: false, error: "Phone number is required" });
    }

    // Check if user already exists in Neon
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existing) {
      // If a new name is provided, update it
      if (name && name !== existing.name) {
        const [updated] = await db
          .update(users)
          .set({ name })
          .where(eq(users.phone, phone))
          .returning();
        return res.json({ ok: true, user: updated, isNew: false });
      }
      return res.json({ ok: true, user: existing, isNew: false });
    }

    // If new user, insert into Neon
    const [created] = await db
      .insert(users)
      .values({
        phone,
        name: name || "Guest",
      })
      .returning();

    res.status(201).json({ ok: true, user: created, isNew: true });
  } catch (error) {
    next(error);
  }
});

// 4. POST /api/users/order - Updates user's plan/tier and occasion upon ordering
router.post("/order", async (req, res, next) => {
  try {
    const { phone, tier, occasion } = req.body;

    if (!phone) {
      return res.status(400).json({ ok: false, error: "Phone number is required" });
    }

    const [updated] = await db
      .update(users)
      .set({
        tier: tier || null,
        occasion: occasion || null,
      })
      .where(eq(users.phone, phone))
      .returning();

    if (!updated) {
      return res.status(404).json({ ok: false, message: "User not found to update plan" });
    }

    res.json({ ok: true, user: updated });
  } catch (error) {
    next(error);
  }
});

export default router;