import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './styles/App.css';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DailyExpense {
  _id: string;
  date: string;
  amount: number;
  description: string;
}

interface WeeklyEarning {
  _id: string;
  weekNumber: number;
  grossAmount: number;
  startDate: string;
  endDate: string;
}

interface FinancialSummary {
  weekly: Array<{
    week: number;
    gross: number;
    net: number;
    expenses: number;
  }>;
  monthly: {
    gross: number;
    net: number;
    expenses: number;
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [weeklyEarnings, setWeeklyEarnings] = useState<WeeklyEarning[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    weekly: [],
    monthly: { gross: 0, net: 0, expenses: 0 }
  });

  const [dailyForm, setDailyForm] = useState({
    date: '',
    amount: '',
    description: ''
  });

  const [weeklyForm, setWeeklyForm] = useState({
    weekNumber: '',
    grossAmount: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [expensesResponse, earningsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/daily-expenses'),
          axios.get('http://localhost:5000/api/weekly-earnings')
        ]);

        setDailyExpenses(expensesResponse.data);
        setWeeklyEarnings(earningsResponse.data);
        calculateFinancialSummary(expensesResponse.data, earningsResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    fetchAllData();
  }, [activeTab]);

  const calculateFinancialSummary = (expenses: DailyExpense[], earnings: WeeklyEarning[]) => {
    // Cálculo semanal
    const weeklySummary = earnings.map(week => {
      const weekStart = new Date(week.startDate);
      const weekEnd = new Date(week.endDate);
      
      const weekExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= weekStart && expenseDate <= weekEnd;
      });

      const totalExpenses = weekExpenses.reduce((sum, item) => sum + item.amount, 0);
      return {
        week: week.weekNumber,
        gross: week.grossAmount,
        expenses: totalExpenses,
        net: week.grossAmount - totalExpenses
      };
    });

    // Cálculo mensal
    const monthlyGross = earnings.reduce((sum, item) => sum + item.grossAmount, 0);
    const monthlyExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    
    setFinancialSummary({
      weekly: weeklySummary,
      monthly: {
        gross: monthlyGross,
        expenses: monthlyExpenses,
        net: monthlyGross - monthlyExpenses
      }
    });
  };

  const handleDailySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/daily-expenses', {
        date: new Date(dailyForm.date).toISOString(),
        amount: parseFloat(dailyForm.amount),
        description: dailyForm.description
      });

      const [expenses, earnings] = await Promise.all([
        axios.get('http://localhost:5000/api/daily-expenses'),
        axios.get('http://localhost:5000/api/weekly-earnings')
      ]);

      setDailyExpenses(expenses.data);
      setWeeklyEarnings(earnings.data);
      calculateFinancialSummary(expenses.data, earnings.data);
      setDailyForm({ date: '', amount: '', description: '' });
    } catch (error) {
      console.error('Erro ao salvar gasto:', error);
    }
  };

  const handleWeeklySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/weekly-earnings', {
        weekNumber: parseInt(weeklyForm.weekNumber),
        grossAmount: parseFloat(weeklyForm.grossAmount),
        startDate: new Date(weeklyForm.startDate).toISOString(),
        endDate: new Date(weeklyForm.endDate).toISOString()
      });

      const [expenses, earnings] = await Promise.all([
        axios.get('http://localhost:5000/api/daily-expenses'),
        axios.get('http://localhost:5000/api/weekly-earnings')
      ]);

      setDailyExpenses(expenses.data);
      setWeeklyEarnings(earnings.data);
      calculateFinancialSummary(expenses.data, earnings.data);
      setWeeklyForm({ weekNumber: '', grossAmount: '', startDate: '', endDate: '' });
    } catch (error) {
      console.error('Erro ao salvar ganho:', error);
    }
  };

  const chartData = {
    labels: financialSummary.weekly.map(item => `Semana ${item.week}`),
    datasets: [
      {
        label: 'Ganhos Brutos (R$)',
        data: financialSummary.weekly.map(item => item.gross),
        backgroundColor: '#00BCD4',
        borderWidth: 2
      },
      {
        label: 'Gastos Totais (R$)',
        data: financialSummary.weekly.map(item => item.expenses),
        backgroundColor: '#FF5722',
        borderWidth: 2
      },
      {
        label: 'Lucro Líquido (R$)',
        data: financialSummary.weekly.map(item => item.net),
        backgroundColor: '#4CAF50',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📊 Controle Financeiro - Lanchonete</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'daily' ? 'active' : ''}
            onClick={() => setActiveTab('daily')}
          >
            🗓️ Gastos Diários
          </button>
          <button 
            className={activeTab === 'weekly' ? 'active' : ''}
            onClick={() => setActiveTab('weekly')}
          >
            📅 Ganhos Semanais
          </button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="summary-section">
        <div className="summary-card">
          <h3>Resumo Mensal</h3>
          <p>Bruto: R$ {financialSummary.monthly.gross.toFixed(2)}</p>
          <p>Gastos: R$ {financialSummary.monthly.expenses.toFixed(2)}</p>
          <p>Líquido: R$ {financialSummary.monthly.net.toFixed(2)}</p>
        </div>

        {financialSummary.weekly.map((week, index) => (
          <div className="summary-card" key={index}>
            <h3>Semana {week.week}</h3>
            <p>Bruto: R$ {week.gross.toFixed(2)}</p>
            <p>Gastos: R$ {week.expenses.toFixed(2)}</p>
            <p>Líquido: R$ {week.net.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Formulários */}
      {activeTab === 'daily' ? (
        <form className="form-container" onSubmit={handleDailySubmit}>
          <div className="input-group">
            <label>📅 Data</label>
            <input
              type="date"
              value={dailyForm.date}
              onChange={e => setDailyForm({...dailyForm, date: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>💸 Valor Gasto (R$)</label>
            <input
              type="number"
              step="0.01"
              value={dailyForm.amount}
              onChange={e => setDailyForm({...dailyForm, amount: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>📝 Descrição</label>
            <input
              type="text"
              value={dailyForm.description}
              onChange={e => setDailyForm({...dailyForm, description: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            💾 Salvar Gasto Diário
          </button>
        </form>
      ) : (
        <form className="form-container" onSubmit={handleWeeklySubmit}>
          <div className="input-group">
            <label>🔢 Número da Semana</label>
            <input
              type="number"
              min="1"
              max="5"
              value={weeklyForm.weekNumber}
              onChange={e => setWeeklyForm({...weeklyForm, weekNumber: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>💰 Valor Bruto (R$)</label>
            <input
              type="number"
              step="0.01"
              value={weeklyForm.grossAmount}
              onChange={e => setWeeklyForm({...weeklyForm, grossAmount: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>⏳ Data Início</label>
            <input
              type="date"
              value={weeklyForm.startDate}
              onChange={e => setWeeklyForm({...weeklyForm, startDate: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>⌛ Data Fim</label>
            <input
              type="date"
              value={weeklyForm.endDate}
              onChange={e => setWeeklyForm({...weeklyForm, endDate: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            💾 Salvar Ganho Semanal
          </button>
        </form>
      )}

      {/* Gráfico */}
      <div className="chart-container">
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Valores (R$)'
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Desempenho Financeiro Semanal',
                font: { size: 18 }
              },
              legend: {
                position: 'top'
              }
            }
          }}
        />
      </div>

      {/* Botão de Download */}
      <div className="actions">
        <button 
          className="download-button"
          onClick={() => window.open('http://localhost:5000/api/report', '_blank')}
        >
          📥 Baixar Planilha Completa
        </button>
      </div>
    </div>
  );
}