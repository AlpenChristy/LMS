
export interface Lead {
  id: string;
  companyName: string;
  leadSource: string;
  assignedTo: string;
  requirements: string;
  deadline: string;
  potential: number;
  lastFollowUp: string;
  nextFollowUp: string;
  address: string;
  contactNumber: string;
  email: string;
  status: 'new' | 'contacted' | 'negotiation' | 'won' | 'lost';
  meetingSummaries: MeetingSummary[];
  createdAt: string;
}

export interface MeetingSummary {
  id: string;
  date: string;
  summary: string;
  createdAt: string;
}
