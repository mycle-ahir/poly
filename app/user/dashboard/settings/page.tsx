"use client";

import { useState, useEffect } from "react";
import { Settings, Bell, Monitor, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UserSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("English (US)");
  const [timezone, setTimezone] = useState("GMT (Greenwich Mean Time)");
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    "Trade Execution": true,
    "Deposit/Withdrawal Alerts": true,
    "Rule Violations": true,
    "Marketing & Promos": true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok) {
        setTheme(data.theme || "dark");
        setLanguage(data.language || "English (US)");
        setTimezone(data.timezone || "GMT (Greenwich Mean Time)");
        if (data.notificationSettings) {
          setNotifications(data.notificationSettings);
        }
      }
    } catch (error) {
      console.error("Settings fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          language,
          timezone,
          notificationSettings: notifications,
        }),
      });

      if (res.ok) {
        toast.success("Preferences saved successfully");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Settings save error:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-[#a1a1aa]">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#6366f1]/20 flex items-center justify-center border border-[#6366f1]/30">
          <Settings className="text-[#6366f1]" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Preferences</h1>
          <p className="text-[#a1a1aa] mt-0.5 text-xs">Customize your dashboard experience</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Monitor size={16} className="text-[#a1a1aa]" /> Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Theme</h3>
              <p className="text-[11px] text-[#a1a1aa]">Select your preferred interface theme</p>
            </div>
            <div className="flex bg-[#0B0F17] rounded-lg p-1 border border-[#1f2937]">
              <button 
                onClick={() => setTheme("dark")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${theme === "dark" ? "bg-[#1f2937] text-white" : "text-[#a1a1aa] hover:text-white"}`}
              >
                Dark
              </button>
              <button 
                onClick={() => setTheme("light")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${theme === "light" ? "bg-[#1f2937] text-white" : "text-[#a1a1aa] hover:text-white"}`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Bell size={16} className="text-[#a1a1aa]" /> Notifications
          </h2>
          <div className="space-y-4">
            {[
              { title: "Trade Execution", desc: "Get notified when a trade is placed or closed" },
              { title: "Deposit/Withdrawal Alerts", desc: "Receive updates on your transaction statuses" },
              { title: "Rule Violations", desc: "Warning notifications if you approach risk limits" },
              { title: "Marketing & Promos", desc: "Updates on new challenges and discounts" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-[11px] text-[#a1a1aa]">{item.desc}</p>
                </div>
                <button 
                  onClick={() => toggleNotification(item.title)}
                  className={`w-10 h-5 rounded-full p-0.5 border transition-all flex ${notifications[item.title] ? "bg-[#10b981]/20 border-[#10b981] justify-end" : "bg-[#1f2937] border-[#374151] justify-start"}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${notifications[item.title] ? "bg-[#10b981]" : "bg-[#4b5563]"}`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Regional */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Globe size={16} className="text-[#a1a1aa]" /> Language & Region
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] text-[#a1a1aa] mb-1.5">Language</p>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer focus:border-[#6366f1]"
              >
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <p className="text-[11px] text-[#a1a1aa] mb-1.5">Timezone</p>
              <select 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer focus:border-[#6366f1]"
              >
                <option>GMT (Greenwich Mean Time)</option>
                <option>EST (Eastern Standard Time)</option>
                <option>PST (Pacific Standard Time)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#10b981] hover:bg-[#059669] text-black px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
