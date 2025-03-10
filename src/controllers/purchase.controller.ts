import { Request, Response } from "express";
import sql from "../services/database.service";
import { getCache, setCache } from "../services/redis.service"; // Add Redis service

interface PurchaseRequest {
  userId: number;
  productId: number;
}

export const purchaseProduct = async (req: Request, res: Response) => {
  const startTime = process.hrtime();
  const { userId, productId } = req.body as PurchaseRequest;

  if (!userId || !productId) {
    return res.status(400).json({ error: "Missing userId or productId" });
  }

  try {
    // Check for recent purchase using Redis
    const cooldownKey = `purchase:${userId}:${productId}`;
    const cooldown = await getCache(cooldownKey);

    if (cooldown) {
      return res.status(429).json({
        error: "You can only purchase this item once every 3 seconds",
      });
    }

    await sql.begin(async (tx) => {
      const [product] = await tx`
        SELECT price FROM products WHERE id = ${productId}
      `;
      if (!product) throw new Error("Product not found");

      const [user] = await tx`
        SELECT balance FROM users WHERE id = ${userId} FOR UPDATE
      `;
      if (!user) throw new Error("User not found");

      if (user.balance < product.price) throw new Error("Insufficient balance");

      const newBalance = user.balance - product.price;
      await tx`
        UPDATE users SET balance = ${newBalance} WHERE id = ${userId}
      `;
      await tx`
        INSERT INTO purchases (user_id, product_id) VALUES (${userId}, ${productId})
      `;

      // Set purchase cooldown in Redis (5 minutes)
      await setCache(cooldownKey, "true", 300);

      // Calculate response time
      const [seconds, nanoseconds] = process.hrtime(startTime);
      res.set({
        "X-Response-Time": `${(seconds * 1000 + nanoseconds / 1e6).toFixed(2)}ms`,
        "X-Cooldown-Expires": new Date(Date.now() + 3).toISOString(),
      });

      res.json({ balance: newBalance });
    });
  } catch (error) {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    res.set(
      "X-Response-Time",
      `${(seconds * 1000 + nanoseconds / 1e6).toFixed(2)}ms`
    );
    res.status(400).json({ error: (error as Error).message });
  }
};
