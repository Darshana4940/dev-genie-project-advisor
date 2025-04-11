
import React, { useState } from 'react';
import { AIConfigState, ProjectSuggestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectGrid from './ProjectGrid';
import ProviderRecommendations from './ProviderRecommendations';
import { useRecommendations } from '@/hooks/useRecommendations';

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
  const [activeProvider, setActiveProvider] = useState<string>('all');
  
  const {
    loading,
    recommendations,
    enhancedRecommendations,
    loadingProviders,
    fetchEnhancedRecommendations
  } = useRecommendations(skills, interests, experienceLevel, goals, aiConfig);

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
              <TabsTrigger value="claude" className="px-3 py-1.5" disabled={!aiConfig.claude.enabled}>
                Claude
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
            <ProjectGrid projects={recommendations} onSelectProject={onSelectProject} />
          </TabsContent>
          
          <TabsContent value="openai" className="mt-0">
            <ProviderRecommendations
              projects={enhancedRecommendations.openai}
              loading={loadingProviders.openai}
              provider="OpenAI"
              onRefresh={() => fetchEnhancedRecommendations('openai')}
              disabled={loadingProviders.openai || !aiConfig.openai.enabled}
              onSelectProject={onSelectProject}
            />
          </TabsContent>
          
          <TabsContent value="gemini" className="mt-0">
            <ProviderRecommendations
              projects={enhancedRecommendations.gemini}
              loading={loadingProviders.gemini}
              provider="Gemini"
              onRefresh={() => fetchEnhancedRecommendations('gemini')}
              disabled={loadingProviders.gemini || !aiConfig.gemini.enabled}
              onSelectProject={onSelectProject}
            />
          </TabsContent>
          
          <TabsContent value="claude" className="mt-0">
            <ProviderRecommendations
              projects={enhancedRecommendations.claude}
              loading={loadingProviders.claude}
              provider="Claude"
              onRefresh={() => fetchEnhancedRecommendations('claude')}
              disabled={loadingProviders.claude || !aiConfig.claude.enabled}
              onSelectProject={onSelectProject}
            />
          </TabsContent>
          
          <TabsContent value="github" className="mt-0">
            <ProviderRecommendations
              projects={enhancedRecommendations.github}
              loading={loadingProviders.github}
              provider="GitHub"
              onRefresh={() => fetchEnhancedRecommendations('github')}
              disabled={loadingProviders.github || !aiConfig.github.enabled}
              onSelectProject={onSelectProject}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {!aiConfig && <ProjectGrid projects={recommendations} onSelectProject={onSelectProject} />}
    </div>
  );
};

export default RecommendedProjects;
