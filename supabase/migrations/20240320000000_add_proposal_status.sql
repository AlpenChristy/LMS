-- Add proposal_status column to leads table
ALTER TABLE leads
ADD COLUMN proposal_status TEXT NOT NULL DEFAULT 'not_given'
CHECK (proposal_status IN ('not_given', 'given', 'approved', 'rejected'));

-- Update existing rows to have the default value
UPDATE leads
SET proposal_status = 'not_given'
WHERE proposal_status IS NULL; 