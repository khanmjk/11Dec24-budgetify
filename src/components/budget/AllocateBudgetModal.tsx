import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { FormField } from '../common/FormField';

interface AllocateBudgetModalProps {
  departmentId: string;
  onClose: () => void;
}

export const AllocateBudgetModal: React.FC<AllocateBudgetModalProps> = ({ departmentId, onClose }) => {
  const store = useBudgetStore();
  const department = store.departments.find(d => d.id === departmentId);
  const organization = department 
    ? store.organizations.find(o => o.id === department.organizationId)
    : null;
  
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  if (!department || !organization) {
    return null;
  }

  const currentSpent = store.getOrganizationTotalSpent(organization.id);
  const remainingOrgBudget = organization.totalBudget - currentSpent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amount > remainingOrgBudget) {
      setError(`Amount cannot exceed remaining organization budget: $${remainingOrgBudget.toLocaleString()}`);
      return;
    }

    // Update department's budget
    const updatedDepartment = {
      ...department,
      totalBudget: amount
    };

    store.updateDepartmentBudget(updatedDepartment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Allocate Budget for {department.name}
        </h2>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-700">
            Organization Budget: ${organization.totalBudget.toLocaleString()}
            <br />
            Available: ${remainingOrgBudget.toLocaleString()}
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
              Allocate Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};