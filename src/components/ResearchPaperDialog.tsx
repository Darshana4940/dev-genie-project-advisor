
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AIConfigState, ResearchPaper } from '@/types';
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
import { Loader2, FileText, BookOpen, Link as LinkIcon, BookMarked, Download } from 'lucide-react';

interface ResearchPaperDialogProps {
  projectTitle?: string;
  projectDescription?: string;
  projectSkills?: string[];
  aiConfig: AIConfigState;
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
  const [paperData, setPaperData] = useState<{
    title: string;
    abstract: string;
    content: string;
    references: string[];
  } | null>(null);

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
      // Pass additional context as part of the topic parameter
      const contextualizedTopic = projectDescription 
        ? `${topic} - Context: ${projectDescription}. Skills: ${projectSkills.join(', ')}`
        : topic;
        
      const data = await generateResearchPaper(contextualizedTopic, aiConfig);
      
      // Transform ResearchPaper type to the format expected by paperData state
      const transformedData = {
        title: data.title,
        abstract: data.abstract,
        content: `${data.introduction}\n\n${data.methodology.overview}\n\n${data.methodology.implementation}\n\n${data.conclusion}`,
        references: data.references.map(ref => `${ref.text}${ref.url ? ` (${ref.url})` : ''}`)
      };
      
      setPaperData(transformedData);
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
      // Create full paper content
      const fullPaper = `# ${paperData.title}

## Abstract
${paperData.abstract}

## Content
${paperData.content}

## References
${paperData.references.map(ref => `- ${ref}`).join('\n')}
`;

      // Create blob and download link
      const blob = new Blob([fullPaper], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paperData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <BookMarked className="h-4 w-4" />
          <span>Research Papers</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Project Research Papers</DialogTitle>
          <DialogDescription>
            Generate research papers related to your project using AI.
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
                <h3 className="text-xl font-semibold">{paperData.title}</h3>
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
              
              <Tabs defaultValue="abstract" value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="abstract" className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Abstract
                  </TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="references">References</TabsTrigger>
                </TabsList>
                
                <div className="mt-4">
                  <TabsContent value="abstract" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {paperData.abstract.split('\n').map((paragraph, i) => (
                          paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="content" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {paperData.content.split('\n').map((paragraph, i) => (
                          paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="references" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ul className="space-y-2">
                          {paperData.references.map((ref, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <LinkIcon className="h-4 w-4 mt-1 flex-shrink-0" />
                              <span>{ref}</span>
                            </li>
                          ))}
                        </ul>
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
