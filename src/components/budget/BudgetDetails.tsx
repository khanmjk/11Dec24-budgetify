import React from 'react';
import { useBudgetStore } from '../../store/budgetStore';

interface BudgetDetailsProps {
  budget: {
    id: string;
    totalAmount: number;
    year: number;
  };
}

export const BudgetDetails: React.FC<BudgetDetailsProps> = ({ budget }) => {
  const budgetItems = useBudgetStore(state => 
    state.budgetItems.filter(item => item.budgetId === budget.id)
  );
  const categories = useBudgetStore(state => state.budgetCategories);

  const getCategoryName = (categoryId: string) =>
    categories.find(c => c.id === categoryId)?.name || 'Unknown Category';

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Budget Details - {budget.year}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Total Budget: ${budget.totalAmount.toLocaleString()}
        </p>
      </div>
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            {budgetItems.map(item => (
              <div key={item.id} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {getCategoryName(item.budgetCategoryId)}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex justify-between">
                    <span>${item.amount.toLocaleString()}</span>
                    <span className="text-gray-500">{item.description}</span>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};