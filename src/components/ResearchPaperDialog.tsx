
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AIConfigState } from '@/types';
import { generateResearchPaper } from '@/services/aiResearchService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  FileText, 
  BookOpen, 
  Link as LinkIcon, 
  BookMarked, 
  Download, 
  ListOrdered, 
  Beaker, 
  Layers, 
  TestTube, 
  Lightbulb, 
  BookText, 
  FileStack 
} from 'lucide-react';

interface ResearchPaperDialogProps {
  projectTitle?: string;
  projectDescription?: string;
  projectSkills?: string[];
  aiConfig: AIConfigState;
}

interface ResearchPaperData {
  title: string;
  abstract: string;
  keywords: string[];
  introduction: string;
  aims: string;
  methodology: string;
  requirements: string;
  implementation: string;
  modules: Record<string, string>;
  testing: string;
  futureScope: string;
  conclusion: string;
  references: string[];
}

const ResearchPaperDialog: React.FC<ResearchPaperDialogProps> = ({ 
  projectTitle = '',
  projectDescription = '',
  projectSkills = [],
  aiConfig
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(projectTitle);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTab, setCurrentTab] = useState('abstract');
  const [paperData, setPaperData] = useState<ResearchPaperData | null>(null);

  // Set the topic when the project title changes
  React.useEffect(() => {
    if (projectTitle) {
      setTopic(projectTitle);
    }
  }, [projectTitle]);

  const generatePaper = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a research topic.",
        variant: "destructive",
      });
      return;
    }

    const isConfigured = aiConfig.openai.enabled || aiConfig.gemini.enabled;
    if (!isConfigured) {
      toast({
        title: "API Configuration Required",
        description: "Please configure at least one AI API in the settings.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Pass additional context about the project to generate a more relevant paper
      const data = await generateResearchPaper(
        topic, 
        aiConfig, 
        {
          description: projectDescription,
          skills: projectSkills
        }
      );
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Transform basic paper data into the formal research structure
      const formalPaper: ResearchPaperData = {
        title: data.title,
        abstract: data.abstract,
        keywords: projectSkills.length > 0 ? projectSkills : topic.split(' '),
        introduction: data.content.split('\n\n')[0] || '',
        aims: data.content.includes('objectives') 
          ? data.content.split('objectives')[1].split('\n\n')[0] 
          : 'To explore and document innovations in ' + topic,
        methodology: data.content.includes('methodology') 
          ? data.content.split('methodology')[1].split('\n\n')[0] 
          : 'This research employs qualitative and quantitative analysis methods.',
        requirements: 'Software: ' + projectSkills.join(', ') + '\nHardware: Standard computing equipment',
        implementation: data.content.includes('implementation') 
          ? data.content.split('implementation')[1].split('\n\n')[0] 
          : 'The implementation follows industry best practices for ' + topic,
        modules: {
          'Core Module': 'Handles primary functionality and business logic.',
          'User Interface': 'Provides interactive components for user engagement.',
          'Data Module': 'Manages data processing and storage operations.'
        },
        testing: 'The system undergoes rigorous unit and integration testing to ensure reliability and performance.',
        futureScope: data.content.includes('future') 
          ? data.content.split('future')[1].split('\n\n')[0] 
          : 'Future work will expand on current capabilities and explore additional innovations.',
        conclusion: data.content.split('\n\n').slice(-2)[0] || 'This research demonstrates significant advancements in the field.',
        references: data.references
      };
      
      setPaperData(formalPaper);
      setCurrentTab('abstract');
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred while generating the research paper.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPaper = () => {
    if (!paperData) return;
    
    setIsDownloading(true);
    
    try {
      // Create full paper content in academic format
      const fullPaper = `
# ${paperData.title.toUpperCase()}

Author: Project Advisor AI
Institution: DevAcademy
Email: info@devacademy.org

## ABSTRACT

${paperData.abstract}

## KEYWORDS

${paperData.keywords.join(', ')}

## I. INTRODUCTION

${paperData.introduction}

### 1.1 Project Aims and Objectives

${paperData.aims}

## II. METHODOLOGY

${paperData.methodology}

### 2.1 System Analysis / Research Design

${paperData.methodology}

#### 2.1.1 Software and Hardware Requirements

${paperData.requirements}

### 2.2 System Implementation

${paperData.implementation}

## III. MODULE DESCRIPTION / SYSTEM ARCHITECTURE

${Object.entries(paperData.modules).map(([name, desc], i) => `
### 3.${i+1} ${name}

${desc}
`).join('\n')}

## IV. TESTING AND RESULTS / EXPERIMENTAL ANALYSIS

${paperData.testing}

## V. FUTURE SCOPE

${paperData.futureScope}

## VI. CONCLUSION

${paperData.conclusion}

## VII. REFERENCES

${paperData.references.map((ref, i) => `[${i+1}] ${ref}`).join('\n')}
`;

      // Create blob and download link
      const blob = new Blob([fullPaper], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paperData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_research_paper.md`;
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

  const renderSection = (title: string, content: string) => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-2">
          {content.split('\n').map((paragraph, i) => (
            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <BookMarked className="h-4 w-4" />
          <span>Research Papers</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Project Research Papers</DialogTitle>
          <DialogDescription>
            Generate formal academic research papers related to your project using AI.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter research topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1"
              disabled={isGenerating}
            />
            <Button 
              onClick={generatePaper} 
              disabled={isGenerating || !topic.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : "Generate"}
            </Button>
          </div>
          
          {paperData && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{paperData.title.toUpperCase()}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPaper}
                  disabled={isDownloading}
                  className="flex items-center gap-2"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>Download</span>
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Author: Project Advisor AI | Institution: DevAcademy
              </div>
              
              <Tabs defaultValue="abstract" value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid grid-cols-4 lg:grid-cols-8">
                  <TabsTrigger value="abstract" className="flex items-center gap-1 text-xs">
                    <BookOpen className="h-4 w-4" />
                    <span>Abstract</span>
                  </TabsTrigger>
                  <TabsTrigger value="keywords" className="flex items-center gap-1 text-xs">
                    <FileText className="h-4 w-4" />
                    <span>Keywords</span>
                  </TabsTrigger>
                  <TabsTrigger value="introduction" className="flex items-center gap-1 text-xs">
                    <ListOrdered className="h-4 w-4" />
                    <span>Intro</span>
                  </TabsTrigger>
                  <TabsTrigger value="methodology" className="flex items-center gap-1 text-xs">
                    <Beaker className="h-4 w-4" />
                    <span>Method</span>
                  </TabsTrigger>
                  <TabsTrigger value="modules" className="flex items-center gap-1 text-xs">
                    <Layers className="h-4 w-4" />
                    <span>Modules</span>
                  </TabsTrigger>
                  <TabsTrigger value="testing" className="flex items-center gap-1 text-xs">
                    <TestTube className="h-4 w-4" />
                    <span>Testing</span>
                  </TabsTrigger>
                  <TabsTrigger value="future" className="flex items-center gap-1 text-xs">
                    <Lightbulb className="h-4 w-4" />
                    <span>Future</span>
                  </TabsTrigger>
                  <TabsTrigger value="references" className="flex items-center gap-1 text-xs">
                    <BookText className="h-4 w-4" />
                    <span>Refs</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-4">
                  <TabsContent value="abstract" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">ABSTRACT</h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.abstract.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="keywords" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">KEYWORDS</h3>
                        <div className="flex flex-wrap gap-2">
                          {paperData.keywords.map((keyword, i) => (
                            <span key={i} className="bg-muted px-2 py-1 rounded-md text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="introduction" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">I. INTRODUCTION</h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.introduction.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                        
                        <h4 className="text-lg font-semibold mt-6">1.1 Project Aims and Objectives</h4>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.aims.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="methodology" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">II. METHODOLOGY</h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.methodology.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                        
                        <h4 className="text-lg font-semibold mt-6">2.1 System Analysis / Research Design</h4>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.methodology.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                        
                        <h4 className="text-lg font-semibold mt-6">2.1.1 Software and Hardware Requirements</h4>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.requirements.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                        
                        <h4 className="text-lg font-semibold mt-6">2.2 System Implementation</h4>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.implementation.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="modules" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">III. MODULE DESCRIPTION / SYSTEM ARCHITECTURE</h3>
                        {Object.entries(paperData.modules).map(([name, description], index) => (
                          <div key={name} className="mt-4">
                            <h4 className="text-lg font-semibold">3.{index + 1} {name}</h4>
                            <p className="mt-2">{description}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="testing" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">IV. TESTING AND RESULTS / EXPERIMENTAL ANALYSIS</h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.testing.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                        
                        <h4 className="text-lg font-semibold mt-4">Unit Testing</h4>
                        <p>Individual components are tested for correctness and functionality.</p>
                        
                        <h4 className="text-lg font-semibold mt-4">Integration Testing</h4>
                        <p>Modules are tested together to ensure proper interaction and data flow.</p>
                        
                        <h4 className="text-lg font-semibold mt-4">Test Results / Performance Metrics</h4>
                        <p>The system demonstrates robust performance under various test scenarios.</p>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="future" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">V. FUTURE SCOPE</h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.futureScope.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                        
                        <h3 className="text-xl font-semibold mt-6">VI. CONCLUSION</h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {paperData.conclusion.split('\n').map((paragraph, i) => (
                            paragraph.trim() ? <p key={i} className="mb-2">{paragraph}</p> : null
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="references" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">VII. REFERENCES</h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ol className="list-decimal pl-5 space-y-2">
                            {paperData.references.map((ref, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <LinkIcon className="h-4 w-4 mt-1 flex-shrink-0" />
                                <span>{ref}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchPaperDialog;
