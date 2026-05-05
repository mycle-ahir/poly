"use client";

import { useState } from "react";
import { Check, CheckCircle2, ArrowRight, Zap, Target, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PurchaseAccountPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("INSTANT");
  const [selectedCapital, setSelectedCapital] = useState(10000);
  const [isLoading, setIsLoading] = useState(false);

  const capitals = [
    { amount: 1000, price: 39 },
    { amount: 3000, price: 79 },
    { amount: 5000, price: 99 },
    { amount: 10000, price: 149 },
    { amount: 25000, price: 299 },
    { amount: 50000, price: 399 },
  ];

  const currentPrice = capitals.find(c => c.amount === selectedCapital)?.price || 0;

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/user/login");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          accountType: selectedType,
          capitalSize: selectedCapital
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) router.push("/user/login");
        throw new Error(data.error || "Failed to create order");
      }

      router.push(`/user/deposit?orderId=${data.order.id}&hashId=${data.order.hashId}&price=${data.order.finalPrice}&capital=${data.order.capitalSize}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[800px] bg-[#111827] border border-[#1f2937] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 border border-[#10b981]/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981] w-5 h-5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Purchase Trading Account</h1>
              <p className="text-[#a1a1aa] text-sm">Choose your account type and capital size to get started</p>
            </div>
          </div>
        </div>

        {/* Account Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Instant Account */}
          <button
            onClick={() => setSelectedType("INSTANT")}
            className={`text-left relative p-5 rounded-xl border transition-all ${
              selectedType === "INSTANT"
                ? "bg-gradient-to-br from-[#064e3b] to-[#111827] border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "bg-[#0B0F17] border-[#1f2937] hover:border-[#374151]"
            }`}
          >
            {selectedType === "INSTANT" && (
              <div className="absolute top-4 right-4 bg-[#10b981] text-black rounded-full p-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
            {selectedType !== "INSTANT" && (
              <div className="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-[#374151]" />
            )}
            <div className="flex items-center gap-2 mb-3">
              <Zap className={selectedType === "INSTANT" ? "text-[#10b981]" : "text-[#a1a1aa]"} size={18} />
              <h3 className="font-semibold text-white">Instant Account</h3>
            </div>
            <p className="text-xs text-[#a1a1aa] mb-4 min-h-[32px]">
              Start trading immediately with full access to all features.
            </p>
            <ul className="space-y-2">
              {[
                "Immediate access",
                "All markets available",
                "75-25 reward split",
                "25% profit target for withdrawal"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] text-[#d4d4d8]">
                  <CheckCircle2 size={12} className={selectedType === "INSTANT" ? "text-[#10b981]" : "text-[#4b5563]"} />
                  {feature}
                </li>
              ))}
            </ul>
          </button>

          {/* One Step Test */}
          <button
            onClick={() => setSelectedType("ONE_STEP_TEST")}
            className={`text-left relative p-5 rounded-xl border transition-all ${
              selectedType === "ONE_STEP_TEST"
                ? "bg-gradient-to-br from-[#1e3a8a]/40 to-[#111827] border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                : "bg-[#0B0F17] border-[#1f2937] hover:border-[#374151]"
            }`}
          >
            {selectedType === "ONE_STEP_TEST" && (
              <div className="absolute top-4 right-4 bg-[#3b82f6] text-black rounded-full p-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
            {selectedType !== "ONE_STEP_TEST" && (
              <div className="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-[#374151]" />
            )}
            <div className="flex items-center gap-2 mb-3">
              <Target className={selectedType === "ONE_STEP_TEST" ? "text-[#3b82f6]" : "text-[#a1a1aa]"} size={18} />
              <h3 className="font-semibold text-white">One Step Test</h3>
            </div>
            <p className="text-xs text-[#a1a1aa] mb-4 min-h-[32px]">
              Pass a 14-day test to unlock your funded account.
            </p>
            <ul className="space-y-2">
              {[
                "14-day test period",
                "25% profit target",
                "Minimum 4 trades required",
                "10% discount on re-apply if failed"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] text-[#d4d4d8]">
                  <CheckCircle2 size={12} className={selectedType === "ONE_STEP_TEST" ? "text-[#3b82f6]" : "text-[#4b5563]"} />
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        </div>

        {/* Capital Size Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981] w-4 h-4"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Select Capital Size
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {capitals.map((cap) => {
              const isSelected = selectedCapital === cap.amount;
              return (
                <button
                  key={cap.amount}
                  onClick={() => setSelectedCapital(cap.amount)}
                  className={`relative p-4 rounded-xl border transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-[#064e3b]/30 border-[#10b981]"
                      : "bg-[#0B0F17] border-[#1f2937] hover:border-[#374151]"
                  }`}
                >
                  <span className={`text-lg font-bold mb-1 ${isSelected ? "text-white" : "text-[#d4d4d8]"}`}>
                    ${cap.amount.toLocaleString()}
                  </span>
                  <span className={`text-xs ${isSelected ? "text-[#10b981]" : "text-[#a1a1aa]"}`}>
                    ${cap.price}
                  </span>
                  {isSelected && (
                    <div className="absolute bottom-2 flex items-center gap-1 text-[#10b981] text-[9px] font-medium">
                      <Check size={10} /> Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary & Checkout */}
        <div className="mt-8 pt-6 border-t border-[#1f2937]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[#a1a1aa] text-sm mb-1">Total Amount</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">${currentPrice}</span>
                <span className="text-[#10b981] text-sm font-medium">Crypto Only</span>
              </div>
            </div>
            <button 
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full md:w-auto bg-[#10b981] hover:bg-[#059669] disabled:bg-[#10b981]/50 text-black px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                <>Proceed to Payment <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
