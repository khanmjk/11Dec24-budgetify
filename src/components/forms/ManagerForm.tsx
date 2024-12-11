import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '../../store/budgetStore';
import { generateId } from '../../utils/generateId';
import { FormField } from '../common/FormField';

interface ManagerFormProps {
  departmentId: string;
}

export const ManagerForm: React.FC<ManagerFormProps> = ({ departmentId }) => {
  const navigate = useNavigate();
  const addManager = useBudgetStore(state => state.addManager);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newManager = {
      id: generateId(),
      name,
      departmentId,
      teams: []
    };
    addManager(newManager);
    navigate(`/department/${departmentId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Manager Name"
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
        Create Manager
      </button>
    </form>
  );
};