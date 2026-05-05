"use client";

import { useState, useEffect } from "react";
import { Loader2, Receipt, ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/user/login");
        return;
      }

      const res = await fetch(`/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(data.orders);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Order Receipts</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">View your past purchase orders and receipts.</p>
      </div>

      <div className="bg-[#0e1217] border border-[#1f2937] rounded-xl overflow-hidden min-h-[300px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-[#0e1217]/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
          </div>
        )}
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#a1a1aa] bg-[#0e1217] border-b border-[#1f2937]">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Account Type</th>
                <th className="px-6 py-4 font-medium">Amount Paid</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {orders.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#a1a1aa]">
                    No orders found.
                  </td>
                </tr>
              )}
              {orders.map((order) => {
                let statusIcon = <Clock size={14} className="text-[#eab308]" />;
                let statusColor = "text-[#eab308]";
                if (order.status === "APPROVED") {
                  statusIcon = <CheckCircle size={14} className="text-[#10b981]" />;
                  statusColor = "text-[#10b981]";
                } else if (order.status === "REJECTED") {
                  statusIcon = <XCircle size={14} className="text-[#ef4444]" />;
                  statusColor = "text-[#ef4444]";
                }

                return (
                  <tr key={order.id} className="hover:bg-[#141923]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[#a1a1aa]">
                      {order.hashId}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#e2e8f0]">
                        {order.accountType.replace("_", " ")}
                      </span>
                      <div className="text-xs text-[#a1a1aa] mt-0.5">
                        ${order.capitalSize.toLocaleString()} Capital
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ${order.finalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 ${statusColor} font-medium text-xs`}>
                        {statusIcon}
                        {order.status.replace("_", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-[#a1a1aa] hover:text-[#3b82f6] hover:bg-[#1f2937] rounded-md transition-all inline-flex items-center gap-2"
                      >
                        <Receipt size={16} /> <span className="sr-only sm:not-sr-only text-xs">View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1217] border border-[#1f2937] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#1f2937] bg-[#141923] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Receipt className="text-[#3b82f6]" /> Order Receipt
                </h2>
                <p className="text-xs text-[#a1a1aa] font-mono mt-1">ID: {selectedOrder.hashId}</p>
              </div>
              {selectedOrder.status === "APPROVED" && (
                <div className="bg-[#064e3b] text-[#34d399] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#047857]">
                  PAID
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-end border-b border-[#1f2937] pb-4">
                <div className="text-[#a1a1aa] text-sm">Date</div>
                <div className="text-white text-right">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
              </div>
              
              <div className="flex justify-between items-end border-b border-[#1f2937] pb-4">
                <div className="text-[#a1a1aa] text-sm">Account Type</div>
                <div className="text-white text-right font-medium">{selectedOrder.accountType.replace("_", " ")}</div>
              </div>
              
              <div className="flex justify-between items-end border-b border-[#1f2937] pb-4">
                <div className="text-[#a1a1aa] text-sm">Capital Size</div>
                <div className="text-white text-right">${selectedOrder.capitalSize.toLocaleString()}</div>
              </div>

              {selectedOrder.discountPct > 0 && (
                <div className="flex justify-between items-end border-b border-[#1f2937] pb-4">
                  <div className="text-[#a1a1aa] text-sm">Discount</div>
                  <div className="text-[#10b981] text-right font-medium">{selectedOrder.discountPct}% OFF</div>
                </div>
              )}

              {selectedOrder.deposit && (
                <div className="flex justify-between items-end border-b border-[#1f2937] pb-4">
                  <div className="text-[#a1a1aa] text-sm">Payment Method</div>
                  <div className="text-white text-right">
                    {selectedOrder.deposit.cryptocurrency} ({selectedOrder.deposit.blockchain})
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-end pt-4">
                <div className="text-[#a1a1aa] text-sm">Total Amount</div>
                <div className="text-2xl font-bold text-white">${selectedOrder.finalPrice.toFixed(2)}</div>
              </div>
            </div>

            <div className="p-6 bg-[#141923] border-t border-[#1f2937] flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2 text-sm font-medium bg-[#1f2937] text-white rounded-lg hover:bg-[#374151] transition-colors"
              >
                Print
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-4 py-2 text-sm font-medium bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
