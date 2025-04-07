
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Code, Book, User, Mail, Github } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">About DevGenie</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Your AI-powered companion for discovering perfect coding projects
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/advisor">
                  <Button className="gap-2">
                    <Code className="h-4 w-4" />
                    Start a Project
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg mb-6">
                DevGenie was created with a simple mission: to help developers overcome project decision paralysis 
                and find coding projects that are perfectly matched to their skills, interests, and goals.
              </p>
              <p className="text-lg mb-6">
                We believe that the right project can accelerate learning, build portfolios, and create 
                opportunities. By leveraging AI, we provide personalized project recommendations that 
                challenge you at the right level and align with your interests.
              </p>
              <p className="text-lg">
                Whether you're a beginner looking to practice fundamentals, a mid-level developer wanting 
                to expand your skills, or an expert seeking creative challenges, DevGenie helps you find 
                your next coding adventure.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">How DevGenie Works</h2>
              <div className="grid gap-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          Personalized Experience
                        </h3>
                        <p className="text-muted-foreground">
                          DevGenie considers your experience level, preferred technologies, and interests
                          to generate project ideas tailored specifically to you.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Code className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          AI-Generated Project Details
                        </h3>
                        <p className="text-muted-foreground">
                          Each project comes with a detailed description, feature list, technical requirements,
                          and even starter code to help you begin immediately.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Book className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          Learning Resources
                        </h3>
                        <p className="text-muted-foreground">
                          DevGenie doesn't just suggest projects—it provides learning resources, 
                          research papers, and guidance to help you overcome challenges as you build.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Technology</h2>
              <p className="text-lg mb-10">
                DevGenie leverages cutting-edge AI technology to provide intelligent project recommendations.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge className="py-1 px-3 text-base">React.js</Badge>
                <Badge className="py-1 px-3 text-base">TypeScript</Badge>
                <Badge className="py-1 px-3 text-base">Tailwind CSS</Badge>
                <Badge className="py-1 px-3 text-base">Supabase</Badge>
                <Badge className="py-1 px-3 text-base">OpenAI</Badge>
                <Badge className="py-1 px-3 text-base">Google Gemini</Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
              <p className="text-lg mb-8">
                Have questions, feedback, or want to contribute to DevGenie? We'd love to hear from you!
              </p>
              <div className="flex justify-center gap-4 mb-8">
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Contact</span>
                </Button>
                <Button variant="outline" className="gap-2">
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
