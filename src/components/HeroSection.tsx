
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <div className="bg-hero-pattern py-20 lg:py-32 overflow-hidden relative">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4 animate-fade-in">
            <div className="inline-block rounded-lg bg-dev-primary/10 px-3 py-1 text-sm text-dev-primary">
              AI-Powered Project Advisor
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              Find Your Next Perfect Coding Project
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              DevGenie analyzes your skills, interests, and goals to suggest tailored coding projects that will help you grow as a developer.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link to="/advisor">
                <Button size="lg" className="bg-gradient-to-r from-dev-primary to-dev-accent hover:from-dev-accent hover:to-dev-primary text-white">
                  Get Project Ideas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="mx-auto lg:mx-0 animate-fade-in relative">
            <div className="absolute inset-0 bg-gradient-radial from-dev-primary/20 to-transparent rounded-xl blur-2xl opacity-70 animate-pulse-slow"></div>
            <div className="relative bg-white dark:bg-gray-950 border rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b bg-muted/50">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="ml-2 text-sm font-medium">Project Recommendations</div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
                <div className="flex justify-end">
                  <div className="h-8 w-24 bg-dev-primary rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
};

export default HeroSection;
