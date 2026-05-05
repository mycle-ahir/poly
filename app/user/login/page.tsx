"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = activeTab === "login" 
        ? { email, password }
        : { email, password, fullName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "ADMIN") {
        router.push("/dashboard"); // Admin dashboard
      } else {
        router.push("/user/dashboard"); // User dashboard
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0B0F17] overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#10b981]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#10b981]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md p-8 relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center">
            <span className="font-bold text-black text-lg leading-none">F</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Funded<span className="text-[#10b981]">Flips</span>
          </span>
        </div>
        <p className="text-[#a1a1aa] text-sm mb-8">Your Trading Success Platform</p>

        <div className="w-full bg-[#111827]/80 backdrop-blur-xl border border-[#1f2937] rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-[#0B0F17] rounded-lg p-1 mb-6 border border-[#1f2937]">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                activeTab === "login" 
                  ? "bg-[#10b981] text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("signup"); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                activeTab === "signup" 
                  ? "bg-[#10b981] text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {activeTab === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#a1a1aa]">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#a1a1aa] flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#a1a1aa] flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg pl-4 pr-10 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#a1a1aa] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-[#10b981]/50 text-black py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] mt-6"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {activeTab === "login" ? "Log In" : "Sign Up"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {activeTab === "login" && (
              <div className="text-center mt-4">
                <Link href="#" className="text-xs text-[#10b981] hover:text-[#059669] hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}
          </form>
        </div>

        <p className="text-[10px] text-[#4b5563] text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
