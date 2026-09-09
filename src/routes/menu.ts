import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';

const router = Router();

router.get('/', MenuController.getAll);
router.get('/:id', MenuController.getById);
router.post('/', MenuController.create);

export default router;