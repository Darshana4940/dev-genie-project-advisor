
import { AIConfigState, ProjectSuggestion, ResearchPaper, ProjectResource } from '@/types';
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

export const generateResearchPaper = async (
  topic: string, 
  aiConfig: AIConfigState,
  projectContext?: ProjectContext
): Promise<ResearchPaperResponse> => {
  try {
    if (aiConfig.openai.enabled && aiConfig.openai.apiKey) {
      try {
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

    if (aiConfig.gemini.enabled && aiConfig.gemini.apiKey) {
      try {
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
  if (!skills || skills.length === 0) {
    return [];
  }
  
  console.log("Generating project recommendations for skills:", skills);
  return generateProjectSuggestions(skills);
};

export const generateProjectResearchPaper = async (
  project: ProjectSuggestion,
  aiConfig: AIConfigState
): Promise<ResearchPaper> => {
  try {
    if (aiConfig.openai.enabled && aiConfig.openai.apiKey) {
      try {
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
                content: 'You are a research paper generator that creates comprehensive, well-structured academic papers about technology projects. Format your response as JSON with the structure provided in the user prompt.'
              },
              {
                role: 'user',
                content: `Generate a complete research paper about "${project.title}" with the following details:
                - Project description: ${project.description}
                - Skills involved: ${project.skills.join(', ')}
                - Difficulty level: ${project.difficulty}
                - Tags: ${project.tags.join(', ')}
                
                Format the response as a JSON object with the following structure:
                {
                  "title": "TITLE OF THE PAPER",
                  "authors": ["Author Name 1", "Author Name 2"],
                  "institution": "Institution Name",
                  "email": "example@email.com",
                  "abstract": "150-250 word summary",
                  "keywords": ["keyword1", "keyword2", "keyword3"],
                  "introduction": "Introduction text",
                  "aims": ["aim1", "aim2", "aim3"],
                  "methodology": {
                    "overview": "Overview text",
                    "systemAnalysis": "System analysis text",
                    "requirements": {
                      "software": ["software1", "software2"],
                      "hardware": ["hardware1", "hardware2"]
                    },
                    "implementation": "Implementation text"
                  },
                  "modules": [
                    {"name": "Module 1", "description": "Module 1 description"},
                    {"name": "Module 2", "description": "Module 2 description"},
                    {"name": "Module 3", "description": "Module 3 description"}
                  ],
                  "testing": {
                    "process": "Testing process description",
                    "results": "Testing results description"
                  },
                  "futureScope": "Future scope text",
                  "conclusion": "Conclusion text",
                  "references": [
                    {"text": "Reference 1", "url": "http://example.com/1"},
                    {"text": "Reference 2", "url": "http://example.com/2"}
                  ]
                }`
              }
            ],
            temperature: 0.7,
            max_tokens: 3000
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Error calling OpenAI API');
        }

        try {
          const content = data.choices[0].message.content;
          const paperData = JSON.parse(content);
          return paperData;
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          throw new Error('Failed to parse research paper data');
        }
      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fall through to try Gemini
      }
    }

    if (aiConfig.gemini.enabled && aiConfig.gemini.apiKey) {
      try {
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
                    text: `Generate a complete research paper about "${project.title}" with the following details:
                    - Project description: ${project.description}
                    - Skills involved: ${project.skills.join(', ')}
                    - Difficulty level: ${project.difficulty}
                    - Tags: ${project.tags.join(', ')}
                    
                    Format the response as a JSON object with the following structure:
                    {
                      "title": "TITLE OF THE PAPER",
                      "authors": ["Author Name 1", "Author Name 2"],
                      "institution": "Institution Name",
                      "email": "example@email.com",
                      "abstract": "150-250 word summary",
                      "keywords": ["keyword1", "keyword2", "keyword3"],
                      "introduction": "Introduction text",
                      "aims": ["aim1", "aim2", "aim3"],
                      "methodology": {
                        "overview": "Overview text",
                        "systemAnalysis": "System analysis text",
                        "requirements": {
                          "software": ["software1", "software2"],
                          "hardware": ["hardware1", hardware2"]
                        },
                        "implementation": "Implementation text"
                      },
                      "modules": [
                        {"name": "Module 1", "description": "Module 1 description"},
                        {"name": "Module 2", "description": "Module 2 description"},
                        {"name": "Module 3", "description": "Module 3 description"}
                      ],
                      "testing": {
                        "process": "Testing process description",
                        "results": "Testing results description"
                      },
                      "futureScope": "Future scope text",
                      "conclusion": "Conclusion text",
                      "references": [
                        {"text": "Reference 1", "url": "http://example.com/1"},
                        {"text": "Reference 2", "url": "http://example.com/2"}
                      ]
                    }`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            }
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Error calling Gemini API');
        }

        try {
          const content = data.candidates[0].content.parts[0].text;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const paperData = JSON.parse(jsonMatch[0]);
            return paperData;
          }
          throw new Error('No valid JSON found in Gemini response');
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          throw new Error('Failed to parse research paper data');
        }
      } catch (error) {
        console.error('Gemini API error:', error);
      }
    }

    return createFallbackResearchPaper(project);
  } catch (error) {
    console.error('Error generating research paper:', error);
    return createFallbackResearchPaper(project);
  }
};

