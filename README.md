This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Funded_flip

how to test user and a normal account :- 
To test the Test Active Account feature effectively, you need to simulate both the "Breach" (Instant Failure) and the "Evaluation" (Pass/Fail at the end of the period) scenarios.

Here is the step-by-step guide to testing this:

1. Initial Setup (Creating the Account)
Purchase: Go to the /user/purchase page and select ONE-STEP TEST.
Approve: In your database (or via the Admin Panel), find the Order/Deposit and set the status to APPROVED.
Verify: Ensure the Account status is now TEST_ACTIVE. You should see the "Test in Progress" UI in the user dashboard.
2. Testing Instant Failure (Drawdown Breach)
The system checks for breaches every time a trade is placed.

The Scenario: A test account has a $1,000 capital and a 20% daily drawdown limit ($200).
The Action: Place a trade with a stake of $201.
Expected Result:
The API (/api/trades) should return a message saying the account has been breached.
The account status in the database should immediately change to TEST_FAILED.
The user should no longer be able to place trades.
3. Testing Test Completion (Pass/Fail)
Evaluation happens via the Cron job (found in app/api/cron/route.ts). Since you don't want to wait 14 days, you can "force" the test to end by manipulating the database.

Step A: Mock the Test Completion Data
Use npx prisma studio or a script to modify a TEST_ACTIVE account:

Set testEndDate to a date in the past (e.g., yesterday).
To test PASSING:
Set testTradesCount to 4 or more.
Set currentBalance to 125% of your capitalSize (e.g., $1,250 for a $1,000 account).
To test FAILING:
Set testTradesCount to 2 (less than the required 4).
Or set currentBalance to 110% (less than the required 125%).
Step B: Trigger the Evaluation
Call the cron endpoint manually in your browser or via Postman:

http
GET /api/cron
(Note: If you are in production, you'll need to append ?secret=your_secret_key)

Step C: Verify Results
Check the account status. It should have transitioned from TEST_ACTIVE to either TEST_PASSED or TEST_FAILED based on the data you set in Step A.
Summary of Rules to Verify:
Rule	Success Requirement	Failure Trigger
Profit Target	Balance ≥ Capital + 25%	Balance < Capital + 25% at testEndDate
Min Trades	testTradesCount ≥ 4	testTradesCount < 4 at testEndDate
Daily Loss	Stay below 20% of starting day balance	Stake/Loss > 20% (Instant)
Lifetime Loss	Stay below 30% of initial capital	Balance < 70% of Capital (Instant)


