import React, { useState } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { PageHeader } from '../components/common/PageHeader';
import { Users, DollarSign, AlertTriangle } from 'lucide-react';
import { EditTeamBudgetModal } from '../components/budget/EditTeamBudgetModal';

export const Teams: React.FC = () => {
  const store = useBudgetStore();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [editTeamId, setEditTeamId] = useState<string | null>(null);

  // Get all organizations
  const organizations = store.organizations;

  // Get departments based on selected organization
  const departments = selectedOrgId
    ? store.departments.filter(d => d.organizationId === selectedOrgId)
    : [];

  // Get filtered teams based on selected organization and department
  const getFilteredTeams = () => {
    return store.teams.filter(team => {
      const manager = store.managers.find(m => m.id === team.managerId);
      if (!manager) return false;

      const department = store.departments.find(d => d.id === manager.departmentId);
      if (!department) return false;

      if (selectedOrgId && department.organizationId !== selectedOrgId) return false;
      if (selectedDeptId && manager.departmentId !== selectedDeptId) return false;

      return true;
    });
  };

  const filteredTeams = getFilteredTeams();

  // Calculate total budget for filtered teams
  const totalTeamBudgets = filteredTeams.reduce((sum, team) => 
    sum + (team.budget?.totalAmount || 0), 0
  );

  // Handle organization selection
  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    setSelectedDeptId(''); // Reset department selection
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Teams" />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
            Select Organization
          </label>
          <select
            id="organization"
            value={selectedOrgId}
            onChange={(e) => handleOrgChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select an organization</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>

        {selectedOrgId && (
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Select Department
            </label>
            <select
              id="department"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedOrgId && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Overview</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Total Team Budgets</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${totalTeamBudgets.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Number of Teams</p>
                <p className="text-2xl font-semibold text-indigo-600">
                  {filteredTeams.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedOrgId ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Organization Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select an organization to view its teams.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map(team => {
            const manager = store.managers.find(m => m.id === team.managerId);
            const department = manager 
              ? store.departments.find(d => d.id === manager.departmentId)
              : null;

            // Calculate budget statistics
            const budgetItems = team.budget
              ? store.budgetItems.filter(item => item.budgetId === team.budget?.id)
              : [];
            
            const allocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
            const spent = budgetItems.reduce((sum, item) => sum + (item.spent || 0), 0);
            const remaining = allocated - spent;
            const isOverBudget = remaining < 0;

            return (
              <div
                key={team.id}
                className="bg-white shadow rounded-lg p-6"
                data-overspent={isOverBudget}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                  </div>
                  {isOverBudget && (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="space-y-2">
                  {manager && (
                    <p className="text-sm text-gray-500">
                      Manager: {manager.name}
                    </p>
                  )}
                  {department && (
                    <p className="text-sm text-gray-500">
                      Department: {department.name}
                    </p>
                  )}

                  {team.budget && (
                    <div className="space-y-1 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Budget:</span>
                        <span className="font-medium">
                          ${team.budget.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Allocated:</span>
                        <span className="font-medium text-indigo-600">
                          ${allocated.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Spent:</span>
                        <span className="font-medium text-blue-600">
                          ${spent.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Remaining:</span>
                        <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                          ${remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setEditTeamId(team.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      {team.budget ? 'Edit Budget' : 'Add Budget'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editTeamId && (
        <EditTeamBudgetModal
          teamId={editTeamId}
          onClose={() => setEditTeamId(null)}
        />
      )}
    </div>
  );
};