const createFallbackResearchPaper = (project: ProjectSuggestion): ResearchPaper => {
  return {
    title: `${project.title}: A Comprehensive Analysis`,
    authors: ["John Doe", "Jane Smith"],
    institution: "Tech University",
    email: "research@example.com",
    abstract: `This research paper presents a comprehensive analysis of the ${project.title} project. The study explores the development, implementation, and evaluation of this ${project.difficulty} level project. Key features and challenges are discussed, along with methodologies employed in creating an effective solution. The paper also examines technical requirements, architectural decisions, and testing procedures. Findings indicate significant potential for application in various domains.`,
    keywords: [...project.tags, ...project.skills.slice(0, 3), project.difficulty],
    introduction: `The rapidly evolving tech landscape demands innovative solutions to address emerging challenges. The ${project.title} project represents an attempt to address these needs through the application of ${project.skills.join(', ')}. This research paper examines the development process, implementation strategies, and outcomes of this project.\n\nThe significance of this study lies in its potential to inform similar future developments and contribute to the body of knowledge in ${project.tags.join(' and ')}. By documenting the approach taken and lessons learned, this paper aims to provide valuable insights for developers, researchers, and organizations interested in similar initiatives.`,
    aims: [
      `Design and implement a fully functional ${project.title} solution`,
      `Evaluate the performance and usability of the implemented solution`,
      `Identify potential improvements and extensions for future development`,
      `Contribute to the knowledge base in ${project.tags[0] || 'technology'} development`
    ],
    methodology: {
      overview: `This project employed a systematic approach to development, beginning with requirement analysis, followed by design, implementation, testing, and evaluation phases. The development process followed an agile methodology, allowing for iterative improvements based on continuous feedback.`,
      systemAnalysis: `The initial phase involved thorough analysis of requirements and existing solutions. Key pain points and limitations of current approaches were identified, forming the basis for our design decisions. Comparative analysis with similar systems revealed opportunities for innovation and improvement.`,
      requirements: {
        software: [
          ...project.skills.filter(s => ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Go'].includes(s)),
          "Version Control System (Git)",
          "Integrated Development Environment",
          "Testing Frameworks"
        ],
        hardware: [
          "Development Computer (8GB RAM, quad-core processor minimum)",
          "Server Environment for Deployment",
          "Mobile Devices for Testing (if applicable)",
          "Network Infrastructure"
        ]
      },
      implementation: `The implementation phase utilized ${project.skills.join(', ')} to build a robust solution. Key components were developed incrementally, with regular code reviews to ensure quality. The system architecture was designed to be modular and scalable, facilitating future enhancements. Performance optimizations were applied throughout the development process.`
    },
    modules: [
      {
        name: "Core Module",
        description: `The central component of the system, responsible for managing core functionality and coordinating between other modules. This module implements the primary business logic and ensures data consistency across the application.`
      },
      {
        name: "User Interface Module",
        description: `Handles all user interactions and visual presentations. Implements responsive design principles to ensure compatibility across devices. Focuses on usability and intuitive interactions to enhance user experience.`
      },
      {
        name: "Data Management Module",
        description: `Responsible for data persistence, retrieval, and manipulation. Implements efficient data structures and algorithms to optimize performance. Includes validation mechanisms to ensure data integrity.`
      },
      {
        name: "Integration Module",
        description: `Manages communications with external systems and services. Implements robust error handling and retries to ensure reliable operation. Provides abstraction layers to simplify integration with third-party APIs.`
      }
    ],
    testing: {
      process: `The testing strategy included unit testing, integration testing, and system testing phases. Automated test suites were developed to ensure consistent quality. User acceptance testing was conducted with representative users to validate usability and functionality. Performance testing was performed to identify bottlenecks and optimize critical paths.`,
      results: `Testing revealed several minor issues that were subsequently addressed. The final implementation passed all functional requirements with a 98% success rate. Performance testing indicated response times within acceptable parameters under normal load conditions. User acceptance testing showed positive feedback, with 85% of testers rating the system as intuitive and effective.`
    },
    futureScope: `Future development of this project could include enhanced features such as AI-powered recommendations, expanded platform support, and deeper integrations with complementary systems. Potential optimizations for performance and scalability have been identified for future iterations. Additionally, opportunities exist for extending the system to support additional use cases beyond its current scope.`,
    conclusion: `This research paper has presented the development and implementation of the ${project.title} project. The systematic approach to design, development, and testing resulted in a robust solution that meets the identified requirements. The modular architecture facilitates future enhancements and extensions. Key challenges were addressed through innovative approaches, contributing valuable insights to the field. The project demonstrates the effective application of ${project.skills.join(', ')} to solve real-world problems in the domain of ${project.tags.join(', ')}.`,
    references: [
      { text: "Smith, J. & Johnson, K. (2023). Modern Software Development Methodologies. Journal of Software Engineering, 45(2), 112-128." },
      { text: "Tech Framework Documentation (2023). Official documentation for development framework.", url: "https://example.com/framework" },
      { text: "Wilson, M. (2022). Best Practices in User Interface Design. Tech Publishing.", url: "https://example.com/ui-design" },
      { text: "International Standards Organization. (2022). ISO/IEC 25010:2022 Systems and software Quality Requirements and Evaluation." },
      { text: "Brown, R. (2023). Performance Optimization Techniques for Modern Applications. Tech Journal, 18(3), 45-62." }
    ]
  };
};

const generateProjectSuggestions = (skills: string[]): ProjectSuggestion[] => {
  const normalizedSkills = skills.map(skill => skill.toLowerCase());
  
  const frontendSkills = ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'bootstrap'];
  const backendSkills = ['node', 'express', 'django', 'flask', 'php', 'laravel', 'ruby', 'rails', 'spring', 'java'];
  const mobileSkills = ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios'];
  const aiMlSkills = ['python', 'tensorflow', 'pytorch', 'machine learning', 'ai', 'data science', 'nlp'];
  const devopsSkills = ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'github actions'];
  
  const hasFrontend = normalizedSkills.some(skill => frontendSkills.some(fs => skill.includes(fs)));
  const hasBackend = normalizedSkills.some(skill => backendSkills.some(bs => skill.includes(bs)));
  const hasMobile = normalizedSkills.some(skill => mobileSkills.some(ms => skill.includes(ms)));
  const hasAiMl = normalizedSkills.some(skill => aiMlSkills.some(ams => skill.includes(ams)));
  const hasDevOps = normalizedSkills.some(skill => devopsSkills.some(dos => skill.includes(dos)));
  
  const projectSuggestions: ProjectSuggestion[] = [];
  
  if (hasFrontend && hasBackend) {
    projectSuggestions.push(createFullStackProject(skills));
  }
  
  if (hasFrontend) {
    projectSuggestions.push(createFrontendProject(skills));
  }
  
  if (hasBackend) {
    projectSuggestions.push(createBackendProject(skills));
  }
  
  if (hasMobile) {
    projectSuggestions.push(createMobileProject(skills));
  }
  
  if (hasAiMl) {
    projectSuggestions.push(createAiMlProject(skills));
  }
  
  if (hasDevOps) {
    projectSuggestions.push(createDevOpsProject(skills));
  }
  
  projectSuggestions.push(...createGeneralProjects(skills));
  
  const uniqueProjects = Array.from(new Map(projectSuggestions.map(project => 
    [project.title, project])).values());
  
  uniqueProjects.forEach(project => {
    const matchingSkills = project.skills.filter(skill => 
      normalizedSkills.some(userSkill => skill.toLowerCase().includes(userSkill))
    );
    project.skillMatchScore = matchingSkills.length / project.skills.length;
  });
  
  uniqueProjects.sort((a, b) => (b.skillMatchScore || 0) - (a.skillMatchScore || 0));
  
  return uniqueProjects;
};

