import express, { Express } from "express";
import dotenv from "dotenv";
import redis from "./services/redis.service";
import sql from "./services/database.service";
import itemsRouter from "./routes/items.route";
import purchaseRouter from "./routes/purchase.route";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());


app.use("/items", itemsRouter);
app.use("/purchase", purchaseRouter);
app.use("/", (req, res) => {
  res.send("Hello World");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on("exit", () => {
  redis.disconnect();
  sql.end();
});
