import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Lead, LeadStatus, ProposalStatus } from "@/types/Lead";
import MeetingNotesDialog from "./MeetingNotesDialog";

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onUpdate: (lead: Lead) => void;
}

const LeadTable = ({ leads, onEdit, onDelete, onUpdate }: LeadTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 30;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'negotiation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'won': return 'bg-green-100 text-green-800 border-green-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      case 'payment_pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      case 'payment_pending': return 'Payment Pending';
      default: return status;
    }
  };

  const getProposalStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case 'not_given': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'given': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProposalStatusLabel = (status: ProposalStatus) => {
    switch (status) {
      case 'not_given': return 'Not Given';
      case 'given': return 'Given';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      onUpdate({ ...lead, status: newStatus });
    }
  };

  const handleProposalStatusChange = (leadId: string, newStatus: ProposalStatus) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      onUpdate({ ...lead, proposal_status: newStatus });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search leads by company, email, or assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="negotiation">In Negotiation</SelectItem>
              <SelectItem value="payment_pending">Payment Pending</SelectItem>
              <SelectItem value="won">Closed Won</SelectItem>
              <SelectItem value="lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Proposal</TableHead>
              <TableHead>Potential</TableHead>
              <TableHead>Next Follow-up</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLeads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{lead.company_name}</div>
                    <div className="text-sm text-gray-500">{lead.requirements.substring(0, 50)}...</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{lead.email}</div>
                    <div className="text-sm text-gray-500">{lead.contact_number}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{lead.lead_source}</Badge>
                </TableCell>
                <TableCell>{lead.assigned_to}</TableCell>
                <TableCell>
                  <Select value={lead.status} onValueChange={(value) => handleStatusChange(lead.id, value as LeadStatus)}>
                    <SelectTrigger className="w-32">
                      <SelectValue>
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="negotiation">In Negotiation</SelectItem>
                      <SelectItem value="payment_pending">Payment Pending</SelectItem>
                      <SelectItem value="won">Closed Won</SelectItem>
                      <SelectItem value="lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={lead.proposal_status} onValueChange={(value) => handleProposalStatusChange(lead.id, value as ProposalStatus)}>
                    <SelectTrigger className="w-32">
                      <SelectValue>
                        <Badge className={getProposalStatusColor(lead.proposal_status)}>
                          {getProposalStatusLabel(lead.proposal_status)}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_given">Not Given</SelectItem>
                      <SelectItem value="given">Given</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${lead.potential}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{lead.potential}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`text-sm ${isOverdue(lead.next_follow_up) ? 'text-red-600 font-semibold' : ''}`}>
                    {formatDate(lead.next_follow_up)}
                    {isOverdue(lead.next_follow_up) && lead.next_follow_up && (
                      <div className="text-xs text-red-500">Overdue</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedLead(lead)}
                      title="Meeting Notes"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(lead)}
                      title="Edit Lead"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(lead.id)}
                      title="Delete Lead"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredLeads.length > 0 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {filteredLeads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No leads found matching your criteria.
          </div>
        )}
      </div>

      {/* Meeting Notes Dialog */}
      {selectedLead && (
        <MeetingNotesDialog
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default LeadTable;
