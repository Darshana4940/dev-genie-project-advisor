
import React, { useState } from 'react';
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
import { DeveloperProfile, ProjectSuggestion, Skill } from '@/types';
import { mockProjects } from '@/data/mockData';
import { ExternalLink } from 'lucide-react';

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

    // Simulate API call
    setTimeout(() => {
      // Filter mock projects based on skill level
      const userLevel = getOverallSkillLevel();
      const matchedProjects = mockProjects.filter(project => {
        if (userLevel === 'beginner' && project.difficulty === 'beginner') return true;
        if (userLevel === 'intermediate' && (project.difficulty === 'beginner' || project.difficulty === 'intermediate')) return true;
        if (userLevel === 'advanced') return true;
        return false;
      });

      setSuggestions(matchedProjects);
      setIsGenerating(false);
      setActiveTab('suggestions');
      
      toast({
        title: "Projects Generated!",
        description: `Found ${matchedProjects.length} projects matching your profile.`,
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Project Advisor</h1>
          <p className="text-muted-foreground">Get personalized project suggestions based on your developer profile.</p>
          
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
                <div className="grid gap-6 md:grid-cols-2">
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
