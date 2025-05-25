
import React from "react";
import DocumentManager from "../components/DocumentManager/DocumentManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto pt-4 px-4">
        <Link to="/">
          <Button variant="outline" className="mb-4 bg-transparent border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition-all duration-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <DocumentManager />
    </div>
  );
};

export default Index;
