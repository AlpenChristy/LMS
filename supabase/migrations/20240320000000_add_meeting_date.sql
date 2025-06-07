-- Add meeting_date column to leads table
ALTER TABLE leads
ADD COLUMN meeting_date TIMESTAMP WITH TIME ZONE;

-- Update existing rows to have NULL meeting_date
UPDATE leads
SET meeting_date = NULL
WHERE meeting_date IS NULL; 