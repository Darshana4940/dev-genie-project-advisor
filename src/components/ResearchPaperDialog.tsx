
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
import { Loader2, FileText, BookOpen, Link as LinkIcon, BookMarked } from 'lucide-react';

interface ResearchPaperDialogProps {
  projectTitle?: string;
  projectDescription?: string; // Added project description
  projectSkills?: string[]; // Added project skills
  aiConfig: AIConfigState;
}

const ResearchPaperDialog: React.FC<ResearchPaperDialogProps> = ({ 
  projectTitle = '',
  projectDescription = '', // Default to empty string
  projectSkills = [], // Default to empty array
  aiConfig
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(projectTitle);
  const [isGenerating, setIsGenerating] = useState(false);
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
      
      setPaperData(data);
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
              <h3 className="text-xl font-semibold">{paperData.title}</h3>
              
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
                      <div className="prose prose-sm max-w-none">
                        {paperData.abstract.split('\n').map((paragraph, i) => (
                          paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="content" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="prose prose-sm max-w-none">
                        {paperData.content.split('\n').map((paragraph, i) => (
                          paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="references" className="m-0">
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="prose prose-sm max-w-none">
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
