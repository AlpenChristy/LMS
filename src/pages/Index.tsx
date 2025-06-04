
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, TrendingUp, Users, Calendar, Target } from "lucide-react";
import { useLeads } from '@/hooks/useLeads';
import LeadForm from "@/components/LeadForm";
import LeadTable from "@/components/LeadTable";
import Dashboard from "@/components/Dashboard";
import { Lead } from "@/types/Lead";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'created_at' | 'meeting_summaries'>) => {
    addLead(newLead);
    setIsFormOpen(false);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    updateLead(updatedLead);
    setEditingLead(null);
    setIsFormOpen(false);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = (leadId: string) => {
    deleteLead(leadId);
  };

  const handleExport = () => {
    exportToCSV(leads, 'leads-export');
    toast({
      title: "Export Successful",
      description: "Leads data has been exported to CSV file.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">LeadCRM</h1>
              <p className="text-purple-100">Lead Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsFormOpen(true)} 
              className="bg-white text-purple-600 hover:bg-gray-100 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Lead
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport} 
              className="border-white text-white hover:bg-white hover:text-purple-600 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <Dashboard leads={leads} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="leads">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-white border-b">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Users className="h-5 w-5" />
                  All Leads ({leads.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading leads...</p>
                  </div>
                ) : (
                  <LeadTable 
                    leads={leads} 
                    onEdit={handleEditLead}
                    onDelete={handleDeleteLead}
                    onUpdate={handleUpdateLead}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Lead Form Modal */}
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
