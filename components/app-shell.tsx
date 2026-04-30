"use client";

import { useState } from "react";
import { BottomTabs, TabType } from "./bottom-tabs";
import { InboxTab } from "./inbox-tab";
import { ContentTab } from "./content-tab";
import { SettingsTab } from "./settings-tab";

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabType>("inbox");

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-hidden">
        {activeTab === "inbox" && <InboxTab />}
        {activeTab === "content" && <ContentTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
