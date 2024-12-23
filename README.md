## Getting Started

### Prerequisites

Before you begin, you'll need to set up accounts and configure a few services:

1. **Open Format Dashboard**

   - Create an account at [Open Format Dashboard](https://app.openformat.tech)
   - Generate an API key to get your `OPENFORMAT_API_KEY`

2. **Privy Dashboard**

   - Create an account at [Privy Dashboard](https://dashboard.privy.io)
   - Create a new app to get your `NEXT_PUBLIC_PRIVY_APP_ID` and `PRIVY_APP_SECRET` from the Settings section of your Privy app
   - In the Login Methods section of your Privy app, enable:
     - Discord
     - Telegram
     - Email

3. **Database**
   - Set up a [Supabase](https://supabase.com) project, or use any PostgreSQL database
   - Get your database connection string to set as `DATABASE_URL`
   - If using Supabase, use the pool connection string from the project settings

### Environment Variables

All environment variables are required for the application to function properly:

| Variable                      | Description                                                                      | Reference                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_PRIVY_APP_ID`    | Public app ID for Privy social wallet and authentication                         | [Privy Dashboard](https://dashboard.privy.io)                                                   |
| `PRIVY_APP_SECRET`            | Secret key for Privy server-side operations                                      | [Privy Dashboard](https://dashboard.privy.io)                                                   |
| `DATABASE_URL`                | PostgreSQL connection string for storing community metadata and branding         | [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres) |
| `NEXT_PUBLIC_THIRDWEB_CLIENT` | Public client ID for Thirdweb IPFS storage                                       | [Thirdweb Dashboard](https://thirdweb.com/dashboard)                                            |
| `THIRDWEB_SECRET`             | Secret key for Thirdweb server-side operations                                   | [Thirdweb Dashboard](https://thirdweb.com/dashboard)                                            |
| `OPENFORMAT_API_KEY`          | API key for Open Format leaderboard generation                                   | [Open Format Dashboard](https://app.openformat.tech)                                            |
| `OPENFORMAT_API_URL`          | Base URL for Open Format API endpoints (default: https://api.openformat.tech/v1) | [Open Format Docs](https://docs.openformat.tech)                                                |

### Deploy

Instantly deploy your own copy of the template using Vercel or Netlify:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopen-format%2Fcommunity-platform&env=NEXT_PUBLIC_PRIVY_APP_ID,PRIVY_SECRET,DATABASE_URL,NEXT_PUBLIC_THIRDWEB_CLIENT,THIRDWEB_SECRET,OPENFORMAT_API_KEY,OPENFORMAT_API_URL) [![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/open-format/community-platform)

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/open-format/community-platform.git
   cd community-platform
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

   the postinstall script will run the following commands:

   ```bash
   npm run db:generate // generate the schema
   npm run db:migrate // migrate the schema
   ```

3. Copy the `.env.example` file to `.env` and fill in the missing values:

   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
