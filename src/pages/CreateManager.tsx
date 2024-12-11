import React from 'react';
import { useParams } from 'react-router-dom';
import { ManagerForm } from '../components/forms/ManagerForm';
import { PageHeader } from '../components/common/PageHeader';

export const CreateManager: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();

  if (!departmentId) {
    return <div>Department ID is required</div>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader 
        title="Add New Manager" 
        backUrl={`/department/${departmentId}`} 
      />
      <ManagerForm departmentId={departmentId} />
    </div>
  );
};