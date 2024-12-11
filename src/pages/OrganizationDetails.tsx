import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBudgetStore } from '../store/budgetStore';
import { PageHeader } from '../components/common/PageHeader';
import { DollarSign, Users, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import { EditTeamBudgetModal } from '../components/budget/EditTeamBudgetModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  allocated: '#4F46E5',
  spent: '#818CF8',
  remaining: '#34D399'
};

export const OrganizationDetails: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const store = useBudgetStore();
  const organization = store.organizations.find(org => org.id === organizationId);
  
  if (!organizationId || !organization) {
    return <div>Organization not found</div>;
  }

  const departments = store.getDepartmentsByOrganization(organizationId);
  const totalSpent = store.getOrganizationTotalSpent(organizationId);
  const remainingBudget = organization.totalBudget - totalSpent;

  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const toggleManager = (managerId: string) => {
    const newExpanded = new Set(expandedManagers);
    if (newExpanded.has(managerId)) {
      newExpanded.delete(managerId);
    } else {
      newExpanded.add(managerId);
    }
    setExpandedManagers(newExpanded);
  };

  // Prepare data for category utilization chart
  const categoryData = departments.map(dept => {
    const stats = store.getDepartmentBudgetInfo(dept.id);
    const budgetItems = store.budgetItems.filter(item => {
      const team = store.teams.find(t => t.budget?.id === item.budgetId);
      const manager = team ? store.managers.find(m => m.id === team.managerId) : null;
      return manager?.departmentId === dept.id;
    });

    const categorySpending = organization.budgetCategories.reduce((acc, cat) => {
      const categoryItems = budgetItems.filter(item => item.budgetCategoryId === cat.id);
      acc[cat.name] = categoryItems.reduce((sum, item) => sum + (item.spent || 0), 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      name: dept.name,
      ...categorySpending
    };
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title={organization.name}
        backUrl="/organizations"
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
              <span className="font-medium text-gray-900">${organization.totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Spent:</span>
              <span className="font-medium text-blue-600">${totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining:</span>
              <span className="font-medium text-green-600">${remainingBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Category Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  height={60}
                  tickFormatter={(value) => value.split(' ').map(word => word.charAt(0)).join('')}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                {organization.budgetCategories.map((category, index) => (
                  <Bar
                    key={category.id}
                    dataKey={category.name}
                    stackId="a"
                    fill={`hsl(${index * (360 / organization.budgetCategories.length)}, 70%, 60%)`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Department Structure</h3>
        <div className="space-y-4">
          {departments.map(dept => {
            const isExpanded = expandedDepts.has(dept.id);
            const managers = store.getManagersByDepartment(dept.id);
            const stats = store.getDepartmentBudgetInfo(dept.id);

            return (
              <div key={dept.id} className="border rounded-lg">
                <button
                  onClick={() => toggleDepartment(dept.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
                      <p className="text-sm text-gray-500">Head: {dept.departmentHeadName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Budget: ${dept.totalBudget.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {managers.length} {managers.length === 1 ? 'Manager' : 'Managers'}
                    </p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 py-3">
                    <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Allocated</p>
                        <p className="text-lg font-medium text-indigo-600">
                          ${stats.allocated.toLocaleString()}
                        </p>
                      </div>
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

                    <div className="space-y-4 pl-6">
                      {managers.map(manager => {
                        const isManagerExpanded = expandedManagers.has(manager.id);
                        const teams = store.getTeamsByManager(manager.id);

                        return (
                          <div key={manager.id} className="border rounded-lg">
                            <button
                              onClick={() => toggleManager(manager.id)}
                              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                            >
                              <div className="flex items-center">
                                {isManagerExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                                )}
                                <div className="flex items-center">
                                  <Users className="h-5 w-5 text-indigo-600 mr-2" />
                                  <span className="text-sm font-medium">{manager.name}</span>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
                              </span>
                            </button>

                            {isManagerExpanded && (
                              <div className="border-t px-3 py-2">
                                <div className="space-y-2">
                                  {teams.map(team => {
                                    const teamStats = store.getTeamBudgetInfo(team.id);
                                    const isOverBudget = teamStats.remaining < 0;

                                    return (
                                      <div key={team.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                                        <span className="text-sm">{team.name}</span>
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
                                                  isOverBudget ? 'text-red-600' : 'text-green-600'
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