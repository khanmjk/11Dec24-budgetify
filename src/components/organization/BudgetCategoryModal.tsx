import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { FormField } from '../common/FormField';
import { AlertTriangle, Plus, Trash2, Edit2 } from 'lucide-react';
import { generateId } from '../../utils/generateId';
import type { BudgetCategory } from '../../types/models';

interface BudgetCategoryModalProps {
  organizationId: string;
  onClose: () => void;
}

export const BudgetCategoryModal: React.FC<BudgetCategoryModalProps> = ({
  organizationId,
  onClose
}) => {
  const store = useBudgetStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');

  const organization = store.organizations.find(org => org.id === organizationId);
  if (!organization) return null;

  const getCategoryUsage = (categoryId: string) => {
    const budgetItems = store.budgetItems.filter(item => item.budgetCategoryId === categoryId);
    const teams = new Set<string>();
    const departments = new Set<string>();

    budgetItems.forEach(item => {
      const budget = store.budgets.find(b => b.id === item.budgetId);
      if (budget) {
        const team = store.teams.find(t => t.id === budget.teamId);
        if (team) {
          teams.add(team.id);
          const manager = store.managers.find(m => m.id === team.managerId);
          if (manager) {
            departments.add(manager.departmentId);
          }
        }
      }
    });

    return {
      itemCount: budgetItems.length,
      teamCount: teams.size,
      departmentCount: departments.size,
      isInUse: budgetItems.length > 0
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    // Check for duplicate names
    const isDuplicate = organization.budgetCategories.some(
      cat => cat.name.toLowerCase() === formData.name.toLowerCase() &&
      (!editingCategory || cat.id !== editingCategory.id)
    );

    if (isDuplicate) {
      setError('A category with this name already exists');
      return;
    }

    const updatedCategories = [...organization.budgetCategories];
    
    if (editingCategory) {
      const index = updatedCategories.findIndex(cat => cat.id === editingCategory.id);
      if (index !== -1) {
        updatedCategories[index] = {
          ...editingCategory,
          name: formData.name,
          description: formData.description
        };
      }
    } else {
      updatedCategories.push({
        id: generateId(),
        organizationId,
        name: formData.name,
        description: formData.description
      });
    }

    store.updateOrganizationCategories(organizationId, updatedCategories);
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (category: BudgetCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description
    });
    setShowForm(true);
  };

  const handleDelete = (categoryId: string) => {
    const usage = getCategoryUsage(categoryId);
    if (usage.isInUse) {
      const confirmDelete = window.confirm(
        `This category is used by ${usage.itemCount} budget items across ${usage.teamCount} teams and ${usage.departmentCount} departments. Are you sure you want to delete it?`
      );
      if (!confirmDelete) return;
    }

    const updatedCategories = organization.budgetCategories.filter(cat => cat.id !== categoryId);
    store.updateOrganizationCategories(organizationId, updatedCategories);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Manage Budget Categories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">×</button>
        </div>

        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingCategory(null);
                setFormData({ name: '', description: '' });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <FormField
              label="Category Name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  setFormData({ name: '', description: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                {editingCategory ? 'Update' : 'Add'} Category
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {organization.budgetCategories.map(category => {
              const usage = getCategoryUsage(category.id);
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                    {usage.isInUse && (
                      <div className="mt-2 text-xs text-gray-500">
                        Used in {usage.itemCount} budget items across {usage.teamCount} teams and {usage.departmentCount} departments
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-gray-500"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};