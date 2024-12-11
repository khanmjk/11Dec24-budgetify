import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { FormField } from '../common/FormField';
import { AlertTriangle } from 'lucide-react';
import { generateId } from '../../utils/generateId';
import type { BudgetCategory, BudgetItem } from '../../types/models';

interface BudgetAllocationModalProps {
  teamId: string;
  categoryId: string;
  budgetItem?: BudgetItem;
  onClose: () => void;
}

export const BudgetAllocationModal: React.FC<BudgetAllocationModalProps> = ({
  teamId,
  categoryId,
  budgetItem,
  onClose
}) => {
  const store = useBudgetStore();
  const team = store.teams.find(t => t.id === teamId);
  const manager = team ? store.managers.find(m => m.id === team.managerId) : null;
  const department = manager ? store.departments.find(d => d.id === manager.departmentId) : null;
  const organization = department ? store.organizations.find(o => o.id === department.organizationId) : null;
  const category = organization?.budgetCategories.find(c => c.id === categoryId);

  const [allocated, setAllocated] = useState(budgetItem?.amount || 0);
  const [spent, setSpent] = useState(budgetItem?.spent || 0);
  const [error, setError] = useState('');

  if (!team?.budget || !category || !organization) return null;

  const teamStats = store.getTeamBudgetInfo(teamId);
  const currentAllocated = budgetItem?.amount || 0;
  const budgetImpact = allocated - currentAllocated;
  const newTotal = teamStats.allocated + budgetImpact;
  const isOverBudget = newTotal > team.budget.totalAmount;
  const remaining = allocated - spent;
  const isOverSpent = remaining < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (allocated < spent) {
      setError('Allocated amount cannot be less than spent amount');
      return;
    }

    const newBudgetItem = {
      id: budgetItem?.id || generateId(),
      budgetId: team.budget!.id,
      budgetCategoryId: categoryId,
      amount: allocated,
      description: `Budget allocation for ${category.name}`,
      spent
    };

    store.addBudgetItem(newBudgetItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {budgetItem ? 'Edit' : 'Add'} Budget Allocation
            </h2>
            <p className="text-sm text-gray-500">{category.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">×</button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Organization:</span>
              <span className="font-medium">{organization.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Department:</span>
              <span className="font-medium">{department?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Team:</span>
              <span className="font-medium">{team.name}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Allocated Amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={allocated}
              onChange={(e) => setAllocated(Number(e.target.value))}
            />

            <FormField
              label="Spent Amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={spent}
              onChange={(e) => setSpent(Number(e.target.value))}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining:</span>
              <span className={`font-medium ${isOverSpent ? 'text-red-600' : 'text-green-600'}`}>
                ${remaining.toLocaleString()}
                {isOverSpent && (
                  <AlertTriangle className="inline-block ml-1 h-4 w-4 text-red-500" />
                )}
              </span>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Team Budget:</span>
                <span className="font-medium">${team.budget.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Currently Allocated:</span>
                <span className="font-medium">${teamStats.allocated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New Total Allocated:</span>
                <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                  ${newTotal.toLocaleString()}
                  {isOverBudget && (
                    <AlertTriangle className="inline-block ml-1 h-4 w-4 text-red-500" />
                  )}
                </span>
              </div>
            </div>

            {isOverBudget && (
              <p className="text-sm text-red-600">
                Warning: This allocation would exceed the team's total budget by ${(newTotal - team.budget.totalAmount).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              {budgetItem ? 'Update' : 'Add'} Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};