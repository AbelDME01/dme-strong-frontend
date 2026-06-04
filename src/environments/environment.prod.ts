export const environment = {
  production: true,
  // Same-origin relative path by default: works when the API is served behind
  // the same domain as the frontend (reverse proxy). Override with the absolute
  // backend URL (e.g. 'https://api.tu-dominio.com/api/v1') if hosted separately.
  apiUrl: '/api/v1',
  supabaseUrl: 'https://kxjnmhuwogwnrfsdculg.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4am5taHV3b2d3bnJmc2RjdWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODI5NjQsImV4cCI6MjA5MjQ1ODk2NH0.PeRNWDqxJy06sXVKjPbIJJ6kF3E5epAovKhMwyJVI5k',
};
