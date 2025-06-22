# Privault Database Setup Instructions

## 🚀 How to Set Up Your Privault Database in Supabase

Follow these steps to create your Privault database schema in your Supabase project:

### Step 1: Access Your Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your **Privault project** (the one with URL: `https://yjwykjvtnnacdzkyiqqw.supabase.co`)

### Step 2: Open the SQL Editor
1. In your project dashboard, look for **"SQL Editor"** in the left sidebar
2. Click on **"SQL Editor"**
3. Click **"New Query"** to create a new SQL query

### Step 3: Run the Schema Script
1. **Copy the entire contents** of the `schema.sql` file 
2. **Paste it** into the SQL Editor
3. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)

### Step 4: Verify the Setup
After running the script, you should see:
- ✅ A success message: `"Privault database schema created successfully! 🎉"`
- ✅ All tables created in the **Table Editor**

### Step 5: Check Your Tables
Go to **"Table Editor"** in the sidebar and verify you have these tables:

#### 📋 **Core Tables Created:**
- **`profiles`** - User metadata and encryption salt
- **`vaults`** - Encrypted vault data (single blob approach)
- **`vault_items`** - Individual encrypted credentials (alternative approach)  
- **`password_history`** - Password change history

#### 🔒 **Security Features Enabled:**
- **Row Level Security (RLS)** on all tables
- **User isolation policies** (users can only access their own data)
- **Automatic timestamps** with triggers
- **Performance indexes** on key columns

### Step 6: Configure Authentication (If Not Done)
1. Go to **"Authentication"** in the sidebar
2. Under **"Settings"** → **"General"**:
   - Enable **"Enable email confirmations"** (recommended)
   - Set **"Site URL"** to `http://localhost:3000` for development
3. Under **"Auth"** → **"Providers"**:
   - Ensure **"Email"** provider is enabled

## 🔍 Verification Queries

After setup, you can run these queries in the SQL Editor to verify everything is working:

### Check RLS is Enabled:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'vaults', 'vault_items', 'password_history');
```
*Should return `true` for all tables*

### Check Policies Exist:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'vaults', 'vault_items', 'password_history');
```
*Should return multiple rows showing the security policies*

## 🎯 What This Schema Provides

### **Zero-Knowledge Architecture:**
- **Client-side encryption only** - Supabase never sees unencrypted data
- **User-specific salt storage** for PBKDF2 key derivation
- **Individual user data isolation** via RLS policies

### **Two Storage Approaches:**
1. **`vaults` table**: Single encrypted JSON blob per user (simpler)
2. **`vault_items` table**: Individual encrypted credentials (more granular)

*You can choose which approach to use in your application logic*

### **Security Features:**
- **Automatic CASCADE deletion** when user account is deleted
- **Data validation constraints** (email format, salt length, etc.)
- **Timestamp tracking** with automatic updates
- **Performance indexes** for efficient queries

## ⚠️ Important Security Notes

1. **Never store unencrypted passwords** in the database
2. **Master passphrases never leave the client** 
3. **All sensitive data is encrypted client-side** before sending to Supabase
4. **RLS policies ensure users can only access their own data**

## 🚨 Troubleshooting

### If you get permission errors:
- Make sure you're running the query as the **project owner**
- Try refreshing the page and running again

### If tables already exist:
- The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
- You can drop existing tables first if you want a clean start

### If you need to reset:
```sql
-- ⚠️ WARNING: This will delete ALL data
DROP TABLE IF EXISTS password_history;
DROP TABLE IF EXISTS vault_items;  
DROP TABLE IF EXISTS vaults;
DROP TABLE IF EXISTS profiles;
```

## ✅ Next Steps After Setup

Once your database is ready:
1. ✅ **Phase 2.2 Complete** - Database schema created
2. 🚀 **Ready for Phase 3** - Authentication system
3. 🔐 **Ready for Phase 4** - Cryptographic foundation

Your Privault database is now ready for zero-knowledge password management! 🎉 