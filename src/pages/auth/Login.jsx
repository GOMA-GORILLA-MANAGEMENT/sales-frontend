import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (!response.ok) {
        let message = "Login failed. Please try again.";
        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          /* no body */
        }
        toast.error(message);
        return;
      }

      const result = await response.json();
      const me = await login(result.access_token, result.refresh_token);
      toast.success(`Welcome back, ${me.firstName || me.fullName}!`);
      // Always start on the home screen for this role (dashboard, or Take order for a waiter).
      navigate("/app", { replace: true });
    } catch (error) {
      toast.error(error.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white xs:px-[0px] xs:bg-gray-50">
      {/* Left Side - Image */}
      <div className="lg:flex-col h-auto hidden [@media(min-width:1280px)]:block lg:h-screen w-full lg:w-auto">
        <div className="w-full lg:w-[800px] h-[300px] sm:h-[400px] lg:h-[750px] bg-[rgba(255,111,0,0.05)] rounded-none lg:rounded-[30px] m-0 lg:m-[30px] lg:mb-[20px] lg:my-[60px] flex items-center justify-center lg:justify-end xs:h-[200px]">
          <img
            src="/dashboard-image.png"
            alt="Factory Management System Dashboard"
            className="w-full h-full lg:w-[685px] lg:h-[600px] object-cover lg:rounded-l-[30px] border-r border-grey"
          />
        </div>
        <div className="hidden lg:block">
          <p className="text-xs text-center text-gray-400">
            Powered by{" "}
            <span className="font-medium text-gray-500">SALES Team</span>
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 lg:p-4 xs:items-start xs:pt-12">
        <div className="w-full">
          {/* Back Button */}
          <div className="mb-[60px]">
            <button
              onClick={() => navigate("/")}
              type="button"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>
          <div className="border-0 rounded-2xl p-4 pt-[0px]  xs:w-full xs:bg-white xs:shadow-md xs:border xs:border-gray-100">
            <div className="text-center flex flex-col justify-start mb-6 sm:mb-8 xs:mb-4">
              <div className="flex justify-center lg:justify-start items-start mb-6">
                {/* <img
                  src="/logo.png"
                  alt="GGM Logo"
                  className="h-[60px] w-auto"
                /> */}
              </div>
              <h2 className="text-2xl sm:text-[30px] lg:mb-[14px] font-bold text-gray-900 mb-1 sm:mb-[3px] inline-flex xs:text-xl">
                Welcome 👋
              </h2>
              <p className="text-[#A2A1A8] text-sm sm:text-[16px] inline-flex xs:text-sm xs:mt-1">
                Please login here
              </p>
            </div>

            <form
              className="space-y-6 xs:space-y-6 xs:mt-6xs:"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2 xs:space-y-3">
                <label
                  htmlFor="email"
                  className="text-[16px] xs:text-[14px] text-gray-700 "
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-4 py-3 xs:py-3 xs:text-[15px] border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent transition-all duration-200 ease-in-out xs:shadow-sm"
                  placeholder="Enter your email"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2 xs:space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[16px] xs:text-[14px] text-gray-700 "
                  >
                    Password
                  </label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-[#FF6F00] hover:underline xs:text-xs"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative xs:mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-4 py-3 xs:py-3 xs:text-[15px] border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent transition-all duration-200 ease-in-out xs:shadow-sm"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-20 xs:p-2 xs:mr-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPassword(!showPassword);
                    }}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-[56px] bg-gradient-to-r from-[#FF6F00] to-[#FF8C00] hover:from-[#E65C00] hover:to-[#E67300] text-white rounded-xl text-[16px] font-medium flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed xs:h-14 xs:text-base xs:shadow-md xs:active:scale-[0.98] xs:transition-transform xs:duration-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Footer links removed as requested */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
