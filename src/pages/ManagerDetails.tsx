import React from 'react';
import { useParams } from 'react-router-dom';
import { useBudgetStore } from '../store/budgetStore';
import { PageHeader } from '../components/common/PageHeader';
import { TeamList } from '../components/lists/TeamList';

export const ManagerDetails: React.FC = () => {
  const { managerId } = useParams<{ managerId: string }>();
  const manager = useBudgetStore(state => 
    state.managers.find(m => m.id === managerId)
  );
  const department = useBudgetStore(state =>
    state.departments.find(d => d.id === manager?.departmentId)
  );

  if (!managerId || !manager || !department) {
    return <div>Manager not found</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title={manager.name}
        backUrl={`/department/${department.id}`}
      />
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Manager Details
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">{department.name}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      <TeamList managerId={managerId} />
    </div>
  );
};