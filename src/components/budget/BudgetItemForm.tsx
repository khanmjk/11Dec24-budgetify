import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { FormField } from '../common/FormField';
import { generateId } from '../../utils/generateId';
import type { Budget } from '../../types/models';

interface BudgetItemFormProps {
  budget: Budget;
  onSave: () => void;
  onCancel: () => void;
}

export const BudgetItemForm: React.FC<BudgetItemFormProps> = ({ budget, onSave, onCancel }) => {
  const store = useBudgetStore();
  const [categoryId, setCategoryId] = useState(store.budgetCategories[0]?.id || '');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Check if total budget items exceed budget total
    const currentTotal = store.budgetItems
      .filter(item => item.budgetId === budget.id)
      .reduce((sum, item) => sum + item.amount, 0);

    if (currentTotal + amount > budget.totalAmount) {
      setError(`Total items cannot exceed budget amount: $${budget.totalAmount.toLocaleString()}`);
      return;
    }

    const newItem = {
      id: generateId(),
      budgetId: budget.id,
      budgetCategoryId: categoryId,
      amount,
      description
    };

    store.addBudgetItem(newItem);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {store.budgetCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <FormField
          label="Amount"
          id="amount"
          type="number"
          min="0"
          step="0.01"
          required
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
          error={error}
        />
      </div>

      <FormField
        label="Description"
        id="description"
        type="text"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          Add Budget Item
        </button>
      </div>
    </form>
  );
};