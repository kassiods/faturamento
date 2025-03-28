import { Router } from 'express';
import { 
  createDailyExpense, 
  getDailyExpenses 
} from '../controllers/dailyExpense';

const router = Router();

router.post('/', createDailyExpense);
router.get('/', getDailyExpenses);

// Adicione outras rotas conforme necessário

export default router;