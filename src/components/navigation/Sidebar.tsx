import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Briefcase,
  PieChart,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const NavItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
      active
        ? 'bg-indigo-800 text-white'
        : 'text-indigo-100 hover:bg-indigo-700'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
    <ChevronRight 
      className={`ml-auto h-4 w-4 ${active ? 'text-white' : 'text-indigo-300'}`}
    />
  </Link>
);

export const Sidebar: React.FC<SidebarProps> = ({ mobile, onClose }) => {
  const location = useLocation();
  const path = location.pathname;

  const handleNavClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  const content = (
    <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <Building2 className="h-8 w-8 text-indigo-300" />
        <span className="ml-2 text-xl font-semibold text-white">
          BudgetPro
        </span>
      </div>
      <nav className="mt-8 flex-1 space-y-2 px-2">
        <NavItem
          to="/"
          icon={<PieChart className="h-5 w-5" />}
          label="Overview"
          active={path === '/'}
          onClick={handleNavClick}
        />
        <NavItem
          to="/organizations"
          icon={<Building2 className="h-5 w-5" />}
          label="Organizations"
          active={path.startsWith('/organization')}
          onClick={handleNavClick}
        />
        <NavItem
          to="/departments"
          icon={<Briefcase className="h-5 w-5" />}
          label="Departments"
          active={path.startsWith('/department')}
          onClick={handleNavClick}
        />
        <NavItem
          to="/teams"
          icon={<Users className="h-5 w-5" />}
          label="Teams"
          active={path.startsWith('/team')}
          onClick={handleNavClick}
        />
      </nav>
    </div>
  );

  if (mobile) {
    return (
      <div className="h-full">
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64">
      {content}
    </div>
  );
};