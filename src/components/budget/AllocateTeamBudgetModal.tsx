import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { FormField } from '../common/FormField';
import { generateId } from '../../utils/generateId';

interface AllocateTeamBudgetModalProps {
  teamId: string;
  onClose: () => void;
}

export const AllocateTeamBudgetModal: React.FC<AllocateTeamBudgetModalProps> = ({ teamId, onClose }) => {
  const store = useBudgetStore();
  const team = store.teams.find(t => t.id === teamId);
  const manager = team ? store.managers.find(m => m.id === team.managerId) : null;
  const department = manager ? store.departments.find(d => d.id === manager.departmentId) : null;
  
  const [amount, setAmount] = useState<number>(team?.budget?.totalAmount || 0);
  const [error, setError] = useState<string>('');

  if (!team || !manager || !department) {
    return null;
  }

  // Calculate department's remaining budget
  const getDepartmentSpentBudget = (): number => {
    const departmentTeams = store.teams.filter(t => {
      const teamManager = store.managers.find(m => m.id === t.managerId);
      return teamManager && teamManager.departmentId === department.id;
    });

    return departmentTeams.reduce((total, t) => {
      if (t.id === team.id) return total; // Exclude current team's budget
      return total + (t.budget?.totalAmount || 0);
    }, 0);
  };

  const departmentSpent = getDepartmentSpentBudget();
  const remainingDepartmentBudget = department.totalBudget - departmentSpent;
  const maxBudget = team.budget 
    ? remainingDepartmentBudget + team.budget.totalAmount 
    : remainingDepartmentBudget;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amount > maxBudget) {
      setError(`Amount cannot exceed department's remaining budget: $${maxBudget.toLocaleString()}`);
      return;
    }

    const budgetId = team.budget?.id || generateId();
    const budget = {
      id: budgetId,
      teamId,
      totalAmount: amount,
      year: new Date().getFullYear(),
      budgetItems: []
    };

    if (team.budget) {
      // Update existing budget
      store.addBudget(budget);
    } else {
      // Create new budget
      store.addBudget(budget);
      store.updateTeamBudget(teamId, budgetId);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {team.budget ? 'Update' : 'Allocate'} Budget for {team.name}
        </h2>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-700">
            Department Budget: ${department.totalBudget.toLocaleString()}
            <br />
            Available: ${maxBudget.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Budget Amount"
            id="amount"
            type="number"
            min="0"
            step="0.01"
            required
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            error={error}
          />

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
              {team.budget ? 'Update' : 'Allocate'} Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};