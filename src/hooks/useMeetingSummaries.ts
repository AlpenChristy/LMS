import { useState } from 'react';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { MeetingSummary } from '@/types/Lead';
import { toast } from '@/hooks/use-toast';

// Default user ID for all operations
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export const useMeetingSummaries = () => {
  const addMeetingSummary = async (leadId: string, summary: string) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('meeting_summaries')
        .insert([{
          lead_id: leadId,
          summary,
          meeting_date: new Date().toISOString(),
          user_id: DEFAULT_USER_ID
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meeting summary added successfully"
      });

      return data;
    } catch (error) {
      console.error('Error adding meeting summary:', error);
      toast({
        title: "Error",
        description: "Failed to add meeting summary",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateMeetingSummary = async (summaryId: string, summary: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('meeting_summaries')
        .update({ summary })
        .eq('id', summaryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meeting summary updated successfully"
      });
    } catch (error) {
      console.error('Error updating meeting summary:', error);
      toast({
        title: "Error",
        description: "Failed to update meeting summary",
        variant: "destructive"
      });
    }
  };

  const deleteMeetingSummary = async (summaryId: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('meeting_summaries')
        .delete()
        .eq('id', summaryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meeting summary deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting meeting summary:', error);
      toast({
        title: "Error",
        description: "Failed to delete meeting summary",
        variant: "destructive"
      });
    }
  };

  return {
    addMeetingSummary,
    updateMeetingSummary,
    deleteMeetingSummary
  };
}; 