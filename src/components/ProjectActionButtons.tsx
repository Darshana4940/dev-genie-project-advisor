import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AIConfigState, ProjectSuggestion } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bookmark, FileText, MessageCircle, Share2, BookMarked, Code } from 'lucide-react';
import ResearchPaperDialog from './ResearchPaperDialog';
import ProjectReviewDialog from './ProjectReviewDialog';
import ResearchPaperView from './ResearchPaperView';
import ProjectSourceCode from './ProjectSourceCode';
import { toJson } from '@/utils/typeUtils';

interface ProjectActionButtonsProps {
  project: ProjectSuggestion;
  aiConfig: AIConfigState;
  onProjectSaved?: () => void;
}

const ProjectActionButtons: React.FC<ProjectActionButtonsProps> = ({
  project,
  aiConfig,
  onProjectSaved
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [researchPaperOpen, setResearchPaperOpen] = useState(false);
  const [sourceCodeOpen, setSourceCodeOpen] = useState(false);

  const handleSaveProject = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save this project.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_projects')
        .insert({
          user_id: user.id,
          project_data: toJson(project) // Convert to Json type
        });

      if (error) throw error;

      toast({
        title: "Project Saved",
        description: "The project has been added to your saved list.",
      });

      if (onProjectSaved) {
        onProjectSaved();
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareProject = () => {
    if (navigator.share) {
      navigator.share({
        title: `Project Idea: ${project.title}`,
        text: `Check out this project idea: ${project.title} - ${project.description}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareText = `${project.title}: ${project.description}`;
      navigator.clipboard.writeText(shareText);
      
      toast({
        title: "Copied to Clipboard",
        description: "Project details copied to clipboard. You can now share it manually.",
      });
    }
  };

  const openResearchPaper = () => {
    setResearchPaperOpen(true);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleSaveProject}
      >
        <Bookmark className="h-4 w-4" />
        <span>Save Project</span>
      </Button>

      <ResearchPaperDialog 
        projectTitle={project.title} 
        projectDescription={project.description}
        projectSkills={project.skills} 
        aiConfig={aiConfig} 
      />

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={openResearchPaper}
      >
        <FileText className="h-4 w-4" />
        <span>Research Paper</span>
      </Button>

      <ProjectReviewDialog project={project} />

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setSourceCodeOpen(true)}
      >
        <Code className="h-4 w-4" />
        <span>Source Code</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleShareProject}
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>

      <ResearchPaperView
        project={project}
        open={researchPaperOpen}
        onOpenChange={setResearchPaperOpen}
        aiConfig={aiConfig}
      />

      <ProjectSourceCode
        project={project}
        open={sourceCodeOpen}
        onOpenChange={setSourceCodeOpen}
      />
    </div>
  );
};

export default ProjectActionButtons;
