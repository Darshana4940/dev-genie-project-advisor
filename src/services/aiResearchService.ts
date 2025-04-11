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
 * Get enhanced recommendations from specific AI providers
 */
export const getEnhancedRecommendations = async (
  skills: string[],
  interests: string = '',
  experienceLevel: string = 'beginner',
  goals: string = '',
  provider: string = 'openai',
  aiConfig: AIConfigState
): Promise<ProjectSuggestion[]> => {
  console.info(`Generating enhanced ${provider} recommendations for skills:`, skills);
  
  try {
    // For demo purposes, we'll generate more diverse projects based on the provider
    // In a real implementation, you would call the appropriate AI API
    const projectTypes = getProjectTypesBySkills(skills);
    let recommendations: ProjectSuggestion[] = [];
    
    if (provider === 'openai') {
      recommendations = generateOpenAIRecommendations(skills, interests, experienceLevel, goals, projectTypes);
    } else if (provider === 'gemini') {
      recommendations = generateGeminiRecommendations(skills, interests, experienceLevel, goals, projectTypes);
    } else if (provider === 'claude') {
      recommendations = generateClaudeRecommendations(skills, interests, experienceLevel, goals, projectTypes);
    } else if (provider === 'github') {
      recommendations = generateGitHubRecommendations(skills, interests, experienceLevel, goals, projectTypes);
    }
    
    return recommendations;
  } catch (error) {
    console.error(`Error generating ${provider} recommendations:`, error);
    throw new Error(`Failed to generate ${provider} project recommendations`);
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
    },
    {
      title: "Code Review Platform",
      description: "Build a platform where developers can submit code snippets for review by peers, with commenting and version tracking.",
      skills: ["React", "Node.js", "MongoDB", "Express", "Socket.io"],
      type: "Developer Tool",
      difficulty: "advanced",
      timeEstimate: "2-3 months"
    },
    {
      title: "Subscription Box Management System",
      description: "Create a system to manage subscription box services, including customer management, inventory, billing cycles, and shipping.",
      skills: ["React", "Node.js", "Express", "PostgreSQL", "Stripe API"],
      type: "Business Application",
      difficulty: "advanced",
      timeEstimate: "2-4 months"
    },
    {
      title: "Smart Home Control Dashboard",
      description: "Develop a dashboard to control and monitor smart home devices, with automation rules and usage analytics.",
      skills: ["React", "Node.js", "WebSockets", "IoT APIs", "Chart.js"],
      type: "IoT Application",
      difficulty: "intermediate",
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Event Planning and Management System",
      description: "Build a comprehensive system for planning, organizing, and managing events with registration, scheduling, and attendee tracking.",
      skills: ["React", "Node.js", "Express", "MongoDB", "Google Calendar API"],
      type: "Business Application",
      difficulty: "intermediate",
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
  
  // Take top 15 projects or all if less than 15
  const topProjects = scoredProjects.slice(0, Math.max(15, scoredProjects.length));
  
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
 * Generate OpenAI-specific project recommendations
 */
const generateOpenAIRecommendations = (
  skills: string[],
  interests: string,
  experienceLevel: string,
  goals: string,
  projectTypes: string[]
): ProjectSuggestion[] => {
  // Advanced project ideas focusing on AI/ML and innovative applications
  const openAIProjectIdeas = [
    {
      title: "AI-Powered Content Generator",
      description: "Build a web application that uses OpenAI's API to generate blog posts, social media content, or marketing copy based on user prompts.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "MongoDB"],
      type: "AI/ML Application",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Intelligent Customer Support Chatbot",
      description: "Create a customer service chatbot that uses natural language processing to understand queries and provide relevant responses.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "MongoDB", "Websockets"],
      type: "AI/ML Application",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Smart Document Analysis Tool",
      description: "Develop an application that extracts key information from documents using OCR and AI text analysis.",
      skills: ["React", "Python", "OpenAI API", "Flask", "PostgreSQL", "Tesseract OCR"],
      type: "AI/ML Application",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Personalized Learning Platform",
      description: "Build an e-learning platform that creates personalized learning paths and content based on user preferences and performance.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "MongoDB", "Redux"],
      type: "Education",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    },
    {
      title: "Creative Writing Assistant",
      description: "Create a tool that helps writers overcome writer's block with AI-generated suggestions and prompts.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "MongoDB"],
      type: "Content Creation",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Visual Design Assistant",
      description: "Build a tool that uses AI to generate design suggestions, color palettes, and layouts based on user preferences.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "MongoDB", "Canvas API"],
      type: "Design Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Code Review Assistant",
      description: "Create an application that uses AI to analyze code, suggest improvements, and identify potential bugs.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "PostgreSQL"],
      type: "Developer Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-4 weeks"
    },
    {
      title: "AI-Powered Research Tool",
      description: "Build a tool that helps researchers find relevant papers, extract key information, and generate summaries using AI.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "MongoDB", "D3.js"],
      type: "Research Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    },
    {
      title: "Sentiment Analysis Dashboard",
      description: "Create a dashboard that analyzes customer feedback, reviews, and social media mentions to determine overall sentiment.",
      skills: ["React", "Python", "OpenAI API", "Flask", "PostgreSQL", "Chart.js"],
      type: "Business Analytics",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Automated Content Moderation System",
      description: "Develop a system that uses AI to identify and filter inappropriate content in real-time for online communities.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "Redis", "WebSockets"],
      type: "Community Management",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    },
    {
      title: "AI Language Translator with Cultural Context",
      description: "Build a translator that not only translates text but also provides cultural context and nuances for better understanding.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "MongoDB"],
      type: "Language Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "AI-Assisted Legal Document Generator",
      description: "Create a tool that helps users generate legal documents with proper formatting and content based on their inputs.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "PostgreSQL"],
      type: "Legal Tech",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-4 months"
    },
    {
      title: "Smart Email Management System",
      description: "Develop an application that categorizes emails, generates response suggestions, and highlights important information.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "MongoDB", "Gmail API"],
      type: "Productivity Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    },
    {
      title: "AI Healthcare Symptom Analyzer",
      description: "Build a tool that helps users understand potential causes of their symptoms and when to seek professional medical advice.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "PostgreSQL"],
      type: "Healthcare",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 months"
    },
    {
      title: "Recipe Generator Based on Ingredients",
      description: "Create an app that suggests recipes based on ingredients users have available, with nutritional information and substitution options.",
      skills: ["React", "Node.js", "OpenAI API", "Express", "MongoDB"],
      type: "Food Tech",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    }
  ];
  
  return formatProjectIdeas(openAIProjectIdeas, skills, interests, goals, 15);
};

/**
 * Generate Gemini-specific project recommendations
 */
const generateGeminiRecommendations = (
  skills: string[],
  interests: string,
  experienceLevel: string,
  goals: string,
  projectTypes: string[]
): ProjectSuggestion[] => {
  // Projects focusing on data visualization, analytics, and multimodal applications
  const geminiProjectIdeas = [
    {
      title: "Interactive Data Dashboard",
      description: "Build a comprehensive data visualization dashboard with interactive charts, filters, and real-time updates.",
      skills: ["React", "D3.js", "Node.js", "Express", "PostgreSQL", "Socket.io"],
      type: "Data Visualization",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Social Media Analytics Platform",
      description: "Create a tool that analyzes social media data to provide insights on trends, sentiment, and user engagement.",
      skills: ["React", "Python", "Flask", "MongoDB", "D3.js", "Twitter API"],
      type: "Analytics",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Advanced E-commerce Platform",
      description: "Build a feature-rich e-commerce site with recommendation engine, inventory management, and analytics.",
      skills: ["React", "Node.js", "Express", "MongoDB", "Redis", "Stripe API"],
      type: "E-commerce",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    },
    {
      title: "Health and Fitness Tracker",
      description: "Develop an application that tracks workouts, nutrition, and health metrics with visualizations and insights.",
      skills: ["React", "Node.js", "Express", "MongoDB", "D3.js", "Chart.js"],
      type: "Health Tech",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Business Intelligence Dashboard",
      description: "Create a comprehensive BI tool with KPI tracking, data visualization, and automated reporting.",
      skills: ["React", "Node.js", "Express", "PostgreSQL", "D3.js", "Redux"],
      type: "Business Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "6-8 weeks"
    },
    {
      title: "User Behavior Analysis Tool",
      description: "Build an application that tracks and analyzes user behavior on websites with heat maps and session recordings.",
      skills: ["React", "Node.js", "Express", "MongoDB", "D3.js", "WebSocket"],
      type: "Analytics",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Location-Based Service Finder",
      description: "Develop a platform that helps users find local services with map integration and reviews.",
      skills: ["React", "Node.js", "Express", "MongoDB", "Google Maps API", "Redux"],
      type: "Location-Based App",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Interactive Learning Platform",
      description: "Create an educational platform with interactive lessons, quizzes, and progress tracking.",
      skills: ["React", "Node.js", "Express", "MongoDB", "D3.js", "Socket.io"],
      type: "Education",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    },
    {
      title: "Market Analysis Tool",
      description: "Build a tool that analyzes market trends, competitor data, and consumer behavior.",
      skills: ["React", "Python", "Flask", "PostgreSQL", "D3.js", "Redis"],
      type: "Business Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-4 months"
    },
    {
      title: "Environmental Monitoring Dashboard",
      description: "Create a dashboard for monitoring environmental data like air quality, temperature, and pollution levels.",
      skills: ["React", "Node.js", "Express", "MongoDB", "D3.js", "WebSockets"],
      type: "Environmental Tech",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    },
    {
      title: "Supply Chain Management System",
      description: "Develop a system to track products through the entire supply chain with real-time updates and analytics.",
      skills: ["React", "Node.js", "Express", "PostgreSQL", "D3.js", "Redux"],
      type: "Business Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 months"
    },
    {
      title: "Collaborative Research Platform",
      description: "Build a platform for researchers to collaborate, share findings, and visualize data.",
      skills: ["React", "Node.js", "Express", "MongoDB", "D3.js", "Socket.io"],
      type: "Research Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 months"
    },
    {
      title: "Transportation Network Analyzer",
      description: "Create a tool for analyzing transportation networks, identifying bottlenecks, and suggesting improvements.",
      skills: ["React", "Python", "Flask", "PostgreSQL", "D3.js", "Google Maps API"],
      type: "Transportation",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 months"
    },
    {
      title: "Customer Journey Visualization Tool",
      description: "Develop a tool that visualizes the customer journey from first contact to purchase and beyond.",
      skills: ["React", "Node.js", "Express", "MongoDB", "D3.js", "Redux"],
      type: "Marketing Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    },
    {
      title: "Multi-platform Content Management System",
      description: "Build a CMS that allows users to create and manage content across multiple platforms with analytics.",
      skills: ["React", "Node.js", "Express", "PostgreSQL", "Redis", "OAuth"],
      type: "Content Management",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 months"
    }
  ];
  
  return formatProjectIdeas(geminiProjectIdeas, skills, interests, goals, 15);
};

/**
 * Generate Claude-specific project recommendations
 */
const generateClaudeRecommendations = (
  skills: string[],
  interests: string,
  experienceLevel: string,
  goals: string,
  projectTypes: string[]
): ProjectSuggestion[] => {
  // Projects focusing on natural language processing, content creation, and advanced text processing
  const claudeProjectIdeas = [
    {
      title: "Contextual Writing Assistant",
      description: "Build an AI writing assistant that understands context, suggests improvements, and maintains consistent tone.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB"],
      type: "Content Creation",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Advanced Document Summarizer",
      description: "Create a tool that generates concise summaries of long documents while preserving key information and nuance.",
      skills: ["React", "Node.js", "Claude API", "Express", "PostgreSQL"],
      type: "Productivity Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Academic Research Assistant",
      description: "Develop an application that helps researchers find relevant papers, extract key information, and generate literature reviews.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB"],
      type: "Research Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Nuanced Sentiment Analysis Platform",
      description: "Build a platform that analyzes text for complex emotional tones, subtle sentiments, and cultural contexts.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB", "D3.js"],
      type: "Analytics",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Interactive Storytelling Platform",
      description: "Create a platform where users can generate interactive stories with branching narratives based on their inputs.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB", "Redux"],
      type: "Entertainment",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    },
    {
      title: "Ethical Dilemma Analyzer",
      description: "Develop a tool that helps users understand multiple perspectives on ethical dilemmas and complex issues.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB"],
      type: "Educational Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Contextual Language Learning App",
      description: "Build an app that teaches languages through realistic conversations and contextual examples.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB"],
      type: "Education",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-4 months"
    },
    {
      title: "Policy and Legal Document Analyzer",
      description: "Create a tool that simplifies and explains complex legal and policy documents for non-experts.",
      skills: ["React", "Node.js", "Claude API", "Express", "PostgreSQL"],
      type: "Legal Tech",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 months"
    },
    {
      title: "Personalized Learning Content Generator",
      description: "Develop a system that creates customized educational content based on a student's learning style and progress.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB", "Redux"],
      type: "Education",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-6 months"
    },
    {
      title: "Cultural Context Translator",
      description: "Build a tool that not only translates text but also explains cultural references, idioms, and context.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB"],
      type: "Language Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-4 months"
    },
    {
      title: "Comprehensive Meeting Assistant",
      description: "Create an assistant that takes meeting notes, identifies action items, summarizes discussions, and follows up on tasks.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB", "WebSockets"],
      type: "Productivity Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 months"
    },
    {
      title: "Content Moderation System with Nuance",
      description: "Develop a content moderation system that understands context, humor, and cultural nuances to reduce false positives.",
      skills: ["React", "Node.js", "Claude API", "Express", "PostgreSQL", "Redis"],
      type: "Community Management",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 months"
    },
    {
      title: "Advanced Tutoring System",
      description: "Build an interactive tutoring system that adapts to student questions and provides detailed, personalized explanations.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB", "Socket.io"],
      type: "Education",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 months"
    },
    {
      title: "Medical Literature Analysis Tool",
      description: "Create a tool for healthcare professionals to quickly analyze and extract insights from medical research papers.",
      skills: ["React", "Node.js", "Claude API", "Express", "PostgreSQL"],
      type: "Healthcare",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 months"
    },
    {
      title: "Interview Preparation Assistant",
      description: "Develop an assistant that helps users prepare for interviews with realistic practice questions and feedback.",
      skills: ["React", "Node.js", "Claude API", "Express", "MongoDB"],
      type: "Career Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-3 months"
    }
  ];
  
  return formatProjectIdeas(claudeProjectIdeas, skills, interests, goals, 15);
};

