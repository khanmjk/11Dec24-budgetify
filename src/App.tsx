import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Organizations } from './pages/Organizations';
import { Departments } from './pages/Departments';
import { Teams } from './pages/Teams';
import { CreateOrganization } from './pages/CreateOrganization';
import { CreateDepartment } from './pages/CreateDepartment';
import { CreateTeam } from './pages/CreateTeam';
import { CreateManager } from './pages/CreateManager';
import { CreateBudget } from './pages/CreateBudget';
import { OrganizationDetails } from './pages/OrganizationDetails';
import { DepartmentDetails } from './pages/DepartmentDetails';
import { ManagerDetails } from './pages/ManagerDetails';
import { initializeTestData } from './utils/initTestData';

function App() {
  useEffect(() => {
    initializeTestData();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="departments" element={<Departments />} />
          <Route path="teams" element={<Teams />} />
          <Route path="organization/new" element={<CreateOrganization />} />
          <Route path="organization/:organizationId" element={<OrganizationDetails />} />
          <Route path="organization/:organizationId/department/new" element={<CreateDepartment />} />
          <Route path="department/:departmentId" element={<DepartmentDetails />} />
          <Route path="department/:departmentId/manager/new" element={<CreateManager />} />
          <Route path="manager/:managerId" element={<ManagerDetails />} />
          <Route path="manager/:managerId/team/new" element={<CreateTeam />} />
          <Route path="team/:teamId/budget/new" element={<CreateBudget />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;