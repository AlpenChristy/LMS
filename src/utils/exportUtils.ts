
import { Lead } from "@/types/Lead";

export const exportToCSV = (leads: Lead[], filename: string = 'leads-export') => {
  // Define CSV headers
  const headers = [
    'Company Name',
    'Email',
    'Contact Number',
    'Lead Source',
    'Assigned To',
    'Status',
    'Potential (%)',
    'Requirements',
    'Address',
    'Deadline',
    'Last Follow-up',
    'Next Follow-up',
    'Created At',
    'Meeting Count'
  ];

  // Convert leads to CSV rows
  const rows = leads.map(lead => [
    lead.company_name,
    lead.email,
    lead.contact_number,
    lead.lead_source,
    lead.assigned_to,
    lead.status,
    lead.potential,
    lead.requirements?.replace(/"/g, '""') || '', // Escape quotes
    lead.address?.replace(/"/g, '""') || '',
    lead.deadline || '',
    lead.last_follow_up || '',
    lead.next_follow_up || '',
    new Date(lead.created_at).toLocaleDateString(),
    lead.meeting_summaries?.length || 0
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Function to export meeting summaries for a specific lead
export const exportMeetingSummaries = (lead: Lead) => {
  if (!lead.meeting_summaries || lead.meeting_summaries.length === 0) {
    return;
  }

  const headers = ['Date', 'Summary'];
  const rows = lead.meeting_summaries.map(summary => [
    new Date(summary.meeting_date).toLocaleString(),
    summary.summary.replace(/"/g, '""')
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${lead.company_name}-meetings-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
