import React from 'react';
import { useParams } from 'react-router-dom';
import { BudgetForm } from '../components/forms/BudgetForm';
import { PageHeader } from '../components/common/PageHeader';
import { useBudgetStore } from '../store/budgetStore';

export const CreateBudget: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const team = useBudgetStore(state => state.teams.find(t => t.id === teamId));
  const manager = useBudgetStore(state => 
    state.managers.find(m => m.id === team?.managerId)
  );

  if (!teamId || !team || !manager) {
    return <div>Team not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader 
        title={`Create Budget for ${team.name}`}
        backUrl={`/manager/${manager.id}`}
      />
      <BudgetForm teamId={teamId} />
    </div>
  );
};