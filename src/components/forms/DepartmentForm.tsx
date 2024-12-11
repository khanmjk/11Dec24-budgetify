import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '../../store/budgetStore';
import { generateId } from '../../utils/generateId';
import { FormField } from '../common/FormField';

export const DepartmentForm: React.FC<{ organizationId: string }> = ({ organizationId }) => {
  const navigate = useNavigate();
  const addDepartment = useBudgetStore(state => state.addDepartment);
  const organization = useBudgetStore(state => 
    state.organizations.find(org => org.id === organizationId)
  );
  const [formData, setFormData] = useState({
    name: '',
    departmentHeadName: '',
    totalBudget: 0
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!organization) {
      setError('Organization not found');
      return;
    }

    // Check if budget exceeds organization's remaining budget
    const currentSpent = useBudgetStore.getState().getOrganizationTotalSpent(organizationId);
    const remainingOrgBudget = organization.totalBudget - currentSpent;

    if (formData.totalBudget > remainingOrgBudget) {
      setError(`Department budget cannot exceed organization's remaining budget: $${remainingOrgBudget.toLocaleString()}`);
      return;
    }

    const newDepartment = {
      id: generateId(),
      name: formData.name,
      departmentHeadName: formData.departmentHeadName,
      organizationId,
      totalBudget: formData.totalBudget,
      managers: []
    };
    
    const result = addDepartment(newDepartment);
    if (!result.success) {
      setError(result.error || 'Failed to create department');
      return;
    }
    
    navigate(`/organization/${organizationId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {organization && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            Organization Budget: ${organization.totalBudget.toLocaleString()}
            <br />
            Available: ${(organization.totalBudget - useBudgetStore.getState().getOrganizationTotalSpent(organizationId)).toLocaleString()}
          </p>
        </div>
      )}

      <FormField
        label="Department Name"
        id="name"
        type="text"
        required
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        error={error}
      />

      <FormField
        label="Department Head Name"
        id="departmentHeadName"
        type="text"
        required
        value={formData.departmentHeadName}
        onChange={(e) => setFormData(prev => ({ ...prev, departmentHeadName: e.target.value }))}
      />

      <FormField
        label="Total Budget"
        id="totalBudget"
        type="number"
        min="0"
        step="0.01"
        required
        value={formData.totalBudget || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: Number(e.target.value) }))}
      />

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Department
      </button>
    </form>
  );
};