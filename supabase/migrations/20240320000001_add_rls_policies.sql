-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to profiles table
CREATE POLICY "Allow read access to profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Create policy to allow insert access to profiles table
CREATE POLICY "Allow insert access to profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Create policy to allow update access to profiles table
CREATE POLICY "Allow update access to profiles"
ON public.profiles
FOR UPDATE
USING (true)
WITH CHECK (true); 