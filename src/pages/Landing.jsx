import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpWideNarrow,
  Award,
  Check,
  Headset,
  LayoutDashboard,
  Menu,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { API_BASE_URL, apiCall, HTTP_METHODS } from "../config/api";
import toast from "react-hot-toast";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      when: "beforeChildren",
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Scroll Animation Component
const ScrollAnimation = ({
  children,
  className = "",
  variant = "fadeInUp",
  ...props
}) => {
  const controls = useAnimation();

  // Start animation immediately when component mounts
  React.useEffect(() => {
    controls.start("show");
  }, [controls]);

  const variants = {
    fadeInUp,
    scaleIn,
    item,
  };

  return (
    <motion.div
      initial="hidden"
      animate={controls}
      variants={variants[variant] || fadeInUp}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const formatRWF = (amount) => {
  try {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `RWF ${Number(amount).toLocaleString("en-US")}`;
  }
};

const smoothScrollToSection = (e, sectionId) => {
  e.preventDefault();
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

// Reusable Modal Component
const FeatureModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4 text-center">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-2">{children}</div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-[#FF6F00] px-4 py-2 text-sm font-medium text-white hover:bg-[#E65C00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6F00] focus-visible:ring-offset-2"
                onClick={onClose}
              >
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function Landing() {
  const [openModal, setOpenModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, submitted: false, error: null });

    try {
      // Validate form fields
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        throw new Error("Please fill in all fields");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Prepare request body matching API schema
      const requestBody = {
        fullName: formData.name,
        emailAddress: formData.email,
        subject: formData.subject,
        message: formData.message,
      };

      console.log("Submitting contact request:", requestBody);

      // Call the contact API
      const response = await apiCall({
        url: `${API_BASE_URL}/api/contact/request`,
        method: HTTP_METHODS.POST,
        body: JSON.stringify(requestBody),
      });

      console.log("Contact request response:", response);

      // Reset form and show success message
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setFormStatus({ submitting: false, submitted: true, error: null });

      // Show success toast
      toast.success("Message sent successfully! We'll get back to you soon.", {
        duration: 4000,
        position: "top-center",
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setFormStatus({ submitting: false, submitted: false, error: null });
      }, 5000);
    } catch (error) {
      console.error("Error submitting contact request:", error);

      const errorMessage = error.message || "Failed to send message. Please try again.";

      setFormStatus({
        submitting: false,
        submitted: false,
        error: errorMessage,
      });

      // Show error toast
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });

      // Hide error message after 5 seconds
      setTimeout(() => {
        setFormStatus({ submitting: false, submitted: false, error: null });
      }, 5000);
    }
  };

  const features = [
    {
      id: "order-flow",
      title: "Seamless Shopping Experience",
      desc: "From product discovery to secure checkout and order tracking.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="#FF6F00"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      details: (
        <div className="space-y-4">
          <p>
            Transform your online store with our powerful e-commerce platform:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Beautiful, responsive product showcases</li>
            <li>One-click checkout process</li>
            <li>Multiple payment gateway integrations</li>
            <li>Real-time order tracking</li>
            <li>Personalized product recommendations</li>
          </ul>
          <p className="text-sm text-gray-500">
            Deliver a seamless shopping experience that converts visitors into
            loyal customers.
          </p>
        </div>
      ),
    },
    {
      id: "product-management",
      title: "Product Management",
      desc: "Easily manage your entire product catalog in one place.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M12 12a5 5 0 100-10 5 5 0 000 10zM3 22a9 9 0 1118 0"
            stroke="#FF6F00"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      details: (
        <div className="space-y-4">
          <p>Powerful tools to manage your product catalog:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Bulk product uploads and updates</li>
            <li>Product variants and options</li>
            <li>Inventory management across multiple locations</li>
            <li>Digital product delivery</li>
            <li>SEO optimization tools</li>
          </ul>
          <p className="text-sm text-gray-500">
            Spend less time managing products and more time growing your
            business.
          </p>
        </div>
      ),
    },
    {
      id: "marketing-tools",
      title: "Marketing & Analytics",
      desc: "Grow your business with powerful marketing tools and insights.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4"
            stroke="#FF6F00"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      details: (
        <div className="space-y-4">
          <p>Powerful marketing tools to grow your online business:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Email marketing automation</li>
            <li>Discount and promotion engine</li>
            <li>Customer segmentation</li>
            <li>Sales performance analytics</li>
            <li>Conversion rate optimization</li>
          </ul>
          <p className="text-sm text-gray-500">
            Make data-driven decisions to increase sales and customer retention.
          </p>
        </div>
      ),
    },
  ];

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpenModal(null);
        setContactModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full sticky top-0 bg-white/80 backdrop-blur-md z-50 border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="SALES"
                  className="h-[50px] xs:h-[30px] w-auto rounded-[5px]"
                />
                <span className="font-semibold text-[#808080] xs:text-[14px] text-[20px] tracking-wider font-zed md:text-[23px]">
                  SALES
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden [@media(min-width:1280px)]:flex items-center space-x-8">
              {[
                "features",
                "how",
                // "pricing",
                // "partners",
                "faq",
                // "about",
                "contact",
              ].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => {
                    smoothScrollToSection(e, item);
                    closeMobileMenu();
                  }}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              ))}
            </nav>

            <div className="hidden [@media(min-width:1280px)]:flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center rounded-md bg-[#FF6F00] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="[@media(min-width:1280px)]:hidden flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="[@media(min-width:1280px)]:hidden bg-white border-t border-gray-200 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {[
                  "features",
                  "how",
                  // "pricing",
                  // "partners",
                  "faq",
                  // "about",
                  "contact",
                ].map((item) => (
                  <a
                    key={`mobile-${item}`}
                    href={`#${item}`}
                    onClick={(e) => {
                      smoothScrollToSection(e, item);
                      closeMobileMenu();
                    }}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </a>
                ))}
                <div className="pt-4 border-t border-gray-200 mt-2">
                  <Link
                    to="/auth/login"
                    className="block w-full text-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md mb-2"
                    onClick={closeMobileMenu}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth/login"
                    className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-[#FF6F00] hover:opacity-90 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={container}
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 md:pt-[130px] pb-16 md:pb-20"
          >
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <motion.div variants={item} className="w-full md:w-1/2">
                <motion.h1
                  variants={item}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-gray-900 tracking-tight"
                >
                  Empowering Rwandan businesses with a seamless Sales Manager{" "}
                </motion.h1>
                <motion.p
                  variants={item}
                  className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-600"
                >
                  Sell products, manage inventory, track orders, and engage
                  customers effortlessly all in one powerful Sales Manager.
                </motion.p>
                <motion.div
                  variants={item}
                  className="mt-6 flex flex-col sm:flex-row gap-3"
                >
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center justify-center gap-3 rounded-[15px] bg-[#FF6F00] px-6 py-4 text-sm sm:text-base font-semibold text-white shadow-soft hover:opacity-90 hover:scale-105 transition-all duration-300"
                  >
                    Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </motion.div>
              </motion.div>
              <ScrollAnimation
                variant="scaleIn"
                className="w-full md:w-1/2 mt-10 md:mt-0"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl shadow-soft ring-1 shadow-[rgba(113,82,243,0.05)] ring-gray-200 bg-white">
                  <img
                    src="/dashboard-image.png"
                    alt="Dashboard preview"
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </ScrollAnimation>
            </div>
          </motion.div>
        </section>

        <motion.section
          id="features"
          className="border-y border-gray-100 bg-white/50 py-12 md:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 px-4">
              <motion.span
                className="inline-flex items-center gap-[5px] px-4 py-2 text-sm font-medium text-[#FF6F00] bg-[#FF6F00]/10 rounded-full mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <svg
                  className="w-6 h-6 text-[#FF6F00]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                E-Commerce Features
              </motion.span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:mb-[30px] font-semibold text-gray-900 tracking-tight">
                Everything you need to run your online store
              </h2>
              <p className="text-lg text-gray-600">
                Grow your business with our comprehensive e-commerce platform
                built for success
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Feature 1 */}
              <motion.div
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-[#FF6F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Beautiful Storefront
                </h3>
                <p className="text-gray-600 mb-4">
                  Create a stunning online store with our customizable themes
                  that work perfectly on all devices.
                </p>
                <button
                  onClick={() => setOpenModal("inventory-management")}
                  className="inline-flex items-center text-[#FF6F00] font-medium group"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-[#FF6F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Secure Checkout
                </h3>
                <p className="text-gray-600 mb-4">
                  Offer multiple payment options with our secure, PCI-compliant
                  checkout process that customers trust.
                </p>
                <button
                  onClick={() => setOpenModal("production-planning")}
                  className="inline-flex items-center text-[#FF6F00] font-medium group"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-lg flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-6 h-6 text-[#FF6F00]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Product Management
                </h3>
                <p className="text-gray-600 mb-4">
                  Easily add, edit, and organize your products with bulk editing
                  and inventory management tools.
                </p>
                <button
                  onClick={() => setOpenModal("analytics")}
                  className="inline-flex items-center text-[#FF6F00] font-medium group"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-[#FF6F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Mobile Optimized
                </h3>
                <p className="text-gray-600 mb-4">
                  Your store looks and works great on any device, with a
                  mobile-first design that drives conversions.
                </p>
                <button
                  onClick={() => setOpenModal("monitoring")}
                  className="inline-flex items-center text-[#FF6F00] font-medium group"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>

              {/* Feature 5 */}
              <motion.div
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-[#FF6F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Marketing Tools
                </h3>
                <p className="text-gray-600 mb-4">
                  Built-in SEO, email marketing, and discount tools to help you
                  attract and retain customers.
                </p>
                <button
                  onClick={() => setOpenModal("quality")}
                  className="inline-flex items-center text-[#FF6F00] font-medium group"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>

              {/* Feature 6 */}
              <motion.div
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-[#FF6F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  24/7 Support
                </h3>
                <p className="text-gray-600 mb-4">
                  Our team is always here to help with any questions or issues
                  you might have, day or night.
                </p>
                <button
                  onClick={() => setOpenModal("security")}
                  className="inline-flex items-center text-[#FF6F00] font-medium group"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Timeline Section */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-12 md:mb-16 px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.span
                className="inline-flex items-center gap-[5px] px-4 py-2 text-sm font-medium text-[#FF6F00] bg-[#FF6F00]/10 rounded-full mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {/* <svg className="w-6 h-6 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg> */}
                <ArrowUpWideNarrow />
                Customer Journey
              </motion.span>
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl lg:mb-[30px] font-semibold text-gray-900 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                The Shopping Experience
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Discover how easy it is to shop with our seamless e-commerce
                platform
              </motion.p>
            </motion.div>

            <div className="relative px-4 sm:px-0">
              {/* Animated Timeline line */}
              <motion.div
                className="hidden md:block absolute left-1/2 w-1 h-full bg-[#FF6F00]/20 -translate-x-1/2"
                initial={{ scaleY: 0, originY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="absolute top-0 left-0 w-full h-full bg-[#FF6F00] origin-top"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    delay: 0.5,
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </motion.div>
              {/* Timeline items */}
              <div className="space-y-16">
                {[
                  {
                    title: "Browse Products",
                    date: "Step 1",
                    description:
                      "Explore our wide range of products with high-quality images, detailed descriptions, and customer reviews to help you make the perfect choice.",
                    delay: 0.2,
                  },
                  {
                    title: "Add to Cart",
                    date: "Step 2",
                    description:
                      "Easily add items to your cart, adjust quantities, and save items for later with our intuitive shopping cart system.",
                    delay: 0.3,
                  },
                  {
                    title: "Secure Checkout",
                    date: "Step 3",
                    description:
                      "Complete your purchase quickly and securely with multiple payment options and a streamlined checkout process.",
                    delay: 0.4,
                  },
                  {
                    title: "Fast Delivery",
                    date: "Step 4",
                    description:
                      "Get your order delivered quickly with real-time tracking and multiple shipping options to suit your needs.",
                    delay: 0.5,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="relative md:grid md:grid-cols-2 md:gap-8"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      delay: item.delay,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div
                      className={`${
                        index % 2 === 0
                          ? "md:text-right md:pr-10"
                          : "md:col-start-2 md:pl-10"
                      }`}
                    >
                      <motion.h3
                        className="text-xl font-semibold text-gray-900"
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: item.delay + 0.1, duration: 0.4 }}
                      >
                        {item.title}
                      </motion.h3>
                      <motion.p
                        className="mt-1 text-gray-600"
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: item.delay + 0.15, duration: 0.4 }}
                      >
                        {item.date}
                      </motion.p>
                    </div>
                    <motion.div
                      className={`relative ${
                        index % 2 === 0 ? "md:pl-10" : "md:pr-10"
                      } mt-4 md:mt-0 ${
                        index % 2 === 0 ? "" : "md:col-start-1 md:row-start-1"
                      }`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{
                        delay: item.delay + 0.2,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100,
                      }}
                    >
                      <motion.div
                        className={`absolute top-0 ${
                          index % 2 === 0
                            ? "left-0 -translate-x-1/2"
                            : "right-0 translate-x-1/2 md:right-auto md:left-0 md:translate-x-0"
                        } w-6 h-6 rounded-full bg-[#FF6F00] border-4 border-white`}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: item.delay + 0.3,
                          type: "spring",
                          stiffness: 200,
                          damping: 10,
                        }}
                      />
                      <motion.div
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: item.delay + 0.4,
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <p>{item.description}</p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ScrollAnimation
          id="how"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20"
        >
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              variants={item}
              className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight"
            >
              Everything you need for a great shopping experience
            </motion.h2>
            <motion.p
              variants={item}
              className="mt-3 text-sm sm:text-base text-gray-600"
            >
              Discover a seamless shopping journey with features designed to
              make your experience enjoyable and convenient.
            </motion.p>
          </div>
          <motion.div
            variants={container}
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              {
                id: "products",
                title: "Wide Product Selection",
                desc: "Browse thousands of high-quality products across multiple categories.",
                icon: <ShoppingBag className="h-5 w-5 text-[#FF6F00]" />,
              },
              {
                id: "secure",
                title: "Secure Checkout",
                desc: "Safe and secure payment processing with multiple payment options.",
                icon: <ShieldCheck className="h-5 w-5 text-[#FF6F00]" />,
              },
              {
                id: "shipping",
                title: "Fast Shipping",
                desc: "Quick delivery with real-time order tracking.",
                icon: <Truck className="h-5 w-5 text-[#FF6F00]" />,
              },
              // {
              //   id: "support",
              //   title: "24/7 Support",
              //   desc: "Our customer service team is always here to help you.",
              //   icon: <Headset className="h-5 w-5 text-[#FF6F00]" />,
              // },
              // {
              //   id: "returns",
              //   title: "Easy Returns",
              //   desc: "Hassle-free returns and exchanges within 30 days.",
              //   icon: <RefreshCw className="h-5 w-5 text-[#FF6F00]" />,
              // },
              // {
              //   id: "rewards",
              //   title: "Loyalty Rewards",
              //   desc: "Earn points on every purchase and redeem for discounts.",
              //   icon: <Award className="h-5 w-5 text-[#FF6F00]" />,
              // },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={item}
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setOpenModal(feature.id)}
              >
                <div className="h-10 w-10 rounded-lg bg-[#FF6F00]/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
                <button
                  className="mt-4 text-sm font-medium text-[#FF6F00] hover:text-[#E65C00] flex items-center group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenModal(feature.id);
                  }}
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </ScrollAnimation>

        {/* Feature Modals */}
        <FeatureModal
          isOpen={openModal === "products"}
          onClose={() => setOpenModal(null)}
          title="Wide Product Selection"
        >
          <div className="space-y-4">
            <p>
              Explore our extensive collection of high-quality products across
              various categories:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Latest fashion trends for men, women, and kids</li>
              <li>Electronics and gadgets from top brands</li>
              <li>Home and living essentials</li>
              <li>Beauty and personal care products</li>
              <li>And much more!</li>
            </ul>
            <p>
              New arrivals added weekly to keep your wardrobe and home fresh and
              stylish.
            </p>
          </div>
        </FeatureModal>

        <FeatureModal
          isOpen={openModal === "secure"}
          onClose={() => setOpenModal(null)}
          title="Secure Shopping Experience"
        >
          <div className="space-y-4">
            <p>Your security is our top priority. We offer:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>256-bit SSL encryption for all transactions</li>
              <li>Multiple secure payment options</li>
              <li>PCI DSS compliant checkout</li>
              <li>Fraud protection and secure authentication</li>
            </ul>
            <p>
              Shop with confidence knowing your information is always protected.
            </p>
          </div>
        </FeatureModal>

        <FeatureModal
          isOpen={openModal === "shipping"}
          onClose={() => setOpenModal(null)}
          title="Fast & Reliable Shipping"
        >
          <div className="space-y-4">
            <p>
              Keep your finger on the pulse of your operations with our
              real-time monitoring system:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Live updates from the factory floor</li>
              <li>Instant alerts for critical issues</li>
              <li>Equipment status and performance tracking</li>
              <li>Production line visualization</li>
              <li>Mobile-friendly interface for on-the-go monitoring</li>
            </ul>
            <p>
              Respond to issues immediately and keep your operations running
              smoothly.
            </p>
          </div>
        </FeatureModal>

        <FeatureModal
          isOpen={openModal === "quality"}
          onClose={() => setOpenModal(null)}
          title="Quality Control Management"
        >
          <div className="space-y-4">
            <p>
              Maintain the highest quality standards with our comprehensive
              quality control system:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Customizable quality checkpoints</li>
              <li>Automated quality alerts and notifications</li>
              <li>Detailed quality reports and analytics</li>
              <li>Non-conformance tracking and resolution</li>
              <li>Supplier quality management</li>
            </ul>
            <p>
              Ensure consistent product quality and reduce defects with our
              powerful quality management tools.
            </p>
          </div>
        </FeatureModal>

        <FeatureModal
          isOpen={openModal === "security"}
          onClose={() => setOpenModal(null)}
          title="Enterprise Security & Compliance"
        >
          <div className="space-y-4">
            <p>
              Protect your sensitive manufacturing data with our
              enterprise-grade security features:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>End-to-end data encryption</li>
              <li>Role-based access control</li>
              <li>Regular security audits and updates</li>
              <li>Compliance with industry standards</li>
              <li>Automated backup and disaster recovery</li>
            </ul>
            <p>
              Rest easy knowing your data is secure and your operations are
              compliant with the latest regulations.
            </p>
          </div>
        </FeatureModal>

        <FeatureModal
          isOpen={openModal === "inventory-management"}
          onClose={() => setOpenModal(null)}
          title="Inventory Management"
        >
          <div className="space-y-4">
            <p>
              Take full control of your inventory with our comprehensive
              management system:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Real-time tracking of raw materials and finished goods</li>
              <li>Automated stock level monitoring and alerts</li>
              <li>Barcode and QR code scanning support</li>
              <li>Batch and expiry date tracking</li>
              <li>Multi-location inventory management</li>
              <li>Inventory forecasting and demand planning</li>
              <li>Vendor and supplier management</li>
            </ul>
            <p className="text-sm text-gray-600">
              Our inventory management system helps you reduce waste, prevent
              stockouts, and optimize your supply chain operations.
            </p>
          </div>
        </FeatureModal>

        <FeatureModal
          isOpen={openModal === "production-planning"}
          onClose={() => setOpenModal(null)}
          title="Production Planning"
        >
          <div className="space-y-4">
            <p>
              Streamline your manufacturing process with our advanced production
              planning tools:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Interactive Gantt charts for visual scheduling</li>
              <li>Resource allocation and capacity planning</li>
              <li>Bill of Materials (BOM) management</li>
              <li>Work order creation and tracking</li>
              <li>Production line balancing</li>
              <li>Material requirements planning (MRP)</li>
              <li>Real-time progress tracking</li>
            </ul>
            <p className="text-sm text-gray-600">
              Optimize your production workflow, reduce lead times, and increase
              overall equipment effectiveness (OEE) with our powerful planning
              tools.
            </p>
          </div>
        </FeatureModal>

        {features.map((feature) => (
          <FeatureModal
            key={feature.id}
            isOpen={openModal === feature.id}
            onClose={() => setOpenModal(null)}
            title={feature.title}
          >
            {feature.details}
          </FeatureModal>
        ))}

        {/* <section id="partners" className="py-12 md:py-20 bg-gray-50 ">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl lg:mb-[30px] font-semibold text-gray-900 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Our Valued Partner
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Proudly partnering with Goma Gorilla Textiles to revolutionize
                textile manufacturing in Rwanda
              </motion.p>
            </div>

            <motion.div
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/3 bg-[#FF6F00] p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-4 overflow-hidden">
                      <img
                        src="gorilla.png"
                        alt="Goma Gorilla Textiles"
                        className="h-20 w-auto object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Goma Gorilla Textiles
                    </h3>
                    <p className="text-white/80 mt-1">Textile Manufacturing</p>
                  </div>
                </div>
                <div className="p-8 md:w-2/3">
                  <div className="prose max-w-none text-gray-600">
                    <p className="text-lg">
                      Goma Gorilla Textiles is a leading textile manufacturer
                      based in Rwanda, committed to producing high-quality
                      fabrics while promoting sustainable and ethical
                      manufacturing practices.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-[#FF6F00] mr-2">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span>Premium quality fabrics</span>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-[#FF6F00] mr-2">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span>Eco-friendly production</span>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-[#FF6F00] mr-2">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span>Local Rwandan workforce</span>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-[#FF6F00] mr-2">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span>Innovative designs</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white">
                      <p className="text-sm text-gray-500">
                        "Partnering with Goma Gorilla Textiles has allowed us to
                        bring high-quality, locally manufactured textiles to
                        market while supporting sustainable practices and local
                        employment in Rwanda."
                      </p>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        SALES Management Team
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-gray-600 mb-6">
                Interested in becoming a partner?
              </p>
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 border h-[56px] border-transparent text-base font-medium rounded-md bg-[#FF6F00] text-white shadow-sm hover:bg-[#E65C00] border border-[#FF6F00]/20"
                onClick={(e) => smoothScrollToSection(e, "contact")}
              >
                Partner with us
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </motion.div>
          </div>
        </section> */}

        {/* <ScrollAnimation id="pricing" className="bg-white py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <motion.h2
                variants={item}
                className="text-2xl sm:text-3xl font-semibold text-gray-900"
              >
                Simple pricing
              </motion.h2>
              <motion.p
                variants={item}
                className="mt-2 text-sm sm:text-base text-gray-600"
              >
                Transparent plans for factories and manufacturers in Rwanda.
              </motion.p>
            </div>
            <motion.div
              variants={container}
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {[
                {
                  name: "Starter",
                  price: 30000,
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
                  name: "Growth",
                  price: 45000,
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
                  name: "Professional",
                  price: 100000,
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
                  name: "Enterprise",
                  price: null,
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
              ].map((p, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  className={`rounded-xl border ${
                    p.popular ? "border-[#FF6F00] shadow-soft" : "border-gray-200"
                  } bg-white p-6`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    {p.popular && (
                      <span className="text-xs px-2 py-1 rounded-full bg-[#FF6F00]/10 text-[#FF6F00]">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-3xl font-semibold text-gray-900">
                      {p.price === null ? "Let's Talk" : formatRWF(p.price)}
                    </span>
                    {p.price !== null && (
                      <span className="text-xs text-gray-500">/ month</span>
                    )}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/plans"
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium ${
                      p.popular
                        ? "bg-[#FF6F00] text-white hover:bg-[#E65C00]"
                        : "text-[#FF6F00] ring-1 ring-[#E65C00]/30 hover:bg-[#E65C00]/5"
                    } transition-colors`}
                  >
                    {p.contactUs ? "Contact Sales" : "Choose plan"}
                    {p.popular && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </ScrollAnimation> */}

        <ScrollAnimation  className="bg-gray-50 py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <motion.h2
                variants={item}
                className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight"
              >
                Trusted by operators
              </motion.h2>
              <motion.p
                variants={item}
                className="mt-3 text-sm sm:text-base text-gray-600"
              >
                Teams streamline day-to-day work and get better visibility
                across the supply chain.
              </motion.p>
            </div>
            <motion.div
              variants={container}
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {[
                {
                  quote:
                    "SALES helped us centralize orders and eliminate spreadsheet chaos.",
                  author: "Aline M.",
                  role: "Operations Lead",
                },
                {
                  quote:
                    "Inventory accuracy improved and fulfillment is faster than ever.",
                  author: "Eric N.",
                  role: "Warehouse Manager",
                },
                {
                  quote:
                    "The role-based dashboards keep everyone focused on what matters.",
                  author: "Diane K.",
                  role: "Accountant",
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm text-gray-700">“{t.quote}”</p>
                  <div className="mt-4 text-xs text-gray-500">
                    {t.author} • {t.role}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </ScrollAnimation>

        <section id="contact" className="bg-white py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl lg:mb-[30px] font-semibold text-gray-900 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Get in Touch
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Have questions or want to learn more about our solutions? We'd
                love to hear from you.
              </motion.p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Contact Form */}
              <motion.div
                className="bg-gray-50 p-6 rounded-2xl shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Send us a message
                </h3>

                {/* Success Message */}
                {formStatus.submitted && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">
                      ✓ Message sent successfully! We'll get back to you soon.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {formStatus.error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-medium">
                      ✗ {formStatus.error}
                    </p>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full h-[56px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                      placeholder="Your message here..."
                      required
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={formStatus.submitting}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#FF6F00] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6F00] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      {formStatus.submitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* <div className="bg-gradient-to-br from-[#FF6F00] to-[#A66DFF] p-8 rounded-2xl text-white"> */}
                <div className="bg-[#FF6F00] p-8 rounded-2xl text-white">
                  <h3 className="text-xl font-semibold mb-4">
                    Contact Information
                  </h3>
                  <p className="mb-6">
                    Fill out the form or reach out to us through other channels
                    listed below.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-white/80 mr-3 mt-0.5">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span>info@sales.rw</span>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-white/80 mr-3 mt-0.5">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <span>+250 788 843 646</span>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-white/80 mr-3 mt-0.5">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <span>Kigali, Rwanda</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white">
                    <div className="flex flex-wrap gap-4 text-sm text-white/60">
                      <Link
                        to="/privacy-policy"
                        className="hover:text-white transition-colors"
                      >
                        Privacy Policy
                      </Link>
                      <span className="text-white/40">•</span>
                      <Link
                        to="/terms-of-service"
                        className="hover:text-white transition-colors"
                      >
                        Terms of Service
                      </Link>
                      <span className="text-white/40">•</span>
                      <Link
                        to="/cookie-policy"
                        className="hover:text-white transition-colors"
                      >
                        Cookie Policy
                      </Link>
                    </div>
                    <p className="mt-4 text-xs text-white/40">
                      &copy; {new Date().getFullYear()} SALES. All rights
                      reserved.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white"
          id="faq"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
                Frequently asked questions
              </h2>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {[
                {
                  q: "Can I change plans later?",
                  a: "Yes, you can upgrade or downgrade at any time.",
                },
                {
                  q: "Do you offer support?",
                  a: "We provide email support on Starter and priority support on Growth and Enterprise.",
                },
                {
                  q: "Is my data secure?",
                  a: "We use industry-standard encryption and role-based access controls.",
                },
                {
                  q: "Do you support RWF billing?",
                  a: "Yes, pricing is shown in RWF with local-friendly billing.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white p-6"
                >
                  <h3 className="text-[16px] font-semibold text-gray-900">
                    {f.q}
                  </h3>
                  <p className="mt-2 text-[16px] text-gray-600">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 border-t border-gray-200"
        >
          <div className="max-w-7xl mx-auto py-12 pb-4 lg:pb-4 px-4 sm:px-6 lg:py-16 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="SALES" className="h-10 w-10" />
                  <span className="text-[17px] font-semibold font-zed tracking-wider text-[#808080]">
                    SALES
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Empowering Rwandan businesses with a seamless Sales Manager
                  .
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF6F00] transition-colors"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF6F00] transition-colors"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF6F00] transition-colors"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                  Product
                </h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <a
                      href="#features"
                      onClick={(e) => smoothScrollToSection(e, "features")}
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  {/* <li>
                    <a
                      href="#pricing"
                      onClick={(e) => smoothScrollToSection(e, "pricing")}
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Pricing
                    </a>
                  </li> */}
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Updates
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Roadmap
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <a
                      href="#about"
                      onClick={(e) => smoothScrollToSection(e, "about")}
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Careers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <a
                      href="#faq"
                      onClick={(e) => smoothScrollToSection(e, "faq")}
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      API Status
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#FF6F00] transition-colors"
                    >
                      Status
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} SALES. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <Link
                  to="/privacy-policy"
                  className="text-sm text-gray-500 hover:text-gray-600"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms-of-service"
                  className="text-sm text-gray-500 hover:text-gray-600"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/cookie-policy"
                  className="text-sm text-gray-500 hover:text-gray-600"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[16px] xs:text-[13px] text-gray-400">
                Powered by{" "}
                <span className="font-medium text-gray-500">SALES Team</span>
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Floating Contact Button */}
      <motion.button
        onClick={() => setContactModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#FF6F00] text-white rounded-full shadow-lg hover:bg-[#E65C00] transition-all duration-300 flex items-center justify-center group hover:scale-110"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <Phone className="w-6 h-6" />
        </motion.div>

        {/* Ripple effect */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF6F00] opacity-75 animate-ping"></span>
      </motion.button>

      {/* Contact Modal */}
      <AnimatePresence>
        {contactModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setContactModalOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all z-50"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Contact Us</h3>
                  <button
                    onClick={() => setContactModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Phone */}
                  <motion.a
                    href="tel:+250788843646"
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FF6F00]/10 to-[#FF6F00]/5 hover:from-[#FF6F00]/20 hover:to-[#FF6F00]/10 transition-all group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FF6F00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Call us</p>
                      <p className="text-lg font-semibold text-gray-900">+250 788 843 646</p>
                    </div>
                  </motion.a>

                  {/* Email */}
                  <motion.a
                    href="mailto:info@sales.rw"
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FF6F00]/10 to-[#FF6F00]/5 hover:from-[#FF6F00]/20 hover:to-[#FF6F00]/10 transition-all group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FF6F00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Email us</p>
                      <p className="text-lg font-semibold text-gray-900">info@sales.rw</p>
                    </div>
                  </motion.a>

                  {/* Location */}
                  <motion.div
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FF6F00]/10 to-[#FF6F00]/5"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FF6F00] rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Visit us</p>
                      <p className="text-lg font-semibold text-gray-900">Kigali, Rwanda</p>
                    </div>
                  </motion.div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Contact Form Link */}
                  <button
                    onClick={() => {
                      setContactModalOpen(false);
                      const contactSection = document.getElementById('contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6F00] text-white rounded-lg hover:bg-[#E65C00] transition-colors font-medium"
                  >
                    Send us a message
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
