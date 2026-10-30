import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Boxes,
  UtensilsCrossed,
  Users,
  Wallet,
  FileBarChart,
  UserCog,
  Store,
  ShieldCheck,
  Settings,
  UserCircle,
  Building2,
  PlusCircle,
  Contact,
  Receipt,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const expandedWidth = 300;
const collapsedWidth = 80;
const animationDuration = 0.3;

const businessNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { name: "Take order", href: "/take-order", icon: ShoppingCart, permission: "order:create" },
  { name: "Orders", href: "/orders", icon: ClipboardList, any: ["order:create", "order:view-all"] },
  { name: "Stock", href: "/stock", icon: Boxes, permission: "stock:view" },
  { name: "Menu", href: "/menu", icon: UtensilsCrossed, permission: "menu:view" },
  { name: "Customers", href: "/customers", icon: Contact, permission: "customer:view" },
  { name: "Debts", href: "/debts", icon: Wallet, permission: "debt:view" },
  { name: "Expenses", href: "/expenses", icon: Receipt, permission: "expense:manage" },
  { name: "Reports", href: "/reports", icon: FileBarChart, permission: "report:view" },
  { name: "Restaurants & bars", href: "/outlets", icon: Store, permission: "outlet:manage" },
  { name: "Team", href: "/team", icon: UserCog, permission: "staff:manage" },
  { name: "Audit trail", href: "/audit", icon: ShieldCheck, permission: "audit:view" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "settings:manage" },
  { name: "My profile", href: "/profile", icon: UserCircle },
];

const platformNav = [
  { name: "Console", href: "/platform", icon: LayoutDashboard, end: true },
  { name: "Restaurants", href: "/platform/restaurants", icon: Building2 },
  { name: "Add restaurant", href: "/platform/onboard", icon: PlusCircle },
];

const SideNav = ({ isCollapsed, onNavigate }) => {
  const { user, can, logout } = useAuth();
  const navigate = useNavigate();
  const items = (user.role === "SUPER_ADMIN" ? platformNav : businessNav).filter(
    (i) => (!i.permission && !i.any) || (i.permission && can(i.permission)) || (i.any && i.any.some(can))
  );

  return (
    <div className={`bg-white h-screen flex flex-col transition-all duration-300 ${isCollapsed ? "w-[80px]" : "w-[300px] pl-[25px]"}`}>
      <div className={`flex items-center h-16 mt-[50px] ${isCollapsed ? "justify-center px-2" : "px-6"}`}>
        <div className="flex justify-center items-center mb-8">
          {isCollapsed ? (
            <img src="/logo.png" alt="SALES" className="w-auto h-[40px]" />
          ) : (
            <img src="/logo-label.png" alt="SALES" className="h-12" />
          )}
        </div>
      </div>

      <nav className="mt-8 flex-1 overflow-y-auto pb-6">
        <div className={`space-y-1 ${isCollapsed ? "px-2" : "px-4"}`}>
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={() => onNavigate && onNavigate()}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center h-[44px] text-[15px] transition-all duration-200 ${
                  isCollapsed ? "justify-center rounded-lg" : "px-4 rounded-r-[10px]"
                } ${
                  isActive
                    ? `bg-[rgba(255,111,0,0.06)] text-[#FF6F00] font-medium ${isCollapsed ? "" : "border-l-[3px] border-[#FF6F00]"}`
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4">
        <button
          onClick={async () => {
            await logout();
            navigate("/auth/login");
          }}
          className={`flex items-center w-full h-[50px] text-[16px] text-gray-600 rounded-r-[10px] hover:bg-gray-50 hover:text-gray-900 transition-colors ${
            isCollapsed ? "justify-center px-2" : "px-4"
          }`}
          title="Sign out"
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && "Sign out"}
        </button>
      </div>
    </div>
  );
};

const TopBar = () => {
  const { user } = useAuth();
  const initials = (user.fullName || user.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white pl-16 pr-6 xs:pl-12 xs:pr-3 py-3 min-h-[72px] xs:min-h-[56px]">
      <div>
        <p className="text-[18px] xs:text-[14px] font-bold text-gray-900 leading-tight">{user.businessName}</p>
        <p className="text-[#A2A1A8] text-sm xs:text-[11px]">
          {user.role === "SUPER_ADMIN" ? "Platform console" : user.outlets?.map((o) => o.name).join(" · ") || "No outlet assigned"}
        </p>
      </div>
      <Link to={user.role === "SUPER_ADMIN" ? "/platform" : "/profile"} className="flex items-center gap-3">
        <div className="text-right xs:hidden">
          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
          <p className="text-xs text-[#A2A1A8]">{user.role.toLowerCase().replace(/_/g, " ")}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-[rgba(255,111,0,0.1)] text-[#FF6F00] font-semibold flex items-center justify-center">
          {initials}
        </div>
      </Link>
    </header>
  );
};

const AppLayout = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = window.innerWidth < 480;
  const shouldExpand = isSidebarExpanded || (!isSidebarExpanded && isHovering);
  const sidebarWidth = shouldExpand ? expandedWidth : collapsedWidth;

  const enter = () => !isMobile && !isSidebarExpanded && setIsHovering(true);
  const leave = () => !isMobile && !isSidebarExpanded && setIsHovering(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <motion.div
        initial={false}
        animate={{ width: isMobile && !isSidebarExpanded ? 0 : sidebarWidth }}
        transition={{ duration: animationDuration, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-full z-20 overflow-hidden"
        onMouseEnter={enter}
        onMouseLeave={leave}
      >
        <SideNav isCollapsed={!shouldExpand} onNavigate={() => isMobile && setIsSidebarExpanded(false)} />
      </motion.div>

      <motion.button
        initial={false}
        onClick={() => {
          setIsSidebarExpanded(!isSidebarExpanded);
          setIsHovering(false);
        }}
        animate={{ left: isMobile && !isSidebarExpanded ? 0 : sidebarWidth }}
        transition={{ duration: animationDuration, ease: "easeInOut" }}
        className={`fixed top-[18px] xs:top-[10px] z-30 p-2 ${
          isSidebarExpanded
            ? "bg-[#FF6F00]/10 hover:bg-[#FF6F00]/20 shadow-sm rounded-full"
            : "bg-white shadow-md border border-gray-200 rounded-full hover:bg-gray-50"
        }`}
        onMouseEnter={enter}
        onMouseLeave={leave}
        aria-label="Toggle menu"
      >
        {isSidebarExpanded ? <X className="w-5 h-5 text-[#FF6F00]" /> : <Menu className="w-5 h-5 text-gray-700" />}
      </motion.button>

      <motion.div
        initial={false}
        animate={{ marginLeft: isMobile && !isSidebarExpanded ? 0 : shouldExpand ? expandedWidth : collapsedWidth }}
        transition={{ duration: animationDuration, ease: "easeInOut" }}
        className="flex-1 flex flex-col h-full min-w-0"
      >
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6 xs:p-[10px]">{children}</main>
      </motion.div>
    </div>
  );
};

export default AppLayout;
