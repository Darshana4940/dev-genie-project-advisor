
import React from 'react';
import { Code, Lightbulb, Rocket, Target } from 'lucide-react';

const features = [
  {
    icon: <Code className="h-10 w-10 text-dev-primary" />,
    title: "Tailored Project Suggestions",
    description: "Receive personalized project recommendations based on your skills, interests, and career goals."
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-dev-primary" />,
    title: "AI-Powered Insights",
    description: "Our advanced AI analyzes your profile to suggest projects that will help you grow and learn new skills."
  },
  {
    icon: <Target className="h-10 w-10 text-dev-primary" />,
    title: "Skill-Based Matching",
    description: "Projects are matched to your current skill level, challenging you without being overwhelming."
  },
  {
    icon: <Rocket className="h-10 w-10 text-dev-primary" />,
    title: "Learning Resources",
    description: "Each suggestion comes with tutorials, guides, and resources to help you succeed."
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How DevGenie Works</h2>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
            Our platform uses AI to match your developer profile with the perfect projects
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-950 rounded-lg border shadow-sm"
            >
              <div className="mb-4 rounded-full bg-dev-primary/10 p-4">
                {feature.icon}
              </div>
              <h3 className="mt-2 text-xl font-bold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
