
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

export interface ProjectResource {
  title: string;
  url: string;
  type: 'tutorial' | 'documentation' | 'github' | 'article';
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
}
