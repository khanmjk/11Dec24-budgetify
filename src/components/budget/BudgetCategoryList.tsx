import React from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { Book, Users, Plane, Laptop, PartyPopper } from 'lucide-react';

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'training and courses':
      return <Book className="h-5 w-5 text-indigo-600" />;
    case 'conferences':
      return <Users className="h-5 w-5 text-green-600" />;
    case 'travel':
      return <Plane className="h-5 w-5 text-blue-600" />;
    case 'educational materials':
      return <Laptop className="h-5 w-5 text-purple-600" />;
    case 'team activities':
      return <PartyPopper className="h-5 w-5 text-yellow-600" />;
    default:
      return <Book className="h-5 w-5 text-gray-600" />;
  }
};

export const BudgetCategoryList: React.FC = () => {
  const categories = useBudgetStore(state => state.budgetCategories);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Budget Categories</h3>
        <p className="mt-1 text-sm text-gray-500">
          Available budget categories for allocation
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {categories.map((category) => (
            <li key={category.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center space-x-4">
                {getCategoryIcon(category.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {category.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {category.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};