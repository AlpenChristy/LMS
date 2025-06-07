-- Add username and password columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN username text UNIQUE,
ADD COLUMN password text;
 
-- Create index on username for faster lookups
CREATE INDEX idx_profiles_username ON public.profiles(username); 