
export interface Lead {
  id: string;
  user_id?: string;
  company_name: string;
  lead_source: string;
  assigned_to: string;
  requirements: string;
  deadline: string;
  potential: number;
  last_follow_up: string;
  next_follow_up: string;
  address: string;
  contact_number: string;
  email: string;
  status: 'new' | 'contacted' | 'negotiation' | 'won' | 'lost';
  meeting_summaries: MeetingSummary[];
  created_at: string;
  updated_at?: string;
}

export interface MeetingSummary {
  id: string;
  lead_id: string;
  user_id?: string;
  summary: string;
  meeting_date: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}
