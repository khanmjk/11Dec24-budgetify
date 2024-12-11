import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { DollarSign, TrendingUp, Users, Building } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}> = ({ title, value, icon, trend }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="rounded-md bg-indigo-500 p-3">
            {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {trend && (
                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <TrendingUp className="self-center flex-shrink-0 h-5 w-5" />
                  <span className="sr-only">Increased by</span>
                  {trend}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export const BudgetSummary: React.FC = () => {
  const store = useBudgetStore();
  const [selectedOrgId, setSelectedOrgId] = useState<string>(store.organizations[0]?.id || '');
  
  // Get selected organization
  const selectedOrg = store.organizations.find(org => org.id === selectedOrgId);
  
  if (!selectedOrg) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No organizations available</p>
      </div>
    );
  }

  // Calculate category-wise spending for the selected organization
  const getCategorySpending = () => {
    const categories = selectedOrg.budgetCategories;
    const relevantBudgetIds = store.teams
      .filter(team => {
        if (!team.budget) return false;
        const manager = store.managers.find(m => m.id === team.managerId);
        const department = manager 
          ? store.departments.find(d => d.id === manager.departmentId)
          : null;
        return department?.organizationId === selectedOrgId;
      })
      .map(team => team.budget!.id);

    return categories.map(category => {
      const amount = store.budgetItems
        .filter(item => 
          relevantBudgetIds.includes(item.budgetId) && 
          item.budgetCategoryId === category.id
        )
        .reduce((sum, item) => sum + item.amount, 0);
      
      return {
        name: category.name,
        value: amount
      };
    }).filter(item => item.value > 0);
  };

  const categorySpending = getCategorySpending();
  const totalBudget = selectedOrg.totalBudget;
  const departments = store.departments.filter(d => d.organizationId === selectedOrgId);
  const stats = store.getOrganizationBudgetInfo(selectedOrgId);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Budget Overview</h2>
        <select
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {store.organizations.map(org => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Budget"
          value={`$${totalBudget.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
        />
        <StatCard
          title="Total Allocated"
          value={`$${stats.allocated.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
        />
        <StatCard
          title="Total Spent"
          value={`$${stats.spent.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
        />
        <StatCard
          title="Remaining Budget"
          value={`$${stats.remaining.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Categories Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Category Details</h4>
            <div className="space-y-2">
              {categorySpending.map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${category.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Total Allocated</span>
                <span className="text-sm font-medium text-gray-900">
                  ${categorySpending.reduce((sum, cat) => sum + cat.value, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};