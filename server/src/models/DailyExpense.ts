import { Schema, model } from 'mongoose';

interface IDailyExpense {
  date: Date;
  amount: number;
  description: string;
}

const schema = new Schema<IDailyExpense>({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true }
});

export const DailyExpense = model<IDailyExpense>('DailyExpense', schema);