const createFullStackProject = (skills: string[]): ProjectSuggestion => {
  const fullStackProjects = [
    {
      title: "E-commerce Platform",
      description: "Build a full-featured e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.",
      difficulty: "advanced" as const,
      timeEstimate: "2-3 months"
    },
    {
      title: "Social Media Dashboard",
      description: "Create a social media management dashboard with analytics, scheduled posting, and content management features.",
      difficulty: "intermediate" as const,
      timeEstimate: "1-2 months"
    },
    {
      title: "Learning Management System",
      description: "Develop an LMS with course creation, student enrollment, assignment submission, and progress tracking.",
      difficulty: "advanced" as const,
      timeEstimate: "3-4 months"
    },
    {
      title: "Project Management Tool",
      description: "Build a project management application with task tracking, team collaboration, and reporting features.",
      difficulty: "intermediate" as const,
      timeEstimate: "1-2 months"
    },
    {
      title: "Real Estate Listing Platform",
      description: "Create a platform for property listings with search filters, map integration, and inquiry management.",
      difficulty: "intermediate" as const,
      timeEstimate: "2-3 months"
    }
  ];
  
  return createProjectFromTemplate(selectRandom(fullStackProjects), skills);
};

const createFrontendProject = (skills: string[]): ProjectSuggestion => {
  const frontendProjects = [
    {
      title: "Interactive Data Visualization Dashboard",
      description: "Create an interactive dashboard to visualize complex datasets using charts, graphs, and filterable views.",
      difficulty: "intermediate" as const,
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Portfolio Website with Animations",
      description: "Design a portfolio website with advanced animations, transitions, and interactive elements.",
      difficulty: "beginner" as const,
      timeEstimate: "1-3 weeks"
    },
    {
      title: "Weather Application with Geolocation",
      description: "Build a weather app that uses geolocation to show current weather and forecasts with beautiful visualizations.",
      difficulty: "beginner" as const,
      timeEstimate: "1-2 weeks"
    },
    {
      title: "Recipe Finder with Filtering",
      description: "Create a recipe search application with advanced filtering options, favorites saving, and meal planning.",
      difficulty: "intermediate" as const,
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Interactive Quiz Application",
      description: "Develop a quiz app with multiple question types, timer, score tracking, and result sharing.",
      difficulty: "beginner" as const,
      timeEstimate: "1-3 weeks"
    }
  ];
  
  return createProjectFromTemplate(selectRandom(frontendProjects), skills);
};

