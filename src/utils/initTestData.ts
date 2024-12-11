import { useBudgetStore } from '../store/budgetStore';
import { generateId } from './generateId';
import { TravelType, TravelCategory } from '../types/enums';

export const initializeTestData = () => {
  const store = useBudgetStore.getState();

  // Clear existing data to prevent duplication
  if (store.organizations.length > 0) {
    return; // Exit if data already exists
  }

  // Create organization with budget categories
  const organizationId = generateId();
  const organization = {
    id: organizationId,
    name: 'SampleTestOrg',
    leaderName: 'Sarah Anderson',
    totalBudget: 5000000,
    budgetCategories: [
      {
        id: generateId(),
        organizationId,
        name: 'Training and Courses',
        description: 'Online courses, certifications, and workshops'
      },
      {
        id: generateId(),
        organizationId,
        name: 'Conferences',
        description: 'Industry conferences and tech events'
      },
      {
        id: generateId(),
        organizationId,
        name: 'Educational Materials',
        description: 'Books, subscriptions, and learning resources'
      },
      {
        id: generateId(),
        organizationId,
        name: 'Team Activities',
        description: 'Team outings and social events'
      },
      {
        id: generateId(),
        organizationId,
        name: 'Travel',
        description: 'Business travel expenses'
      }
    ]
  };

  // Add organization
  store.addOrganization(organization);

  // Create Departments
  const departments = [
    {
      id: generateId(),
      name: 'Engineering',
      departmentHeadName: 'Michael Chen',
      organizationId,
      totalBudget: 2000000
    },
    {
      id: generateId(),
      name: 'Product Management',
      departmentHeadName: 'Emily Rodriguez',
      organizationId,
      totalBudget: 1000000
    },
    {
      id: generateId(),
      name: 'Design',
      departmentHeadName: 'David Kim',
      organizationId,
      totalBudget: 800000
    },
    {
      id: generateId(),
      name: 'Operations',
      departmentHeadName: 'Lisa Thompson',
      organizationId,
      totalBudget: 700000
    },
    {
      id: generateId(),
      name: 'Customer Success',
      departmentHeadName: 'James Wilson',
      organizationId,
      totalBudget: 500000
    }
  ];

  departments.forEach(dept => store.addDepartment(dept));

  // Create Managers
  const managers = [
    // Engineering Managers
    {
      id: generateId(),
      name: 'Alex Kumar',
      departmentId: departments[0].id
    },
    {
      id: generateId(),
      name: 'Maria Garcia',
      departmentId: departments[0].id
    },
    // Product Manager
    {
      id: generateId(),
      name: 'John Smith',
      departmentId: departments[1].id
    },
    // Design Managers
    {
      id: generateId(),
      name: 'Sophie Lee',
      departmentId: departments[2].id
    },
    // Operations Managers
    {
      id: generateId(),
      name: 'Rachel Green',
      departmentId: departments[3].id
    },
    // Customer Success Manager
    {
      id: generateId(),
      name: 'Emma Watson',
      departmentId: departments[4].id
    }
  ];

  managers.forEach(manager => store.addManager(manager));

  // Helper function to create budget items with category distribution
  const createBudgetItems = (budgetId: string, totalAmount: number) => {
    const categories = organization.budgetCategories;
    const distributions = [
      { categoryId: categories[0].id, percentage: 0.20 }, // Training: 20%
      { categoryId: categories[1].id, percentage: 0.20 }, // Conferences: 20%
      { categoryId: categories[2].id, percentage: 0.15 }, // Educational: 15%
      { categoryId: categories[3].id, percentage: 0.15 }, // Team Activities: 15%
      { categoryId: categories[4].id, percentage: 0.30 }  // Travel: 30%
    ];

    distributions.forEach(dist => {
      const amount = totalAmount * dist.percentage;
      const itemId = generateId();
      
      // Add sample travel details for conference budget items
      const conferenceDetails = dist.categoryId === categories[1].id ? [
        {
          id: generateId(),
          budgetItemId: itemId,
          conferenceName: 'Tech Conference 2024',
          motivation: 'Learning new technologies and networking',
          travelType: TravelType.International,
          country: 'US',
          city: 'San Francisco',
          needsHotel: true,
          needsCarRental: true,
          needsAirTravel: true,
          flightCosts: 800,
          hotelCosts: 200,
          carRentalCosts: 100,
          mealCosts: 75,
          startDate: '2024-06-15',
          endDate: '2024-06-18',
          numberOfTravelers: 2,
          perPersonCost: 1075,
          totalAmount: 2150
        }
      ] : undefined;

      // Add sample business travel details for travel budget items
      const businessTravelDetails = dist.categoryId === categories[4].id ? [
        {
          id: generateId(),
          budgetItemId: itemId,
          purpose: 'Client Meeting - Project Kickoff',
          travelType: TravelType.International,
          travelCategory: TravelCategory.ClientVisit,
          country: 'UK',
          city: 'London',
          needsHotel: true,
          needsCarRental: false,
          needsAirTravel: true,
          flightCosts: 1200,
          hotelCosts: 300,
          carRentalCosts: 0,
          mealCosts: 100,
          startDate: '2024-04-10',
          endDate: '2024-04-14',
          numberOfTravelers: 3,
          perPersonCost: 1600,
          totalAmount: 4800
        },
        {
          id: generateId(),
          budgetItemId: itemId,
          purpose: 'Regional Office Visit',
          travelType: TravelType.Local,
          travelCategory: TravelCategory.InterOffice,
          country: 'US',
          city: 'Chicago',
          needsHotel: true,
          needsCarRental: true,
          needsAirTravel: true,
          flightCosts: 400,
          hotelCosts: 150,
          carRentalCosts: 200,
          mealCosts: 50,
          startDate: '2024-05-20',
          endDate: '2024-05-22',
          numberOfTravelers: 2,
          perPersonCost: 700,
          totalAmount: 1400
        }
      ] : undefined;

      store.addBudgetItem({
        id: itemId,
        budgetId,
        budgetCategoryId: dist.categoryId,
        amount,
        description: `Budget allocation for ${categories.find(c => c.id === dist.categoryId)?.name}`,
        spent: (conferenceDetails?.reduce((sum, detail) => sum + detail.totalAmount, 0) || 0) +
              (businessTravelDetails?.reduce((sum, detail) => sum + detail.totalAmount, 0) || 0),
        travelDetails: conferenceDetails,
        businessTravelDetails
      });
    });
  };

  // Create teams with budgets
  const createTeamWithBudget = (name: string, managerId: string, amount: number) => {
    const teamId = generateId();
    const budgetId = generateId();
    
    store.addTeam({
      id: teamId,
      name,
      managerId
    });

    store.addBudget({
      id: budgetId,
      teamId,
      totalAmount: amount,
      year: 2024
    });

    store.updateTeamBudget(teamId, budgetId);
    createBudgetItems(budgetId, amount);
  };

  // Create teams for each manager
  createTeamWithBudget('Frontend Development', managers[0].id, 600000);
  createTeamWithBudget('Backend Development', managers[0].id, 700000);
  createTeamWithBudget('Mobile Development', managers[1].id, 400000);
  createTeamWithBudget('Product Team', managers[2].id, 600000);
  createTeamWithBudget('UX Design', managers[3].id, 300000);
  createTeamWithBudget('Operations', managers[4].id, 400000);
  createTeamWithBudget('Customer Support', managers[5].id, 300000);
};