import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xlpdomximqpxgndyruub.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscGRvbXhpbXFweGduZHlydXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzQ1NzAsImV4cCI6MjEwMTYxMDU3MH0.45fbLGAhyODigv8tHQ-Pn240FlCsg4S4c2kDQ-Awc2Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
