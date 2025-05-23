
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { File, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const Landing = () => {
  const { logout, userEmail, userRole } = useAuth();
  const navigate = useNavigate();

  const handleInviteClick = () => {
    if (userRole !== 'super_admin') {
      toast.error('Only super admins can invite users');
      return;
    }
    navigate('/invite');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4 text-center">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        {userEmail && <span className="text-white text-sm">Logged in as: {userEmail}</span>}
        {userRole === 'super_admin' && (
          <Button
            variant="outline"
            className="bg-white hover:bg-pink-600 hover:text-white"
            onClick={handleInviteClick}
          >
            Invite User
          </Button>
        )}
        <Button 
          variant="ghost" 
          className="text-white hover:text-pink-500"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-1" />
          Logout
        </Button>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Welcome to <span className="text-pink-500">Document Evaluation Portal</span>
      </h1>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {userRole === 'admin' || userRole === 'super_admin' ? (
          <Link to="/documents">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-6 text-lg">
              <File className="mr-2 h-5 w-5" />
              Upload Documents
            </Button>
          </Link>
        ) : null}
        <Link to="/insights">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-6 text-lg">
            Get Insights
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Landing;