/**
 * Generate GitHub-specific project recommendations
 */
const generateGitHubRecommendations = (
  skills: string[],
  interests: string,
  experienceLevel: string,
  goals: string,
  projectTypes: string[]
): ProjectSuggestion[] => {
  // Projects focusing on developer tools, collaboration, and open-source contributions
  const githubProjectIdeas = [
    {
      title: "Open Source Contribution Tracker",
      description: "Create a dashboard that tracks and visualizes open source contributions across GitHub repositories.",
      skills: ["React", "Node.js", "GitHub API", "Express", "MongoDB", "D3.js"],
      type: "Developer Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Collaborative Code Editor",
      description: "Build a real-time collaborative code editor with syntax highlighting, version control, and chat.",
      skills: ["React", "Node.js", "Socket.io", "Express", "MongoDB", "CodeMirror"],
      type: "Developer Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 weeks"
    },
    {
      title: "DevOps Monitoring Dashboard",
      description: "Develop a comprehensive dashboard for monitoring CI/CD pipelines, deployments, and infrastructure.",
      skills: ["React", "Node.js", "Express", "MongoDB", "Docker", "GitHub Actions API"],
      type: "DevOps Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "5-7 weeks"
    },
    {
      title: "Technical Documentation Generator",
      description: "Create a tool that automatically generates documentation from code comments and repository structure.",
      skills: ["React", "Node.js", "Express", "MongoDB", "GitHub API", "Markdown"],
      type: "Developer Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Project Management Tool",
      description: "Build a project management application with Kanban boards, time tracking, and GitHub integration.",
      skills: ["React", "Node.js", "Express", "PostgreSQL", "GitHub API", "Redux"],
      type: "Project Management",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Code Review Platform",
      description: "Develop a platform for peer code reviews with commenting, approval workflows, and metrics.",
      skills: ["React", "Node.js", "Express", "MongoDB", "GitHub API", "Socket.io"],
      type: "Developer Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "5-7 weeks"
    },
    {
      title: "Developer Portfolio Generator",
      description: "Create a tool that generates professional developer portfolios from GitHub profiles and repositories.",
      skills: ["React", "Node.js", "Express", "MongoDB", "GitHub API", "Next.js"],
      type: "Career Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-4 weeks"
    },
    {
      title: "Team Collaboration Hub",
      description: "Build a central hub for team collaboration with GitHub integration, document sharing, and discussion boards.",
      skills: ["React", "Node.js", "Express", "PostgreSQL", "GitHub API", "Socket.io"],
      type: "Collaboration Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 months"
    },
    {
      title: "Code Quality Analyzer",
      description: "Create a tool that analyzes code quality, suggests improvements, and tracks progress over time.",
      skills: ["React", "Node.js", "Express", "MongoDB", "GitHub API", "D3.js"],
      type: "Developer Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 months"
    },
    {
      title: "Open Source Project Explorer",
      description: "Develop a platform for discovering and exploring open source projects based on skills and interests.",
      skills: ["React", "Node.js", "Express", "MongoDB", "GitHub API", "Redux"],
      type: "Developer Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-4 months"
    },
    {
      title: "Code Learning Platform",
      description: "Build a platform that uses real GitHub repositories to create interactive coding challenges and tutorials.",
      skills: ["React", "Node.js", "Express", "MongoDB", "GitHub API", "CodeMirror"],
      type: "Education",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 months"
    },
    {
      title: "Developer Collaboration Network",
      description: "Create a social network for developers to find collaborators for projects based on skills and interests.",
      skills: ["React", "Node.js", "Express", "PostgreSQL", "GitHub API", "Socket.io"],
      type: "Social Network",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 months"
    },
    {
      title: "GitHub Repository Analytics",
      description: "Develop a tool that provides in-depth analytics and insights for GitHub repositories and organizations.",
      skills: ["React", "Node.js", "Express", "PostgreSQL", "GitHub API", "D3.js"],
      type: "Analytics",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "3-5 months"
    },
    {
      title: "Automated Code Deployment System",
      description: "Build a system that automates code deployment, testing, and rollback procedures for GitHub projects.",
      skills: ["React", "Node.js", "Express", "MongoDB", "GitHub API", "Docker"],
      type: "DevOps Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "4-6 months"
    },
    {
      title: "Developer Skill Graph",
      description: "Create a tool that visualizes a developer's skills based on their GitHub contributions and repositories.",
      skills: ["React", "Node.js", "Express", "Neo4j", "GitHub API", "D3.js"],
      type: "Career Tool",
      difficulty: getDifficultyFromExperience(experienceLevel),
      timeEstimate: "2-4 months"
    }
  ];
  
  return formatProjectIdeas(githubProjectIdeas, skills, interests, goals, 15);
};

