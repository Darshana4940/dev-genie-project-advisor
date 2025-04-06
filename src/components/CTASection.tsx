
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-dev-primary/10 to-dev-accent/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Find Your Next Project?</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Let our AI suggest the perfect coding project based on your skills, interests, and goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/advisor">
              <Button size="lg" className="bg-gradient-to-r from-dev-primary to-dev-accent hover:from-dev-accent hover:to-dev-primary text-white">
                Get Started Now
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              View Sample Projects
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
