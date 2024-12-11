import React from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { Users } from 'lucide-react';

interface SelectTeamModalProps {
  departmentId: string;
  onSelect: (teamId: string) => void;
  onClose: () => void;
}

export const SelectTeamModal: React.FC<SelectTeamModalProps> = ({ 
  departmentId, 
  onSelect, 
  onClose 
}) => {
  const store = useBudgetStore();
  
  // Get all teams for the department
  const managers = store.managers.filter(m => m.departmentId === departmentId);
  const teams = managers.reduce((allTeams, manager) => {
    const managerTeams = store.teams.filter(t => t.managerId === manager.id);
    return [...allTeams, ...managerTeams];
  }, [] as typeof store.teams);

  // Group teams by manager
  const teamsByManager = managers.map(manager => ({
    manager,
    teams: store.teams.filter(t => t.managerId === manager.id)
  }));

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Select Team to Edit Budget
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {teamsByManager.map(({ manager, teams }) => (
            <div key={manager.id} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">
                {manager.name}'s Teams
              </h3>
              <div className="space-y-2">
                {teams.map(team => {
                  const budgetInfo = store.getTeamBudgetInfo(team.id);
                  const isOverBudget = budgetInfo.remaining < 0;
                  
                  return (
                    <button
                      key={team.id}
                      onClick={() => onSelect(team.id)}
                      className={`w-full text-left p-4 rounded-lg border hover:border-indigo-500 hover:shadow-sm transition-all ${
                        isOverBudget ? 'bg-red-50 border-red-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className={`h-5 w-5 ${
                            isOverBudget ? 'text-red-500' : 'text-indigo-600'
                          } mr-2`} />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{team.name}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Allocated</p>
                              <p className="font-medium text-gray-900">
                                ${budgetInfo.allocated.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Spent</p>
                              <p className="font-medium text-blue-600">
                                ${budgetInfo.spent.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Remaining</p>
                              <p className={`font-medium ${
                                isOverBudget ? 'text-red-600' : 'text-green-600'
                              }`}>
                                ${budgetInfo.remaining.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};