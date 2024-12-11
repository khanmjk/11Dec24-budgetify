import { create } from 'zustand';
import type { Organization, Department, Manager, Team, Budget, BudgetCategory, BudgetItem } from '../types/models';

interface BudgetStore {
  organizations: Organization[];
  departments: Department[];
  managers: Manager[];
  teams: Team[];
  budgets: Budget[];
  budgetItems: BudgetItem[];
  
  // Actions
  addOrganization: (org: Organization) => void;
  addDepartment: (dept: Department) => { success: boolean; error?: string };
  addManager: (manager: Manager) => void;
  addTeam: (team: Team) => void;
  addBudget: (budget: Budget) => void;
  addBudgetItem: (item: BudgetItem) => void;
  deleteBudgetItem: (itemId: string) => void;
  updateTeamBudget: (teamId: string, budgetId: string) => void;
  updateDepartmentBudget: (department: Department) => void;
  updateOrganizationCategories: (organizationId: string, categories: BudgetCategory[]) => void;
  
  // Selectors
  getDepartmentsByOrganization: (organizationId: string) => Department[];
  getManagersByDepartment: (departmentId: string) => Manager[];
  getTeamsByManager: (managerId: string) => Team[];
  getBudgetItems: (budgetId: string) => BudgetItem[];
  getBudgetCategories: (organizationId: string) => BudgetCategory[];
  getOrganizationTotalSpent: (organizationId: string) => number;
  getOrganizationBudgetInfo: (organizationId: string) => { allocated: number; spent: number; remaining: number };
  getTeamBudgetInfo: (teamId: string) => { allocated: number; spent: number; remaining: number };
  getDepartmentBudgetInfo: (departmentId: string) => { allocated: number; spent: number; remaining: number };
  getManagerBudgetInfo: (managerId: string) => { allocated: number; spent: number; remaining: number };
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  organizations: [],
  departments: [],
  managers: [],
  teams: [],
  budgets: [],
  budgetItems: [],

  addOrganization: (org) => set((state) => ({
    organizations: [...state.organizations, org]
  })),

  addDepartment: (dept) => {
    const state = get();
    const existingDept = state.departments.find(
      d => d.organizationId === dept.organizationId && d.name === dept.name
    );
    
    if (existingDept) {
      return {
        success: false,
        error: 'A department with this name already exists in the organization'
      };
    }

    set((state) => ({
      departments: [...state.departments, dept]
    }));

    return { success: true };
  },

  addManager: (manager) => set((state) => ({
    managers: [...state.managers, manager]
  })),

  addTeam: (team) => set((state) => ({
    teams: [...state.teams, team]
  })),

  addBudget: (budget) => set((state) => ({
    budgets: [...state.budgets.filter(b => b.id !== budget.id), budget]
  })),

  addBudgetItem: (item) => set((state) => ({
    budgetItems: [...state.budgetItems.filter(i => i.id !== item.id), item]
  })),

  deleteBudgetItem: (itemId) => set((state) => ({
    budgetItems: state.budgetItems.filter(i => i.id !== itemId)
  })),

