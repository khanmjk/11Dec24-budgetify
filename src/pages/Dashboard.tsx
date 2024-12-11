import React from 'react';
import { Link } from 'react-router-dom';
import { useBudgetStore } from '../store/budgetStore';
import { BudgetSummary } from '../components/dashboard/BudgetSummary';
import { PlusCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { organizations, departments, teams } = useBudgetStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Budget Management Dashboard</h1>
        <Link
          to="/organization/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Organization
        </Link>
      </div>

      <BudgetSummary />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Organizations</h2>
          {organizations.length === 0 ? (
            <p className="text-gray-500">No organizations added yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {organizations.slice(0, 5).map(org => (
                <li key={org.id} className="py-4">
                  <Link to={`/organization/${org.id}`} className="hover:text-indigo-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{org.name}</p>
                        <p className="text-sm text-gray-500">Leader: {org.leaderName}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {departments.filter(d => d.organizationId === org.id).length} departments
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Teams</h2>
          {teams.length === 0 ? (
            <p className="text-gray-500">No teams added yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {teams.slice(0, 5).map(team => (
                <li key={team.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{team.name}</p>
                      <p className="text-sm text-gray-500">
                        {team.budget 
                          ? `Budget: $${team.budget.totalAmount.toLocaleString()}`
                          : 'No budget assigned'}
                      </p>
                    </div>
                    {!team.budget && (
                      <Link
                        to={`/team/${team.id}/budget/new`}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        Add Budget
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};