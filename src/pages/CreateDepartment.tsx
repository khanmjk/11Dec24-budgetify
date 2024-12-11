import React from 'react';
import { useParams } from 'react-router-dom';
import { DepartmentForm } from '../components/forms/DepartmentForm';

export const CreateDepartment: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();

  if (!organizationId) {
    return <div>Organization ID is required</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Create New Department</h1>
      <DepartmentForm organizationId={organizationId} />
    </div>
  );
};