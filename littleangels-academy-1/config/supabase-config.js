// Supabase Configuration
// Copy these values to your .env.local file

export const SUPABASE_CONFIG = {
  url: 'https://zvkfuljxidxtuqrmquso.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTQxMTgsImV4cCI6MjA3MTUzMDExOH0.aL72I0Ls2ziZs2EJaX_bpMkI9gj8AGHFModINaQVb_8',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk',
  jwtSecret: 'c0F6fODkXb3tFizctX9hQ4rO4Rv/GIZhKNZOD+VIoE6kagzsHzRo3TemrSOjlc212gmRuPCmD4Vnz8LQ0OweLQ=='
};

// Environment variables template
export const ENV_TEMPLATE = `
# Supabase Configuration
VITE_SUPABASE_URL=https://zvkfuljxidxtuqrmquso.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTQxMTgsImV4cCI6MjA3MTUzMDExOH0.aL72I0Ls2ziZs2EJaX_bpMkI9gj8AGHFModINaQVb_8

# Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk

# JWT Secret
SUPABASE_JWT_SECRET=c0F6fODkXb3tFizctX9hQ4rO4Rv/GIZhKNZOD+VIoE6kagzsHzRo3TemrSOjlc212gmRuPCmD4Vnz8LQ0OweLQ==

# App Configuration
VITE_APP_NAME=Little Angels Academy
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Map Configuration (for GPS tracking)
VITE_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw

# SMS Configuration (for notifications)
VITE_SMS_API_KEY=your_sms_api_key_here
VITE_SMS_SENDER_ID=LittleAngels

# M-Pesa Configuration (for payments)
VITE_MPESA_CONSUMER_KEY=your_mpesa_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
VITE_MPESA_SHORTCODE=your_mpesa_shortcode
VITE_MPESA_PASSKEY=your_mpesa_passkey

# Email Configuration
VITE_EMAIL_FROM=noreply@littleangels.ac.ke
VITE_EMAIL_SERVICE=gmail

# School Configuration
VITE_SCHOOL_NAME=Little Angels Academy
VITE_SCHOOL_ADDRESS=Nairobi, Kenya
VITE_SCHOOL_PHONE=+254700000000
VITE_SCHOOL_EMAIL=info@littleangels.ac.ke
`;
