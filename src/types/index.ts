
export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface DeveloperProfile {
  skills: Skill[];
  experience: string;
  interests: string[];
  goals: string[];
}

export interface ProjectReview {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
  projectId?: string;
}

export interface ProjectResource {
  title: string;
  url: string;
  type: 'tutorial' | 'documentation' | 'github' | 'article';
}

export interface ProjectSourceCode {
  githubUrl?: string;
  codeSamples?: Array<{
    language: string;
    code: string;
    description: string;
  }>;
  relatedResources: ProjectResource[];
}

export interface ProjectSuggestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  timeEstimate: string;
  resources: ProjectResource[];
  tags: string[];
  sourceCode?: ProjectSourceCode;
  reviews?: ProjectReview[];
  skillMatchScore?: number;
  researchPaper?: ResearchPaper;
}

export interface ResearchPaper {
  title: string;
  authors: string[];
  institution?: string;
  email?: string;
  abstract: string;
  keywords: string[];
  introduction: string;
  aims: string[];
  methodology: {
    overview: string;
    systemAnalysis: string;
    requirements?: {
      software: string[];
      hardware: string[];
    };
    implementation: string;
  };
  modules: {
    name: string;
    description: string;
  }[];
  testing: {
    process: string;
    results: string;
  };
  futureScope: string;
  conclusion: string;
  references: {
    text: string;
    url?: string;
  }[];
}

export interface AIModelConfig {
  provider: 'openai' | 'gemini' | 'claude' | 'github';
  apiKey: string;
  enabled: boolean;
}

export interface AIConfigState {
  openai: AIModelConfig;
  gemini: AIModelConfig;
  claude: AIModelConfig;
  github: AIModelConfig;
}

export interface ProjectDetails {
  detailedDescription: string;
  projectStructure: string;
  roadmap: string;
  flowchart: string;
  pseudoCode?: string;
}
