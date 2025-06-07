import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lead, LeadStatus, ProposalStatus } from "@/types/Lead";

// Default user ID for unauthenticated operations
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: Omit<Lead, "id" | "created_at" | "updated_at" | "meeting_summaries"> & { id?: string }) => void;
  onClose: () => void;
}

// Function to format date for date input
const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to format time for time input
const formatTimeForInput = (timeString: string | null): string => {
  if (!timeString) return '';
  // If it's a full datetime string, extract just the time part
  if (timeString.includes('T')) {
    return timeString.split('T')[1].slice(0, 5);
  }
  return timeString;
};

export const LeadForm = ({ lead, onSubmit, onClose }: LeadFormProps) => {
  const [formData, setFormData] = useState<Omit<Lead, "id" | "created_at" | "updated_at" | "meeting_summaries"> & { id?: string }>({
    id: lead?.id,
    company_name: lead?.company_name || '',
    lead_source: lead?.lead_source || '',
    assigned_to: lead?.assigned_to || '',
    requirements: lead?.requirements || '',
    deadline: lead?.deadline || '',
    potential: lead?.potential || null,
    last_follow_up: lead?.last_follow_up || '',
    next_follow_up: lead?.next_follow_up || '',
    address: lead?.address || '',
    contact_number: lead?.contact_number || '',
    email: lead?.email || '',
    status: lead?.status || 'new',
    proposal_status: lead?.proposal_status || 'not_given',
    meeting_date: formatDateForInput(lead?.meeting_date),
    meeting_time: formatTimeForInput(lead?.meeting_time),
    user_id: lead?.user_id || 'default_user_id'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store the exact time as entered
    const submitData = {
      ...formData,
      meeting_date: formData.meeting_date || null,
      meeting_time: formData.meeting_time || null
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription>
            {lead ? 'Update the lead information below.' : 'Fill in the lead information below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lead_source">Lead Source</Label>
                <Select
                  value={formData.lead_source}
                  onValueChange={(value) => setFormData({ ...formData, lead_source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Input
                  id="assigned_to"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements || ''}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="potential">Potential Value</Label>
                <Input
                  id="potential"
                  type="number"
                  value={formData.potential || ''}
                  onChange={(e) => setFormData({ ...formData, potential: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div>
                <Label htmlFor="last_follow_up">Last Follow Up</Label>
                <Input
                  id="last_follow_up"
                  type="date"
                  value={formData.last_follow_up || ''}
                  onChange={(e) => setFormData({ ...formData, last_follow_up: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="next_follow_up">Next Follow Up</Label>
                <Input
                  id="next_follow_up"
                  type="date"
                  value={formData.next_follow_up || ''}
                  onChange={(e) => setFormData({ ...formData, next_follow_up: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meeting_date">Meeting Date</Label>
                  <Input
                    id="meeting_date"
                    type="date"
                    value={formData.meeting_date}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        meeting_date: value || null
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="meeting_time">Meeting Time</Label>
                  <Input
                    id="meeting_time"
                    type="time"
                    value={formData.meeting_time}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        meeting_time: value || null
                      }));
                    }}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as LeadStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="payment_pending">Payment Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="proposal_status">Proposal Status</Label>
                <Select
                  value={formData.proposal_status}
                  onValueChange={(value) => setFormData({ ...formData, proposal_status: value as ProposalStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select proposal status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_given">Not Given</SelectItem>
                    <SelectItem value="given">Given</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{lead ? 'Update Lead' : 'Add Lead'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadForm;