const createBackendProject = (skills: string[]): ProjectSuggestion => {
  const backendProjects = [
    {
      title: "RESTful API with Authentication",
      description: "Build a comprehensive RESTful API with user authentication, role-based access control, and data validation.",
      difficulty: "intermediate" as const,
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Real-time Chat Server",
      description: "Create a scalable real-time chat server with private messaging, group chats, and message persistence.",
      difficulty: "intermediate" as const,
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Content Management System API",
      description: "Develop a headless CMS API with content creation, asset management, and versioning capabilities.",
      difficulty: "advanced" as const,
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Payment Processing Service",
      description: "Build a payment processing service that integrates with popular payment gateways and handles subscriptions.",
      difficulty: "advanced" as const,
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Data Processing Pipeline",
      description: "Create a data processing pipeline for collecting, transforming, and storing data from multiple sources.",
      difficulty: "intermediate" as const,
      timeEstimate: "2-4 weeks"
    }
  ];
  
  return createProjectFromTemplate(selectRandom(backendProjects), skills);
};

const createMobileProject = (skills: string[]): ProjectSuggestion => {
  const mobileProjects = [
    {
      title: "Fitness Tracking App",
      description: "Build a mobile app for tracking workouts, setting goals, and visualizing progress over time.",
      difficulty: "intermediate" as const,
      timeEstimate: "4-8 weeks"
    },
    {
      title: "Travel Companion App",
      description: "Create a travel app with itinerary planning, place recommendations, and offline map capabilities.",
      difficulty: "intermediate" as const,
      timeEstimate: "6-10 weeks"
    },
    {
      title: "Expense Tracker with Budgeting",
      description: "Develop a personal finance app for tracking expenses, creating budgets, and generating spending reports.",
      difficulty: "beginner" as const,
      timeEstimate: "3-6 weeks"
    },
    {
      title: "Language Learning Flashcards",
      description: "Build a mobile flashcard app for language learning with spaced repetition and pronunciation practice.",
      difficulty: "beginner" as const,
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Augmented Reality Measurement Tool",
      description: "Create an AR app that can measure real-world objects using the device's camera and AR capabilities.",
      difficulty: "advanced" as const,
      timeEstimate: "6-12 weeks"
    }
  ];
  
  return createProjectFromTemplate(selectRandom(mobileProjects), skills);
};

