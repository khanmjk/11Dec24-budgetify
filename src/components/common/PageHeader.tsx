import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  backUrl?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, backUrl }) => {
  return (
    <div className="mb-8">
      {backUrl && (
        <Link
          to={backUrl}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
      )}
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    </div>
  );
};