  updateTeamBudget: (teamId, budgetId) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === teamId
        ? { ...team, budget: state.budgets.find(b => b.id === budgetId) }
        : team
    )
  })),

  updateDepartmentBudget: (department) => set((state) => ({
    departments: state.departments.map(dept =>
      dept.id === department.id ? department : dept
    )
  })),

  updateOrganizationCategories: (organizationId, categories) => set((state) => ({
    organizations: state.organizations.map(org =>
      org.id === organizationId
        ? { ...org, budgetCategories: categories }
        : org
    )
  })),

  getDepartmentsByOrganization: (organizationId) => {
    const state = get();
    return state.departments.filter(dept => dept.organizationId === organizationId);
  },

  getManagersByDepartment: (departmentId) => {
    const state = get();
    return state.managers.filter(manager => manager.departmentId === departmentId);
  },

  getTeamsByManager: (managerId) => {
    const state = get();
    return state.teams.filter(team => team.managerId === managerId);
  },

  getBudgetItems: (budgetId) => {
    const state = get();
    return state.budgetItems.filter(item => item.budgetId === budgetId);
  },

  getBudgetCategories: (organizationId) => {
    const state = get();
    const organization = state.organizations.find(org => org.id === organizationId);
    return organization?.budgetCategories || [];
  },

  getOrganizationTotalSpent: (organizationId) => {
    const state = get();
    const departments = state.departments.filter(d => d.organizationId === organizationId);
    return departments.reduce((total, dept) => {
      const managers = state.managers.filter(m => m.departmentId === dept.id);
      const deptSpent = managers.reduce((mTotal, manager) => {
        const teams = state.teams.filter(t => t.managerId === manager.id);
        return mTotal + teams.reduce((tTotal, team) => {
          if (!team.budget) return tTotal;
          const items = state.budgetItems.filter(i => i.budgetId === team.budget!.id);
          return tTotal + items.reduce((iTotal, item) => iTotal + (item.spent || 0), 0);
        }, 0);
      }, 0);
      return total + deptSpent;
    }, 0);
  },

  getOrganizationBudgetInfo: (organizationId) => {
    const state = get();
    const organization = state.organizations.find(o => o.id === organizationId);
    if (!organization) return { allocated: 0, spent: 0, remaining: 0 };

    const departments = state.departments.filter(d => d.organizationId === organizationId);
    let totalAllocated = 0;
    let totalSpent = 0;

    departments.forEach(dept => {
      const managers = state.managers.filter(m => m.departmentId === dept.id);
      managers.forEach(manager => {
        const teams = state.teams.filter(t => t.managerId === manager.id);
        teams.forEach(team => {
          if (team.budget) {
            const items = state.budgetItems.filter(i => i.budgetId === team.budget!.id);
            totalAllocated += items.reduce((sum, item) => sum + item.amount, 0);
            totalSpent += items.reduce((sum, item) => sum + (item.spent || 0), 0);
          }
        });
      });
    });

    return {
      allocated: totalAllocated,
      spent: totalSpent,
      remaining: organization.totalBudget - totalSpent
    };
  },

  getTeamBudgetInfo: (teamId) => {
    const state = get();
    const team = state.teams.find(t => t.id === teamId);
    if (!team?.budget) return { allocated: 0, spent: 0, remaining: 0 };

    const items = state.budgetItems.filter(item => item.budgetId === team.budget!.id);
    const allocated = items.reduce((sum, item) => sum + item.amount, 0);
    const spent = items.reduce((sum, item) => sum + (item.spent || 0), 0);

    return {
      allocated,
      spent,
      remaining: allocated - spent
    };
  },

  getDepartmentBudgetInfo: (departmentId) => {
    const state = get();
    const department = state.departments.find(d => d.id === departmentId);
    if (!department) return { allocated: 0, spent: 0, remaining: 0 };

    const managers = state.managers.filter(m => m.departmentId === departmentId);
    let totalAllocated = 0;
    let totalSpent = 0;

    managers.forEach(manager => {
      const teams = state.teams.filter(t => t.managerId === manager.id);
      teams.forEach(team => {
        if (team.budget) {
          const items = state.budgetItems.filter(i => i.budgetId === team.budget!.id);
          totalAllocated += items.reduce((sum, item) => sum + item.amount, 0);
          totalSpent += items.reduce((sum, item) => sum + (item.spent || 0), 0);
        }
      });
    });

    return {
      allocated: totalAllocated,
      spent: totalSpent,
      remaining: department.totalBudget - totalSpent
    };
  },

  getManagerBudgetInfo: (managerId) => {
    const state = get();
    const teams = state.teams.filter(t => t.managerId === managerId);
    let totalAllocated = 0;
    let totalSpent = 0;

    teams.forEach(team => {
      if (team.budget) {
        const items = state.budgetItems.filter(i => i.budgetId === team.budget!.id);
        totalAllocated += items.reduce((sum, item) => sum + item.amount, 0);
        totalSpent += items.reduce((sum, item) => sum + (item.spent || 0), 0);
      }
    });

    return {
      allocated: totalAllocated,
      spent: totalSpent,
      remaining: totalAllocated - totalSpent
    };
  }
}));