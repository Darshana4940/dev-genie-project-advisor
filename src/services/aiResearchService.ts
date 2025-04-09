import { AIConfigState, ProjectSuggestion, ResearchPaper, ProjectResource } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toJson } from '@/utils/typeUtils';

/**
 * Generates project recommendations based on user skills, interests, and experience
 */
export const getRecommendedProjects = async (
  skills: string[], 
  interests: string = '', 
  experienceLevel: string = 'beginner',
  goals: string = ''
): Promise<ProjectSuggestion[]> => {
  console.info('Generating project recommendations for skills:', skills);
  
  try {
    // Use mockup data for now to avoid API errors
    const projectTypes = getProjectTypesBySkills(skills);
    const recommendations = generateProjectRecommendations(skills, interests, experienceLevel, goals, projectTypes);
    
    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate project recommendations');
  }
};

/**
 * Get project types based on user skills
 */
const getProjectTypesBySkills = (skills: string[]): string[] => {
  const skillToProjectMapping: Record<string, string[]> = {
    // Frontend skills
    'React': ['Web App', 'Progressive Web App', 'Mobile App (React Native)', 'Dashboard'],
    'Vue': ['Web App', 'Single Page Application', 'Dashboard'],
    'Angular': ['Enterprise App', 'Dashboard', 'CRM System'],
    'JavaScript': ['Web App', 'Browser Extension', 'Interactive Website'],
    'TypeScript': ['Web App', 'API Client', 'Enterprise App'],
    'HTML': ['Static Website', 'Landing Page', 'Portfolio'],
    'CSS': ['UI Component Library', 'Interactive Website', 'Portfolio'],
    'Tailwind': ['Landing Page', 'UI Component Library', 'Dashboard'],
    
    // Backend skills
    'Node.js': ['REST API', 'Microservice', 'Serverless Functions', 'Real-time Chat'],
    'Express': ['REST API', 'Backend Server', 'Authentication System'],
    'Python': ['Data Analysis Tool', 'Machine Learning Model', 'Web Scraper', 'Automation Script'],
    'Django': ['CMS', 'E-commerce Site', 'Social Network'],
    'Flask': ['REST API', 'Microservice', 'Web Dashboard'],
    'Java': ['Enterprise App', 'Android App', 'System Integration'],
    'Spring': ['Microservices', 'Enterprise App', 'REST API'],
    'C#': ['Desktop App', 'Game', 'Enterprise App', '.NET Web API'],
    'PHP': ['CMS', 'E-commerce Site', 'Web Portal'],
    
    // Database skills
    'MongoDB': ['NoSQL Database App', 'Content Repository', 'User Management System'],
    'PostgreSQL': ['Data-heavy Application', 'Analytics Platform', 'Inventory System'],
    'MySQL': ['CMS', 'E-commerce Database', 'Booking System'],
    'Firebase': ['Real-time Chat', 'Social App', 'Mobile Backend'],
    
    // Mobile skills
    'Flutter': ['Cross-platform Mobile App', 'Utility App', 'Social Network App'],
    'Swift': ['iOS App', 'macOS App', 'Mobile Game'],
    'Kotlin': ['Android App', 'Mobile Utility', 'Productivity Tool'],
    
    // DevOps skills
    'Docker': ['Containerized App', 'Development Environment', 'Microservices'],
    'Kubernetes': ['Scalable Cloud App', 'Service Mesh', 'Container Orchestration'],
    'AWS': ['Cloud-native App', 'Serverless App', 'Scalable Web Service'],
    'Azure': ['Enterprise Cloud App', 'Identity Management System', 'Cloud Integration'],
    
    // Data skills
    'Data Science': ['Data Visualization', 'Predictive Model', 'Business Intelligence Dashboard'],
    'Machine Learning': ['Recommendation System', 'Image Recognition', 'Natural Language Processing'],
    'TensorFlow': ['Neural Network', 'Deep Learning Model', 'Computer Vision System'],
    'PyTorch': ['Deep Learning Project', 'Research Model', 'NLP System'],
    
    // Other skills
    'GraphQL': ['API Gateway', 'Data Aggregation Service', 'Modern Web App'],
    'Rust': ['High-performance Tool', 'System Utility', 'WebAssembly App'],
    'Go': ['Microservice', 'Command-line Tool', 'High-performance API'],
    'Blockchain': ['Decentralized App', 'Smart Contract', 'Token System']
  };
  
  // Get project types based on user skills
  const projectTypes = new Set<string>();
  skills.forEach(skill => {
    const types = skillToProjectMapping[skill] || [];
    types.forEach(type => projectTypes.add(type));
  });
  
  // If no specific project types found, return general ones
  if (projectTypes.size === 0) {
    return ['Web App', 'Mobile App', 'Tool', 'Dashboard', 'API'];
  }
  
  return Array.from(projectTypes);
};

