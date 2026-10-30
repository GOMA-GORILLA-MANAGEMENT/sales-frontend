import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic email validation
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting password reset for email:", email);

      // Try primary endpoint first
      let response = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      console.log("Primary endpoint response status:", response.status);

      // Fallback to request-password-reset if needed
      if (!response.ok) {
        console.log("Primary endpoint failed, trying fallback...");
        console.log("Request payload:", JSON.stringify({ email }));

        response = await fetch(
          `${API_BASE_URL}/api/auth/request-password-reset`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        console.log("Fallback endpoint response status:", response.status);
        console.log(
          "Response headers:",
          Object.fromEntries(response.headers.entries())
        );
      }

      if (response.ok) {
        toast.success("If this email has an account, a reset link is on its way.");
        navigate("/auth/login");
      } else {
        let message = "Could not send the reset link. Please try again.";
        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          /* no readable body */
        }
        toast.error(message);
      }
    } catch (error) {
      console.error("Network error details:", error);
      toast.error(
        `Network error: ${error.message}. Please check your connection and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side with dashboard image */}
      <div className="lg:flex-col h-auto hidden [@media(min-width:1280px)]:block lg:h-screen w-full lg:w-auto">
        <div className="w-full aspect-[4/3] overflow-hidden shadow-soft lg:w-[770px] ring-1 h-[300px] sm:h-[400px] lg:h-[650px] ring-gray-200  bg-[rgba(255,111,0,0.05)] rounded-none lg:rounded-[30px] m-0 lg:m-[30px] lg:mb-[20px] lg:my-[60px] flex items-center justify-center lg:justify-end xs:h-[200px]">
          <img
            src="/dashboard-image.png"
            alt="Factory Management System Dashboard"
            // className="w-full h-full lg:w-[685px] lg:h-[600px] object-cover lg:rounded-l-[30px] border-r border-grey"
            className="h-full w-full lg:w-[685px] lg:h-[500px] object-cover lg:rounded-l-[30px] border-[1px]  hover:shadow-soft hover:scale-105  border-grey border-r-[0px] transition-transform duration-500"
          />
        </div>
        <div className="hidden lg:block">
          <p className="text-xs text-center text-gray-400">
            Powered by{" "}
            <span className="font-medium text-gray-500">SALES Team</span>
          </p>
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-[40%] xs:w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>
          <div className="border-0 rounded-2xl p-4 pt-[40px]  xs:w-full xs:bg-white xs:shadow-md xs:border xs:border-gray-100">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Forgot Password
              </h2>
              <p className="mt-2 text-[#A2A1A8]">
                Enter your registered email address; we'll send reset
                instructions.
              </p>
              {/* Temporary notice for email service issues */}
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Notice:</span> If you experience
                  issues receiving the reset email, please contact support
                  directly for assistance.
                </p>
              </div>
            </div>

            {/* Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[16px] text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent sm:text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full h-[56px] bg-[#FF6F00] hover:bg-[#E65C00] text-white font-medium rounded-[10px] text-[16px] transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Instructions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
