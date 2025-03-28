import { Request, Response } from 'express';
import { WeeklyEarning } from '../models/WeeklyEarning';

export const createWeeklyEarning = async (req: Request, res: Response) => {
  try {
    const earning = new WeeklyEarning(req.body);
    await earning.save();
    res.status(201).json(earning);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getWeeklyEarnings = async (req: Request, res: Response) => {
  try {
    const earnings = await WeeklyEarning.find().sort({ weekStartDate: -1 });
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Adicione outros métodos conforme necessário