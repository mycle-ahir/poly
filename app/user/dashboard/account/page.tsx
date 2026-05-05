"use client";

import { useState, useEffect } from "react";
import { User, ShieldCheck, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UserAccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok) {
        setFullName(data.fullName || "");
        setEmail(data.email || "");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
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
        body: JSON.stringify({ fullName }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-[#a1a1aa]">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm">Loading account details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center border border-[#3b82f6]/30">
          <User className="text-[#3b82f6]" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">My Account</h1>
          <p className="text-[#a1a1aa] mt-0.5 text-xs">Manage your personal information and security</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Info */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <User size={16} className="text-[#a1a1aa]" /> Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] text-[#a1a1aa] mb-1.5">Full Name</p>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6] transition-colors" 
              />
            </div>
            <div>
              <p className="text-[11px] text-[#a1a1aa] mb-1.5">Email Address</p>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" size={14} />
                <input 
                  type="email" 
                  readOnly 
                  value={email}
                  className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg pl-9 pr-3 py-2 text-sm text-[#6b7280] outline-none cursor-not-allowed" 
                />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-[#1f2937] flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-[#10b981] hover:bg-[#059669] text-black px-4 py-2 rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* Verification / KYC */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#10b981]" /> Identity Verification
          </h2>
          <div className="bg-[#064e3b]/20 border border-[#10b981]/30 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#34d399]">Level 2 Verified</h3>
              <p className="text-[11px] text-[#10b981]/80 mt-1">Your identity and proof of address are verified. You can withdraw profits.</p>
            </div>
            <span className="bg-[#10b981] text-black text-[10px] font-bold px-2 py-1 rounded">COMPLETED</span>
          </div>
        </div>

        {/* Security */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Lock size={16} className="text-[#a1a1aa]" /> Security Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#1f2937]">
              <div>
                <h3 className="text-sm font-semibold text-white">Change Password</h3>
                <p className="text-[11px] text-[#a1a1aa]">Update your password regularly to keep your account secure</p>
              </div>
              <button className="bg-[#1f2937] hover:bg-[#374151] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                Update
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Two-Factor Authentication (2FA)</h3>
                <p className="text-[11px] text-[#a1a1aa]">Add an extra layer of security using an authenticator app</p>
              </div>
              <button className="bg-[#10b981] hover:bg-[#059669] text-black px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
