import React from 'react';
import { Link } from 'react-router-dom';
import { useBudgetStore } from '../../store/budgetStore';
import { PlusCircle, Users } from 'lucide-react';
import type { Team } from '../../types/models';

interface TeamListProps {
  managerId: string;
}

export const TeamList: React.FC<TeamListProps> = ({ managerId }) => {
  const teams = useBudgetStore(state => 
    state.teams.filter(t => t.managerId === managerId)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Teams</h2>
        <Link
          to={`/manager/${managerId}/team/new`}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Team
        </Link>
      </div>

      {teams.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No teams added yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};

const TeamCard: React.FC<{ team: Team }> = ({ team }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{team.name}</h3>
          <p className="text-sm text-gray-500">
            {team.budget 
              ? `Budget: $${team.budget.totalAmount.toLocaleString()}`
              : 'No budget assigned'}
          </p>
        </div>
        <Users className="h-5 w-5 text-gray-400" />
      </div>
      {!team.budget && (
        <div className="mt-4">
          <Link
            to={`/team/${team.id}/budget/new`}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <PlusCircle className="h-3 w-3 mr-1" />
            Add Budget
          </Link>
        </div>
      )}
    </div>
  );
};