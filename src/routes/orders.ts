import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();

router.get('/', OrderController.getAll);
router.post('/', OrderController.create);
router.patch('/:id/status', OrderController.updateStatus);

export default router;