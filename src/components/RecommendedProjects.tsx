
import React, { useState, useEffect } from 'react';
import { getRecommendedProjects, submitProjectFeedback } from '@/services/aiResearchService';
import { ProjectSuggestion, ProjectFeedback } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ThumbsUp, ThumbsDown, ExternalLink, Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  Cell
} from 'recharts';

interface RecommendedProjectsProps {
  skills: string[];
  onSelectProject?: (project: ProjectSuggestion) => void;
}

const RecommendedProjects: React.FC<RecommendedProjectsProps> = ({
  skills,
  onSelectProject
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ProjectSuggestion[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});
  const [showSkillGraph, setShowSkillGraph] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (skills.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getRecommendedProjects(skills);
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [skills]);

  const handleFeedback = async (projectId: string, isPositive: boolean) => {
    try {
      await submitProjectFeedback(projectId, {
        isPositive,
        timestamp: new Date().toISOString(),
        skills,
        projectId
      });
      
      setFeedbackSubmitted((prev) => ({
        ...prev,
        [projectId]: true
      }));
      
      toast({
        title: "Feedback received",
        description: "Thank you for your feedback! It helps us improve recommendations.",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateSkillGraphData = () => {
    if (recommendations.length === 0) return [];
    
    // Extract all unique skills
    const allSkills = new Set<string>();
    recommendations.forEach(project => {
      project.skills.forEach(skill => allSkills.add(skill));
    });
    skills.forEach(skill => allSkills.add(skill));
    
    const skillsArr = Array.from(allSkills);
    
    // Create graph data points for a scatter plot
    // Each skill will be positioned in a circle-like arrangement
    const graphData = skillsArr.map((skill, index) => {
      const angle = (index / skillsArr.length) * Math.PI * 2;
      const radius = 100;
      const x = Math.cos(angle) * radius + 100;
      const y = Math.sin(angle) * radius + 100;
      
      // Count projects that use this skill
      const projectCount = recommendations.filter(project => 
        project.skills.includes(skill)
      ).length;
      
      // Check if this is a user skill
      const isUserSkill = skills.includes(skill);
      
      return {
        name: skill,
        x: x,
        y: y,
        z: projectCount * 10 + 10, // Size based on project count
        isUserSkill,
        relations: recommendations
          .filter(project => project.skills.includes(skill))
          .map(project => project.title)
      };
    });
    
    return graphData;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No recommendations available. Try adding more skills to your profile.
        </p>
      </div>
    );
  }

  const skillGraphData = generateSkillGraphData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Recommended Projects</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setShowSkillGraph(!showSkillGraph)}
        >
          <Network className="h-4 w-4" />
          {showSkillGraph ? 'Hide Skill Graph' : 'Show Skill Graph'}
        </Button>
      </div>
      
      {showSkillGraph && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Skill Relationship Graph</CardTitle>
            <CardDescription>
              Visualizing the relationship between your skills and recommended projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart 
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <XAxis type="number" dataKey="x" name="X" hide />
                  <YAxis type="number" dataKey="y" name="Y" hide />
                  <ZAxis type="number" dataKey="z" range={[20, 60]} name="Count" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-md p-3 shadow-md">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {data.relations.length} related projects
                            </p>
                            {data.relations.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium">Related projects:</p>
                                <ul className="text-xs">
                                  {data.relations.slice(0, 3).map((proj: string, i: number) => (
                                    <li key={i} className="text-muted-foreground">{proj}</li>
                                  ))}
                                  {data.relations.length > 3 && <li className="text-muted-foreground">...</li>}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Skill Graph" data={skillGraphData}>
                    {skillGraphData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isUserSkill ? '#2563eb' : '#64748b'}
                      />
                    ))}
                  </Scatter>
                  <Legend 
                    content={() => (
                      <div className="flex items-center justify-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          <span>Your Skills</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                          <span>Related Skills</span>
                        </div>
                      </div>
                    )}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {recommendations.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
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
                <h4 className="text-sm font-medium mb-2">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-muted">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => onSelectProject && onSelectProject(project)}
              >
                <ThumbsUp className="h-4 w-4" />
                View Details
              </Button>
              
              <div className="flex gap-2">
                {feedbackSubmitted[project.id] ? (
                  <span className="text-sm text-muted-foreground">Thanks for your feedback!</span>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-green-500 hover:text-green-600 hover:bg-green-100"
                      onClick={() => handleFeedback(project.id, true)}
                      title="This recommendation is helpful"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="sr-only">Helpful</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-100"
                      onClick={() => handleFeedback(project.id, false)}
                      title="This recommendation is not helpful"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="sr-only">Not helpful</span>
                    </Button>
                  </>
                )}
                
                {project.sourceCode?.githubUrl && (
                  <a 
                    href={project.sourceCode.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProjects;
