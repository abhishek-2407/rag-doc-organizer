
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Welcome to <span className="text-pink-500">Document Evaluation Portal</span>
      </h1>
      
      {/* <p className="text-gray-400 max-w-md mb-10 text-lg">
        Organize, analyze and gain insights from your documents using our powerful RAG system
      </p> */}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/documents">
          <Button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-6 text-lg">
            <File className="mr-2 h-5 w-5" />
            Upload Documents
          </Button>
        </Link>
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
