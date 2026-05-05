import "dotenv/config";

const BASE_URL = "http://localhost:3000/api";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`API Error ${res.status} at ${endpoint}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function testFlow() {
  console.log("🚀 Starting E2E API Test Flow...");
  const uniqueEmail = `test_${Date.now()}@example.com`;
  const password = "Password123";

  // 1. Register User
  console.log(`\n[1] Registering new user: ${uniqueEmail}`);
  const regRes = await fetchAPI("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: uniqueEmail, password, fullName: "Test User" }),
  });
  const userToken = regRes.accessToken;
  const userHeaders = { Authorization: `Bearer ${userToken}` };
  console.log("✅ User registered successfully.");

  // 2. Create Order
  console.log("\n[2] Creating an order (100k INSTANT)...");
  const orderRes = await fetchAPI("/orders", {
    method: "POST",
    headers: userHeaders,
    body: JSON.stringify({ accountType: "INSTANT", capitalSize: 10000 }), // wait, capitalSize in config has 10000.
  });
  const orderId = orderRes.order.id;
  console.log(`✅ Order created (ID: ${orderId})`);

  // 3. Submit Deposit
  console.log("\n[3] Submitting deposit...");
  const depositRes = await fetchAPI("/deposits", {
    method: "POST",
    headers: userHeaders,
    body: JSON.stringify({
      orderId,
      cryptocurrency: "USDT",
      blockchain: "ERC20",
      txHash: "0xTestDepositHash1234567890",
    }),
  });
  const depositId = depositRes.deposit.id;
  console.log(`✅ Deposit submitted (ID: ${depositId})`);

  // 4. Admin Login
  console.log("\n[4] Admin login...");
  const adminRes = await fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@fundedflips.com", password: "Admin@123456" }),
  });
  const adminToken = adminRes.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  console.log("✅ Admin logged in.");

  // 5. Admin Approve Deposit (Creates Account)
  console.log("\n[5] Admin approving deposit...");
  await fetchAPI("/admin/deposits", {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({ depositId, action: "APPROVE" }),
  });
  console.log("✅ Deposit approved & Trading Account created.");

  // 6. User Dashboard (Check Account & Balance)
  console.log("\n[6] Fetching user dashboard...");
  const dashRes = await fetchAPI("/user/dashboard", { headers: userHeaders });
  const account = dashRes.dashboard.account;
  console.log(`✅ Account found (Balance: $${account.currentBalance})`);

  // 7. Place a Trade
  console.log("\n[7] Placing a trade...");
  // Match start time needs to be > 10 mins from now.
  const futureTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); 
  const tradeRes = await fetchAPI("/trades", {
    method: "POST",
    headers: userHeaders,
    body: JSON.stringify({
      accountId: account.id,
      matchId: "match_123",
      matchTitle: "Test Match",
      matchStartTime: futureTime,
      selection: "Team A",
      odds: 2.0,
      stake: 500, // 5% of 10k, max is 20%
    }),
  });
  console.log(`✅ Trade placed successfully (New Balance: $${tradeRes.trade.stake}) wait, the balance is updated. let's check dashboard again`);

  const dashAfterTrade = await fetchAPI("/user/dashboard", { headers: userHeaders });
  console.log(`✅ Balance after trade: $${dashAfterTrade.dashboard.account.currentBalance}`);

  console.log("\n🎉 All API checks passed successfully!");
}

testFlow().catch((e) => {
  console.error("\n❌ Test Failed:");
  console.error(e.message);
  process.exit(1);
});
