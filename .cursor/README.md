# Supabase MCP Setup

The Supabase MCP connects Cursor to your Supabase project for database operations (migrations, SQL, listing tables, etc.).

## 1. Get Your Credentials

### Access Token
1. Go to [Supabase Account Tokens](https://supabase.com/dashboard/account/tokens)
2. Click **Generate new token**
3. Name it (e.g. "Cursor MCP") and copy the token (starts with `sbp_`)

### Project Reference
- **Option A:** From your Supabase URL: `https://YOUR_PROJECT_REF.supabase.co` → the subdomain is your project ref
- **Option B:** Supabase Dashboard → Project Settings → General → **Reference ID**

## 2. Configure MCP

Edit `.cursor/mcp.json` (or copy from `mcp.json.example` if missing) and replace:
- `YOUR_PROJECT_REF` → your project reference (e.g. `abcdefghijklmnop`)
- `YOUR_ACCESS_TOKEN` → your token from step 1

**Note:** `.cursor/mcp.json` is gitignored so your token is never committed.

## 3. Restart Cursor

Fully quit and reopen Cursor for the MCP server to connect.

## 4. Verify Connection

Ask the AI: *"List all tables in my Supabase database using MCP"* or *"What migrations are applied?"*
