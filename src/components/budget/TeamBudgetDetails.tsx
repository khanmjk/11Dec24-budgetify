import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BudgetCategoryBreakdown } from './BudgetCategoryBreakdown';
import { BudgetCategoryTable } from './BudgetCategoryTable';

interface TeamBudgetDetailsProps {
  teamId: string;
}

export const TeamBudgetDetails: React.FC<TeamBudgetDetailsProps> = ({ teamId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const store = useBudgetStore();
  const team = store.teams.find(t => t.id === teamId);
  const budgetItems = team?.budget 
    ? store.budgetItems.filter(item => item.budgetId === team.budget?.id)
    : [];

  if (!team || !team.budget) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400 mr-2" />
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-500">
              Total Budget: ${team.budget.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <BudgetCategoryBreakdown budgetItems={budgetItems} />
            <BudgetCategoryTable budgetItems={budgetItems} />
          </div>
        </div>
      )}
    </div>
  );
};