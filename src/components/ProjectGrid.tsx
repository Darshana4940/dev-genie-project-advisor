
import React from 'react';
import { ProjectSuggestion } from '@/types';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: ProjectSuggestion[];
  onSelectProject?: (project: ProjectSuggestion) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onSelectProject }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No recommendations available. Try adding more skills to your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onSelectProject={onSelectProject}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
