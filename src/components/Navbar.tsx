
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Code, Home, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-dev-primary" />
          <Link to="/" className="text-lg font-bold text-foreground">DevGenie</Link>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link to="/projects" className="text-muted-foreground hover:text-foreground">Projects</Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button>Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
