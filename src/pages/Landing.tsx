
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
            className="bg-transparent border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white transition-all duration-300"
            onClick={handleInviteClick}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        )}
        <Button 
          variant="ghost" 
          className="text-white hover:text-purple-500 hover:bg-white/10 transition-all duration-300"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-1" />
          Logout
        </Button>
      </div>

      {/* <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg p-8 shadow-2xl max-w-2xl w-full"> */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Welcome to <span className="text-pink-600">Document Evaluation Portal</span>
        </h1>
        
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {userRole === 'admin' || userRole === 'super_admin' ? (
            <Link to="/documents">
              <Button className="bg-pink-600 hover:bg-pink-800 text-white font-semibold px-8 py-6 text-lg transform hover:scale-105 transition-all duration-300 shadow-lg">
                <File className="mr-2 h-5 w-5" />
                Upload Documents
              </Button>
            </Link>
          ) : null}
          <Link to="/insights">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-6 text-lg transform hover:scale-105 transition-all duration-300 shadow-lg">
              Get Insights
            </Button>
          </Link>
        </div>
      {/* </div> */}
    </div>
  );
};

export default Landing;
