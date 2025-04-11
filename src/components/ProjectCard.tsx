
import React from 'react';
import { ProjectSuggestion } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: ProjectSuggestion;
  onSelectProject?: (project: ProjectSuggestion) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {project.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-muted">
            {project.timeEstimate}
          </Badge>
          {project.skillMatchScore && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              {project.skillMatchScore}% Match
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{project.description}</p>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Skills Required:</h4>
          <div className="flex flex-wrap gap-2">
            {project.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-muted">
                {skill}
              </Badge>
            ))}
            {project.skills.length > 5 && (
              <Badge variant="secondary" className="bg-muted">+{project.skills.length - 5}</Badge>
            )}
          </div>
        </div>
        
        {project.tags && project.tags.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-secondary/10 text-secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="bg-secondary/10 text-secondary">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onSelectProject && onSelectProject(project)}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          View Details
        </Button>
        
        {project.sourceCode?.githubUrl && (
          <a 
            href={project.sourceCode.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            GitHub
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
