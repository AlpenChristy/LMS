import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/Lead';
import { toast } from '@/hooks/use-toast';

// Default user ID for all operations
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        console.log('=== useLeads Hook ===');
        console.log('Starting to fetch leads...');
        
        const { data, error } = await supabaseAdmin
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching leads:', error);
          throw error;
        }

        console.log('Raw data from database:', data);
        
        // Ensure all required fields are present
        const formattedLeads = (data || []).map(lead => ({
          ...lead,
          status: lead.status as LeadStatus,
          proposal_status: lead.proposal_status || 'not_given',
          meeting_date: lead.meeting_date || null,
          meeting_time: lead.meeting_time || null,
          created_at: lead.created_at || null,
          updated_at: lead.updated_at || null,
          user_id: lead.user_id || DEFAULT_USER_ID
        })) as Lead[];

        console.log('Formatted leads:', formattedLeads);
        console.log('Number of leads:', formattedLeads.length);
        console.log('First lead (if any):', formattedLeads[0]);
        
        setLeads(formattedLeads);
      } catch (error) {
        console.error('Error in useLeads:', error);
        toast({
          title: "Error",
          description: "Failed to fetch leads",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();

    // Subscribe to changes
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads'
        }, 
        async (payload) => {
          console.log('Received realtime update:', payload);
          if (payload.eventType === 'INSERT') {
            // Fetch the complete lead data with meeting summaries
            const { data, error } = await supabaseAdmin
              .from('leads')
              .select(`
                *,
                meeting_summaries (
                  id,
                  lead_id,
                  summary,
                  meeting_date,
                  created_at,
                  user_id
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              setLeads(prev => [{
                ...data,
                status: data.status as LeadStatus
              } as Lead, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the complete lead data with meeting summaries
            const { data, error } = await supabaseAdmin
              .from('leads')
              .select(`
                *,
                meeting_summaries (
                  id,
                  lead_id,
                  summary,
                  meeting_date,
                  created_at,
                  user_id
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              setLeads(prev => prev.map(lead => 
                lead.id === payload.new.id ? {
                  ...data,
                  status: data.status as LeadStatus
                } as Lead : lead
              ));
            }
          } else if (payload.eventType === 'DELETE') {
            setLeads(prev => prev.filter(lead => lead.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addLead = async (newLead: Omit<Lead, 'id' | 'created_at' | 'meeting_summaries'>) => {
    try {
      // Format the meeting date and time
      const formattedLead = {
        ...newLead,
        meeting_date: newLead.meeting_date ? new Date(newLead.meeting_date).toISOString() : null,
        meeting_time: newLead.meeting_time || null,
        created_at: new Date().toISOString(),
        user_id: DEFAULT_USER_ID
      };

      // First insert the lead
      const { data: insertedLead, error: insertError } = await supabaseAdmin
        .from('leads')
        .insert([formattedLead])
        .select()
        .single();

      if (insertError) throw insertError;

      // Then fetch the complete lead data with meeting summaries
      const { data, error: fetchError } = await supabaseAdmin
        .from('leads')
        .select(`
          *,
          meeting_summaries (
            id,
            lead_id,
            summary,
            meeting_date,
            created_at,
            user_id
          )
        `)
        .eq('id', insertedLead.id)
        .single();

      if (fetchError) throw fetchError;

      // Update local state with the new lead
      const typedData = {
        ...data,
        status: data.status as LeadStatus
      } as Lead;
      
      setLeads(prev => [typedData, ...prev]);

      toast({
        title: "Success",
        description: "Lead added successfully"
      });

      return typedData;
    } catch (error) {
      console.error('Error adding lead:', error);
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateLead = async (updatedLead: Lead) => {
    try {
      // Validate that we have a valid lead ID
      if (!updatedLead?.id) {
        throw new Error('Invalid lead ID');
      }

      // Extract only the fields that belong to the leads table
      const { meeting_summaries, ...leadData } = updatedLead;

      // Format the meeting date and time
      const formattedLead = {
        ...leadData,
        meeting_date: leadData.meeting_date ? new Date(leadData.meeting_date).toISOString() : null,
        meeting_time: leadData.meeting_time || null,
        user_id: DEFAULT_USER_ID
      };

      // First update the lead
      const { error: updateError } = await supabaseAdmin
        .from('leads')
        .update(formattedLead)
        .eq('id', updatedLead.id);

      if (updateError) throw updateError;

      // Then fetch the complete lead data with meeting summaries
      const { data, error: fetchError } = await supabaseAdmin
        .from('leads')
        .select(`
          *,
          meeting_summaries (
            id,
            lead_id,
            summary,
            meeting_date,
            created_at,
            user_id
          )
        `)
        .eq('id', updatedLead.id)
        .single();

      if (fetchError) throw fetchError;

      // Update local state with the updated lead
      const typedData = {
        ...data,
        status: data.status as LeadStatus
      } as Lead;

      setLeads(prev => prev.map(lead => 
        lead.id === updatedLead.id ? typedData : lead
      ));

      toast({
        title: "Success",
        description: "Lead updated successfully"
      });

      return typedData;
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update lead",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      // Update local state by removing the deleted lead
      setLeads(prev => prev.filter(lead => lead.id !== leadId));

      toast({
        title: "Success",
        description: "Lead deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive"
      });
    }
  };

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead
  };
};
