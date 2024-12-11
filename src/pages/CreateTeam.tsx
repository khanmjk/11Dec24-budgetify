import React from 'react';
import { useParams } from 'react-router-dom';
import { TeamForm } from '../components/forms/TeamForm';

export const CreateTeam: React.FC = () => {
  const { managerId } = useParams<{ managerId: string }>();

  if (!managerId) {
    return <div>Manager ID is required</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Create New Team</h1>
      <TeamForm managerId={managerId} />
    </div>
  );
};