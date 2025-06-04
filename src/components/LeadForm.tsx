
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { Lead } from "@/types/Lead";

interface LeadFormProps {
  lead?: Lead | null;
  onSubmit: (lead: any) => void;
  onClose: () => void;
}

const LeadForm = ({ lead, onSubmit, onClose }: LeadFormProps) => {
  const [formData, setFormData] = useState({
    company_name: '',
    lead_source: '',
    assigned_to: '',
    requirements: '',
    deadline: '',
    potential: [50],
    last_follow_up: '',
    next_follow_up: '',
    address: '',
    contact_number: '',
    email: '',
    status: 'new' as const,
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        company_name: lead.company_name,
        lead_source: lead.lead_source,
        assigned_to: lead.assigned_to,
        requirements: lead.requirements,
        deadline: lead.deadline,
        potential: [lead.potential],
        last_follow_up: lead.last_follow_up,
        next_follow_up: lead.next_follow_up,
        address: lead.address,
        contact_number: lead.contact_number,
        email: lead.email,
        status: lead.status,
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      potential: formData.potential[0],
      ...(lead && { id: lead.id, created_at: lead.created_at }),
    };
    onSubmit(submitData);
  };

  const leadSources = [
    'LinkedIn', 'Website', 'Referral', 'Cold Call', 'Email Campaign', 
    'Trade Show', 'Social Media', 'Partner', 'Advertisement', 'Other'
  ];

  const teamMembers = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 
    'David Brown', 'Emily Davis', 'Chris Anderson', 'Lisa Taylor'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  required
                />
              </div>

              {/* Lead Source */}
              <div>
                <Label htmlFor="lead_source">Lead Source *</Label>
                <Select value={formData.lead_source} onValueChange={(value) => setFormData({...formData, lead_source: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To */}
              <div>
                <Label htmlFor="assigned_to">Assigned To *</Label>
                <Select value={formData.assigned_to} onValueChange={(value) => setFormData({...formData, assigned_to: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="negotiation">In Negotiation</SelectItem>
                    <SelectItem value="won">Closed Won</SelectItem>
                    <SelectItem value="lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              {/* Contact Number */}
              <div>
                <Label htmlFor="contact_number">Contact Number *</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                  required
                />
              </div>

              {/* Deadline */}
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>

              {/* Last Follow-up */}
              <div>
                <Label htmlFor="last_follow_up">Last Follow-up Date</Label>
                <Input
                  id="last_follow_up"
                  type="date"
                  value={formData.last_follow_up}
                  onChange={(e) => setFormData({...formData, last_follow_up: e.target.value})}
                />
              </div>

              {/* Next Follow-up */}
              <div>
                <Label htmlFor="next_follow_up">Next Follow-up Date</Label>
                <Input
                  id="next_follow_up"
                  type="date"
                  value={formData.next_follow_up}
                  onChange={(e) => setFormData({...formData, next_follow_up: e.target.value})}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={2}
              />
            </div>

            {/* Requirements */}
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                rows={3}
              />
            </div>

            {/* Potential */}
            <div>
              <Label htmlFor="potential">Potential ({formData.potential[0]}%)</Label>
              <div className="mt-2">
                <Slider
                  value={formData.potential}
                  onValueChange={(value) => setFormData({...formData, potential: value})}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {lead ? 'Update Lead' : 'Add Lead'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadForm;
