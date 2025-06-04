
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText } from "lucide-react";
import LeadForm from "@/components/LeadForm";
import LeadTable from "@/components/LeadTable";
import { Lead } from "@/types/Lead";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Load leads from localStorage on component mount
  useEffect(() => {
    const savedLeads = localStorage.getItem('leads');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    }
  }, []);

  // Save leads to localStorage whenever leads change
  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'createdAt'>) => {
    const lead: Lead = {
      ...newLead,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setLeads(prev => [lead, ...prev]);
    setIsFormOpen(false);
    toast({
      title: "Lead Added",
      description: "New lead has been successfully added to the system.",
    });
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    ));
    setEditingLead(null);
    setIsFormOpen(false);
    toast({
      title: "Lead Updated",
      description: "Lead information has been successfully updated.",
    });
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId));
    toast({
      title: "Lead Deleted",
      description: "Lead has been successfully removed from the system.",
    });
  };

  const handleExport = () => {
    exportToCSV(leads, 'leads-export');
    toast({
      title: "Export Successful",
      description: "Leads data has been exported to CSV file.",
    });
  };

  const getStatusCounts = () => {
    const counts = {
      new: 0,
      contacted: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
    };
    
    leads.forEach(lead => {
      counts[lead.status as keyof typeof counts]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management System</h1>
          <p className="text-gray-600">Manage your sales leads effectively and track conversion progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.new}</div>
              <div className="text-sm text-gray-600">New Leads</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.contacted}</div>
              <div className="text-sm text-gray-600">Contacted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{statusCounts.negotiation}</div>
              <div className="text-sm text-gray-600">In Negotiation</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts.won}</div>
              <div className="text-sm text-gray-600">Closed Won</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts.lost}</div>
              <div className="text-sm text-gray-600">Closed Lost</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Lead
          </Button>
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="table" className="w-full">
          <TabsList>
            <TabsTrigger value="table">Lead Table</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>All Leads ({leads.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadTable 
                  leads={leads} 
                  onEdit={handleEditLead}
                  onDelete={handleDeleteLead}
                  onUpdate={handleUpdateLead}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Lead Form Modal/Drawer */}
        {isFormOpen && (
          <LeadForm
            lead={editingLead}
            onSubmit={editingLead ? handleUpdateLead : handleAddLead}
            onClose={() => {
              setIsFormOpen(false);
              setEditingLead(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
