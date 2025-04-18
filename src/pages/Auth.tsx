
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SignupUserData } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  contact: z.string().min(5, { message: 'Contact information must be at least 5 characters' }),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select your experience level',
  }),
  interests: z.string().min(3, { message: 'Please enter at least one interest' }),
  learningGoals: z.string().optional(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  // Forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      contact: '',
      experienceLevel: 'beginner',
      interests: '',
      learningGoals: '',
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log('Login submission:', data.email);
      const { error } = await signIn(data.email, data.password);
      if (!error) {
        navigate('/');
      }
    } catch (error) {
      console.error('Login form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log('Signup submission:', data.email);
      
      // Convert interests string to array if provided
      const interests = data.interests ? data.interests.split(',').map(i => i.trim()) : [];
      
      const userData: SignupUserData = {
        fullName: data.fullName,
        contact: data.contact,
        experienceLevel: data.experienceLevel,
        interests: interests
      };
      
      const { error } = await signUp(data.email, data.password, userData);
      if (!error) {
        // In the AuthContext, we show a toast about checking email
        setActiveTab('login');
        signupForm.reset();
      }
    } catch (error) {
      console.error('Signup form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-foreground mb-2">
            <Code className="h-6 w-6 text-dev-primary" />
            <span>DevGenie</span>
          </Link>
          <p className="text-muted-foreground">Your AI-powered project advisor</p>
        </div>
        
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' 
                ? 'Sign in to your account to continue' 
                : 'Create an account to get started'}
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <CardContent className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="example@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-dev-primary to-dev-accent hover:from-dev-accent hover:to-dev-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Logging in...' : 'Login'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-4">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <CardContent className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="example@email.com" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Information *</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone or other contact info" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            required
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interests *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What are you interested in? (e.g. web development, machine learning, game development)" 
                              className="min-h-[80px]"
                              {...field} 
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="learningGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Learning Goals (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What do you want to achieve with your next project? What skills do you want to develop?"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-dev-primary to-dev-accent hover:from-dev-accent hover:to-dev-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Signing up...' : 'Sign Up'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {activeTab === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <Button 
              variant="link" 
              className="p-0 text-dev-primary"
              onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
            >
              {activeTab === 'login' ? 'Sign up' : 'Login'}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
