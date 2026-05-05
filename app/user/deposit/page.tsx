"use client";

import { useState, useEffect } from "react";
import { Copy, ArrowRight, DollarSign, QrCode, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const PRICING = {
  ONE_STEP_TEST: {
    10000: 99,
    25000: 149,
    50000: 299,
    100000: 499,
  },
  INSTANT: {
    10000: 199,
    25000: 299,
    50000: 599,
    100000: 999,
  }
};

export default function DepositCryptoPage() {
  const router = useRouter();
  
  const [accountType, setAccountType] = useState<"ONE_STEP_TEST" | "INSTANT">("INSTANT");
  const [capitalSize, setCapitalSize] = useState<10000 | 25000 | 50000 | 100000>(25000);

  const [wallets, setWallets] = useState<any[]>([]);
  const [crypto, setCrypto] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [txHash, setTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch active wallets
    fetch("/api/wallets")
      .then((res) => res.json())
      .then((data) => {
        if (data.wallets) setWallets(data.wallets);
      });
  }, []);

  const currentWallet = wallets.find(
    (w) => w.cryptocurrency === crypto && w.blockchain === network
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard!");
  };

  const handleSubmit = async () => {
    if (!txHash) return alert("Please enter the transaction hash.");
    if (!currentWallet) return alert("Please select a valid payment method.");
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return router.push("/user/login");
      
      const price = PRICING[accountType][capitalSize];

      // 1. Create Order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          accountType,
          capitalSize,
          price,
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Order creation failed");

      const orderId = orderData.order.id;

      // 2. Submit Deposit
      const depositRes = await fetch("/api/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          cryptocurrency: crypto,
          blockchain: network,
          txHash,
        })
      });

      const depositData = await depositRes.json();
      if (!depositRes.ok) throw new Error(depositData.error || "Deposit submission failed");

      alert("Deposit submitted successfully! Awaiting admin approval.");
      router.push("/user/dashboard/deposits");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPrice = PRICING[accountType][capitalSize];

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-[500px] bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#1f2937] flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
            <DollarSign className="text-[#10b981]" size={16} />
          </div>
          <h1 className="text-lg font-bold text-white">Purchase Account</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Account Type */}
          <div>
            <p className="text-xs text-[#10b981] font-medium mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Select Account Type
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAccountType("INSTANT")}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  accountType === "INSTANT" 
                    ? "bg-[#10b981]/10 border-[#10b981] text-[#10b981]" 
                    : "bg-[#0B0F17] border-[#1f2937] text-[#a1a1aa] hover:border-[#374151]"
                }`}
              >
                Instant Account
              </button>
              <button
                onClick={() => setAccountType("ONE_STEP_TEST")}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  accountType === "ONE_STEP_TEST" 
                    ? "bg-[#10b981]/10 border-[#10b981] text-[#10b981]" 
                    : "bg-[#0B0F17] border-[#1f2937] text-[#a1a1aa] hover:border-[#374151]"
                }`}
              >
                One Step Test
              </button>
            </div>
          </div>

          {/* Account Size */}
          <div>
            <p className="text-xs text-[#10b981] font-medium mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Select Account Size
            </p>
            <div className="grid grid-cols-4 gap-2">
              {([10000, 25000, 50000, 100000] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setCapitalSize(size)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    capitalSize === size 
                      ? "bg-[#10b981]/10 border-[#10b981] text-[#10b981]" 
                      : "bg-[#0B0F17] border-[#1f2937] text-[#a1a1aa] hover:border-[#374151]"
                  }`}
                >
                  ${size / 1000}k
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#1f2937] w-full"></div>

          {/* Select Cryptocurrency */}
          <div>
            <p className="text-xs text-[#10b981] font-medium mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Select Cryptocurrency
            </p>
            <div className="grid grid-cols-4 gap-2">
              {["USDT", "USDC", "ETH", "BTC"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCrypto(c)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    crypto === c 
                      ? "bg-[#10b981]/10 border-[#10b981] text-[#10b981]" 
                      : "bg-[#0B0F17] border-[#1f2937] text-[#a1a1aa] hover:border-[#374151]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Select Blockchain */}
          <div>
            <p className="text-xs text-[#10b981] font-medium mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Select Blockchain
            </p>
            <div className="grid grid-cols-3 gap-2">
              {["ERC20", "TRC20", "BEP20"].map((n) => (
                <button
                  key={n}
                  onClick={() => setNetwork(n)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    network === n 
                      ? "bg-[#10b981]/10 border-[#10b981] text-[#10b981]" 
                      : "bg-[#0B0F17] border-[#1f2937] text-[#a1a1aa] hover:border-[#374151]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Display Area */}
          {currentWallet ? (
            <>
              {/* QR Code Section */}
              <div className="bg-[#064e3b] rounded-xl p-6 flex flex-col items-center justify-center border border-[#10b981]/30">
                <div className="w-32 h-32 bg-white rounded-xl p-2 mb-3 shadow-lg flex items-center justify-center overflow-hidden">
                  {currentWallet.qrCodeUrl ? (
                    <img src={currentWallet.qrCodeUrl} alt="QR Code" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <QrCode className="w-full h-full text-black opacity-30" />
                  )}
                </div>
                <p className="text-[11px] text-[#34d399] flex items-center gap-1.5">
                  <span className="opacity-70">Scan QR Code or copy address below</span>
                </p>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#10b981] font-medium mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    Wallet Address
                  </p>
                  <div className="flex items-center bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2.5">
                    <input
                      type="text"
                      readOnly
                      value={currentWallet.walletAddress}
                      className="bg-transparent border-none outline-none text-white text-xs w-full font-mono overflow-hidden text-ellipsis"
                    />
                    <button onClick={() => handleCopy(currentWallet.walletAddress)} className="text-[#a1a1aa] hover:text-white transition-colors ml-2 shrink-0">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#10b981] font-medium mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                      Payment Amount
                    </p>
                    <input
                      type="text"
                      readOnly
                      value={`$${currentPrice}`}
                      className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2.5 text-xs font-semibold text-white outline-none"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-[#10b981] font-medium mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                      Account Capital
                    </p>
                    <input
                      type="text"
                      readOnly
                      value={`$${capitalSize.toLocaleString()}`}
                      className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2.5 text-xs font-semibold text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#10b981] font-medium mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    Transaction Hash (TxID)
                  </p>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Paste your transaction hash here"
                    className="w-full bg-[#0B0F17] border border-[#10b981] rounded-lg px-3 py-2.5 text-xs text-white outline-none placeholder-[#4b5563]"
                  />
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-[#10b981]/50 text-black py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] mt-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (
                  <>I've Sent the Payment <ArrowRight size={16} /></>
                )}
              </button>
            </>
          ) : (
            <div className="p-8 text-center text-[#a1a1aa] bg-[#0B0F17] rounded-xl border border-[#1f2937]">
              No wallet configuration available for {crypto} on {network}. Please select another option.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
