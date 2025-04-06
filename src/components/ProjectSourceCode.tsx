
import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Code, Github, BookOpen, FileText } from 'lucide-react';
import { ProjectSuggestion } from '@/types';

interface ProjectSourceCodeProps {
  project: ProjectSuggestion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectSourceCode: React.FC<ProjectSourceCodeProps> = ({ 
  project, 
  open, 
  onOpenChange 
}) => {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('github');
  const [sourceData, setSourceData] = useState({
    github: [] as Array<{name: string, url: string, description: string}>,
    tutorials: [] as Array<{name: string, url: string, type: string}>,
    documentation: [] as Array<{name: string, url: string, description: string}>
  });

  useEffect(() => {
    if (open && project) {
      setLoading(true);
      
      // Simulate API call to fetch source code references
      setTimeout(() => {
        // Generate mock source code data based on project skills
        const mockSourceData = generateMockSourceData(project);
        setSourceData(mockSourceData);
        setLoading(false);
      }, 1500);
    }
  }, [open, project]);

  const generateMockSourceData = (project: ProjectSuggestion) => {
    // This function simulates generating relevant source links based on project skills
    const githubRepos = project.skills.map((skill, index) => ({
      name: `${skill}-project-${index + 1}`,
      url: `https://github.com/examples/${skill.toLowerCase()}-examples`,
      description: `A ${skill} project example that demonstrates key concepts related to ${project.title}`,
    })).slice(0, 5);

    const tutorials = [
      {
        name: `Getting Started with ${project.title}`,
        url: `https://www.tutorial-site.com/${project.title.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'video'
      },
      {
        name: `${project.title} Step-by-Step Guide`,
        url: `https://www.freecodecamp.org/news/${project.title.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'article'
      },
      {
        name: `Advanced ${project.skills[0]} Techniques`,
        url: `https://dev.to/tutorials/${project.skills[0].toLowerCase()}`,
        type: 'tutorial'
      }
    ];

    const documentation = project.skills.map((skill, index) => ({
      name: `${skill} Official Documentation`,
      url: `https://docs.example.com/${skill.toLowerCase()}`,
      description: `Official documentation for ${skill} with examples and API references`,
    }));

    return {
      github: githubRepos,
      tutorials: tutorials,
      documentation: documentation
    };
  };

  const renderSkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded w-2/3"></div>
      <div className="h-4 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
      <div className="h-10 bg-muted rounded w-full mt-4"></div>
      <div className="h-10 bg-muted rounded w-full"></div>
      <div className="h-10 bg-muted rounded w-full"></div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Source Code & Resources</SheetTitle>
          <SheetDescription>
            {project && `Explore implementation resources for "${project.title}"`}
          </SheetDescription>
        </SheetHeader>

        {project && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {project.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
            
            <Tabs defaultValue="github" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="mb-4 w-full grid grid-cols-3">
                <TabsTrigger value="github" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </TabsTrigger>
                <TabsTrigger value="tutorials" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Tutorials</span>
                </TabsTrigger>
                <TabsTrigger value="documentation" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Documentation</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="github" className="space-y-4">
                <h3 className="font-medium">GitHub Repositories</h3>
                {loading ? (
                  renderSkeletonLoader()
                ) : (
                  <div className="space-y-4">
                    {sourceData.github.map((repo, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Github className="h-4 w-4 text-primary" />
                            <a 
                              href={repo.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium hover:underline text-primary"
                            >
                              {repo.name}
                            </a>
                          </div>
                          <p className="text-muted-foreground text-sm">{repo.description}</p>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="flex items-center gap-1"
                              asChild
                            >
                              <a href={repo.url} target="_blank" rel="noopener noreferrer">
                                <span>View</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tutorials" className="space-y-4">
                <h3 className="font-medium">Tutorials & Guides</h3>
                {loading ? (
                  renderSkeletonLoader()
                ) : (
                  <div className="space-y-4">
                    {sourceData.tutorials.map((tutorial, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <a 
                              href={tutorial.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium hover:underline text-primary"
                            >
                              {tutorial.name}
                            </a>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {tutorial.type}
                          </Badge>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="flex items-center gap-1"
                              asChild
                            >
                              <a href={tutorial.url} target="_blank" rel="noopener noreferrer">
                                <span>View</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="documentation" className="space-y-4">
                <h3 className="font-medium">Documentation & References</h3>
                {loading ? (
                  renderSkeletonLoader()
                ) : (
                  <div className="space-y-4">
                    {sourceData.documentation.map((doc, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium hover:underline text-primary"
                            >
                              {doc.name}
                            </a>
                          </div>
                          <p className="text-muted-foreground text-sm">{doc.description}</p>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="flex items-center gap-1"
                              asChild
                            >
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <span>View</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Separator />
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button 
                onClick={() => window.open(`https://github.com/search?q=${encodeURIComponent(project.title)}`, '_blank')}
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                Search on GitHub
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ProjectSourceCode;
