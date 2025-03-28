import { Router } from 'express';
import { 
  createWeeklyEarning, 
  getWeeklyEarnings 
} from '../controllers/weeklyEarning';

const router = Router();

router.post('/', createWeeklyEarning);
router.get('/', getWeeklyEarnings);

// Adicione outras rotas conforme necessário

export default router;