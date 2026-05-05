"use client";

import { useState, useEffect } from "react";
import { Wallet, QrCode, RefreshCw, Edit, Copy, Plus, Save, Loader2, X, Trash, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WalletSettingsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newForm, setNewForm] = useState({ cryptocurrency: "USDT", blockchain: "ERC20", walletAddress: "", qrCodeUrl: "" });

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return router.push("/user/login");

      const res = await fetch("/api/admin/wallets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return router.push("/user/login");

      const data = await res.json();
      if (data.wallets) setWallets(data.wallets);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size to prevent huge base64 strings (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (isEdit) {
        setEditForm({ ...editForm, qrCodeUrl: base64String });
      } else {
        setNewForm({ ...newForm, qrCodeUrl: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (walletId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const payload = { ...editForm };
      if (payload.qrCodeUrl === "") {
        payload.qrCodeUrl = null;
      }
      const res = await fetch("/api/admin/wallets", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ walletId, ...payload }),
      });
      
      if (res.ok) {
        setEditingId(null);
        fetchWallets();
      } else {
        alert("Failed to update wallet");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (walletId: string) => {
    if (!confirm("Are you sure you want to delete this wallet?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/admin/wallets?walletId=${walletId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      if (res.ok) {
        fetchWallets();
      } else {
        alert("Failed to delete wallet");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const payload = { ...newForm };
      if (payload.qrCodeUrl === "") {
        payload.qrCodeUrl = null as any;
      }
      const res = await fetch("/api/admin/wallets", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setIsAddingNew(false);
        setNewForm({ cryptocurrency: "USDT", blockchain: "ERC20", walletAddress: "", qrCodeUrl: "" });
        fetchWallets();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create wallet");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-[#10b981]" size={32} /></div>;
  }

  return (
    <div className="space-y-6 max-w-[1200px] pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Wallet Settings</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">Manage cryptocurrency wallets and QR codes for deposits</p>
      </div>

      {isAddingNew && (
        <div className="p-6 rounded-xl bg-[#0e1217] border border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.1)] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Add New Wallet Configuration</h3>
            <button onClick={() => setIsAddingNew(false)} className="text-[#a1a1aa] hover:text-white"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#a1a1aa] mb-1 block">Cryptocurrency</label>
              <select 
                value={newForm.cryptocurrency} 
                onChange={(e) => setNewForm({ ...newForm, cryptocurrency: e.target.value })}
                className="w-full bg-[#141923] border border-[#1f2937] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10b981]"
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#a1a1aa] mb-1 block">Blockchain</label>
              <select 
                value={newForm.blockchain} 
                onChange={(e) => setNewForm({ ...newForm, blockchain: e.target.value })}
                className="w-full bg-[#141923] border border-[#1f2937] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10b981]"
              >
                <option value="ERC20">ERC20</option>
                <option value="TRC20">TRC20</option>
                <option value="BEP20">BEP20</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#a1a1aa] mb-1 block">Wallet Address</label>
            <input 
              value={newForm.walletAddress} 
              onChange={(e) => setNewForm({ ...newForm, walletAddress: e.target.value })}
              type="text" className="w-full bg-[#141923] border border-[#1f2937] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#10b981]" placeholder="0x..." />
          </div>
          <div>
            <label className="text-xs text-[#a1a1aa] mb-1 block">QR Code Image</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#141923] border border-[#1f2937] hover:border-[#10b981] rounded-lg cursor-pointer transition-colors text-white text-sm">
                <Upload size={16} />
                Upload Image
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden" 
                />
              </label>
              {newForm.qrCodeUrl && (
                <img src={newForm.qrCodeUrl} alt="QR Preview" className="h-10 w-10 object-contain rounded bg-white p-1" />
              )}
              {newForm.qrCodeUrl && (
                <button onClick={() => setNewForm({...newForm, qrCodeUrl: ""})} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              )}
            </div>
          </div>
          <button onClick={handleCreate} className="bg-[#10b981] hover:bg-[#059669] text-black font-bold py-2 rounded-lg transition-colors mt-2">
            Save Configuration
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wallets.map((wallet) => {
          const isEditing = editingId === wallet.id;
          const currentQrUrl = isEditing && editForm.qrCodeUrl !== undefined ? editForm.qrCodeUrl : wallet.qrCodeUrl;

          return (
            <div key={wallet.id} className="p-6 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Wallet className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{wallet.cryptocurrency}</h3>
                    <p className="text-xs text-[#a1a1aa]">{wallet.blockchain}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newStatus = !wallet.isActive;
                    setEditForm({ isActive: newStatus });
                    handleUpdate(wallet.id);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${wallet.isActive ? 'text-[#34d399] bg-[#064e3b]' : 'text-[#f87171] bg-[#7f1d1d]'}`}
                >
                  {wallet.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* QR Code Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#a1a1aa] font-medium">QR Code</span>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#141923] border border-[#1f2937] hover:border-[#10b981] rounded-lg cursor-pointer transition-colors text-white text-xs flex-1">
                      <Upload size={14} />
                      Upload New QR Image
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="hidden" 
                      />
                    </label>
                    {currentQrUrl && (
                      <img src={currentQrUrl} alt="QR Preview" className="h-10 w-10 object-contain rounded bg-white p-1 shrink-0" />
                    )}
                  </div>
                ) : (
                  <div className="w-full bg-[#141923] border border-[#1f2937] rounded-lg p-3 flex items-center gap-3">
                    {wallet.qrCodeUrl ? (
                       <img src={wallet.qrCodeUrl} alt="QR Code" className="h-16 w-16 object-contain rounded bg-white p-1" />
                    ) : (
                      <span className="text-xs text-[#a1a1aa]">No QR Code uploaded</span>
                    )}
                  </div>
                )}
              </div>

              {/* Wallet Address Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#a1a1aa] font-medium">Wallet Address</span>
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <button onClick={() => handleUpdate(wallet.id)} className="flex items-center gap-1.5 text-[#10b981] text-xs font-medium hover:text-[#059669] transition-colors">
                        <Save size={12} /> Save
                      </button>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(wallet.id); setEditForm({ walletAddress: wallet.walletAddress, qrCodeUrl: wallet.qrCodeUrl || "" }); }} className="flex items-center gap-1.5 text-[#10b981] text-xs font-medium hover:text-[#059669] transition-colors">
                          <Edit size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(wallet.id)} className="flex items-center gap-1.5 text-red-500 text-xs font-medium hover:text-red-400 transition-colors">
                          <Trash size={12} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center bg-[#141923] border border-[#1f2937] rounded-lg px-3 py-2.5">
                  <input
                    type="text"
                    readOnly={!isEditing}
                    value={isEditing ? editForm.walletAddress : wallet.walletAddress}
                    onChange={(e) => setEditForm({ ...editForm, walletAddress: e.target.value })}
                    className={`bg-transparent border-none outline-none text-white text-sm w-full font-mono ${isEditing ? 'border-b border-[#10b981]' : ''}`}
                  />
                  {!isEditing && (
                    <button onClick={() => handleCopy(wallet.walletAddress)} className="text-[#a1a1aa] hover:text-white transition-colors ml-2 shrink-0">
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              </div>


              {/* Info Box */}
              <div className="bg-[#1e3a8a]/20 border border-[#1e3a8a]/50 rounded-lg p-3">
                <p className="text-xs text-[#60a5fa]">Users will deposit to this address when selecting {wallet.cryptocurrency} on {wallet.blockchain} network.</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Wallet Button */}
      {!isAddingNew && (
        <button onClick={() => setIsAddingNew(true)} className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Plus size={18} />
          Add New Wallet Configuration
        </button>
      )}

      {/* Important Information */}
      <div className="mt-8 pt-6 border-t border-[#1f2937]">
        <h3 className="text-sm font-semibold text-white mb-4">Important Information</h3>
        <ul className="space-y-3">
          {[
            "Ensure wallet addresses are correct before saving. Incorrect addresses may result in lost funds.",
            "QR codes should be high quality and scannable. Test them before updating.",
            "Each crypto-blockchain combination should have a unique wallet address.",
            "Changes take effect immediately for all new deposit requests."
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 shrink-0" />
              <span className="text-xs text-[#a1a1aa]">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
