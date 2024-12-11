import { TravelType } from './enums';

export interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  organizationId: string;  // Added to associate category with organization
}

export interface Organization {
  id: string;
  name: string;
  leaderName: string;
  totalBudget: number;
  budgetCategories: BudgetCategory[];  // Added to store org-specific categories
}

export interface Department {
  id: string;
  name: string;
  departmentHeadName: string;
  organizationId: string;
  totalBudget: number;
}

export interface Manager {
  id: string;
  name: string;
  departmentId: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  budget?: Budget;
}

export interface Budget {
  id: string;
  teamId: string;
  totalAmount: number;
  year: number;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  budgetCategoryId: string;
  amount: number;
  description: string;
  spent?: number;
  travelDetails?: TravelDetail[];
  businessTravelDetails?: BusinessTravelDetail[];
}

export interface TravelDetail {
  id: string;
  budgetItemId: string;
  conferenceName: string;
  motivation: string;
  travelType: TravelType;
  country: string;
  city: string;
  needsHotel: boolean;
  needsCarRental: boolean;
  needsAirTravel: boolean;
  flightCosts: number;
  hotelCosts: number;
  carRentalCosts: number;
  mealCosts: number;
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  perPersonCost: number;
  totalAmount: number;
}

export interface BusinessTravelDetail {
  id: string;
  budgetItemId: string;
  purpose: string;
  travelType: TravelType;
  travelCategory: string;
  country: string;
  city: string;
  needsHotel: boolean;
  needsCarRental: boolean;
  needsAirTravel: boolean;
  flightCosts: number;
  hotelCosts: number;
  carRentalCosts: number;
  mealCosts: number;
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  perPersonCost: number;
  totalAmount: number;
}

export interface Country {
  name: string;
  code: string;
}

export interface City {
  name: string;
  country: string;
  region?: string;
}

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}