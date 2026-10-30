import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-purple-600" />
            </div>
            {/* Celebration particles */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -top-1 -right-3 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-100"></div>
            <div className="absolute -bottom-2 -left-3 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            <div className="absolute -bottom-1 -right-2 w-3 h-3 bg-green-400 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Password Update Successfully
          </h2>
          <p className="text-gray-600">
            Your password has been updated successfully
          </p>
        </div>

        {/* Back to Login Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-[#E65C00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
