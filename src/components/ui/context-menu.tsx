import { useEffect, useRef, useState } from "react";
import { Copy, Trash2, CopyPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContextMenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function ContextMenu({
  isOpen,
  position,
  actions,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    // Adjust position if menu goes off screen
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 10;
    }
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height - 10;
    }
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }, [isOpen, position]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] bg-[#1a1a2e] border border-white/20 rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="py-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
              "hover:bg-white/10",
              action.variant === "destructive" &&
                "text-destructive hover:bg-destructive/20",
            )}
          >
            {action.icon && (
              <span className="w-4 h-4 shrink-0">{action.icon}</span>
            )}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Hook for using context menu
export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    position,
    openMenu,
    closeMenu,
  };
}
