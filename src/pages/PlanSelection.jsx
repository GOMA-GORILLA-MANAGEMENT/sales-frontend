import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, ChevronDown, Send } from "lucide-react";
import { Listbox } from "@headlessui/react";
import toast from "react-hot-toast";
import { API_BASE_URL, apiCall, HTTP_METHODS } from "../config/api";

const PlanSelection = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "SHOP_BUSINESS",
  });

  const navigate = useNavigate();

  const plans = [
    {
      id: "starter",
      name: "Starter",
      pricingType: "ZERO_FIVE",
      price: { monthly: 30000, yearly: 324000 },
      features: [
        "0-5 users",
        "Basic order management",
        "Email support",
        "Basic analytics",
        "1 warehouse location",
      ],
      popular: false,
    },
    {
      id: "growth",
      name: "Growth",
      pricingType: "THREE_FIVE",
      price: { monthly: 45000, yearly: 486000 },
      features: [
        "6-20 users",
        "Advanced workflows",
        "Priority support",
        "Advanced analytics",
        "Up to 5 warehouse locations",
        "API access",
      ],
      popular: true,
    },
    {
      id: "professional",
      name: "Professional",
      pricingType: "SIX_TWENTY",
      price: { monthly: 100000, yearly: 1080000 },
      features: [
        "20-50 users",
        "Advanced workflows",
        "Priority support",
        "Advanced analytics",
        "Up to 10 warehouse locations",
        "API access",
        "Custom integrations",
      ],
      popular: false,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      pricingType: "TWELVE_FIFTY",
      price: { monthly: null, yearly: null },
      features: [
        "Unlimited users",
        "Custom workflows",
        "24/7 dedicated support",
        "Custom reporting",
        "Unlimited locations",
        "API access",
        "Dedicated success manager",
      ],
      popular: false,
      contactUs: true,
    },
  ];

  const businessTypes = [
    { id: "TEXTILE", name: "Textile" },
    { id: "WHOLESALE_TRADING", name: "Wholesale Trading" },
    { id: "BEVERAGE", name: "Beverage" },
    { id: "AGRICULTURE", name: "Agriculture" },
    { id: "SHOP_BUSINESS", name: "Shop Business" },
  ];



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatRWF = (amount) => {
    if (amount === null) return "Let's Talk";
    if (amount === 0) return "Free";
    return new Intl.NumberFormat("RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setStep(2);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!businessInfo.name.trim()) newErrors.name = "Full name is required";
    if (!businessInfo.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(businessInfo.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!businessInfo.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9\-+()\s]+$/.test(businessInfo.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!businessInfo.businessName.trim())
      newErrors.businessName = "Business name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToReview = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      
      const requestBody = {
        businessName: businessInfo.businessName,
        fullName: businessInfo.name,
        email: businessInfo.email,
        phoneNumber: businessInfo.phone,
        businessType: businessInfo.businessType,
        pricingType: selectedPlanData.pricingType,
      };

      console.log("Submitting pricing request:", requestBody);

      const response = await apiCall({
        url: `${API_BASE_URL}/api/contact/pricing`,
        method: HTTP_METHODS.POST,
        body: JSON.stringify(requestBody),
      });

      console.log("Pricing request response:", response);

      // Show success toast
      toast.success("Plan request sent successfully! Our team will contact you soon.", {
        duration: 4000,
        position: "top-center",
      });

      setIsSubmitting(false);

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error submitting pricing request:", error);
      setIsSubmitting(false);
      
      toast.error(
        error.message || "Failed to send plan request. Please try again.",
        {
          duration: 4000,
          position: "top-center",
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w- mx-auto">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center space-x-[10px] text-[16px] text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-[24px] h-[24px] text-gray-700 border-[1px] border-gray-300 rounded-[8px] p-[5px]" />
            <span>Go back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Select the plan that's right for your business
          </p>

          {step === 1 && (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    billingCycle === "monthly"
                      ? "bg-white shadow-sm text-[#FF6F00]"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    billingCycle === "yearly"
                      ? "bg-white shadow-sm text-[#FF6F00]"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Yearly Billing (Save 20%)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step >= stepNumber
                        ? "bg-[#FF6F00] text-white"
                        : "bg-gray-200 text-gray-600"
                    } font-medium`}
                  >
                    {step > stepNumber ? <Check size={20} /> : stepNumber}
                  </div>
                  <span className="mt-2 text-sm font-medium text-gray-700">
                    {stepNumber === 1
                      ? "Select Plan"
                      : stepNumber === 2
                      ? "Business Info"
                      : "Review"}
                  </span>
                </div>
                {stepNumber < 3 && (
                  <div className="w-16 h-1 mx-2 bg-gray-200 rounded-full"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Plan Selection */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border ${
                  plan.popular
                    ? "border-[#FF6F00] ring-2 ring-[#FF6F00]"
                    : "border-gray-200"
                } bg-white p-6 shadow-sm`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6F00] text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatRWF(plan.price[billingCycle])}
                  </span>
                  {plan.price[billingCycle] !== null && (
                    <span className="text-sm text-gray-500">
                      {plan.price[billingCycle] === 0
                        ? ""
                        : `/${billingCycle === "monthly" ? "month" : "year"}`}
                    </span>
                  )}
                </div>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => plan.contactUs ? window.location.href = 'mailto:sales@imhh.rw?subject=Enterprise Plan Inquiry' : handlePlanSelect(plan.id)}
                  className={`mt-6 w-full py-2 px-4 rounded-md font-medium ${
                    plan.popular
                      ? "bg-[#FF6F00] text-white hover:bg-[#E65C00]"
                      : "text-[#FF6F00] border border-[#FF6F00] hover:bg-[#E65C00]/5"
                  } transition-colors`}
                >
                  {plan.contactUs ? "Contact Sales" : "Select Plan"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Business Information */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Business Information
            </h2>
            <form onSubmit={handleContinueToReview} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Business Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v2H7V5zm0 4h6v2H7V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="businessName"
                      id="businessName"
                      value={businessInfo.businessName}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.businessName
                          ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 shadow-sm focus:ring-[#FF6F00] focus:border-[#FF6F00]"
                      } rounded-md`}
                      placeholder="Acme Inc."
                    />
                  </div>
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={businessInfo.name}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.name
                          ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 shadow-sm focus:ring-[#FF6F00] focus:border-[#FF6F00]"
                      } rounded-md`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={businessInfo.email}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.email
                          ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 shadow-sm focus:ring-[#FF6F00] focus:border-[#FF6F00]"
                      } rounded-md`}
                      placeholder="you@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={businessInfo.phone}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.phone
                          ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 shadow-sm focus:ring-[#FF6F00] focus:border-[#FF6F00]"
                      } rounded-md`}
                      placeholder="+250 700 000 000"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="businessType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Business Type
                  </label>
                  <Listbox
                    value={businessInfo.businessType}
                    onChange={(value) =>
                      handleInputChange({ target: { name: "businessType", value } })
                    }
                  >
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-3 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-[#FF6F00] focus:border-[#FF6F00]">
                        <span className="block truncate text-gray-900">
                          {businessTypes.find((t) => t.id === businessInfo.businessType)?.name}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                        {businessTypes.map((type) => (
                          <Listbox.Option
                            key={type.id}
                            value={type.id}
                            className={({ active, selected }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-orange-100 text-orange-900"
                                  : "text-gray-900"
                              } ${selected ? "bg-orange-50" : ""}`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected
                                      ? "font-medium text-[#FF6F00]"
                                      : "font-normal"
                                  }`}
                                >
                                  {type.name}
                                </span>
                                {selected && (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#FF6F00]">
                                    <Check className="h-5 w-5" />
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6F00]"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Plans
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#FF6F00] hover:bg-[#E65C00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6F00]"
                >
                  Continue to Review
                  <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Review Your Selection
            </h2>
            
            {/* Selected Plan Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Plan</h3>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {plans.find(p => p.id === selectedPlan)?.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {billingCycle === "monthly" ? "Monthly" : "Yearly"} Billing
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#FF6F00]">
                      {formatRWF(plans.find(p => p.id === selectedPlan)?.price[billingCycle])}
                    </p>
                    <p className="text-sm text-gray-500">
                      {plans.find(p => p.id === selectedPlan)?.price[billingCycle] !== null && 
                        `/${billingCycle === "monthly" ? "month" : "year"}`}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Included Features:</p>
                  <ul className="space-y-2">
                    {plans.find(p => p.id === selectedPlan)?.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Business Information Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{businessInfo.businessName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                    <dd className="mt-1 text-sm text-gray-900">{businessInfo.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{businessInfo.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{businessInfo.phone}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Business Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {businessTypes.find(t => t.id === businessInfo.businessType)?.name}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6F00]"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Business Info
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#FF6F00] hover:bg-[#E65C00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6F00] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending Request..." : "Send Plan Request"}
                {!isSubmitting && <Send size={18} className="ml-2" />}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success/Confirmation (handled by navigation) */}
      </div>
    </div>
  );
};

export default PlanSelection;
