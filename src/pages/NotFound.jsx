import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <p className="mt-2 text-gray-500">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FF6F00] hover:bg-[#FF6F00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
