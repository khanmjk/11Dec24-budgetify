import React, { useState } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { PageHeader } from '../components/common/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EditTeamBudgetModal } from '../components/budget/EditTeamBudgetModal';
import { SelectTeamModal } from '../components/budget/SelectTeamModal';

export const Departments = () => {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const store = useBudgetStore();
  const organizations = store.organizations;

  // Get departments based on selected organization
  const departments = selectedOrgId
    ? store.departments.filter(d => d.organizationId === selectedOrgId)
    : [];

  // Calculate budget statistics for the selected organization
  const getOrgBudgetStats = () => {
    if (!selectedOrgId) return { total: 0, allocated: 0, spent: 0, remaining: 0 };
    const org = organizations.find(o => o.id === selectedOrgId);
    if (!org) return { total: 0, allocated: 0, spent: 0, remaining: 0 };

    const stats = store.getOrganizationBudgetInfo(selectedOrgId);
    return {
      total: org.totalBudget,
      allocated: stats.allocated,
      spent: stats.spent,
      remaining: stats.remaining
    };
  };

  // Handle team selection
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedDepartmentId(null);
  };

  // Prepare data for the bar chart
  const chartData = departments.map(dept => {
    const stats = store.getDepartmentBudgetInfo(dept.id);
    return {
      name: `${dept.name}\n[${dept.departmentHeadName}]`,
      Budgeted: dept.totalBudget,
      'Actual Spent': stats.spent,
      Remaining: stats.remaining
    };
  });

  const orgStats = getOrgBudgetStats();

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" />

      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
          Select Organization
        </label>
        <select
          id="organization"
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select an organization</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </div>

      {selectedOrgId && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Total Organization Budget</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${orgStats.total.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-semibold text-blue-600">
                  ${orgStats.spent.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining Budget</p>
                <p className="text-2xl font-semibold text-green-600">
                  ${orgStats.remaining.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-8 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    height={60}
                    tick={{
                      fontSize: 12,
                      width: 150,
                      fill: '#374151'
                    }}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="Budgeted" fill="#4F46E5" />
                  <Bar dataKey="Actual Spent" fill="#818CF8" />
                  <Bar dataKey="Remaining" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map(dept => {
              const stats = store.getDepartmentBudgetInfo(dept.id);
              const managers = store.getManagersByDepartment(dept.id);

              return (
                <div key={dept.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
                      <p className="text-sm text-gray-500">Head: {dept.departmentHeadName}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Budget</p>
                        <p className="text-lg font-medium text-gray-900">
                          ${dept.totalBudget.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Managers</p>
                        <p className="text-lg font-medium text-gray-900">
                          {managers.length}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Spent</p>
                        <p className="text-lg font-medium text-blue-600">
                          ${stats.spent.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className="text-lg font-medium text-green-600">
                          ${stats.remaining.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDepartmentId(dept.id)}
                      className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Edit Budget
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedDepartmentId && (
        <SelectTeamModal
          departmentId={selectedDepartmentId}
          onSelect={handleTeamSelect}
          onClose={() => setSelectedDepartmentId(null)}
        />
      )}

      {selectedTeamId && (
        <EditTeamBudgetModal
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </div>
  );
};