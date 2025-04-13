
import React, { useState, useEffect } from 'react';
import { getRecommendedProjects } from '@/services/aiResearchService';
import { ProjectSuggestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ThumbsUp, ExternalLink, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecommendedProjectsProps {
  skills: string[];
  interests?: string;
  experienceLevel?: string;
  goals?: string;
  onSelectProject?: (project: ProjectSuggestion) => void;
}

const RecommendedProjects: React.FC<RecommendedProjectsProps> = ({
  skills,
  interests = '',
  experienceLevel = 'beginner',
  goals = '',
  onSelectProject
}) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ProjectSuggestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (skills.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getRecommendedProjects(skills, interests, experienceLevel, goals);
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast({
          title: "Error fetching recommendations",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [skills, interests, experienceLevel, goals, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No recommendations available. Try adding more skills to your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Recommended Projects</h3>
      <div className="grid gap-6 md:grid-cols-2">
        {recommendations.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {project.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-muted">
                  {project.timeEstimate}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.description}</p>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-muted">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {project.tags && project.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-secondary/10 text-secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Resources:</h4>
                <ul className="space-y-2">
                  {project.resources.slice(0, 3).map((resource, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      <a 
                        href={resource.url !== '#' ? resource.url : `https://www.google.com/search?q=${encodeURIComponent(resource.title)}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => onSelectProject && onSelectProject(project)}
              >
                <ThumbsUp className="h-4 w-4" />
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
        ))}
      </div>
    </div>
  );
};

export default RecommendedProjects;
