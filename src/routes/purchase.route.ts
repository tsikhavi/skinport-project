import { Router } from 'express';
import { purchaseProduct } from '../controllers/purchase.controller';

const purchaseRouter = Router();

purchaseRouter.post("/", purchaseProduct);

export default purchaseRouter;