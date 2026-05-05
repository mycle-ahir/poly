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
  return { ok: res.ok, status: res.status, data };
}

async function testWithdrawalFlow() {
  console.log("🚀 Testing Withdrawal Rules...");

  // Login as the user created in previous test
  // Since we don't have the exact email, let's create a new one.
  const uniqueEmail = `withdraw_test_${Date.now()}@example.com`;
  const regRes = await fetchAPI("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: uniqueEmail, password: "Password123" }),
  });
  const userToken = regRes.data.accessToken;
  const userHeaders = { Authorization: `Bearer ${userToken}` };

  // 2. Admin gives account via backend direct insertion just for speed:
  // Instead of full flow, we'll use Prisma directly to mock a perfect scenario.
}

// Just checking if we can request a withdrawal on the previous user.
// I will just use Prisma in a script to see if rules block it.
