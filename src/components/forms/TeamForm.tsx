import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '../../store/budgetStore';
import { generateId } from '../../utils/generateId';
import { FormField } from '../common/FormField';

export const TeamForm: React.FC<{ managerId: string }> = ({ managerId }) => {
  const navigate = useNavigate();
  const addTeam = useBudgetStore(state => state.addTeam);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeam = {
      id: generateId(),
      name,
      managerId
    };
    addTeam(newTeam);
    navigate(`/manager/${managerId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Team Name"
        id="name"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Team
      </button>
    </form>
  );
};