
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter,
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AIConfigState, ProjectSuggestion, ResearchPaper } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, BookOpen, Download, FileText, Cog, FlaskConical, Layers, TestTube, Lightbulb, CheckCircle, BookMarked } from 'lucide-react';
import { generateProjectResearchPaper } from '@/services/aiResearchService';

interface ResearchPaperViewProps {
  project: ProjectSuggestion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiConfig: AIConfigState;
}

const ResearchPaperView: React.FC<ResearchPaperViewProps> = ({
  project,
  open,
  onOpenChange,
  aiConfig
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTab, setCurrentTab] = useState('abstract');
  const [researchPaper, setResearchPaper] = useState<ResearchPaper | null>(null);
  const [activeAI, setActiveAI] = useState<string>('');

  useEffect(() => {
    if (open && project) {
      if (project.researchPaper) {
        setResearchPaper(project.researchPaper);
      } else {
        handleGeneratePaper();
      }
    }
  }, [open, project]);

  const getEnabledAI = (): string => {
    // Priority order: OpenAI -> Gemini -> Claude -> GitHub
    if (aiConfig.openai.enabled && aiConfig.openai.apiKey) {
      return 'openai';
    } else if (aiConfig.gemini.enabled && aiConfig.gemini.apiKey) {
      return 'gemini';
    } else if (aiConfig.claude.enabled && aiConfig.claude.apiKey) {
      return 'claude';
    } else if (aiConfig.github.enabled && aiConfig.github.apiKey) {
      return 'github';
    }
    return '';
  };

  const handleGeneratePaper = async () => {
    if (!project) return;
    
    const enabledAI = getEnabledAI();
    setActiveAI(enabledAI);
    
    if (!enabledAI) {
      toast({
        title: "No AI Model Available",
        description: "Please enable and configure at least one AI model in settings.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedPaper = await generateProjectResearchPaper(project, aiConfig);
      setResearchPaper(generatedPaper);
    } catch (error) {
      console.error("Error generating research paper:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate research paper. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResearchPaper = () => {
    if (!researchPaper || !project) return;
    
    setIsDownloading(true);
    
    try {
      // Create full paper content in markdown format
      const fullPaper = `# ${researchPaper.title}

## Authors
${researchPaper.authors.join(', ')}${researchPaper.institution ? `\nInstitution: ${researchPaper.institution}` : ''}${researchPaper.email ? `\nEmail: ${researchPaper.email}` : ''}

## Abstract
${researchPaper.abstract}

## Keywords
${researchPaper.keywords.join(', ')}

# I. Introduction
${researchPaper.introduction}

## 1.1 Project Aims and Objectives
${researchPaper.aims.map(aim => `- ${aim}`).join('\n')}

# II. Methodology
${researchPaper.methodology.overview}

## 2.1 System Analysis / Research Design
${researchPaper.methodology.systemAnalysis}

${researchPaper.methodology.requirements ? `### 2.1.1 Software and Hardware Requirements
**Software:** ${researchPaper.methodology.requirements.software.join(', ')}
**Hardware:** ${researchPaper.methodology.requirements.hardware.join(', ')}` : ''}

## 2.2 System Implementation
${researchPaper.methodology.implementation}

# III. Module Description / System Architecture
${researchPaper.modules.map(module => `## ${module.name}\n${module.description}`).join('\n\n')}

# IV. Testing and Results / Experimental Analysis
## Process
${researchPaper.testing.process}

## Results
${researchPaper.testing.results}

# V. Future Scope
${researchPaper.futureScope}

# VI. Conclusion
${researchPaper.conclusion}

# VII. References
${researchPaper.references.map((ref, index) => `[${index + 1}] ${ref.text}${ref.url ? ` (${ref.url})` : ''}`).join('\n')}
`;

      // Create blob and download link
      const blob = new Blob([fullPaper], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_research_paper.md`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Complete",
        description: "Research paper has been downloaded as Markdown file."
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the research paper.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
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
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Research Paper</SheetTitle>
          <SheetDescription>
            {project && `Academic research paper for "${project.title}"`}
            {activeAI && <span className="text-xs ml-2 bg-muted px-2 py-1 rounded-full">{activeAI.toUpperCase()} AI</span>}
          </SheetDescription>
        </SheetHeader>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating comprehensive research paper...</p>
          </div>
        ) : researchPaper ? (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{researchPaper.title}</h1>
              <p className="text-muted-foreground mt-2">
                {researchPaper.authors.join(', ')}
                {researchPaper.institution && <span className="block mt-1">{researchPaper.institution}</span>}
                {researchPaper.email && <span className="block mt-1">{researchPaper.email}</span>}
              </p>
            </div>
            
            <Tabs defaultValue="abstract" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="mb-4 w-full grid grid-cols-4 md:grid-cols-8">
                <TabsTrigger value="abstract" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden md:inline">Abstract</span>
                </TabsTrigger>
                <TabsTrigger value="introduction" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden md:inline">Introduction</span>
                </TabsTrigger>
                <TabsTrigger value="methodology" className="flex items-center gap-2">
                  <Cog className="h-4 w-4" />
                  <span className="hidden md:inline">Methodology</span>
                </TabsTrigger>
                <TabsTrigger value="modules" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span className="hidden md:inline">Modules</span>
                </TabsTrigger>
                <TabsTrigger value="testing" className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  <span className="hidden md:inline">Testing</span>
                </TabsTrigger>
                <TabsTrigger value="future" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span className="hidden md:inline">Future</span>
                </TabsTrigger>
                <TabsTrigger value="conclusion" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden md:inline">Conclusion</span>
                </TabsTrigger>
                <TabsTrigger value="references" className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4" />
                  <span className="hidden md:inline">References</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="abstract" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Abstract</h2>
                    <p className="text-muted-foreground">{researchPaper.abstract}</p>
                    
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Keywords</h3>
                      <p className="text-sm text-muted-foreground italic">{researchPaper.keywords.join(', ')}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="introduction" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">I. Introduction</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{researchPaper.introduction}</p>
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">1.1 Project Aims and Objectives</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        {researchPaper.aims.map((aim, index) => (
                          <li key={index} className="text-muted-foreground">{aim}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="methodology" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">II. Methodology</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{researchPaper.methodology.overview}</p>
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">2.1 System Analysis / Research Design</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{researchPaper.methodology.systemAnalysis}</p>
                    </div>
                    
                    {researchPaper.methodology.requirements && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">2.1.1 Software and Hardware Requirements</h3>
                        <div className="mt-2">
                          <h4 className="font-medium text-sm">Software</h4>
                          <ul className="list-disc pl-6">
                            {researchPaper.methodology.requirements.software.map((item, index) => (
                              <li key={index} className="text-muted-foreground">{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-medium text-sm">Hardware</h4>
                          <ul className="list-disc pl-6">
                            {researchPaper.methodology.requirements.hardware.map((item, index) => (
                              <li key={index} className="text-muted-foreground">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">2.2 System Implementation</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{researchPaper.methodology.implementation}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="modules" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">III. Module Description / System Architecture</h2>
                    <div className="space-y-6">
                      {researchPaper.modules.map((module, index) => (
                        <div key={index}>
                          <h3 className="font-medium mb-2">{index + 1}. {module.name}</h3>
                          <p className="text-muted-foreground whitespace-pre-line">{module.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="testing" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">IV. Testing and Results / Experimental Analysis</h2>
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Testing Process</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{researchPaper.testing.process}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Results</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{researchPaper.testing.results}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="future" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">V. Future Scope</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{researchPaper.futureScope}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="conclusion" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">VI. Conclusion</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{researchPaper.conclusion}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="references" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">VII. References</h2>
                    <ScrollArea className="h-[300px]">
                      <ol className="list-decimal pl-6 space-y-2">
                        {researchPaper.references.map((reference, index) => (
                          <li key={index} className="text-muted-foreground">
                            {reference.text}
                            {reference.url && (
                              <a 
                                href={reference.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary hover:underline ml-1"
                              >
                                ({reference.url})
                              </a>
                            )}
                          </li>
                        ))}
                      </ol>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <SheetFooter className="flex justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button 
                onClick={downloadResearchPaper}
                disabled={isDownloading}
                className="flex items-center gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>Download Research Paper</span>
              </Button>
            </SheetFooter>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Research Paper Available</h3>
            <p className="text-muted-foreground mb-6">
              Generate a comprehensive research paper for this project.
            </p>
            <Button onClick={handleGeneratePaper}>
              Generate Research Paper
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ResearchPaperView;
