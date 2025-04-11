
import React from 'react';
import { ProjectSuggestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ProjectGrid from './ProjectGrid';

interface ProviderRecommendationsProps {
  projects: ProjectSuggestion[];
  loading: boolean;
  provider: string;
  onRefresh: () => void;
  disabled: boolean;
  onSelectProject?: (project: ProjectSuggestion) => void;
}

const ProviderRecommendations: React.FC<ProviderRecommendationsProps> = ({
  projects,
  loading,
  provider,
  onRefresh,
  disabled,
  onSelectProject
}) => {
  if (projects.length > 0) {
    return <ProjectGrid projects={projects} onSelectProject={onSelectProject} />;
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">
        No {provider} recommendations yet. Click refresh to get AI-powered project ideas.
      </p>
      <Button 
        onClick={onRefresh}
        disabled={disabled}
      >
        Generate {provider} Recommendations
      </Button>
    </div>
  );
};

export default ProviderRecommendations;
