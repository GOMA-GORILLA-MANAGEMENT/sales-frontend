import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRedirect from "./components/HomeRedirect";
import AppLayout from "./components/AppLayout";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";

import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Success from "./pages/auth/Success";

import PlatformConsole from "./platform/PlatformConsole";
import Restaurants from "./platform/Restaurants";
import RestaurantDetail from "./platform/RestaurantDetail";
import Onboard from "./platform/Onboard";

import Dashboard from "./business/Dashboard";
import TakeOrder from "./business/TakeOrder";
import Orders from "./business/Orders";
import Stock from "./business/Stock";
import Menu from "./business/Menu";
import Customers from "./business/Customers";
import CustomerStatement from "./business/CustomerStatement";
import Debts from "./business/Debts";
import DebtDetail from "./business/DebtDetail";
import Expenses from "./business/Expenses";
import Reports from "./business/Reports";
import Outlets from "./business/Outlets";
import Team from "./business/Team";
import Audit from "./business/Audit";
import Settings from "./business/Settings";
import Profile from "./business/Profile";

/** A signed-in screen inside the app shell, optionally limited to a permission. */
const Screen = ({ permission, platform, any, children }) => (
  <ProtectedRoute permission={permission} platform={platform} any={any}>
    <AppLayout>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AppLayout>
  </ProtectedRoute>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 1600);
    const removeTimer = setTimeout(() => setIsLoading(false), 2200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{ opacity: isFadingOut ? 0 : 1, transition: "opacity 0.6s ease-out" }}>
        <LoadingScreen />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/success" element={<Success />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />

            {/* After sign-in, everyone lands on the screen that suits their role */}
            <Route path="/app" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />

            {/* Platform console (super admin only) */}
            <Route path="/platform" element={<Screen platform><PlatformConsole /></Screen>} />
            <Route path="/platform/restaurants" element={<Screen platform><Restaurants /></Screen>} />
            <Route path="/platform/restaurants/:id" element={<Screen platform><RestaurantDetail /></Screen>} />
            <Route path="/platform/onboard" element={<Screen platform><Onboard /></Screen>} />

            {/* A restaurant account */}
            <Route path="/dashboard" element={<Screen permission="dashboard:view"><Dashboard /></Screen>} />
            <Route path="/take-order" element={<Screen permission="order:create"><TakeOrder /></Screen>} />
            <Route path="/orders" element={<Screen any={["order:create", "order:view-all"]}><Orders /></Screen>} />
            <Route path="/stock" element={<Screen permission="stock:view"><Stock /></Screen>} />
            <Route path="/menu" element={<Screen permission="menu:view"><Menu /></Screen>} />
            <Route path="/customers" element={<Screen permission="customer:view"><Customers /></Screen>} />
            <Route path="/customers/:id/statement" element={<Screen permission="debt:view"><CustomerStatement /></Screen>} />
            <Route path="/debts" element={<Screen permission="debt:view"><Debts /></Screen>} />
            <Route path="/debts/:id" element={<Screen permission="debt:view"><DebtDetail /></Screen>} />
            <Route path="/expenses" element={<Screen permission="expense:manage"><Expenses /></Screen>} />
            <Route path="/reports" element={<Screen permission="report:view"><Reports /></Screen>} />
            <Route path="/outlets" element={<Screen permission="outlet:manage"><Outlets /></Screen>} />
            <Route path="/team" element={<Screen permission="staff:manage"><Team /></Screen>} />
            <Route path="/audit" element={<Screen permission="audit:view"><Audit /></Screen>} />
            <Route path="/settings" element={<Screen permission="settings:manage"><Settings /></Screen>} />
            <Route path="/profile" element={<Screen><Profile /></Screen>} />

            <Route path="/home" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
