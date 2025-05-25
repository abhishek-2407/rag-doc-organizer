
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { ApiUrl } from '@/Constants';
import { toast } from '@/components/ui/sonner';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${ApiUrl}/auth/register`, {
        email: values.email,
        password: values.password
      });
      
      if (response.data && response.data.access_token) {
        login(
          response.data.access_token,
          values.email,
          response.data.role || null
        );
        
        toast.success('Registration successful! Welcome aboard!');
        navigate('/');
      } else {
        toast.error('Invalid registration response');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error messages from the API
      if (error.response && error.response.data && error.response.data.detail) {
        const errorDetail = error.response.data.detail;
        
        if (errorDetail === "Email is not invited to register") {
          toast.error('Your email is not invited to register. Please contact an administrator for an invitation.');
        } else if (errorDetail === "Email already registered") {
          toast.error('This email is already registered. Please try logging in instead.');
        } else {
          toast.error(`Registration failed: ${errorDetail}`);
        }
      } else {
        toast.error('Registration failed. Please check your information and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 px-4">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border-gray-700 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
          <CardDescription className="text-gray-300">Register to access the document evaluation portal</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-gray-700/50 transition-all duration-300">
                        <Mail className="ml-2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Enter your email" className="border-0 focus-visible:ring-0 bg-transparent text-white placeholder-gray-400" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-gray-700/50 transition-all duration-300">
                        <Lock className="ml-2 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="Create password" className="border-0 focus-visible:ring-0 bg-transparent text-white placeholder-gray-400" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 transform hover:scale-105" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Button variant="link" className="p-0 text-indigo-500 hover:text-indigo-400" onClick={() => navigate('/login')}>
              Login
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
