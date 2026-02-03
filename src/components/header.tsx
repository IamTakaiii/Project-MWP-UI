import { Link } from "@tanstack/react-router";
import { ScrollText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="text-center mb-10">
      {/* Navigation */}
      <div className="flex justify-between mb-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="h-4 w-4" />
            หน้าหลัก
          </Button>
        </Link>
        <Link to="/changelog">
          <Button variant="secondary" size="sm" className="gap-2">
            <ScrollText className="h-4 w-4" />
            Change Log
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <svg
          viewBox="0 0 32 32"
          className="w-14 h-14 mx-auto drop-shadow-[0_4px_20px_rgba(76,154,255,0.4)] animate-bounce"
        >
          <defs>
            <linearGradient
              x1="98.031%"
              y1="0.161%"
              x2="58.888%"
              y2="40.766%"
              id="gradient1"
            >
              <stop stopColor="#0052CC" offset="0%" />
              <stop stopColor="#2684FF" offset="100%" />
            </linearGradient>
            <linearGradient
              x1="100.665%"
              y1="-17.615%"
              x2="55.402%"
              y2="44.248%"
              id="gradient2"
            >
              <stop stopColor="#0052CC" offset="0%" />
              <stop stopColor="#2684FF" offset="100%" />
            </linearGradient>
          </defs>
          <path
            d="M15.967 0c-4.225 4.225-4.157 11.022.157 15.336l.51.51c4.157 4.157 4.157 10.905 0 15.062l-.51.51-1.096-1.096c4.225-4.225 4.157-11.022-.157-15.336l-.51-.51c-4.157-4.157-4.157-10.905 0-15.062l.51-.51L15.967 0z"
            fill="url(#gradient1)"
          />
          <path
            d="M21.62 5.652c-4.225 4.225-4.157 11.022.157 15.336l.51.51c4.157 4.157 4.157 10.905 0 15.062l-.51.51-1.096-1.096c4.225-4.225 4.157-11.022-.157-15.336l-.51-.51c-4.157-4.157-4.157-10.905 0-15.062l.51-.51 1.096 1.096z"
            fill="url(#gradient2)"
          />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2 drop-shadow-lg">
        JIRA Worklog Creator
      </h1>
      <p className="text-lg text-[#A5ADBA]">สร้าง worklog หลายวันพร้อมกัน</p>
    </header>
  );
}
