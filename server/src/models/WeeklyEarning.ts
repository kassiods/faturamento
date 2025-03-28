import { Schema, model } from 'mongoose';

interface IWeeklyEarning {
  weekNumber: number;
  grossAmount: number;
  startDate: Date;
  endDate: Date;
}

const schema = new Schema<IWeeklyEarning>({
  weekNumber: { type: Number, required: true },
  grossAmount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

export const WeeklyEarning = model<IWeeklyEarning>('WeeklyEarning', schema);