import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBudgetStore } from '../../store/budgetStore';
import { PlusCircle, Users, ChevronRight, DollarSign } from 'lucide-react';
import { AllocateBudgetModal } from '../budget/AllocateBudgetModal';

interface DepartmentListProps {
  organizationId: string;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({ organizationId }) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const departments = useBudgetStore(state => state.getDepartmentsByOrganization(organizationId));
  const getManagersByDepartment = useBudgetStore(state => state.getManagersByDepartment);
  const getTeamsByManager = useBudgetStore(state => state.getTeamsByManager);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Departments</h2>
        <Link
          to={`/organization/${organizationId}/department/new`}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Department
        </Link>
      </div>

      {departments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No departments added yet.</p>
      ) : (
        <div className="space-y-4">
          {departments.map((dept) => {
            const deptManagers = getManagersByDepartment(dept.id);
            const totalTeams = deptManagers.reduce((acc, manager) => 
              acc + getTeamsByManager(manager.id).length, 0
            );

            return (
              <div
                key={dept.id}
                className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-grow">
                    <div className="flex items-center justify-between">
                      <Link to={`/department/${dept.id}`} className="hover:text-indigo-600">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
                          <p className="text-sm text-gray-500">Head: {dept.departmentHeadName}</p>
                        </div>
                      </Link>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Managers</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {deptManagers.length} {deptManagers.length === 1 ? 'Manager' : 'Managers'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Teams</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {totalTeams} {totalTeams === 1 ? 'Team' : 'Teams'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Budget</p>
                          <p className="mt-1 text-sm text-gray-900">
                            ${dept.totalBudget?.toLocaleString() || '0'}
                          </p>
                          <button
                            onClick={() => setSelectedDepartmentId(dept.id)}
                            className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            Allocate Budget
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedDepartmentId && (
        <AllocateBudgetModal
          departmentId={selectedDepartmentId}
          onClose={() => setSelectedDepartmentId(null)}
        />
      )}
    </div>
  );
};