const createAiMlProject = (skills: string[]): ProjectSuggestion => {
  const aiMlProjects = [
    {
      title: "Sentiment Analysis Dashboard",
      description: "Build a dashboard that analyzes sentiment from social media posts, reviews, or any text content.",
      difficulty: "intermediate" as const,
      timeEstimate: "3-6 weeks"
    },
    {
      title: "Image Classification Web App",
      description: "Create a web app that can classify uploaded images using pre-trained or custom machine learning models.",
      difficulty: "intermediate" as const,
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Recommendation Engine",
      description: "Develop a recommendation system that suggests products, content, or connections based on user behavior.",
      difficulty: "advanced" as const,
      timeEstimate: "4-8 weeks"
    },
    {
      title: "Natural Language Chatbot",
      description: "Build a chatbot using natural language processing to understand and respond to user queries.",
      difficulty: "advanced" as const,
      timeEstimate: "5-10 weeks"
    },
    {
      title: "Anomaly Detection System",
      description: "Create a system that can detect anomalies in time-series data, such as unusual transactions or sensor readings.",
      difficulty: "advanced" as const,
      timeEstimate: "4-8 weeks"
    }
  ];
  
  return createProjectFromTemplate(selectRandom(aiMlProjects), skills);
};

const createDevOpsProject = (skills: string[]): ProjectSuggestion => {
  const devOpsProjects = [
    {
      title: "CI/CD Pipeline Automation",
      description: "Set up a complete CI/CD pipeline for automated testing, building, and deployment of applications.",
      difficulty: "intermediate" as const,
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Infrastructure as Code Project",
      description: "Create infrastructure as code templates for provisioning and managing cloud resources.",
      difficulty: "intermediate" as const,
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Monitoring Dashboard",
      description: "Build a comprehensive monitoring dashboard for tracking application performance, server health, and alerts.",
      difficulty: "intermediate" as const,
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Container Orchestration System",
      description: "Set up a containerized application environment with orchestration for scaling and management.",
      difficulty: "advanced" as const,
      timeEstimate: "4-6 weeks"
    },
    {
      title: "Automated Backup System",
      description: "Create an automated backup system with scheduling, verification, and recovery capabilities.",
      difficulty: "beginner" as const,
      timeEstimate: "1-3 weeks"
    }
  ];
  
  return createProjectFromTemplate(selectRandom(devOpsProjects), skills);
};

const createGeneralProjects = (skills: string[]): ProjectSuggestion[] => {
  const generalProjects = [
    {
      title: "Personal Blog Platform",
      description: "Create a blog platform with content management, commenting, and analytics features.",
      difficulty: "beginner" as const,
      timeEstimate: "2-4 weeks"
    },
    {
      title: "Task Management App",
      description: "Build a task management application with features like categories, priorities, and reminders.",
      difficulty: "beginner" as const,
      timeEstimate: "1-3 weeks"
    },
    {
      title: "Online Resume Builder",
      description: "Develop a tool that helps users create professional resumes with customizable templates.",
      difficulty: "intermediate" as const,
      timeEstimate: "3-5 weeks"
    },
    {
      title: "Digital Cookbook",
      description: "Build a digital cookbook application where users can save, categorize, and share recipes.",
      difficulty: "beginner" as const,
      timeEstimate: "2-3 weeks"
    },
    {
      title: "Event Planning Tool",
      description: "Create an event planning application with guest lists, scheduling, and RSVP management.",
      difficulty: "intermediate" as const,
      timeEstimate: "3-5 weeks"
    }
  ];
  
  return generalProjects.map(project => createProjectFromTemplate(project, skills)).slice(0, 3);
};

