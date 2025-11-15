-- Create scans table to store website security scan results
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  score INTEGER NOT NULL,
  ssl_data JSONB,
  headers_data JSONB,
  vulnerabilities_data JSONB,
  dns_data JSONB,
  whois_data JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on url for faster lookups
CREATE INDEX idx_scans_url ON public.scans(url);

-- Create index on created_at for time-based queries
CREATE INDEX idx_scans_created_at ON public.scans(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert scan results (public scanner)
CREATE POLICY "Anyone can insert scan results"
  ON public.scans
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Anyone can view scan results
CREATE POLICY "Anyone can view scan results"
  ON public.scans
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create function to clean up old scans (older than 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_scans()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.scans
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;