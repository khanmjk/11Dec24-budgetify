import React from 'react';
import { OrganizationForm } from '../components/forms/OrganizationForm';

export const CreateOrganization: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Create New Organization</h1>
      <OrganizationForm />
    </div>
  );
};