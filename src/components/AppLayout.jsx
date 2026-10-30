import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const expandedWidth = 300;
const collapsedWidth = 80;

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
  { name: "My profile", href: "/profile", icon: UserCircle },
];

/** True while the screen matches a CSS media query, and updates when the window is resized or turned. */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
};

const useNavItems = () => {
  const { user, can } = useAuth();
  return (user.role === "SUPER_ADMIN" ? platformNav : businessNav).filter(
    (i) => (!i.permission && !i.any) || (i.permission && can(i.permission)) || (i.any && i.any.some(can))
  );
};

const initialsOf = (user) =>
  (user.fullName || user.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const useSignOut = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return async () => {
    await logout();
    navigate("/auth/login", { replace: true });
  };
};

/** The navigation list. In the drawer it also shows who is signed in and a Sign out button that is always on screen. */
const SideNav = ({ isCollapsed = false, drawer = false, onNavigate, onClose }) => {
  const { user } = useAuth();
  const items = useNavItems();
  const signOut = useSignOut();

  return (
    <div
      className={`bg-white h-full flex flex-col ${
        drawer ? "w-full" : `transition-all duration-300 ${isCollapsed ? "w-[80px]" : "w-[300px] pl-[25px]"}`
      }`}
    >
      {drawer ? (
        <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 border-b border-gray-100">
          <img src="/logo-label.png" alt="SALES" className="h-9" />
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className={`flex items-center h-16 mt-[50px] ${isCollapsed ? "justify-center px-2" : "px-6"}`}>
          <div className="flex justify-center items-center mb-8">
            {isCollapsed ? <img src="/logo.png" alt="SALES" className="w-auto h-[40px]" /> : <img src="/logo-label.png" alt="SALES" className="h-12" />}
          </div>
        </div>
      )}

      <nav className={`flex-1 overflow-y-auto overscroll-contain ${drawer ? "py-3" : "mt-8 pb-6"}`}>
        <div className={`space-y-1 ${isCollapsed ? "px-2" : "px-3"}`}>
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={() => onNavigate && onNavigate()}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center text-[15px] transition-all duration-200 ${drawer ? "h-12" : "h-[44px]"} ${
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

      <div className="border-t border-gray-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {drawer && (
          <div className="flex items-center gap-3 px-2 pb-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[rgba(255,111,0,0.1)] text-[#FF6F00] font-semibold flex items-center justify-center">
              {initialsOf(user)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-[#A2A1A8] truncate">{user.role.toLowerCase().replace(/_/g, " ")}</p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className={`flex items-center w-full h-12 text-[16px] text-gray-700 rounded-[10px] hover:bg-gray-50 transition-colors ${
            isCollapsed ? "justify-center px-2" : "px-4"
          } ${drawer ? "border border-gray-200" : ""}`}
          title="Sign out"
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && "Sign out"}
        </button>
      </div>
    </div>
  );
};

/** The round avatar at the top right. It opens a small menu, so Sign out is one tap away on every screen. */
const UserMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-0.5 hover:bg-gray-50" aria-haspopup="menu" aria-expanded={open}>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900 leading-tight">{user.fullName}</p>
          <p className="text-xs text-[#A2A1A8] leading-tight">{user.role.toLowerCase().replace(/_/g, " ")}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-[rgba(255,111,0,0.1)] text-[#FF6F00] font-semibold flex items-center justify-center">{initialsOf(user)}</div>
        <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-[12px] border border-gray-200 bg-white p-1.5 shadow-xl z-50">
          <div className="px-3 py-2 border-b border-gray-100 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
            <p className="text-xs text-[#A2A1A8] truncate">{user.email}</p>
          </div>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <UserCircle className="h-4 w-4" /> My profile
          </button>
          <button role="menuitem" onClick={signOut} className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const TopBar = ({ onMenu, showMenuButton }) => {
  const { user } = useAuth();
  return (
    <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-3 sm:px-6 py-2.5 min-h-[60px] sm:min-h-[72px] pt-[max(0.625rem,env(safe-area-inset-top))]">
      {showMenuButton && (
        <button onClick={onMenu} className="p-2.5 -ml-1 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      )}
      <div className={`min-w-0 flex-1 ${showMenuButton ? "" : "lg:pl-12"}`}>
        <p className="text-[16px] sm:text-[18px] font-bold text-gray-900 leading-tight truncate">{user.businessName}</p>
        <p className="text-[#A2A1A8] text-xs sm:text-sm truncate">
          {user.role === "SUPER_ADMIN" ? "Platform console" : user.outlets?.map((o) => o.name).join(" · ") || "No outlet assigned"}
        </p>
      </div>
      <UserMenu />
    </header>
  );
};

const AppLayout = ({ children }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);

  // A page change or a bigger screen closes the drawer.
  useEffect(() => setDrawerOpen(false), [location.pathname, isDesktop]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const expanded = pinned || hovering;

  if (isDesktop) {
    const width = expanded ? expandedWidth : collapsedWidth;
    return (
      <div className="flex h-dvh bg-white overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 left-0 h-full z-20 overflow-hidden border-r border-gray-100"
          onMouseEnter={() => !pinned && setHovering(true)}
          onMouseLeave={() => !pinned && setHovering(false)}
        >
          <SideNav isCollapsed={!expanded} />
        </motion.div>

        <motion.button
          initial={false}
          onClick={() => {
            setPinned(!pinned);
            setHovering(false);
          }}
          animate={{ left: width }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`fixed top-[18px] z-30 p-2 ${
            pinned ? "bg-[#FF6F00]/10 hover:bg-[#FF6F00]/20 shadow-sm rounded-full" : "bg-white shadow-md border border-gray-200 rounded-full hover:bg-gray-50"
          }`}
          aria-label="Toggle menu"
        >
          {pinned ? <X className="w-5 h-5 text-[#FF6F00]" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </motion.button>

        <motion.div initial={false} animate={{ marginLeft: width }} transition={{ duration: 0.3, ease: "easeInOut" }} className="flex-1 flex flex-col h-full min-w-0">
          <TopBar showMenuButton={false} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6">{children}</main>
        </motion.div>
      </div>
    );
  }

  // Phones and tablets: the menu slides in over the page, and the top bar always has the avatar menu with Sign out.
  return (
    <div className="flex h-dvh flex-col bg-white overflow-hidden">
      <TopBar showMenuButton onMenu={() => setDrawerOpen(true)} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-3 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</main>

      <div className={`fixed inset-0 z-40 ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${drawerOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setDrawerOpen(false)} />
        <aside
          className={`absolute inset-y-0 left-0 h-dvh w-[86vw] max-w-[320px] bg-white shadow-2xl transition-transform duration-200 ease-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SideNav drawer onNavigate={() => setDrawerOpen(false)} onClose={() => setDrawerOpen(false)} />
        </aside>
      </div>
    </div>
  );
};

export default AppLayout;
