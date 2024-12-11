import React from 'react';
import { useBudgetStore } from '../../store/budgetStore';

interface BudgetCategoryTableProps {
  budgetItems: Array<{
    budgetCategoryId: string;
    amount: number;
  }>;
}

export const BudgetCategoryTable: React.FC<BudgetCategoryTableProps> = ({ budgetItems }) => {
  const categories = useBudgetStore(state => state.budgetCategories);

  const categoryTotals = categories.map(category => ({
    name: category.name,
    description: category.description,
    amount: budgetItems
      .filter(item => item.budgetCategoryId === category.id)
      .reduce((sum, item) => sum + item.amount, 0)
  })).filter(item => item.amount > 0);

  const totalAmount = categoryTotals.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Budget Category Details
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categoryTotals.map((category, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  ${category.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {((category.amount / totalAmount) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                ${totalAmount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};