# Database Migration Instructions

## New Columns Added

The following new columns have been added to the database schema:

### Clients Table
- `capture_name` (BOOLEAN, DEFAULT FALSE) - Controls whether to capture name field
- `capture_phone` (BOOLEAN, DEFAULT FALSE) - Controls whether to capture phone field

### Leads Table
- `name` (TEXT) - Optional name of the lead
- `phone` (TEXT) - Optional phone number of the lead

## Manual Migration Required

Due to Node.js version compatibility issues with Drizzle Kit, the database migration needs to be run manually.

### SQL Migration Script

Run the following SQL commands in your database:

```sql
-- Add new columns to clients table
ALTER TABLE clients 
ADD COLUMN capture_name BOOLEAN DEFAULT FALSE,
ADD COLUMN capture_phone BOOLEAN DEFAULT FALSE;

-- Add new columns to leads table
ALTER TABLE leads 
ADD COLUMN name TEXT,
ADD COLUMN phone TEXT;
```

### How to Run

1. **Vercel/Neon Database**:
   - Go to your Vercel project settings
   - Find the database connection details
   - Use a PostgreSQL client (like psql, DBeaver, or TablePlus) to connect
   - Run the SQL commands above

2. **Local Development**:
   - Connect to your local PostgreSQL database
   - Run the SQL commands above

### Verification

After running the migration, verify the columns exist by running:

```sql
-- Check clients table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name IN ('capture_name', 'capture_phone');

-- Check leads table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN ('name', 'phone');
```

## Features Enabled by This Migration

Once the migration is complete, the following features will work:

1. **Dynamic Field Configuration**: Clients can enable/disable name and phone capture in dashboard
2. **Enhanced Lead Capture**: Forms will show/hide fields based on configuration
3. **Complete Lead Data**: Webhooks will include name and phone when available
4. **Adaptive Dashboard**: Lead table will show relevant columns based on configuration

## Troubleshooting

If you encounter the error "column 'capture_name' does not exist", it means this migration hasn't been applied yet.

The application will automatically work once these database columns are created.
