import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBudgetStore } from '../store/budgetStore';
import { PageHeader } from '../components/common/PageHeader';
import { DollarSign, Users, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { EditTeamBudgetModal } from '../components/budget/EditTeamBudgetModal';

const COLORS = ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

export const DepartmentDetails: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const store = useBudgetStore();
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const department = store.departments.find(dept => dept.id === departmentId);
  const organization = department 
    ? store.organizations.find(org => org.id === department.organizationId)
    : null;
  const managers = store.getManagersByDepartment(departmentId || '');

  if (!departmentId || !department || !organization) {
    return <div>Department not found</div>;
  }

  const toggleManager = (managerId: string) => {
    const newExpanded = new Set(expandedManagers);
    if (newExpanded.has(managerId)) {
      newExpanded.delete(managerId);
    } else {
      newExpanded.add(managerId);
    }
    setExpandedManagers(newExpanded);
  };

  const stats = store.getDepartmentBudgetInfo(departmentId);
  const budgetUtilization = (stats.spent / department.totalBudget) * 100;

  return (
    <div className="space-y-8">
      <PageHeader 
        title={department.name}
        backUrl={`/organization/${department.organizationId}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-indigo-600" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Budget Overview</h3>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Budget:</span>
              <span className="font-medium text-gray-900">${department.totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Allocated:</span>
              <span className="font-medium text-indigo-600">${stats.allocated.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Spent:</span>
              <span className="font-medium text-blue-600">${stats.spent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining:</span>
              <span className={`font-medium ${stats.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${stats.remaining.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Budget Utilization:</span>
                <span className={`font-medium ${
                  budgetUtilization > 90 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {budgetUtilization.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={managers.map(manager => {
                    const managerStats = store.getManagerBudgetInfo(manager.id);
                    return {
                      name: manager.name,
                      value: managerStats.allocated
                    };
                  })}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {managers.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Department Structure</h3>
        <div className="space-y-4">
          {managers.map(manager => {
            const isExpanded = expandedManagers.has(manager.id);
            const teams = store.getTeamsByManager(manager.id);
            const managerStats = store.getManagerBudgetInfo(manager.id);
            const managerUtilization = (managerStats.spent / managerStats.allocated) * 100;

            return (
              <div key={manager.id} className="border rounded-lg">
                <button
                  onClick={() => toggleManager(manager.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-indigo-600 mr-2" />
                      <div>
                        <span className="text-sm font-medium">{manager.name}</span>
                        <p className="text-xs text-gray-500">
                          {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${managerStats.allocated.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {managerUtilization.toFixed(1)}% utilized
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 py-3">
                    <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Allocated</p>
                        <p className="text-lg font-medium text-indigo-600">
                          ${managerStats.allocated.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Spent</p>
                        <p className="text-lg font-medium text-blue-600">
                          ${managerStats.spent.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className={`text-lg font-medium ${
                          managerStats.remaining < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${managerStats.remaining.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {teams.map(team => {
                        const teamStats = store.getTeamBudgetInfo(team.id);
                        const isOverBudget = teamStats.remaining < 0;
                        const teamUtilization = (teamStats.spent / teamStats.allocated) * 100;

                        return (
                          <div key={team.id} className={`flex items-center justify-between p-2 rounded-md ${
                            isOverBudget ? 'bg-red-50' : 'hover:bg-gray-50'
                          }`}>
                            <div className="flex items-center">
                              {isOverBudget && (
                                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                              )}
                              <div>
                                <span className="text-sm font-medium">{team.name}</span>
                                <p className="text-xs text-gray-500">
                                  {teamUtilization.toFixed(1)}% utilized
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500">Allocated</p>
                                    <p className="text-sm font-medium text-indigo-600">
                                      ${teamStats.allocated.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Spent</p>
                                    <p className="text-sm font-medium text-blue-600">
                                      ${teamStats.spent.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Remaining</p>
                                    <p className={`text-sm font-medium ${
                                      teamStats.remaining < 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      ${teamStats.remaining.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedTeamId(team.id)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                              >
                                <DollarSign className="h-3 w-3 mr-1" />
                                Edit Budget
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedTeamId && (
        <EditTeamBudgetModal
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </div>
  );
};