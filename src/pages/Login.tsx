
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
import { Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, userRole } = useAuth();
  
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
      const response = await axios.post(`${ApiUrl}/auth/login`, {
        email: values.email,
        password: values.password
      });
      
      if (response.data && response.data.access_token) {
        // Store the token in localStorage and context
        login(
          response.data.access_token,
          values.email,
          response.data.role || null
        );
        
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#2a003f] to-gray-900 px-4">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline"
          className="bg-transparent border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300"
          onClick={() => navigate('/register')}
        >
          Register
        </Button>
      </div>

      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border-gray-700 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">Document Evaluation Portal</CardTitle>
          <CardDescription className="text-gray-300">Enter your credentials to login</CardDescription>
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
                      <div className="flex items-center border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-pink-500 bg-gray-700/50 transition-all duration-300">
                        <User className="ml-2 h-4 w-4 text-gray-400" />
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
                      <div className="flex items-center border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-pink-500 bg-gray-700/50 transition-all duration-300">
                        <Lock className="ml-2 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="Enter your password" className="border-0 focus-visible:ring-0 bg-transparent text-white placeholder-gray-400" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 transform hover:scale-105" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Button variant="link" className="p-0 text-pink-500 hover:text-pink-400" onClick={() => navigate('/register')}>
              Register
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
