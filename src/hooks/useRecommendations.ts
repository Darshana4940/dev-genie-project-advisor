
import { useState, useEffect } from 'react';
import { getRecommendedProjects, getEnhancedRecommendations } from '@/services/aiResearchService';
import { ProjectSuggestion, AIConfigState } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useRecommendations = (
  skills: string[],
  interests: string = '',
  experienceLevel: string = 'beginner',
  goals: string = '',
  aiConfig?: AIConfigState
) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ProjectSuggestion[]>([]);
  const [enhancedRecommendations, setEnhancedRecommendations] = useState<Record<string, ProjectSuggestion[]>>({
    openai: [],
    gemini: [],
    claude: [],
    github: []
  });
  const [loadingProviders, setLoadingProviders] = useState<Record<string, boolean>>({
    openai: false,
    gemini: false,
    claude: false,
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

  // Automatically fetch enhanced recommendations from all enabled providers when hook is used
  useEffect(() => {
    if (!aiConfig || skills.length === 0) return;

    const fetchAllEnabledProviders = async () => {
      const providers = Object.keys(aiConfig).filter(key => aiConfig[key].enabled);
      
      for (const provider of providers) {
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
            description: `Could not fetch recommendations from ${provider}.`,
            variant: "destructive"
          });
        } finally {
          setLoadingProviders(prev => ({ ...prev, [provider]: false }));
        }
      }
    };
    
    fetchAllEnabledProviders();
  }, [skills, interests, experienceLevel, goals, aiConfig, toast]);

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

  return {
    loading,
    recommendations,
    enhancedRecommendations,
    loadingProviders,
    fetchEnhancedRecommendations
  };
};
