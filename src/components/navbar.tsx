/**
 * NavBar Component
 *
 * Global navigation bar - rendered once in root layout.
 * Uses nav.config.ts for all navigation items.
 */

import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMainNavItems,
  getToolsNavItems,
  type NavItem,
} from "@/config/nav.config";

export function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const mainItems = getMainNavItems();
  const toolsItems = getToolsNavItems();

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  const NavLink = ({
    item,
    onClick,
    size = "default",
  }: {
    item: NavItem;
    onClick?: () => void;
    size?: "default" | "small";
  }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 rounded-lg font-medium transition-all duration-200",
          size === "default" ? "px-3 py-2 text-sm" : "px-2.5 py-1.5 text-xs",
          isActive(item.href)
            ? "bg-primary/15 text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5",
        )}
      >
        <Icon className={size === "default" ? "h-4 w-4" : "h-3.5 w-3.5"} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left - Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                <span className="text-sm">🚀</span>
              </div>
              <span className="hidden sm:block font-semibold text-foreground group-hover:text-primary transition-colors">
                MWP
              </span>
            </Link>

            {/* Center - Main navigation (desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {mainItems.map((item) => (
                <NavLink key={item.id} item={item} />
              ))}
            </div>

            {/* Right - Tools dropdown + Mobile menu */}
            <div className="flex items-center gap-2">
              {/* Tools dropdown (desktop) */}
              <div className="hidden md:block relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1.5 text-xs",
                    toolsItems.some((item) => isActive(item.href))
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                >
                  เครื่องมือ
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isToolsOpen && "rotate-180",
                    )}
                  />
                </Button>

                {/* Dropdown menu */}
                {isToolsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsToolsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {toolsItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.id}
                            to={item.href}
                            onClick={() => setIsToolsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                              isActive(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-white/5",
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm">
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed top-14 left-0 right-0 max-h-[calc(100vh-3.5rem)] overflow-y-auto bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 space-y-1">
              {/* Main nav items */}
              <div className="pb-3 mb-3 border-b border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2 px-3">
                  หน้าหลัก
                </p>
                {mainItems.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>

              {/* Tools nav items */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 px-3">
                  เครื่องมือ
                </p>
                {toolsItems.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * PageContainer Component
 *
 * Consistent page wrapper with standardized padding and max-width.
 * All pages use the same max-width (7xl = 1280px) for consistent edge spacing.
 */
interface PageContainerProps {
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("px-4 py-6 md:px-8 md:py-8", className)}>
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
}

/**
 * PageHeader Component
 *
 * Consistent page header with title, description, and optional actions.
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconGradient?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  icon,
  iconGradient = "from-primary to-blue-400",
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
              iconGradient,
            )}
          >
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
