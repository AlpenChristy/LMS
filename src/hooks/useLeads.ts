
import { useState, useEffect } from 'react';
import { Lead } from '@/types/Lead';

// Mock data for demonstration
const mockLeads: Lead[] = [
  {
    id: '1',
    company_name: 'Tech Solutions Inc',
    lead_source: 'Website',
    assigned_to: 'John Doe',
    requirements: 'Need comprehensive CRM solution for 50+ employees',
    deadline: '2024-07-15',
    potential: 85,
    last_follow_up: '2024-06-01',
    next_follow_up: '2024-06-10',
    address: '123 Business Park, Tech City',
    contact_number: '+1-555-0123',
    email: 'contact@techsolutions.com',
    status: 'negotiation',
    created_at: '2024-05-15',
    meeting_summaries: []
  },
  {
    id: '2',
    company_name: 'Green Energy Corp',
    lead_source: 'LinkedIn',
    assigned_to: 'Jane Smith',
    requirements: 'Solar panel installation management system',
    deadline: '2024-08-01',
    potential: 60,
    last_follow_up: '2024-05-28',
    next_follow_up: '2024-06-05',
    address: '456 Green Ave, Eco City',
    contact_number: '+1-555-0456',
    email: 'info@greenenergy.com',
    status: 'contacted',
    created_at: '2024-05-10',
    meeting_summaries: []
  },
  {
    id: '3',
    company_name: 'StartupHub',
    lead_source: 'Referral',
    assigned_to: 'Mike Johnson',
    requirements: 'Simple lead tracking for startup accelerator',
    deadline: '2024-06-30',
    potential: 40,
    last_follow_up: '',
    next_follow_up: '2024-06-08',
    address: '789 Innovation St, StartupVille',
    contact_number: '+1-555-0789',
    email: 'hello@startuphub.com',
    status: 'new',
    created_at: '2024-06-01',
    meeting_summaries: []
  },
  {
    id: '4',
    company_name: 'Retail Masters',
    lead_source: 'Cold Call',
    assigned_to: 'Sarah Wilson',
    requirements: 'Inventory and customer management system',
    deadline: '2024-07-20',
    potential: 70,
    last_follow_up: '2024-05-30',
    next_follow_up: '2024-06-12',
    address: '321 Commerce Blvd, Retail District',
    contact_number: '+1-555-0321',
    email: 'orders@retailmasters.com',
    status: 'contacted',
    created_at: '2024-05-20',
    meeting_summaries: []
  },
  {
    id: '5',
    company_name: 'FinanceFirst',
    lead_source: 'Trade Show',
    assigned_to: 'David Brown',
    requirements: 'Financial services CRM with compliance features',
    deadline: '2024-09-15',
    potential: 95,
    last_follow_up: '2024-06-02',
    next_follow_up: '2024-06-15',
    address: '654 Finance Row, Banking Quarter',
    contact_number: '+1-555-0654',
    email: 'contact@financefirst.com',
    status: 'won',
    created_at: '2024-05-05',
    meeting_summaries: []
  }
];

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from localStorage or API
    const loadLeads = () => {
      const savedLeads = localStorage.getItem('leads');
      if (savedLeads) {
        setLeads(JSON.parse(savedLeads));
      } else {
        setLeads(mockLeads);
        localStorage.setItem('leads', JSON.stringify(mockLeads));
      }
      setIsLoading(false);
    };

    // Simulate network delay
    setTimeout(loadLeads, 1000);
  }, []);

  const saveLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    localStorage.setItem('leads', JSON.stringify(newLeads));
  };

  const addLead = (newLead: Omit<Lead, 'id' | 'created_at' | 'meeting_summaries'>) => {
    const lead: Lead = {
      ...newLead,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      meeting_summaries: []
    };
    const updatedLeads = [...leads, lead];
    saveLeads(updatedLeads);
  };

  const updateLead = (updatedLead: Lead) => {
    const updatedLeads = leads.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    );
    saveLeads(updatedLeads);
  };

  const deleteLead = (leadId: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    saveLeads(updatedLeads);
  };

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead
  };
};
