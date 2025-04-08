import { AIConfigState } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toJson } from '@/utils/typeUtils';

interface ResearchPaperResponse {
  title: string;
  abstract: string;
  content: string;
  references: string[];
  error?: string;
}

interface ProjectContext {
  description?: string;
  skills?: string[];
}

interface ProjectFeedback {
  isPositive: boolean;
  timestamp: string;
  skills: string[];
  comment?: string;
}

export const generateResearchPaper = async (
  topic: string, 
  aiConfig: AIConfigState,
  projectContext?: ProjectContext
): Promise<ResearchPaperResponse> => {
  try {
    // Try OpenAI first if enabled
    if (aiConfig.openai.enabled && aiConfig.openai.apiKey) {
      try {
        // Enhance the prompt with project context if available
        const enhancedPrompt = projectContext
          ? `Generate a research paper about ${topic}. 
             Project context: ${projectContext.description || ''}
             Technical skills involved: ${projectContext.skills?.join(', ') || ''}
             Focus on recent developments, technical aspects, and practical applications that would be 
             relevant for someone working on this specific project.`
          : `Generate a research paper about ${topic}. Focus on recent developments, technical aspects, and practical applications.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiConfig.openai.apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a research assistant that generates concise, well-structured academic papers on programming topics. Include a title, abstract, content sections, and references.'
              },
              {
                role: 'user',
                content: enhancedPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Error calling OpenAI API');
        }

        const content = data.choices[0].message.content;
        
        // Parse the content into structured format
        const lines = content.split('\n');
        let title = '';
        let abstract = '';
        let mainContent = '';
        let references: string[] = [];
        
        let currentSection = 'title';
        
        for (const line of lines) {
          if (line.toLowerCase().includes('abstract')) {
            currentSection = 'abstract';
            continue;
          } else if (line.toLowerCase().includes('references') || line.toLowerCase().includes('bibliography')) {
            currentSection = 'references';
            continue;
          } else if (currentSection === 'title' && line.trim() && !title) {
            title = line.trim();
            currentSection = 'pre-abstract';
          } else if (currentSection === 'abstract') {
            abstract += line + '\n';
          } else if (currentSection === 'references') {
            if (line.trim()) {
              references.push(line.trim());
            }
          } else if (currentSection !== 'title' && currentSection !== 'pre-abstract') {
            mainContent += line + '\n';
          }
        }
        
        return {
          title: title || topic,
          abstract: abstract.trim(),
          content: mainContent.trim(),
          references
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fall through to try Gemini
      }
    }

    // Try Gemini if enabled
    if (aiConfig.gemini.enabled && aiConfig.gemini.apiKey) {
      try {
        // Enhance the prompt with project context if available
        const enhancedPrompt = projectContext
          ? `Generate a research paper about ${topic}. 
             Project context: ${projectContext.description || ''}
             Technical skills involved: ${projectContext.skills?.join(', ') || ''}
             Include a title, abstract, main content with sections, and references. 
             Focus on recent developments, technical aspects, and practical applications that would be 
             relevant for someone working on this specific project.`
          : `Generate a research paper about ${topic}. Include a title, abstract, main content with sections, and references. Focus on recent developments, technical aspects, and practical applications.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${aiConfig.gemini.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: enhancedPrompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Error calling Gemini API');
        }

        const content = data.candidates[0].content.parts[0].text;
        
        // Parse the content into structured format
        const lines = content.split('\n');
        let title = '';
        let abstract = '';
        let mainContent = '';
        let references: string[] = [];
        
        let currentSection = 'title';
        
        for (const line of lines) {
          if (line.toLowerCase().includes('abstract')) {
            currentSection = 'abstract';
            continue;
          } else if (line.toLowerCase().includes('references') || line.toLowerCase().includes('bibliography')) {
            currentSection = 'references';
            continue;
          } else if (currentSection === 'title' && line.trim() && !title) {
            title = line.trim();
            currentSection = 'pre-abstract';
          } else if (currentSection === 'abstract') {
            abstract += line + '\n';
          } else if (currentSection === 'references') {
            if (line.trim()) {
              references.push(line.trim());
            }
          } else if (currentSection !== 'title' && currentSection !== 'pre-abstract') {
            mainContent += line + '\n';
          }
        }
        
        return {
          title: title || topic,
          abstract: abstract.trim(),
          content: mainContent.trim(),
          references
        };
      } catch (error) {
        console.error('Gemini API error:', error);
      }
    }

    // If we get here, both APIs failed or were not enabled
    return {
      title: "Research Paper Generation Failed",
      abstract: "Unable to generate research paper with the current AI configurations.",
      content: "Please check your API keys and try again. Make sure at least one AI service is enabled and configured correctly.",
      references: [],
      error: "API error or no API enabled"
    };
  } catch (error) {
    console.error('Error generating research paper:', error);
    return {
      title: "Error",
      abstract: "An error occurred while generating the research paper.",
      content: "Please try again later or check your configuration.",
      references: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const saveProjectToSupabase = async (project: any, userId: string) => {
  if (!userId) {
    return { error: new Error('User ID is required to save a project') };
  }

  const { error } = await supabase
    .from('saved_projects')
    .insert({
      project_data: toJson(project),
      user_id: userId
    });
  
  return { error };
};

export const getRecommendedProjects = async (skills: string[]) => {
  // This would typically fetch from a backend
  // For now, return mock data based on skills
  return mockRecommendations(skills);
};

// Modified function to submit project feedback using localStorage for now
export const submitProjectFeedback = async (projectId: string, feedback: ProjectFeedback) => {
  try {
    // Store feedback in saved_projects table with a special format
    const feedbackData = {
      ...feedback,
      projectId,
    };
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create a project feedback object
    const projectFeedbackData = {
      id: `feedback-${Date.now()}`,
      title: `Project Feedback`,
      description: feedback.comment || `Feedback for project: ${projectId}`,
      skills: feedback.skills,
      difficulty: 'beginner',
      feedback: [feedbackData],
      isProjectFeedback: true
    };
    
    // Store in saved_projects table which we know exists and is typed correctly
    const { error } = await supabase
      .from('saved_projects')
      .insert({
        user_id: user?.id || 'anonymous',
        project_data: toJson(projectFeedbackData)
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting project feedback:", error);
    throw error;
  }
};

const mockRecommendations = (skills: string[]) => {
  // Simple recommendation algorithm - match projects with similar skills
  const recommendations = [];
  
  // Example project templates that would be matched with user skills
  const projectTemplates = [
    {
      title: "Advanced Web Application",
      description: "Build a full-stack web application with authentication, database integration, and real-time features.",
      difficulty: "advanced",
      skills: ["React", "Node.js", "TypeScript", "MongoDB"],
      timeEstimate: "3-6 months"
    },
    {
      title: "Mobile App with React Native",
      description: "Develop a cross-platform mobile application that works on both iOS and Android.",
      difficulty: "intermediate",
      skills: ["React Native", "JavaScript", "Redux", "Firebase"],
      timeEstimate: "2-4 months"
    },
    {
      title: "Machine Learning Model Deployment",
      description: "Create and deploy a machine learning model with a web interface for predictions.",
      difficulty: "advanced",
      skills: ["Python", "TensorFlow", "Flask", "Docker"],
      timeEstimate: "3-4 months"
    },
    {
      title: "Data Visualization Dashboard",
      description: "Build an interactive dashboard to visualize complex datasets with filters and charts.",
      difficulty: "intermediate",
      skills: ["JavaScript", "D3.js", "React", "CSS"],
      timeEstimate: "1-2 months"
    }
  ];
  
  // Generate a unique ID and expand the basic template
  const createProjectSuggestion = (template: any) => {
    return {
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...template,
      tags: generateRandomTags(),
      resources: generateRandomResources(template.skills),
      sourceCode: {
        githubUrl: Math.random() > 0.5 ? 'https://github.com/example/repo' : undefined,
        relatedResources: generateRandomResources(template.skills)
      }
    };
  };
  
  // Generate random tags
  const generateRandomTags = () => {
    const allTags = [
      'Web Development', 'Mobile App', 'AI/ML', 'Data Science', 'IoT', 
      'Blockchain', 'Game Development', 'DevOps', 'Cloud Computing'
    ];
    
    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };
  
  // Generate random resources
  const generateRandomResources = (skills: string[]) => {
    const resources = [];
    
    for (let i = 0; i < 2; i++) {
      const skill = skills[Math.floor(Math.random() * skills.length)];
      resources.push({
        title: `Learning Resource for ${skill}`,
        url: 'https://example.com/resource',
        type: ['tutorial', 'documentation', 'github', 'article'][Math.floor(Math.random() * 4)] as 'tutorial' | 'documentation' | 'github' | 'article'
      });
    }
    
    return resources;
  };
  
  // Filter and sort projects by skill match
  projectTemplates.forEach(template => {
    const matchingSkills = template.skills.filter(skill => 
      skills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    
    if (matchingSkills.length > 0) {
      recommendations.push({
        ...createProjectSuggestion(template),
        skillMatchScore: matchingSkills.length / template.skills.length
      });
    }
  });
  
  // Sort by match score
  recommendations.sort((a, b) => b.skillMatchScore - a.skillMatchScore);
  
  return recommendations;
};
