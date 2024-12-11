import React from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { DollarSign } from 'lucide-react';

interface BudgetSummaryCardProps {
  budgetId: string;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({ budgetId }) => {
  const store = useBudgetStore();
  const budget = store.budgets.find(b => b.id === budgetId);
  const items = store.budgetItems.filter(item => item.budgetId === budgetId);
  const categories = store.budgetCategories;

  if (!budget) return null;

  const totalSpent = items.reduce((sum, item) => sum + item.amount, 0);
  const remaining = budget.totalAmount - totalSpent;

  const getCategoryName = (categoryId: string) =>
    categories.find(c => c.id === categoryId)?.name || 'Unknown Category';

  const groupedItems = items.reduce((acc, item) => {
    const categoryName = getCategoryName(item.budgetCategoryId);
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += item.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Budget Summary</h3>
        <DollarSign className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-2xl font-semibold text-gray-900">
            ${budget.totalAmount.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Total Allocated</p>
          <p className="text-2xl font-semibold text-indigo-600">
            ${totalSpent.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Remaining</p>
          <p className="text-2xl font-semibold text-green-600">
            ${remaining.toLocaleString()}
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Category Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(groupedItems).map(([category, amount]) => (
              <div key={category} className="flex justify-between text-sm">
                <span className="text-gray-500">{category}</span>
                <span className="font-medium">${amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};