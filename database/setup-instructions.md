# Privault — Database Setup Instructions

This guide will help you set up the Supabase database for the Privault application. We have consolidated the entire schema (tables, indexes, Row Level Security policies, and triggers) into a single SQL script to make this as simple as possible.

## Prerequisites

1. You already have a Supabase project created.
2. You have copied your **Project URL** and **anon key** into your `.env.local` file.

## Step 1: Run the Schema Script

1. Open your Supabase Dashboard ([https://supabase.com/dashboard](https://supabase.com/dashboard)).
2. Select your `Privault` project.
3. In the left sidebar, click on **SQL Editor** (it looks like a terminal/code icon `</>`).
4. Click on **+ New query**.
5. Open the local file `database/sql/schema.sql` in your code editor.
6. Select all text (`Ctrl+A` or `Cmd+A`) and copy it.
7. Paste it into the Supabase SQL Editor.
8. Click the green **Run** button (or press `Cmd+Enter` / `Ctrl+Enter`).

You should see a success message that says "Success. No rows returned".

## Step 2: Verify the Setup

You can verify everything was set up correctly by running these individual queries in new SQL Editor tabs:

**Verify Tables:**
```sql
\dt
```
*(You should see `profiles`, `vault_credentials`, `password_history`, `vault_otp_verifications`, `audit_log`, and `security_events`)*

**Verify Row Level Security Policies:**
```sql
select * from pg_policies;
```
*(You should see multiple policies enforcing `auth.uid() = user_id` on all public tables)*

**Verify Triggers:**
```sql
select trigger_name, event_manipulation, action_statement from information_schema.triggers where trigger_schema = 'public';
```
*(You should see `trg_profiles_updated_at` and `trg_vault_credentials_updated_at`)*

## What just happened?

Running `schema.sql` accomplished the following:
1. Created all 6 required database tables with strict typing and defaults.
2. Created the necessary Foreign Key relationships binding everything to Supabase Auth (`auth.users`).
3. Created performance indexes so queries relating to an individual user are fast.
4. Enabled **Row Level Security (RLS)** on all tables, ensuring users can strictly only access data associated with their own `user_id`.
5. Created PostgreSQL triggers to automatically keep the `updated_at` timestamp accurate when records change.

## Next Steps

Once the database is set up and verified, return to the Privault application development (Phase 2).
