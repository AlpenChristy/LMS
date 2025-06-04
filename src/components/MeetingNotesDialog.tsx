
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calendar } from "lucide-react";
import { Lead } from "@/types/Lead";
import { useLeads } from '@/hooks/useLeads';

interface MeetingNotesDialogProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

const MeetingNotesDialog = ({ lead, onClose, onUpdate }: MeetingNotesDialogProps) => {
  const [newSummary, setNewSummary] = useState('');
  const { addMeetingSummary } = useLeads();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'negotiation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'won': return 'bg-green-100 text-green-800 border-green-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'New';
      case 'contacted': return 'Contacted';
      case 'negotiation': return 'In Negotiation';
      case 'won': return 'Closed Won';
      case 'lost': return 'Closed Lost';
      default: return status;
    }
  };

  const handleAddSummary = () => {
    if (!newSummary.trim()) return;

    addMeetingSummary({ leadId: lead.id, summary: newSummary });
    setNewSummary('');
    onClose();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meeting Notes - {lead.company_name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(lead.status)}>
                {getStatusLabel(lead.status)}
              </Badge>
              <span className="text-sm text-gray-500">Assigned to: {lead.assigned_to}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lead Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Lead Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span> {lead.email}
              </div>
              <div>
                <span className="text-gray-500">Phone:</span> {lead.contact_number}
              </div>
              <div>
                <span className="text-gray-500">Source:</span> {lead.lead_source}
              </div>
              <div>
                <span className="text-gray-500">Potential:</span> {lead.potential}%
              </div>
            </div>
            {lead.requirements && (
              <div className="mt-2">
                <span className="text-gray-500">Requirements:</span>
                <p className="text-sm mt-1">{lead.requirements}</p>
              </div>
            )}
          </div>

          {/* Add New Summary */}
          <div>
            <h3 className="font-semibold mb-3">Add New Meeting Summary</h3>
            <div className="space-y-3">
              <Textarea
                placeholder="Enter meeting summary, discussion points, outcomes, next steps..."
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                rows={4}
              />
              <Button onClick={handleAddSummary} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Summary
              </Button>
            </div>
          </div>

          {/* Meeting History */}
          <div>
            <h3 className="font-semibold mb-3">
              Meeting History ({lead.meeting_summaries?.length || 0})
            </h3>
            
            {lead.meeting_summaries && lead.meeting_summaries.length > 0 ? (
              <div className="space-y-4">
                {lead.meeting_summaries.map((summary) => (
                  <div key={summary.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-500">
                        {formatDateTime(summary.meeting_date)}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{summary.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No meeting summaries yet.</p>
                <p className="text-sm">Add your first meeting notes above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingNotesDialog;
