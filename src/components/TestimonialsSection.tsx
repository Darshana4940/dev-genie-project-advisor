
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "DevGenie helped me find the perfect project that matched my skills in React and my interest in AI. I've learned so much in just a few weeks!",
    name: "Alex Johnson",
    title: "Frontend Developer",
    avatar: "/placeholder.svg"
  },
  {
    quote: "As a self-taught developer, I was struggling to find projects that would challenge me but not be overwhelming. DevGenie's suggestions were spot-on.",
    name: "Sarah Chen",
    title: "Full Stack Developer",
    avatar: "/placeholder.svg"
  },
  {
    quote: "The project advisor suggested a game development project that perfectly matched my skill level. It's exactly what I needed to expand my portfolio.",
    name: "Michael Rodriguez",
    title: "Game Developer",
    avatar: "/placeholder.svg"
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Developer Success Stories</h2>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
            Hear from developers who found their perfect projects with DevGenie
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white dark:bg-gray-950 border shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4 mt-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
