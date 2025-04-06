
import React from 'react';

const steps = [
  {
    number: "01",
    title: "Tell us about yourself",
    description: "Share your skills, interests, and goals as a developer."
  },
  {
    number: "02",
    title: "Get AI recommendations",
    description: "Our advanced AI analyzes your profile and suggests tailored projects."
  },
  {
    number: "03",
    title: "Choose your project",
    description: "Browse through personalized suggestions with detailed information."
  },
  {
    number: "04",
    title: "Start building",
    description: "Get all the resources you need to begin your new project journey."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple Process</h2>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
            Four easy steps to find your next perfect coding project
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-950 rounded-lg border shadow-sm"
            >
              <div className="absolute -top-4 left-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-dev-primary to-dev-accent px-4 py-1 text-sm font-medium text-white">
                {step.number}
              </div>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground text-center">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
