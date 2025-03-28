import { Request, Response } from 'express';
import { DailyExpense } from '../models/DailyExpense';

export const createDailyExpense = async (req: Request, res: Response) => {
  try {
    const expense = new DailyExpense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getDailyExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await DailyExpense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Adicione outros métodos conforme necessário (update, delete, etc.)