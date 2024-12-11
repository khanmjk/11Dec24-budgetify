import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '../../store/budgetStore';
import { generateId } from '../../utils/generateId';
import { FormField } from '../common/FormField';
import type { BudgetItem } from '../../types/models';

interface BudgetFormProps {
  teamId: string;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ teamId }) => {
  const navigate = useNavigate();
  const store = useBudgetStore();
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [items, setItems] = useState<Array<{
    categoryId: string;
    amount: number;
    description: string;
  }>>([]);
  const [error, setError] = useState<string>('');

  // Find the organization and department this team belongs to
  const team = store.teams.find(t => t.id === teamId);
  const manager = team ? store.managers.find(m => m.id === team.managerId) : null;
  const department = manager ? store.departments.find(d => d.id === manager.departmentId) : null;
  const organization = department ? store.organizations.find(o => o.id === department.organizationId) : null;

  // Calculate department's current spent budget
  const getDepartmentSpentBudget = (departmentId: string): number => {
    const departmentManagers = store.managers.filter(m => m.departmentId === departmentId);
    let total = 0;
    departmentManagers.forEach(manager => {
      const managerTeams = store.teams.filter(t => t.managerId === manager.id);
      managerTeams.forEach(team => {
        if (team.budget) {
          total += team.budget.totalAmount;
        }
      });
    });
    return total;
  };

  const handleAddItem = () => {
    if (store.budgetCategories.length === 0) {
      setError('No budget categories available');
      return;
    }

    setItems([...items, {
      categoryId: store.budgetCategories[0].id,
      amount: 0,
      description: ''
    }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!department || !organization) {
      setError('Department or organization not found');
      return;
    }

    // Check department budget constraint
    const departmentSpent = getDepartmentSpentBudget(department.id);
    const remainingDepartmentBudget = department.totalBudget - departmentSpent;

    if (totalAmount > remainingDepartmentBudget) {
      setError(`Budget exceeds department's remaining budget. Available: $${remainingDepartmentBudget.toLocaleString()}`);
      return;
    }

    // Check organization budget constraint
    const currentSpent = store.getOrganizationTotalSpent(organization.id);
    const newTotal = currentSpent + totalAmount;

    if (newTotal > organization.totalBudget) {
      setError(`Budget exceeds organization's remaining budget. Available: $${(organization.totalBudget - currentSpent).toLocaleString()}`);
      return;
    }

    const budgetId = generateId();
    const budget = {
      id: budgetId,
      teamId,
      totalAmount,
      year,
      budgetItems: []
    };

    const budgetItems: BudgetItem[] = items.map(item => ({
      id: generateId(),
      budgetId,
      budgetCategoryId: item.categoryId,
      amount: item.amount,
      description: item.description
    }));

    store.addBudget(budget);
    budgetItems.forEach(item => store.addBudgetItem(item));
    store.updateTeamBudget(teamId, budgetId);

    if (manager) {
      navigate(`/manager/${manager.id}`);
    }
  };

  if (!department || !organization) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-sm text-red-700">Unable to create budget: Department or organization not found</p>
      </div>
    );
  }

  const departmentSpent = getDepartmentSpentBudget(department.id);
  const remainingDepartmentBudget = department.totalBudget - departmentSpent;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          Department Budget: ${department.totalBudget.toLocaleString()}
          <br />
          Available: ${remainingDepartmentBudget.toLocaleString()}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Total Budget Amount"
          id="totalAmount"
          type="number"
          min="0"
          step="0.01"
          required
          value={totalAmount || ''}
          onChange={(e) => setTotalAmount(Number(e.target.value))}
        />
        <FormField
          label="Year"
          id="year"
          type="number"
          min={new Date().getFullYear()}
          required
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Budget Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select
                value={item.categoryId}
                onChange={(e) => updateItem(index, 'categoryId', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {store.budgetCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FormField
                label="Amount"
                type="number"
                min="0"
                step="0.01"
                required
                value={item.amount || ''}
                onChange={(e) => updateItem(index, 'amount', Number(e.target.value))}
              />
            </div>
            <FormField
              label="Description"
              type="text"
              required
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Budget
      </button>
    </form>
  );
};