/**
 * Generate project recommendations based on user profile and project types
 */
const generateProjectRecommendations = (
  skills: string[],
  interests: string,
  experienceLevel: string,
  goals: string,
  projectTypes: string[]
): ProjectSuggestion[] => {
  const recommendations: ProjectSuggestion[] = [];
  const skillsLower = skills.map(s => s.toLowerCase());
  
  // Map experience level to difficulty
  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (experienceLevel === 'mid' || experienceLevel === 'intermediate') {
    difficulty = 'intermediate';
  } else if (experienceLevel === 'senior' || experienceLevel === 'advanced') {
    difficulty = 'advanced';
  }
  
  // Extract keywords from interests and goals
  const interestKeywords = interests
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);
    
  const goalKeywords = goals
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Project ideas based on common skills and project types
  const projectIdeas: Array<{
    title: string;
    description: string;
    skills: string[];
    type: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeEstimate: string;
  }> = [
    {
      title: "Personal Portfolio Website",
      description: "Create a responsive portfolio website to showcase your projects and skills. Include sections for about, projects, skills, and contact information.",
      skills: ["HTML", "CSS", "JavaScript", "React"],
      type: "Web App",
      difficulty: "beginner",
      timeEstimate: "1-2 weeks"
    },
    {
      title: "Task Management Dashboard",
      description: "Build a kanban-style task management application with drag-and-drop functionality, user authentication, and data persistence.",
      skills: ["React", "TypeScript", "Firebase", "Tailwind CSS"],
      type: "Dashboard",
      difficulty: "intermediate",
      timeEstimate: "2-4 weeks"
    },
    {
      title: "E-commerce Platform",
      description: "Develop a full-featured e-commerce site with product listings, shopping cart, checkout process, and admin dashboard.",
      skills: ["React", "Node.js", "Express", "MongoDB", "Redux"],
      type: "Web App",
      difficulty: "advanced",
      timeEstimate: "1-3 months"
    },
    {
      title: "Weather Forecast App",
      description: "Create a weather application that shows current conditions and forecasts based on location. Integrate with a weather API.",
      skills: ["JavaScript", "React", "API Integration", "CSS"],
      type: "Web App",
      difficulty: "beginner",
      timeEstimate: "1-2 weeks"
    },
    {
      title: "Real-time Chat Application",
      description: "Build a chat application with real-time messaging, user presence indicators, and message history.",
      skills: ["React", "Node.js", "Socket.io", "Express", "MongoDB"],
      type: "Web App",
      difficulty: "intermediate",
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Personal Finance Tracker",
      description: "Develop an application to track expenses, income, and generate reports and visualizations of spending habits.",
      skills: ["React", "Node.js", "Chart.js", "PostgreSQL", "Express"],
      type: "Dashboard",
      difficulty: "intermediate",
      timeEstimate: "3-6 weeks"
    },
    {
      title: "Recipe Finder and Meal Planner",
      description: "Create an app that allows users to search for recipes based on ingredients, dietary restrictions, and save favorites for meal planning.",
      skills: ["React", "Node.js", "MongoDB", "API Integration"],
      type: "Web App",
      difficulty: "intermediate",
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Social Media Dashboard",
      description: "Build an analytics dashboard that aggregates social media metrics across platforms and visualizes performance.",
      skills: ["React", "Node.js", "Chart.js", "API Integration", "TypeScript"],
      type: "Dashboard",
      difficulty: "advanced",
      timeEstimate: "1-2 months"
    },
    {
      title: "Job Application Tracker",
      description: "Develop an application to track job applications, interviews, and follow-ups with status updates and reminders.",
      skills: ["React", "Firebase", "TypeScript", "Tailwind CSS"],
      type: "Web App",
      difficulty: "intermediate",
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Markdown Blog Platform",
      description: "Create a blogging platform that supports markdown for content creation with image uploads and syntax highlighting.",
      skills: ["React", "Node.js", "Express", "MongoDB", "Markdown"],
      type: "Web App",
      difficulty: "intermediate",
      timeEstimate: "3-6 weeks"
    },
    {
      title: "Machine Learning Model Visualization",
      description: "Build a web application that visualizes training and prediction processes for various machine learning models.",
      skills: ["Python", "TensorFlow", "React", "D3.js", "Flask"],
      type: "Data Visualization",
      difficulty: "advanced",
      timeEstimate: "1-3 months"
    },
    {
      title: "Inventory Management System",
      description: "Develop a system for tracking inventory levels, orders, sales, and deliveries for a small business.",
      skills: ["React", "Node.js", "Express", "PostgreSQL", "TypeScript"],
      type: "Enterprise App",
      difficulty: "advanced",
      timeEstimate: "2-3 months"
    },
    {
      title: "Language Learning Flashcards App",
      description: "Create an application with spaced repetition learning for vocabulary, phrases, and grammar in multiple languages.",
      skills: ["React", "Node.js", "MongoDB", "Express"],
      type: "Education App",
      difficulty: "intermediate",
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Fitness Tracker",
      description: "Build an application to track workouts, set fitness goals, and visualize progress over time with charts and statistics.",
      skills: ["React", "Firebase", "Chart.js", "TypeScript"],
      type: "Mobile App",
      difficulty: "intermediate",
      timeEstimate: "3-6 weeks"
    },
    {
      title: "Video Conferencing App",
      description: "Develop a video chat application with screen sharing, text chat, and room creation functionality.",
      skills: ["React", "WebRTC", "Node.js", "Socket.io", "Express"],
      type: "Web App",
      difficulty: "advanced",
      timeEstimate: "2-3 months"
    }
  ];
  
  // Filter projects based on user skills and difficulty
  const filteredProjects = projectIdeas.filter(project => {
    // Match by difficulty
    if (project.difficulty !== difficulty) {
      // Allow one level down for advanced users if not enough advanced projects
      if (!(difficulty === 'advanced' && project.difficulty === 'intermediate')) {
        return false;
      }
    }
    
    // Match by skills (at least one skill should match)
    const hasMatchingSkill = project.skills.some(skill => 
      skillsLower.includes(skill.toLowerCase())
    );
    
    return hasMatchingSkill;
  });
  
  // Score and sort projects
  const scoredProjects = filteredProjects.map(project => {
    let score = 0;
    
    // Score based on skill match percentage
    const matchingSkills = project.skills.filter(skill => 
      skillsLower.includes(skill.toLowerCase())
    );
    score += (matchingSkills.length / project.skills.length) * 50;
    
    // Score based on interest match
    if (interestKeywords.length > 0) {
      const projectText = `${project.title} ${project.description} ${project.type}`.toLowerCase();
      const interestMatches = interestKeywords.filter(keyword => 
        projectText.includes(keyword)
      );
      score += interestMatches.length * 10;
    }
    
    // Score based on goals match
    if (goalKeywords.length > 0) {
      const projectText = `${project.title} ${project.description} ${project.type}`.toLowerCase();
      const goalMatches = goalKeywords.filter(keyword => 
        projectText.includes(keyword)
      );
      score += goalMatches.length * 15;
    }
    
    return { ...project, score };
  }).sort((a, b) => b.score - a.score);
  
  // Take top N projects
  const topProjects = scoredProjects.slice(0, 5);
  
  // Convert to ProjectSuggestion format
  topProjects.forEach((project, index) => {
    const resources: ProjectResource[] = generateResourcesForProject(project);
    
    recommendations.push({
      id: `project-${Date.now()}-${index}`,
      title: project.title,
      description: project.description,
      difficulty: project.difficulty,
      skills: project.skills,
      timeEstimate: project.timeEstimate,
      resources: resources,
      tags: [project.type],
      skillMatchScore: Math.floor(project.score),
      sourceCode: {
        relatedResources: resources
      }
    });
  });
  
  return recommendations;
};

