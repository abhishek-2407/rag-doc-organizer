
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { ApiUrl } from '@/Constants';
import { toast } from '@/components/ui/sonner';
import { Mail, User, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().refine(val => ['user', 'admin', 'super_admin'].includes(val), {
    message: 'Role must be one of: user, admin, super_admin',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Invite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  useEffect(() => {
    // Redirect if not super_admin
    if (userRole !== 'super_admin') {
      toast.error('Access denied. Super admin privileges required.');
      navigate('/');
    }
  }, [userRole, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'user',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${ApiUrl}/auth/invite`, {
        email: values.email,
        role: values.role
      });
      
      if (response.data && response.data.status === 'success') {
        toast.success(response.data.message || 'Invitation sent successfully!');
        form.reset();
      } else {
        toast.error('Failed to send invitation.');
      }
    } catch (error) {
      console.error('Invite error:', error);
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If not super_admin, show loading until redirect happens
  if (userRole !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-gray-900 px-4">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border-gray-700 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-pink-600/20 rounded-full">
              <UserPlus className="h-8 w-8 text-pink-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Invite User</CardTitle>
          <CardDescription className="text-gray-300">Send invitation to a new user</CardDescription>
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
                        <Mail className="ml-2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Enter user email" className="border-0 focus-visible:ring-0 bg-transparent text-white placeholder-gray-400" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:ring-pink-500 focus:border-pink-500">
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="user" className="text-white hover:bg-gray-700">User</SelectItem>
                        <SelectItem value="admin" className="text-white hover:bg-gray-700">Admin</SelectItem>
                        <SelectItem value="super_admin" className="text-white hover:bg-gray-700">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 transform hover:scale-105" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" className="text-pink-500 hover:text-pink-400" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Invite;