/**
 * Format project ideas into ProjectSuggestion objects with a minimum count
 */
const formatProjectIdeas = (
  projectIdeas: Array<{
    title: string;
    description: string;
    skills: string[];
    type: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeEstimate: string;
  }>,
  userSkills: string[],
  interests: string,
  goals: string,
  minCount: number = 15
): ProjectSuggestion[] => {
  const skillsLower = userSkills.map(s => s.toLowerCase());
  
  // Score the projects
  const scoredProjects = projectIdeas.map(project => {
    let score = 0;
    
    // Score based on skill match percentage
    const matchingSkills = project.skills.filter(skill => 
      skillsLower.includes(skill.toLowerCase())
    );
    score += (matchingSkills.length / project.skills.length) * 50;
    
    // Additional scoring based on interests and goals if available
    if (interests) {
      const interestKeywords = interests.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      const projectText = `${project.title} ${project.description} ${project.type}`.toLowerCase();
      const interestMatches = interestKeywords.filter(keyword => projectText.includes(keyword));
      score += interestMatches.length * 10;
    }
    
    if (goals) {
      const goalKeywords = goals.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      const projectText = `${project.title} ${project.description} ${project.type}`.toLowerCase();
      const goalMatches = goalKeywords.filter(keyword => projectText.includes(keyword));
      score += goalMatches.length * 15;
    }
    
    return { ...project, score };
  });
  
  // Sort by score
  const sortedProjects = scoredProjects.sort((a, b) => b.score - a.score);
  
  // Take at least minCount projects or all if less than minCount
  const selectedProjects = sortedProjects.length >= minCount 
    ? sortedProjects.slice(0, minCount)
    : sortedProjects;
  
  // Convert to ProjectSuggestion format
  return selectedProjects.map((project, index) => {
    const resources: ProjectResource[] = generateResourcesForProject(project);
    
    return {
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
    };
  });
};

