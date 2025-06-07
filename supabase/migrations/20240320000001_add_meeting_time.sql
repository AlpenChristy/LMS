-- Add meeting_time column to leads table
ALTER TABLE leads
ADD COLUMN meeting_time TIME;

-- Update existing rows to have NULL meeting_time
UPDATE leads
SET meeting_time = NULL
WHERE meeting_time IS NULL; 