const createProjectFromTemplate = (
  template: { 
    title: string; 
    description: string; 
    difficulty: "beginner" | "intermediate" | "advanced"; 
    timeEstimate: string 
  }, 
  userSkills: string[]
): ProjectSuggestion => {
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());
  
  const relevantSkills = selectRelevantSkills(normalizedUserSkills, template.title, template.difficulty);
  
  const id = `project-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
  return {
    id,
    title: template.title,
    description: template.description,
    difficulty: template.difficulty,
    skills: relevantSkills,
    timeEstimate: template.timeEstimate,
    resources: generateRelevantResources(relevantSkills),
    tags: generateRelevantTags(template.title, template.description),
    sourceCode: {
      githubUrl: Math.random() > 0.3 ? 'https://github.com/example/repo' : undefined,
      relatedResources: generateRelevantResources(relevantSkills)
    }
  };
};

const selectRelevantSkills = (userSkills: string[], projectTitle: string, difficulty: string): string[] => {
  const beginnerSkills = ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'jQuery'];
  const intermediateSkills = ['React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'MongoDB', 'Firebase'];
  const advancedSkills = ['TypeScript', 'GraphQL', 'Docker', 'Kubernetes', 'AWS', 'TensorFlow', 'PyTorch'];
  
  let selectedSkills = userSkills.slice(0, Math.min(5, userSkills.length));
  
  if (selectedSkills.length < 3) {
    if (projectTitle.toLowerCase().includes('mobile')) {
      selectedSkills.push('React Native', 'Flutter', 'Swift');
    } else if (projectTitle.toLowerCase().includes('ai') || projectTitle.toLowerCase().includes('ml')) {
      selectedSkills.push('Python', 'TensorFlow', 'Data Science');
    } else if (projectTitle.toLowerCase().includes('dashboard')) {
      selectedSkills.push('D3.js', 'Chart.js', 'Data Visualization');
    }
    
    if (difficulty === 'beginner' && selectedSkills.length < 4) {
      selectedSkills = [...selectedSkills, ...selectRandomFromArray(beginnerSkills, 2)];
    } else if (difficulty === 'intermediate' && selectedSkills.length < 4) {
      selectedSkills = [...selectedSkills, ...selectRandomFromArray(intermediateSkills, 2)];
    } else if (difficulty === 'advanced' && selectedSkills.length < 4) {
      selectedSkills = [...selectedSkills, ...selectRandomFromArray(advancedSkills, 2)];
    }
  }
  
  return Array.from(new Set(selectedSkills.map(skill => 
    skill.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
  )));
};

const generateRelevantResources = (skills: string[]): ProjectResource[] => {
  const resourceTypes: Array<'tutorial' | 'documentation' | 'github' | 'article'> = ['tutorial', 'documentation', 'github', 'article'];
  const resources: ProjectResource[] = [];
  
  skills.slice(0, 3).forEach(skill => {
    const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const title = getResourceTitle(type, skill);
    
    resources.push({
      title,
      url: 'https://example.com/resource',
      type
    });
  });
  
  resources.push({
    title: 'Project Planning Guide',
    url: 'https://example.com/planning',
    type: 'article'
  });
  
  return resources;
};

const getResourceTitle = (type: string, skill: string): string => {
  switch (type) {
    case 'tutorial':
      return `${skill} Beginner to Advanced Tutorial`;
    case 'documentation':
      return `Official ${skill} Documentation`;
    case 'github':
      return `${skill} Example Repository`;
    case 'article':
      return `Best Practices for ${skill} Development`;
    default:
      return `${skill} Learning Resource`;
  }
};

const generateRelevantTags = (title: string, description: string): string[] => {
  const allTags = [
    'Web Development', 'Mobile App', 'AI/ML', 'Data Science', 'IoT', 
    'Blockchain', 'Game Development', 'DevOps', 'Cloud Computing',
    'Cybersecurity', 'AR/VR', 'Automation', 'UI/UX', 'Microservices',
    'Frontend', 'Backend', 'Full Stack', 'API Development'
  ];
  
  const content = (title + ' ' + description).toLowerCase();
  const relevantTags = allTags.filter(tag => content.includes(tag.toLowerCase()));
  
  if (relevantTags.length > 0) {
    return selectRandomFromArray(relevantTags, Math.min(3, relevantTags.length));
  } else {
    return selectRandomFromArray(allTags, 3);
  }
};

const selectRandomFromArray = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const selectRandom = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const mockRecommendations = (skills: string[]) => {
  const recommendations = [];
  
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
  
  const generateRandomTags = () => {
    const allTags = [
      'Web Development', 'Mobile App', 'AI/ML', 'Data Science', 'IoT', 
      'Blockchain', 'Game Development', 'DevOps', 'Cloud Computing'
    ];
    
    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };
  
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
  
  recommendations.sort((a, b) => b.skillMatchScore - a.skillMatchScore);
  
  return recommendations;
};
