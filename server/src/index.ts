import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dailyExpenseRoutes from './routes/dailyExpenseR';
import weeklyEarningRoutes from './routes/weeklyEarningR';

dotenv.config({ path: '.env' }); // Forçar caminho do .env

const app = express();
const PORT = 5000;

// Verificação reforçada da variável
if (!process.env.MONGO_URI) {
  throw new Error('❌ Variável MONGO_URI não encontrada no .env');
}

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('❌ Erro MongoDB:', err));

// Restante do código permanece igual...
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use('/api/daily-expenses', dailyExpenseRoutes);
app.use('/api/weekly-earnings', weeklyEarningRoutes);

app.listen(PORT, () => {
  console.log(`🔄 Servidor rodando na porta ${PORT}`);
});