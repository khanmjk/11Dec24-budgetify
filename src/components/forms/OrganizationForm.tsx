import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '../../store/budgetStore';
import { generateId } from '../../utils/generateId';
import { FormField } from '../common/FormField';

export const OrganizationForm: React.FC = () => {
  const navigate = useNavigate();
  const addOrganization = useBudgetStore(state => state.addOrganization);
  const [formData, setFormData] = useState({
    name: '',
    leaderName: '',
    totalBudget: 0
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.totalBudget <= 0) {
      setError('Total budget must be greater than 0');
      return;
    }

    const newOrg = {
      id: generateId(),
      name: formData.name,
      leaderName: formData.leaderName,
      totalBudget: formData.totalBudget,
      departments: []
    };
    addOrganization(newOrg);
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Organization Name"
        id="name"
        type="text"
        required
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
      />

      <FormField
        label="Leader Name"
        id="leaderName"
        type="text"
        required
        value={formData.leaderName}
        onChange={(e) => setFormData(prev => ({ ...prev, leaderName: e.target.value }))}
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
        error={error}
      />

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Organization
      </button>
    </form>
  );
};