import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calendar, Edit2, Trash2 } from "lucide-react";
import { Lead, MeetingSummary } from "@/types/Lead";
import { useMeetingSummaries } from '@/hooks/useMeetingSummaries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MeetingNotesDialogProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

const MeetingNotesDialog = ({ lead, onClose, onUpdate }: MeetingNotesDialogProps) => {
  const [newSummary, setNewSummary] = useState('');
  const [editingSummary, setEditingSummary] = useState<MeetingSummary | null>(null);
  const [editText, setEditText] = useState('');
  const { addMeetingSummary, updateMeetingSummary, deleteMeetingSummary } = useMeetingSummaries();

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

  const handleAddSummary = async () => {
    if (!newSummary.trim()) return;

    const summary = await addMeetingSummary(lead.id, newSummary);
    if (summary) {
      const updatedLead = {
        ...lead,
        meeting_summaries: [...(lead.meeting_summaries || []), summary]
      };
      onUpdate(updatedLead);
      setNewSummary('');
    }
  };

  const handleEditSummary = async (summary: MeetingSummary) => {
    if (!editText.trim()) return;

    await updateMeetingSummary(summary.id, editText);
    const updatedLead = {
      ...lead,
      meeting_summaries: lead.meeting_summaries?.map(s => 
        s.id === summary.id ? { ...s, summary: editText } : s
      ) || []
    };
    onUpdate(updatedLead);
    setEditingSummary(null);
    setEditText('');
  };

  const handleDeleteSummary = async (summaryId: string) => {
    await deleteMeetingSummary(summaryId);
    const updatedLead = {
      ...lead,
      meeting_summaries: lead.meeting_summaries?.filter(s => s.id !== summaryId) || []
    };
    onUpdate(updatedLead);
  };

  const startEditing = (summary: MeetingSummary) => {
    setEditingSummary(summary);
    setEditText(summary.summary);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  // Sort meeting summaries by date in descending order
  const sortedSummaries = useMemo(() => {
    if (!lead.meeting_summaries) return [];
    return [...lead.meeting_summaries].sort((b, a) => {
      const dateA = a.meeting_date ? new Date(a.meeting_date).getTime() : 0;
      const dateB = b.meeting_date ? new Date(b.meeting_date).getTime() : 0;
      return dateB - dateA;
    });
  }, [lead.meeting_summaries]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meeting Notes - {lead.company_name}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(lead.status)}>
                {getStatusLabel(lead.status)}
              </Badge>
              <span className="text-sm text-gray-500">Assigned to: {lead.assigned_to}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
            
            {sortedSummaries.length > 0 ? (
              <div className="space-y-4">
                {sortedSummaries.map((summary) => (
                  <div key={summary.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-500">
                        {formatDateTime(summary.meeting_date)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(summary)}
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSummary(summary.id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {editingSummary?.id === summary.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingSummary(null);
                              setEditText('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditSummary(summary)}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{summary.summary}</p>
                    )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingNotesDialog;
