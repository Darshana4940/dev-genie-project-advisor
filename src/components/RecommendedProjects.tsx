
import React, { useState, useEffect } from 'react';
import { getRecommendedProjects, getEnhancedRecommendations } from '@/services/aiResearchService';
import { ProjectSuggestion, AIConfigState } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ThumbsUp, ExternalLink, Tag, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RecommendedProjectsProps {
  skills: string[];
  interests?: string;
  experienceLevel?: string;
  goals?: string;
  aiConfig?: AIConfigState;
  onSelectProject?: (project: ProjectSuggestion) => void;
}

const RecommendedProjects: React.FC<RecommendedProjectsProps> = ({
  skills,
  interests = '',
  experienceLevel = 'beginner',
  goals = '',
  aiConfig,
  onSelectProject
}) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ProjectSuggestion[]>([]);
  const [enhancedRecommendations, setEnhancedRecommendations] = useState<Record<string, ProjectSuggestion[]>>({
    openai: [],
    gemini: [],
    github: []
  });
  const [activeProvider, setActiveProvider] = useState<string>('all');
  const [loadingProviders, setLoadingProviders] = useState<Record<string, boolean>>({
    openai: false,
    gemini: false,
    github: false
  });
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

  const fetchEnhancedRecommendations = async (provider: string) => {
    if (!aiConfig) return;
    
    setLoadingProviders(prev => ({ ...prev, [provider]: true }));
    
    try {
      const enhancedData = await getEnhancedRecommendations(
        skills, 
        interests, 
        experienceLevel, 
        goals, 
        provider,
        aiConfig
      );
      
      setEnhancedRecommendations(prev => ({
        ...prev,
        [provider]: enhancedData
      }));
      
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Recommendations`,
        description: `Successfully fetched ${enhancedData.length} project suggestions.`,
      });
    } catch (error) {
      console.error(`Error fetching ${provider} recommendations:`, error);
      toast({
        title: `Error with ${provider}`,
        description: `Could not fetch recommendations from ${provider}. ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoadingProviders(prev => ({ ...prev, [provider]: false }));
    }
  };

  const getDisplayedProjects = (): ProjectSuggestion[] => {
    if (activeProvider === 'all') {
      return recommendations;
    }
    
    return enhancedRecommendations[activeProvider] || [];
  };

  const displayedProjects = getDisplayedProjects();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Recommended Projects</h3>
      
      {aiConfig && (
        <Tabs value={activeProvider} onValueChange={setActiveProvider} className="w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <TabsList className="h-auto p-1">
              <TabsTrigger value="all" className="px-3 py-1.5">
                Default
              </TabsTrigger>
              <TabsTrigger value="openai" className="px-3 py-1.5" disabled={!aiConfig.openai.enabled}>
                OpenAI
              </TabsTrigger>
              <TabsTrigger value="gemini" className="px-3 py-1.5" disabled={!aiConfig.gemini.enabled}>
                Gemini
              </TabsTrigger>
              <TabsTrigger value="github" className="px-3 py-1.5" disabled={!aiConfig.github.enabled}>
                GitHub
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {activeProvider !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchEnhancedRecommendations(activeProvider)}
                  disabled={loadingProviders[activeProvider]}
                >
                  {loadingProviders[activeProvider] ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {renderProjectGrid(recommendations)}
          </TabsContent>
          
          <TabsContent value="openai" className="mt-0">
            {enhancedRecommendations.openai.length > 0 ? (
              renderProjectGrid(enhancedRecommendations.openai)
            ) : loadingProviders.openai ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No OpenAI recommendations yet. Click refresh to get AI-powered project ideas.
                </p>
                <Button 
                  onClick={() => fetchEnhancedRecommendations('openai')}
                  disabled={loadingProviders.openai || !aiConfig.openai.enabled}
                >
                  Generate OpenAI Recommendations
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="gemini" className="mt-0">
            {enhancedRecommendations.gemini.length > 0 ? (
              renderProjectGrid(enhancedRecommendations.gemini)
            ) : loadingProviders.gemini ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No Gemini recommendations yet. Click refresh to get AI-powered project ideas.
                </p>
                <Button 
                  onClick={() => fetchEnhancedRecommendations('gemini')}
                  disabled={loadingProviders.gemini || !aiConfig.gemini.enabled}
                >
                  Generate Gemini Recommendations
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="github" className="mt-0">
            {enhancedRecommendations.github.length > 0 ? (
              renderProjectGrid(enhancedRecommendations.github)
            ) : loadingProviders.github ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No GitHub recommendations yet. Click refresh to get AI-powered project ideas.
                </p>
                <Button 
                  onClick={() => fetchEnhancedRecommendations('github')}
                  disabled={loadingProviders.github || !aiConfig.github.enabled}
                >
                  Generate GitHub Recommendations
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {!aiConfig && displayedProjects.length > 0 && renderProjectGrid(displayedProjects)}
      
      {!aiConfig && displayedProjects.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No recommendations available. Try adding more skills to your profile.
          </p>
        </div>
      )}
    </div>
  );
  
  function renderProjectGrid(projects: ProjectSuggestion[]) {
    return projects.length > 0 ? (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
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
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No recommendations available. Try adding more skills to your profile.
        </p>
      </div>
    );
  }
};

export default RecommendedProjects;
