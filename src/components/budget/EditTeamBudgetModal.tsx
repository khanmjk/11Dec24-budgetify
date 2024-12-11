import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { AlertTriangle, Trash2, Edit2, Plus } from 'lucide-react';
import { ConferenceManageModal } from './ConferenceManageModal';
import { BusinessTravelManageModal } from './BusinessTravelManageModal';
import { BudgetAllocationModal } from './BudgetAllocationModal';

interface EditTeamBudgetModalProps {
  teamId: string;
  onClose: () => void;
}

export const EditTeamBudgetModal: React.FC<EditTeamBudgetModalProps> = ({
  teamId,
  onClose
}) => {
  const store = useBudgetStore();
  const [selectedConferenceId, setSelectedConferenceId] = useState<string | null>(null);
  const [selectedTravelId, setSelectedTravelId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  
  const team = store.teams.find(t => t.id === teamId);
  const manager = team ? store.managers.find(m => m.id === team.managerId) : null;
  const department = manager ? store.departments.find(d => d.id === manager.departmentId) : null;
  const organization = department ? store.organizations.find(o => o.id === department.organizationId) : null;
  
  if (!team || !team.budget || !organization) return null;

  const categories = organization.budgetCategories;
  const budgetItems = store.budgetItems.filter(item => item.budgetId === team.budget!.id);
  const teamStats = store.getTeamBudgetInfo(teamId);

  const handleDeleteItem = (itemId: string) => {
    store.deleteBudgetItem(itemId);
  };

  const handleEditAllocation = (categoryId: string, existingItem?: typeof budgetItems[0]) => {
    setEditingCategoryId(categoryId);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Edit Budget for {team.name}
            </h2>
            <p className="text-sm text-gray-500">
              {department?.name} • {manager?.name}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">×</button>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-lg font-medium text-gray-900">
                ${team.budget.totalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Allocated</p>
              <p className="text-lg font-medium text-indigo-600">
                ${teamStats.allocated.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className={`text-lg font-medium ${
                teamStats.remaining < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${teamStats.remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spent
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => {
                const budgetItem = budgetItems.find(item => item.budgetCategoryId === category.id);
                const isConference = category.name === 'Conferences';
                const isTravel = category.name === 'Travel';
                const allocated = budgetItem?.amount || 0;
                const spent = budgetItem?.spent || 0;
                const remaining = allocated - spent;
                const isOverBudget = remaining < 0;

                return (
                  <tr key={category.id} className={budgetItem ? '' : 'text-gray-400'}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span>{category.name}</span>
                        {(isConference || isTravel) && budgetItem && (
                          <button
                            onClick={() => isConference ? setSelectedConferenceId(budgetItem.id) : setSelectedTravelId(budgetItem.id)}
                            className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                          >
                            Manage
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                      ${allocated.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                      ${spent.toLocaleString()}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right ${
                      isOverBudget ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${remaining.toLocaleString()}
                      {isOverBudget && (
                        <AlertTriangle className="inline-block ml-1 h-4 w-4 text-red-500" />
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        {budgetItem ? (
                          <>
                            <button
                              onClick={() => handleEditAllocation(category.id, budgetItem)}
                              className="text-indigo-600 hover:text-indigo-900 p-2"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(budgetItem.id)}
                              className="text-red-600 hover:text-red-900 p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditAllocation(category.id)}
                            className="text-indigo-600 hover:text-indigo-900 p-2"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedConferenceId && (
        <ConferenceManageModal
          budgetItemId={selectedConferenceId}
          onClose={() => setSelectedConferenceId(null)}
        />
      )}

      {selectedTravelId && (
        <BusinessTravelManageModal
          budgetItemId={selectedTravelId}
          onClose={() => setSelectedTravelId(null)}
        />
      )}

      {editingCategoryId && (
        <BudgetAllocationModal
          teamId={teamId}
          categoryId={editingCategoryId}
          budgetItem={budgetItems.find(item => item.budgetCategoryId === editingCategoryId)}
          onClose={() => setEditingCategoryId(null)}
        />
      )}
    </div>
  );
};