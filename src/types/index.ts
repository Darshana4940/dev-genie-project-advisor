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
