import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { Lead, LeadStatus, ProposalStatus } from "@/types/Lead";

// Default user ID for unauthenticated operations
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

interface LeadFormProps {
  lead?: Lead | null;
  onSubmit: (lead: Omit<Lead, 'id' | 'created_at' | 'meeting_summaries'> | Lead) => void;
  onClose: () => void;
}

const LeadForm = ({ lead, onSubmit, onClose }: LeadFormProps) => {
  const [formData, setFormData] = useState<Omit<Lead, 'created_at' | 'meeting_summaries'>>({
    id: lead?.id || '',
    company_name: lead?.company_name || '',
    lead_source: lead?.lead_source || '',
    assigned_to: lead?.assigned_to || '',
    requirements: lead?.requirements || '',
    deadline: lead?.deadline || '',
    potential: lead?.potential || 50,
    last_follow_up: lead?.last_follow_up || '',
    next_follow_up: lead?.next_follow_up || '',
    address: lead?.address || '',
    contact_number: lead?.contact_number || '',
    email: lead?.email || '',
    status: lead?.status || 'new',
    proposal_status: lead?.proposal_status || 'not_given',
    updated_at: new Date().toISOString(),
    user_id: DEFAULT_USER_ID
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert empty strings to null for optional fields
    const processedData = {
      ...formData,
      requirements: formData.requirements || null,
      deadline: formData.deadline || null,
      last_follow_up: formData.last_follow_up || null,
      next_follow_up: formData.next_follow_up || null,
      address: formData.address || null,
      potential: formData.potential || null
    };

    // If this is a new lead, omit the id field
    if (!lead) {
      const { id, ...newLeadData } = processedData;
      onSubmit(newLeadData);
    } else {
      onSubmit(processedData);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => handleChange('contact_number', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_source">Lead Source</Label>
                <Input
                  id="lead_source"
                  value={formData.lead_source}
                  onChange={(e) => handleChange('lead_source', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Input
                  id="assigned_to"
                  value={formData.assigned_to}
                  onChange={(e) => handleChange('assigned_to', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value as LeadStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="payment_pending">Payment Pending</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposal_status">Proposal Status</Label>
                <Select
                  value={formData.proposal_status}
                  onValueChange={(value) => handleChange('proposal_status', value as ProposalStatus)}
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
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="potential">Potential Value</Label>
                <Input
                  id="potential"
                  type="number"
                  value={formData.potential || ''}
                  onChange={(e) => handleChange('potential', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_follow_up">Last Follow Up</Label>
                <Input
                  id="last_follow_up"
                  type="date"
                  value={formData.last_follow_up || ''}
                  onChange={(e) => handleChange('last_follow_up', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_follow_up">Next Follow Up</Label>
                <Input
                  id="next_follow_up"
                  type="date"
                  value={formData.next_follow_up || ''}
                  onChange={(e) => handleChange('next_follow_up', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements || ''}
                onChange={(e) => handleChange('requirements', e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {lead ? 'Update Lead' : 'Add Lead'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadForm;
