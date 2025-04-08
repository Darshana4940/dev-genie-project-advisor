
import React, { useState, useEffect } from 'react';
import { getRecommendedProjects, submitProjectFeedback } from '@/services/aiResearchService';
import { ProjectSuggestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecommendedProjectsProps {
  skills: string[];
  onSelectProject?: (project: ProjectSuggestion) => void;
}

const RecommendedProjects: React.FC<RecommendedProjectsProps> = ({
  skills,
  onSelectProject
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ProjectSuggestion[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (skills.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getRecommendedProjects(skills);
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [skills]);

  const handleFeedback = async (projectId: string, isPositive: boolean) => {
    try {
      await submitProjectFeedback(projectId, {
        isPositive,
        timestamp: new Date().toISOString(),
        skills
      });
      
      setFeedbackSubmitted((prev) => ({
        ...prev,
        [projectId]: true
      }));
      
      toast({
        title: "Feedback received",
        description: "Thank you for your feedback! It helps us improve recommendations.",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

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
              
              <div className="flex gap-2">
                {feedbackSubmitted[project.id] ? (
                  <span className="text-sm text-muted-foreground">Thanks for your feedback!</span>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-green-500 hover:text-green-600 hover:bg-green-100"
                      onClick={() => handleFeedback(project.id, true)}
                      title="This recommendation is helpful"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="sr-only">Helpful</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-100"
                      onClick={() => handleFeedback(project.id, false)}
                      title="This recommendation is not helpful"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="sr-only">Not helpful</span>
                    </Button>
                  </>
                )}
                
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
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProjects;
