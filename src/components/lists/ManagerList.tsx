import React from 'react';
import { Link } from 'react-router-dom';
import { useBudgetStore } from '../../store/budgetStore';
import { PlusCircle, UserCircle } from 'lucide-react';
import type { Manager } from '../../types/models';

interface ManagerListProps {
  departmentId: string;
}

export const ManagerList: React.FC<ManagerListProps> = ({ departmentId }) => {
  const managers = useBudgetStore(state => 
    state.managers.filter(m => m.departmentId === departmentId)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Managers</h2>
        <Link
          to={`/department/${departmentId}/manager/new`}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Manager
        </Link>
      </div>

      {managers.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No managers added yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {managers.map((manager) => (
            <ManagerCard key={manager.id} manager={manager} />
          ))}
        </div>
      )}
    </div>
  );
};

const ManagerCard: React.FC<{ manager: Manager }> = ({ manager }) => {
  const teams = useBudgetStore(state => 
    state.teams.filter(t => t.managerId === manager.id)
  );

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{manager.name}</h3>
          <p className="text-sm text-gray-500">{teams.length} teams</p>
        </div>
        <UserCircle className="h-5 w-5 text-gray-400" />
      </div>
      <div className="mt-4">
        <Link
          to={`/manager/${manager.id}/team/new`}
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          <PlusCircle className="h-3 w-3 mr-1" />
          Add Team
        </Link>
      </div>
    </div>
  );
};