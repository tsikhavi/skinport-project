import { Request, Response } from "express";
import sql from "../services/database.service";

interface PurchaseRequest {
  userId: number;
  productId: number;
}

export const purchaseProduct = async (req: Request, res: Response) => {
  const { userId, productId } = req.body as PurchaseRequest;

  if (!userId || !productId) {
    return res.status(400).json({ error: "Missing userId or productId" });
  }

  try {
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

      res.json({ balance: newBalance });
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
