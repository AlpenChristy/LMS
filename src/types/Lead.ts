export type LeadStatus = 'new' | 'contacted' | 'negotiation' | 'won' | 'lost' | 'payment_pending';

export type ProposalStatus = 'not_given' | 'given' | 'approved' | 'rejected';

export interface MeetingSummary {
  id: string;
  lead_id: string;
  summary: string;
  meeting_date: string | null;
  created_at: string | null;
  user_id: string;
}

export interface Lead {
  id: string;
  company_name: string;
  lead_source: string;
  assigned_to: string;
  requirements: string | null;
  deadline: string | null;
  potential: number | null;
  last_follow_up: string | null;
  next_follow_up: string | null;
  address: string | null;
  contact_number: string;
  email: string;
  status: LeadStatus;
  proposal_status: ProposalStatus;
  meeting_date: string | null;
  meeting_time: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  meeting_summaries: MeetingSummary[];
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}
