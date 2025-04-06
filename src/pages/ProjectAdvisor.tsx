
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DeveloperProfile, ProjectSuggestion, Skill, AIConfigState, AIModelConfig } from '@/types';
import { mockProjects } from '@/data/mockData';
import { ExternalLink, Loader2 } from 'lucide-react';
import AIConfigDialog from '@/components/AIConfigDialog';

const ProjectAdvisor = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentSkillLevel, setCurrentSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [experience, setExperience] = useState('');
  const [interests, setInterests] = useState('');
  const [goals, setGoals] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [savedProjects, setSavedProjects] = useState<ProjectSuggestion[]>([]);
  const [aiConfig, setAIConfig] = useState<AIConfigState>({
    openai: { provider: 'openai', apiKey: '', enabled: false },
    gemini: { provider: 'gemini', apiKey: '', enabled: false },
    claude: { provider: 'claude', apiKey: '', enabled: false },
    github: { provider: 'github', apiKey: '', enabled: false }
  });

  // Load saved API keys and projects from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('aiConfig');
    if (savedConfig) {
      try {
        setAIConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse saved AI config');
      }
    }

    const saved = localStorage.getItem('savedProjects');
    if (saved) {
      try {
        setSavedProjects(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved projects');
      }
    }
  }, []);

  // Save API keys and projects to localStorage
  useEffect(() => {
    localStorage.setItem('aiConfig', JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  const addSkill = () => {
    if (!currentSkill.trim()) {
      toast({
        title: "Skill name is required",
        description: "Please enter a skill name.",
        variant: "destructive",
      });
      return;
    }

    const newSkill: Skill = {
      id: Date.now().toString(),
      name: currentSkill.trim(),
      level: currentSkillLevel,
    };

    setSkills([...skills, newSkill]);
    setCurrentSkill('');
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const getRandomTags = () => {
    const allTags = [
      'Web Development', 'Mobile App', 'AI/ML', 'Data Science', 'IoT', 
      'Blockchain', 'Game Development', 'DevOps', 'Cloud Computing',
      'Cybersecurity', 'AR/VR', 'Automation', 'UI/UX', 'Microservices',
      'Frontend', 'Backend', 'Full Stack', 'Low-Code', 'API Development'
    ];
    
    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 4) + 2; // 2-5 tags
    return shuffled.slice(0, count);
  };

  const getRandomSkills = () => {
    const allSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS',
      'Docker', 'Kubernetes', 'GraphQL', 'MongoDB', 'SQL', 'Firebase',
      'Flutter', 'Swift', 'Kotlin', 'Go', 'Rust', 'C#', 'Java', 'PHP',
      'TensorFlow', 'PyTorch', 'Vue.js', 'Angular', 'Next.js', 'Express',
      'CSS', 'HTML', 'Tailwind', 'Bootstrap', 'Material UI', 'Redux'
    ];
    
    // Get user skills first
    let projectSkills = skills.map(s => s.name);
    
    // Add some random skills
    if (projectSkills.length < 5) {
      const shuffled = [...allSkills].sort(() => 0.5 - Math.random());
      const additionalCount = Math.floor(Math.random() * 3) + 1; // 1-3 additional skills
      shuffled.slice(0, additionalCount).forEach(skill => {
        if (!projectSkills.includes(skill)) {
          projectSkills.push(skill);
        }
      });
    }
    
    return projectSkills;
  };

  const getRandomTimeEstimate = () => {
    const timeRanges = [
      '1-2 weeks', '2-3 weeks', '3-4 weeks', 
      '1-2 months', '2-3 months', '3-6 months'
    ];
    return timeRanges[Math.floor(Math.random() * timeRanges.length)];
  };

  const getRandomResources = () => {
    const resourceTitles = [
      'Getting Started Guide', 'API Documentation', 'GitHub Repository',
      'Video Tutorial', 'Interactive Tutorial', 'Stack Overflow Solutions',
      'Best Practices Guide', 'Code Samples', 'Community Forum',
      'DevOps Pipeline Setup', 'Testing Guidelines', 'Security Best Practices'
    ];
    
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 resources
    const resources: ProjectResource[] = [];
    
    for (let i = 0; i < count; i++) {
      const title = resourceTitles[Math.floor(Math.random() * resourceTitles.length)];
      const types: Array<'tutorial' | 'documentation' | 'github' | 'article'> = ['tutorial', 'documentation', 'github', 'article'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      resources.push({
        title: `${title} for ${getRandomSkills()[0]}`,
        url: '#',
        type
      });
    }
    
    return resources;
  };

  const generateRandomProject = (id: string): ProjectSuggestion => {
    const projectTitles = [
      'AI-powered Task Manager', 'IoT Home Monitoring System', 'Blockchain Voting Platform',
      'AR Shopping Experience', 'Voice-Controlled Smart Assistant', 'Personalized Learning App',
      'Real-time Collaboration Tool', 'Cryptocurrency Portfolio Tracker', 'Mental Health Wellness App',
      'Social Media Content Scheduler', 'E-commerce Recommendation Engine', 'Decentralized File Storage',
      'Augmented Reality Navigation', 'Peer-to-peer Ridesharing Platform', 'Language Learning Gamification',
      'Recipe Recommendation System', 'Remote Team Collaboration Platform', 'Personal Finance Tracker',
      'Virtual Study Group Platform', 'Cross-platform Mobile Game', 'Job Application Tracker',
      'Smart City Traffic Management', 'Virtual Reality Training Simulator', 'Healthcare Patient Portal',
      'Custom CRM Solution', 'Music Recommendation System', 'Travel Itinerary Planner',
      'Project Management Dashboard', 'Sustainable Living Tracker', 'Automated Code Reviewer'
    ];

    const descriptions = [
      'A comprehensive solution that helps users streamline their workflow and boost productivity.',
      'An innovative platform that leverages cutting-edge technology to solve real-world problems.',
      'A user-friendly application designed to simplify complex processes and improve user experience.',
      'A powerful tool that provides data-driven insights and actionable recommendations.',
      'A next-generation system that combines multiple technologies for a seamless experience.',
      'A scalable solution that addresses growing needs in the digital landscape.',
      'A versatile application that caters to diverse user requirements across different domains.',
      'A feature-rich platform that offers extensive customization and integration capabilities.',
      'An intelligent system that learns from user behavior to deliver personalized experiences.',
      'A robust application built with security and performance in mind.'
    ];

    // Combine a random title with a random description plus some specifics about the title
    const title = projectTitles[Math.floor(Math.random() * projectTitles.length)];
    const baseDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const specificDescription = `This ${title.toLowerCase()} project allows users to ${
      Math.random() > 0.5 ? 'efficiently manage' : 'seamlessly interact with'
    } ${
      Math.random() > 0.5 ? 'data' : 'content'
    } through a ${
      Math.random() > 0.5 ? 'modern interface' : 'intuitive UI'
    }.`;

    return {
      id,
      title,
      description: `${baseDescription} ${specificDescription}`,
      difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as 'beginner' | 'intermediate' | 'advanced',
      skills: getRandomSkills(),
      timeEstimate: getRandomTimeEstimate(),
      resources: getRandomResources(),
      tags: getRandomTags(),
      sourceCode: {
        githubUrl: Math.random() > 0.3 ? 'https://github.com/example/repo' : undefined,
        relatedResources: getRandomResources()
      }
    };
  };

  const generateProjects = () => {
    if (skills.length === 0) {
      toast({
        title: "Skills are required",
        description: "Please add at least one skill before generating suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate API call delay
    setTimeout(() => {
      // Generate random number of projects between 10-20
      const projectCount = Math.floor(Math.random() * 11) + 10; // 10-20
      const newProjects: ProjectSuggestion[] = [];
      
      for (let i = 0; i < projectCount; i++) {
        newProjects.push(generateRandomProject(`project-${Date.now()}-${i}`));
      }

      setSuggestions(newProjects);
      setIsGenerating(false);
      setActiveTab('suggestions');
      
      toast({
        title: "Projects Generated!",
        description: `Found ${newProjects.length} projects matching your profile.`,
      });
    }, 2000);
  };

  const getOverallSkillLevel = (): 'beginner' | 'intermediate' | 'advanced' => {
    const levels = skills.map(skill => skill.level);
    if (levels.includes('advanced') && levels.length > 2) return 'advanced';
    if (levels.includes('intermediate') || levels.length > 3) return 'intermediate';
    return 'beginner';
  };

  const saveProject = (project: ProjectSuggestion) => {
    if (!savedProjects.some(p => p.id === project.id)) {
      setSavedProjects([...savedProjects, project]);
      toast({
        title: "Project Saved",
        description: "Project has been added to your saved list.",
      });
    } else {
      toast({
        title: "Already Saved",
        description: "This project is already in your saved list.",
        variant: "destructive",
      });
    }
  };

  const removeSavedProject = (id: string) => {
    setSavedProjects(savedProjects.filter(project => project.id !== id));
    toast({
      title: "Project Removed",
      description: "Project has been removed from your saved list.",
    });
  };

  const updateAIConfig = (newConfig: AIConfigState) => {
    setAIConfig(newConfig);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-dev-primary to-dev-accent">
                Project Advisor
              </h1>
              <p className="text-muted-foreground mt-2">
                Get personalized project suggestions based on your developer profile.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <AIConfigDialog config={aiConfig} onUpdateConfig={updateAIConfig} />
            </div>
          </div>
          
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Your Profile</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="saved">Saved Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                    <CardDescription>Add your programming skills and expertise level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                        <Input 
                          placeholder="e.g. JavaScript, Python, React" 
                          value={currentSkill}
                          onChange={(e) => setCurrentSkill(e.target.value)}
                        />
                        <Select 
                          value={currentSkillLevel} 
                          onValueChange={(value) => setCurrentSkillLevel(value as 'beginner' | 'intermediate' | 'advanced')}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Skill Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={addSkill}>Add Skill</Button>
                      </div>
                      
                      <div className="mt-4">
                        {skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                              <Badge 
                                key={skill.id} 
                                variant="outline"
                                className="flex items-center gap-2 px-3 py-1"
                              >
                                <span>{skill.name}</span>
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                                  {skill.level}
                                </span>
                                <button 
                                  onClick={() => removeSkill(skill.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No skills added yet.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Help us understand more about your experience and goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Experience Level</label>
                        <Select value={experience} onValueChange={setExperience}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="beginner">Beginner Developer (0-1 years)</SelectItem>
                            <SelectItem value="junior">Junior Developer (1-3 years)</SelectItem>
                            <SelectItem value="mid">Mid-level Developer (3-5 years)</SelectItem>
                            <SelectItem value="senior">Senior Developer (5+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Interests</label>
                        <Textarea 
                          placeholder="What are you interested in? (e.g. web development, machine learning, game development)"
                          value={interests}
                          onChange={(e) => setInterests(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Learning Goals</label>
                        <Textarea 
                          placeholder="What do you want to achieve with your next project? What skills do you want to develop?"
                          value={goals}
                          onChange={(e) => setGoals(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  size="lg"
                  onClick={generateProjects}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-dev-primary to-dev-accent hover:from-dev-accent hover:to-dev-primary text-white"
                >
                  {isGenerating ? 'Generating...' : 'Generate Project Suggestions'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="suggestions">
              {suggestions.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {suggestions.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{project.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="bg-dev-primary/10 text-dev-primary border-dev-primary/20">
                            {project.difficulty}
                          </Badge>
                          <Badge variant="outline" className="bg-muted">
                            {project.timeEstimate}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{project.description}</p>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Skills Required:</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="bg-muted">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Resources:</h4>
                          <ul className="space-y-2">
                            {project.resources.map((resource, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <ExternalLink className="h-4 w-4 text-dev-primary" />
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-dev-primary hover:underline">
                                  {resource.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                          More Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => saveProject(project)}
                          className="bg-dev-primary text-white hover:bg-dev-secondary"
                        >
                          Save Project
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No Suggestions Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Complete your developer profile to get personalized project suggestions.
                  </p>
                  <Button onClick={() => setActiveTab('profile')}>
                    Return to Profile
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="saved">
              {savedProjects.length > 0 ? (
                <div className="space-y-6">
                  {savedProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{project.title}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeSavedProject(project.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="bg-dev-primary/10 text-dev-primary border-dev-primary/20">
                            {project.difficulty}
                          </Badge>
                          <Badge variant="outline" className="bg-muted">
                            {project.timeEstimate}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{project.description}</p>
                        
                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Skills Required:</h4>
                            <div className="flex flex-wrap gap-2">
                              {project.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="bg-muted">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Resources:</h4>
                            <ul className="space-y-2">
                              {project.resources.map((resource, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <ExternalLink className="h-4 w-4 text-dev-primary" />
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-dev-primary hover:underline">
                                    {resource.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No Saved Projects</h3>
                  <p className="text-muted-foreground mb-6">
                    Save projects from suggestions to access them here later.
                  </p>
                  <Button onClick={() => setActiveTab('suggestions')}>
                    Browse Suggestions
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectAdvisor;
