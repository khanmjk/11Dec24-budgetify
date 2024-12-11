import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useBudgetStore } from '../../store/budgetStore';

const COLORS = ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

interface BudgetCategoryBreakdownProps {
  budgetItems: Array<{
    budgetCategoryId: string;
    amount: number;
  }>;
  title?: string;
}

export const BudgetCategoryBreakdown: React.FC<BudgetCategoryBreakdownProps> = ({ 
  budgetItems,
  title = 'Budget Category Breakdown'
}) => {
  const categories = useBudgetStore(state => state.budgetCategories);

  // Group items by category
  const categoryData = categories.map(category => ({
    name: category.name,
    value: budgetItems
      .filter(item => item.budgetCategoryId === category.id)
      .reduce((sum, item) => sum + item.amount, 0)
  })).filter(item => item.value > 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};