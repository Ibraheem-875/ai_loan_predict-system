import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { LoanInput, LoanResult } from '../services/api';

interface Props { input: LoanInput; result: LoanResult; }

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Charts({ input, result }: Props) {
  const expenses = input.existingEMI + result.emi;
  const savings = Math.max(0, input.income - expenses);

  const pieData = [
    { name: 'Net Savings', value: savings },
    { name: 'Existing EMIs', value: input.existingEMI },
    { name: 'New Loan EMI', value: result.emi },
  ];

  const barData = [
    { name: 'Requested', loan: input.loanAmount, capacity: result.recommendedLoan },
    { name: 'Monthly', emi: result.emi, affordable: Math.max(0, (input.income - input.existingEMI) * 0.5) },
  ];

  const tooltipStyle = { backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: '0.8rem' };

  return (
    <div className="animate-fade-in-up delay-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
      {/* Pie Chart — Income vs Expenses */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Income Allocation</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart — Loan vs Repayment Capacity */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Loan vs Capacity</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} barGap={6}>
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
            <Bar dataKey="loan" name="Loan Amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="capacity" name="Recommended" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="emi" name="EMI" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="affordable" name="Affordable EMI" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
 