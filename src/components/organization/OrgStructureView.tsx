import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { ChevronDown, ChevronRight, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { EditTeamBudgetModal } from '../budget/EditTeamBudgetModal';

interface OrgStructureViewProps {
  organizationId: string;
}

export const OrgStructureView: React.FC<OrgStructureViewProps> = ({ organizationId }) => {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const store = useBudgetStore();
  const organization = store.organizations.find(org => org.id === organizationId);
  const departments = store.getDepartmentsByOrganization(organizationId);

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

  // Calculate budget statistics for a team
  const getTeamBudgetStats = (teamId: string) => {
    const team = store.teams.find(t => t.id === teamId);
    if (!team?.budget) return { allocated: 0, spent: 0, remaining: 0 };

    const budgetItems = store.budgetItems.filter(item => item.budgetId === team.budget!.id);
    const allocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const spent = budgetItems.reduce((sum, item) => sum + (item.spent || 0), 0);
    const remaining = allocated - spent;

    return { allocated, spent, remaining };
  };

  // Calculate budget statistics for a manager
  const getManagerBudgetStats = (managerId: string) => {
    const teams = store.getTeamsByManager(managerId);
    return teams.reduce((stats, team) => {
      const teamStats = getTeamBudgetStats(team.id);
      return {
        allocated: stats.allocated + teamStats.allocated,
        spent: stats.spent + teamStats.spent,
        remaining: stats.remaining + teamStats.remaining
      };
    }, { allocated: 0, spent: 0, remaining: 0 });
  };

  // Calculate budget statistics for a department
  const getDepartmentBudgetStats = (deptId: string) => {
    const managers = store.getManagersByDepartment(deptId);
    return managers.reduce((stats, manager) => {
      const managerStats = getManagerBudgetStats(manager.id);
      return {
        allocated: stats.allocated + managerStats.allocated,
        spent: stats.spent + managerStats.spent,
        remaining: stats.remaining + managerStats.remaining
      };
    }, { allocated: 0, spent: 0, remaining: 0 });
  };

  if (!organization) return null;

  return (
    <div className="space-y-4">
      {departments.map(dept => {
        const isExpanded = expandedDepts.has(dept.id);
        const managers = store.getManagersByDepartment(dept.id);
        const deptStats = getDepartmentBudgetStats(dept.id);

        return (
          <div key={dept.id} className="border rounded-lg bg-white">
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
                  Budget: ${dept.totalBudget?.toLocaleString()}
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
                      ${deptStats.allocated.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Spent</p>
                    <p className="text-lg font-medium text-blue-600">
                      ${deptStats.spent.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className={`text-lg font-medium ${
                      deptStats.remaining < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${deptStats.remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pl-6">
                  {managers.map(manager => {
                    const isManagerExpanded = expandedManagers.has(manager.id);
                    const teams = store.getTeamsByManager(manager.id);
                    const managerStats = getManagerBudgetStats(manager.id);

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
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${managerStats.allocated.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
                            </p>
                          </div>
                        </button>

                        {isManagerExpanded && (
                          <div className="border-t px-3 py-2">
                            <div className="grid grid-cols-3 gap-4 mb-3 bg-gray-50 p-3 rounded-lg">
                              <div>
                                <p className="text-xs text-gray-500">Allocated</p>
                                <p className="text-sm font-medium text-indigo-600">
                                  ${managerStats.allocated.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Spent</p>
                                <p className="text-sm font-medium text-blue-600">
                                  ${managerStats.spent.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Remaining</p>
                                <p className={`text-sm font-medium ${
                                  managerStats.remaining < 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  ${managerStats.remaining.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {teams.map(team => {
                                const teamStats = getTeamBudgetStats(team.id);
                                const isOverBudget = teamStats.remaining < 0;

                                return (
                                  <div key={team.id}>
                                    <div className={`flex items-center justify-between p-2 rounded-md ${
                                      isOverBudget ? 'bg-red-50' : 'hover:bg-gray-50'
                                    }`}>
                                      <div className="flex items-center">
                                        {isOverBudget && (
                                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                                        )}
                                        <span className="text-sm">{team.name}</span>
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

      {selectedTeamId && (
        <EditTeamBudgetModal
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </div>
  );
};