/**
 * Get difficulty level based on experience
 */
const getDifficultyFromExperience = (
  experienceLevel: string
): 'beginner' | 'intermediate' | 'advanced' => {
  if (experienceLevel === 'mid' || experienceLevel === 'intermediate' || experienceLevel === 'junior') {
    return 'intermediate';
  } else if (experienceLevel === 'senior' || experienceLevel === 'advanced') {
    return 'advanced';
  }
  return 'beginner';
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

/**
 * Generate a research paper based on a single topic string
 */
export const generateResearchPaper = async (
  topic: string,
  config: AIConfigState
): Promise<ResearchPaper> => {
  try {
    // Implementation for generating research papers
    const paper: ResearchPaper = {
      title: `Research on ${topic.split(' - Context:')[0]}`,
      authors: ['AI Assistant'],
      abstract: `This paper explores ${topic.split(' - Context:')[0]} and its applications in modern software development.`,
      keywords: [topic.split(' - Context:')[0], 'research', 'technology', 'software development'],
      introduction: `Introduction to ${topic.split(' - Context:')[0]} and its significance in today's technological landscape.`,
      aims: [`To explore ${topic.split(' - Context:')[0]}`, `To analyze applications of ${topic.split(' - Context:')[0]}`, `To provide implementation guidelines`],
      methodology: {
        overview: 'This research employs a systematic approach to exploring the topic, including literature review, analysis of existing implementations, and best practice evaluation.',
        systemAnalysis: 'A thorough system analysis was conducted to understand the components, requirements, and constraints.',
        implementation: 'The implementation strategy focuses on practical approaches to building robust solutions.'
      },
      modules: [
        { name: 'Core Components', description: 'Description of the fundamental building blocks.' },
        { name: 'Implementation Strategy', description: 'Strategies for successful implementation.' }
      ],
      testing: {
        process: 'The testing methodology includes unit testing, integration testing, and system validation.',
        results: 'Testing results demonstrate the viability and effectiveness of the proposed solutions.'
      },
      futureScope: 'Future research could explore additional applications, optimizations, and integration with emerging technologies.',
      conclusion: 'This research provides valuable insights into implementing effective solutions and addressing common challenges.',
      references: [
        { text: 'Modern Software Development Practices', url: 'https://example.com/software-development' },
        { text: 'System Design Principles', url: 'https://example.com/system-design' },
        { text: 'Implementation Guidelines', url: 'https://example.com/implementation' }
      ]
    };
    
    return paper;
  } catch (error) {
    console.error('Error generating research paper:', error);
    throw new Error('Failed to generate research paper');
  }
};

/**
 * Generate a research paper specifically for a project
 */
export const generateProjectResearchPaper = async (
  project: ProjectSuggestion,
  config: AIConfigState
): Promise<ResearchPaper> => {
  try {
    // For now, we'll reuse the existing generateResearchPaper function
    // but customize it for the project context
    const projectTitle = project.title;
    const skillsText = project.skills.join(', ');
    
    const paper: ResearchPaper = {
      title: `Research on ${projectTitle}`,
      authors: ['AI Assistant'],
      abstract: `This paper explores the development and implementation of a ${projectTitle} project using ${skillsText}. It discusses the methodology, architecture, implementation details, and testing procedures necessary for successful execution.`,
      keywords: [...project.skills, ...project.tags, 'research', 'project development'],
      introduction: `Introduction to the ${projectTitle} project, its background, significance, and the technologies involved including ${skillsText}...`,
      aims: [
        `To design and implement ${projectTitle}`,
        `To apply best practices in software development using ${skillsText}`,
        `To demonstrate the practical applications of this project`
      ],
      methodology: {
        overview: `The methodology for developing ${projectTitle} involves careful planning, design, implementation, and testing...`,
        systemAnalysis: `System analysis for ${projectTitle} includes requirement gathering, feasibility study, and system design...`,
        requirements: {
          software: project.skills,
          hardware: ['Computer with adequate processing power', 'Internet connection', 'Development environment']
        },
        implementation: `The implementation of ${projectTitle} involves setting up the development environment, coding the core modules, and integrating the different components...`
      },
      modules: [
        { name: 'Core Module', description: `The main functionality of ${projectTitle}...` },
        { name: 'User Interface', description: `The user interface design and implementation for ${projectTitle}...` },
        { name: 'Data Management', description: `How data is stored, retrieved, and manipulated in ${projectTitle}...` }
      ],
      testing: {
        process: `The testing process for ${projectTitle} includes unit testing, integration testing, and user acceptance testing...`,
        results: `The testing results show that ${projectTitle} meets the specified requirements and performs as expected...`
      },
      futureScope: `Future enhancements for ${projectTitle} could include additional features, performance optimizations, and integration with other systems...`,
      conclusion: `The ${projectTitle} project demonstrates the successful application of ${skillsText} in creating a functional and useful solution...`,
      references: [
        { text: `${project.skills[0]} Documentation`, url: `https://example.com/${project.skills[0].toLowerCase()}` },
        { text: `Best Practices for ${project.tags[0] || 'Software Development'}`, url: 'https://example.com/best-practices' },
        { text: 'Software Design Patterns', url: 'https://example.com/design-patterns' }
      ]
    };
    
    return paper;
  } catch (error) {
    console.error('Error generating project research paper:', error);
    throw new Error('Failed to generate project research paper');
  }
};

/**
 * Get project details
 */
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

/**
 * Get implementation steps
 */
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

/**
 * Get project roadmap
 */
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

/**
 * Get code samples
 */
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
