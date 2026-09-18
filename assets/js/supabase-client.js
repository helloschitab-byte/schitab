// SCHITAB — Supabase client
// Uses the public anon key, safe to expose in frontend code.
// All real access control is enforced by Row Level Security policies in the database.

const SUPABASE_URL = 'https://bvxsnipmcknwitrvsupp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2eHNuaXBtY2tud2l0cnZzdXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDg1NjEsImV4cCI6MjEwNTI4NDU2MX0.VXP3WjOzHoqLrPgeSYyupXtaKqMbb1KU_UNgRnFxMVk';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