/**
 * Generate resources for a specific project
 */
const generateResourcesForProject = (project: any): ProjectResource[] => {
  const resources: ProjectResource[] = [];
  const { title, skills } = project;
  
  // Add a tutorial
  resources.push({
    title: `Building a ${title} Step by Step`,
    url: '#',
    type: 'tutorial'
  });
  
  // Add documentation for main skill
  if (skills.length > 0) {
    resources.push({
      title: `${skills[0]} Documentation`,
      url: '#',
      type: 'documentation'
    });
  }
  
  // Add GitHub example
  resources.push({
    title: `${title} Sample Code`,
    url: '#',
    type: 'github'
  });
  
  // Add article about best practices
  resources.push({
    title: `Best Practices for ${title} Development`,
    url: '#',
    type: 'article'
  });
  
  return resources;
};

export const generateResearchPaper = async (
  topic: string,
  config: AIConfigState
): Promise<ResearchPaper> => {
  try {
    // Implementation for generating research papers
    const paper: ResearchPaper = {
      title: `Research on ${topic}`,
      authors: ['AI Assistant'],
      abstract: `This paper explores ${topic} and its applications.`,
      keywords: [topic, 'research', 'technology'],
      introduction: `Introduction to ${topic}...`,
      aims: [`To explore ${topic}`, `To analyze applications of ${topic}`],
      methodology: {
        overview: 'The methodology used in this research...',
        systemAnalysis: 'System analysis approach...',
        implementation: 'Implementation details...'
      },
      modules: [
        { name: 'Module 1', description: 'Description of module 1' },
        { name: 'Module 2', description: 'Description of module 2' }
      ],
      testing: {
        process: 'Testing process...',
        results: 'Testing results...'
      },
      futureScope: 'Future scope of this research...',
      conclusion: 'Conclusion of the research...',
      references: [
        { text: 'Reference 1', url: 'https://example.com/ref1' },
        { text: 'Reference 2', url: 'https://example.com/ref2' }
      ]
    };
    
    return paper;
  } catch (error) {
    console.error('Error generating research paper:', error);
    throw new Error('Failed to generate research paper');
  }
};

