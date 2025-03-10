import { Router } from "express";
import { getItems } from "../controllers/items.controller";

const itemsRouter: Router = Router();


itemsRouter.get("/", (req, res) => getItems(req, res));


export default itemsRouter;
