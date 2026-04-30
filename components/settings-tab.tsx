"use client";

import { useAuth } from "@/lib/auth-context";
import {
  LogOut,
  User,
  Mail,
  Sparkles,
  Shield,
  Info,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export function SettingsTab() {
  const { logout } = useAuth();

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Manager Profile",
          value: "Operations Manager",
          action: undefined,
        },
        {
          icon: Mail,
          label: "Email Account",
          value: "Connected",
          status: "success" as const,
          action: undefined,
        },
        {
          icon: Sparkles,
          label: "AI Assistant",
          value: "Claude",
          status: "success" as const,
          action: undefined,
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: Info,
          label: "App Version",
          value: "1.0.0",
          action: undefined,
        },
        {
          icon: Shield,
          label: "Privacy Policy",
          value: undefined,
          action: "link" as const,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Club info card */}
        <div className="bg-primary rounded-xl p-4 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-8 h-8"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">Ingrebourne Links</h2>
              <p className="text-primary-foreground/80 text-sm">
                Golf & Country Club
              </p>
            </div>
          </div>
        </div>

        {/* Settings groups */}
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
              {group.title}
            </h3>
            <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                    </div>
                    {item.value && (
                      <span
                        className={`text-sm ${
                          item.status === "success"
                            ? "text-accent"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.value}
                      </span>
                    )}
                    {item.action === "link" && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    )}
                    {!item.action && !item.value && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-destructive/10 text-destructive rounded-xl font-semibold hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Ingrebourne Links Golf Operations Manager
          <br />
          Powered by Claude AI
        </p>
      </div>
    </div>
  );
}
