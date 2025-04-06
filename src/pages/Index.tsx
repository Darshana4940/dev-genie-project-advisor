
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorks from '@/components/HowItWorks';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ProjectSuggestion, ProjectReview } from '@/types';
import { ExternalLink, Code, Star, Github, BookOpen, Save, Check } from 'lucide-react';
import ProjectSourceCode from '@/components/ProjectSourceCode';

const Index = () => {
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [interests, setInterests] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [savedProjects, setSavedProjects] = useState<ProjectSuggestion[]>([]);
  const [showSavedLibrary, setShowSavedLibrary] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectSuggestion | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [sourceCodeOpen, setSourceCodeOpen] = useState(false);

  useEffect(() => {
    // Load saved projects from localStorage
    const savedProjectsData = localStorage.getItem('savedProjects');
    if (savedProjectsData) {
      try {
        setSavedProjects(JSON.parse(savedProjectsData));
      } catch (error) {
        console.error('Error loading saved projects:', error);
      }
    }
  }, []);

  const addSkill = () => {
    if (!currentSkill.trim()) {
      toast({
        title: "Skill name is required",
        description: "Please enter a skill name.",
        variant: "destructive",
      });
      return;
    }

    if (!skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    } else {
      toast({
        title: "Skill already added",
        description: "This skill is already in your list.",
        variant: "destructive",
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
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

    // Generate a random number of projects between 10-20
    const numProjects = Math.floor(Math.random() * 11) + 10; // 10-20 projects

    // Simulate API call
    setTimeout(() => {
      const generatedProjects: ProjectSuggestion[] = Array.from({ length: numProjects }).map((_, index) => {
        const difficulty = ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as 'beginner' | 'intermediate' | 'advanced';
        const skillsSubset = skills.sort(() => 0.5 - Math.random()).slice(0, Math.min(skills.length, 4));
        
        // Generate random project titles and descriptions
        const projectTypes = [
          'Web Application', 'Mobile App', 'API', 'Machine Learning Model', 
          'IoT System', 'Data Visualization', 'Game', 'Automation Tool',
          'Browser Extension', 'Desktop Application', 'Blockchain App'
        ];
        
        const domains = [
          'Social Media', 'E-commerce', 'Health', 'Education', 'Finance', 
          'Entertainment', 'Productivity', 'Communication', 'Travel',
          'Food & Dining', 'Fitness', 'Weather', 'News', 'Real Estate'
        ];
        
        const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        
        const title = `${domain} ${projectType} with ${skillsSubset[0]}`;
        
        const description = `Build a ${difficulty} level ${domain.toLowerCase()} ${projectType.toLowerCase()} using ${skillsSubset.join(', ')}. This project will help you improve your skills and create a practical application that can be added to your portfolio.`;
        
        return {
          id: `project-${Date.now()}-${index}`,
          title,
          description,
          difficulty,
          skills: skillsSubset,
          timeEstimate: `${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 5) + 6} weeks`,
          resources: [
            {
              title: `${skillsSubset[0]} Tutorial`,
              url: `https://example.com/tutorial/${skillsSubset[0].toLowerCase()}`,
              type: 'tutorial'
            },
            {
              title: `${projectType} Documentation`,
              url: `https://example.com/docs/${projectType.toLowerCase().replace(/\s+/g, '-')}`,
              type: 'documentation'
            },
            {
              title: `Sample ${domain} Project`,
              url: `https://github.com/example/${domain.toLowerCase().replace(/\s+/g, '-')}-${projectType.toLowerCase().replace(/\s+/g, '-')}`,
              type: 'github'
            }
          ],
          tags: [...skillsSubset, domain.toLowerCase(), projectType.toLowerCase(), difficulty],
          reviews: []
        };
      });

      setSuggestions(generatedProjects);
      setIsGenerating(false);
      
      toast({
        title: "Projects Generated!",
        description: `Found ${numProjects} projects matching your profile.`,
      });
    }, 2000);
  };

  const saveProject = (project: ProjectSuggestion) => {
    if (!savedProjects.some(p => p.id === project.id)) {
      const updatedSavedProjects = [...savedProjects, project];
      setSavedProjects(updatedSavedProjects);
      localStorage.setItem('savedProjects', JSON.stringify(updatedSavedProjects));
      
      toast({
        title: "Project Saved",
        description: "Project has been added to your saved library.",
      });
    } else {
      toast({
        title: "Already Saved",
        description: "This project is already in your saved library.",
        variant: "destructive",
      });
    }
  };
  
  const removeSavedProject = (id: string) => {
    setProjectToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  const confirmRemoveSavedProject = () => {
    if (projectToDelete) {
      const updatedSavedProjects = savedProjects.filter(project => project.id !== projectToDelete);
      setSavedProjects(updatedSavedProjects);
      localStorage.setItem('savedProjects', JSON.stringify(updatedSavedProjects));
      
      toast({
        title: "Project Removed",
        description: "Project has been removed from your saved library.",
      });
      
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  };

  const openProjectDetails = (project: ProjectSuggestion) => {
    setSelectedProject(project);
  };
  
  const openReviewDialog = () => {
    if (selectedProject) {
      setReviewDialogOpen(true);
    }
  };
  
  const submitReview = () => {
    if (selectedProject) {
      const newReview: ProjectReview = {
        id: `review-${Date.now()}`,
        userId: 'current-user',
        username: 'User',
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString(),
      };
      
      const updatedProject = {
        ...selectedProject,
        reviews: [...(selectedProject.reviews || []), newReview]
      };
      
      // Update in suggestions if it exists there
      setSuggestions(suggestions.map(p => 
        p.id === selectedProject.id ? updatedProject : p
      ));
      
      // Update in saved projects if it exists there
      const savedProjectIndex = savedProjects.findIndex(p => p.id === selectedProject.id);
      if (savedProjectIndex !== -1) {
        const updatedSavedProjects = [...savedProjects];
        updatedSavedProjects[savedProjectIndex] = updatedProject;
        setSavedProjects(updatedSavedProjects);
        localStorage.setItem('savedProjects', JSON.stringify(updatedSavedProjects));
      }
      
      setSelectedProject(updatedProject);
      setReviewDialogOpen(false);
      setReviewRating(5);
      setReviewComment('');
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    }
  };

  const openSourceCode = (project: ProjectSuggestion) => {
    setSelectedProject(project);
    setSourceCodeOpen(true);
  };

  const renderSkillBadges = () => (
    <div className="flex flex-wrap gap-2 mt-4">
      {skills.map((skill, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-2 py-1 px-2">
          <span>{skill}</span>
          <button 
            onClick={() => removeSkill(skill)}
            className="text-muted-foreground hover:text-destructive ml-1"
          >
            ×
          </button>
        </Badge>
      ))}
    </div>
  );

  const renderProjectGrid = (projects: ProjectSuggestion[], isSavedLibrary: boolean = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow bg-card border border-primary/20 overflow-hidden group">
          <CardHeader className="relative">
            <div className="absolute top-3 right-3 z-10">
              {!isSavedLibrary ? (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveProject(project);
                  }}
                  className="bg-white/80 hover:bg-white rounded-full h-8 w-8"
                >
                  <Save className="h-4 w-4 text-primary" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSavedProject(project.id);
                  }}
                  className="bg-white/80 hover:bg-destructive/10 hover:text-destructive rounded-full h-8 w-8"
                >
                  <Check className="h-4 w-4 text-primary" />
                </Button>
              )}
            </div>
            
            <CardTitle className="text-lg font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className={`
                ${project.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-600' : 
                  project.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-600' : 
                  'bg-rose-500/10 text-rose-600'}
              `}>
                {project.difficulty}
              </Badge>
              <Badge variant="outline" className="bg-muted">
                {project.timeEstimate}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-muted-foreground line-clamp-3 mb-3">{project.description}</p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {project.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/5 text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between gap-2 pt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => openProjectDetails(project)}
              className="flex-1"
            >
              Details
            </Button>
            <Button 
              size="sm"
              onClick={() => openSourceCode(project)}
              className="flex-1 bg-primary text-white hover:bg-primary/90 flex items-center gap-1"
            >
              <Code className="h-3 w-3" /> View Source
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderStars = (rating: number, max: number = 5) => {
    return Array.from({ length: max }).map((_, i) => (
      <Star 
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="flex-grow container py-8">
        <section className="mb-12">
          <HeroSection />
        </section>
        
        <section id="generator" className="mb-16 scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                AI Project Generator
              </span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Tell us about your skills and interests, and we'll generate personalized project ideas to help you grow as a developer.
            </p>
          </div>
          
          <Card className="p-6 shadow-lg border-primary/20">
            <CardContent className="p-0">
              <div className="space-y-6">
                <div>
                  <label className="text-base font-medium mb-2 block">What skills do you have?</label>
                  <div className="flex gap-2">
                    <Input 
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      placeholder="e.g. JavaScript, React, Python"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button onClick={addSkill}>Add Skill</Button>
                  </div>
                  {renderSkillBadges()}
                </div>
                
                <div>
                  <label className="text-base font-medium mb-2 block">Experience Level</label>
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
                
                <div>
                  <label className="text-base font-medium mb-2 block">What are you interested in building?</label>
                  <Textarea 
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="Describe your interests, project types, or specific domains you want to work in."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={generateProjects}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white py-6 px-8 text-lg font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Ideas...
                      </>
                    ) : (
                      'Generate Project Ideas'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {suggestions.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">
                Suggested Projects ({suggestions.length})
              </h2>
              <Button 
                variant="outline"
                onClick={() => setShowSavedLibrary(!showSavedLibrary)}
                className="flex items-center gap-2"
              >
                {showSavedLibrary ? 'Hide Saved Library' : 'Show Saved Library'}
              </Button>
            </div>
            {renderProjectGrid(suggestions)}
          </section>
        )}
        
        {showSavedLibrary && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Your Saved Projects ({savedProjects.length})</h2>
            {savedProjects.length > 0 ? (
              renderProjectGrid(savedProjects, true)
            ) : (
              <Card className="p-12 text-center bg-muted/50">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-2">No Saved Projects</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't saved any projects yet. Generate some projects and save the ones you like!
                  </p>
                  <Button onClick={() => setShowSavedLibrary(false)}>
                    Hide Library
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        )}
        
        <section className="mb-16">
          <FeaturesSection />
        </section>
        
        <section className="mb-16">
          <HowItWorks />
        </section>
        
        <section className="mb-16">
          <TestimonialsSection />
        </section>
        
        <section>
          <CTASection />
        </section>
      </main>
      
      <Footer />
      
      {/* Project Details Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        {selectedProject && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className={`
                    ${selectedProject.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-600' : 
                      selectedProject.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-600' : 
                      'bg-rose-500/10 text-rose-600'}
                  `}>
                    {selectedProject.difficulty}
                  </Badge>
                  <Badge variant="outline" className="bg-muted">
                    {selectedProject.timeEstimate}
                  </Badge>
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 my-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedProject.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Resources</h3>
                <ul className="space-y-2">
                  {selectedProject.resources.map((resource, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {resource.type === 'github' && <Github className="h-4 w-4 text-primary" />}
                      {resource.type === 'tutorial' && <BookOpen className="h-4 w-4 text-primary" />}
                      {resource.type === 'documentation' && <ExternalLink className="h-4 w-4 text-primary" />}
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Reviews</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={openReviewDialog}
                  >
                    Add Review
                  </Button>
                </div>
                
                {selectedProject.reviews && selectedProject.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {selectedProject.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-medium">{review.username}</div>
                            <div className="text-muted-foreground text-xs">
                              {new Date(review.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex mb-2">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this project!</p>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <Button 
                variant="outline"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </Button>
              <div className="flex gap-2">
                <Button 
                  onClick={() => openSourceCode(selectedProject)}
                  className="flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  View Source
                </Button>
                <Button 
                  onClick={() => {
                    saveProject(selectedProject);
                    setSelectedProject(null);
                  }}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Save Project
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Your Review</DialogTitle>
            <DialogDescription>
              Share your thoughts about this project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setReviewRating(i + 1)}
                    className={i < reviewRating ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    <Star className={i < reviewRating ? 'fill-yellow-400' : ''} />
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Comments</label>
              <Textarea 
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts about this project..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the project from your saved library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveSavedProject}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Source Code Sheet */}
      <ProjectSourceCode 
        project={selectedProject}
        open={sourceCodeOpen}
        onOpenChange={setSourceCodeOpen}
      />
    </div>
  );
};

export default Index;