export const getProjectDetails = async (
  project: ProjectSuggestion,
  config: AIConfigState
): Promise<string> => {
  try {
    // Implementation for getting project details
    return `Detailed information about ${project.title}...`;
  } catch (error) {
    console.error('Error getting project details:', error);
    throw new Error('Failed to get project details');
  }
};

export const getImplementationSteps = async (
  project: ProjectSuggestion,
  config: AIConfigState
): Promise<string> => {
  try {
    // Implementation for getting implementation steps
    return `Implementation steps for ${project.title}...`;
  } catch (error) {
    console.error('Error getting implementation steps:', error);
    throw new Error('Failed to get implementation steps');
  }
};

export const getProjectRoadmap = async (
  project: ProjectSuggestion,
  config: AIConfigState
): Promise<string> => {
  try {
    // Implementation for getting project roadmap
    return `Roadmap for ${project.title}...`;
  } catch (error) {
    console.error('Error getting project roadmap:', error);
    throw new Error('Failed to get project roadmap');
  }
};

export const getCodeSamples = async (
  project: ProjectSuggestion,
  config: AIConfigState
): Promise<string> => {
  try {
    // Implementation for getting code samples
    return `Code samples for ${project.title}...`;
  } catch (error) {
    console.error('Error getting code samples:', error);
    throw new Error('Failed to get code samples');
  }
};
