import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, TrendingUp, Users, Calendar, Target, Upload, LogOut, Menu, X } from "lucide-react";
import { useLeads } from '@/hooks/useLeads';
import LeadForm from "@/components/LeadForm";
import LeadTable from "@/components/LeadTable";
import Dashboard from "@/components/Dashboard";
import ImportLeads from "@/components/ImportLeads";
import { Lead } from "@/types/Lead";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAddLead = async (newLead: Omit<Lead, 'id' | 'created_at' | 'meeting_summaries'>) => {
    try {
      await addLead({
        ...newLead,
        updated_at: new Date().toISOString()
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding lead:', error);
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive"
      });
    }
  };

  const handleUpdateLead = async (updatedLead: Omit<Lead, "id" | "created_at" | "updated_at" | "meeting_summaries"> & { id?: string }) => {
    try {
      if (!updatedLead.id) {
        throw new Error('Lead ID is required for update');
      }

      // Format the meeting date if it exists
      const formattedLead = {
        ...updatedLead,
        meeting_date: updatedLead.meeting_date ? new Date(updatedLead.meeting_date).toISOString() : null,
        updated_at: new Date().toISOString()
      };

      await updateLead({
        ...formattedLead,
        id: updatedLead.id
      } as Lead);
      setEditingLead(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive"
      });
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    exportToCSV(leads, 'leads-export');
    toast({
      title: "Export Successful",
      description: "Leads data has been exported to CSV file.",
    });
  };

  const handleImportLeads = async (importedLeads: Omit<Lead, 'id' | 'created_at' | 'meeting_summaries'>[]) => {
    try {
      for (const lead of importedLeads) {
        await addLead(lead);
      }
      setIsImportOpen(false);
      toast({
        title: "Success",
        description: `Successfully imported ${importedLeads.length} leads`,
      });
    } catch (error) {
      console.error('Error importing leads:', error);
      toast({
        title: "Error",
        description: "Failed to import leads",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
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
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              onClick={() => setIsFormOpen(true)} 
              className="bg-white text-purple-600 hover:bg-gray-100 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Lead
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsImportOpen(true)}
              className="bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-600 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Leads
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport} 
              className="bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-600 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-600 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden text-white hover:bg-purple-700/50 p-2 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <span 
                className={`absolute left-0 w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'top-3 rotate-45' : 'top-1'
                }`}
              />
              <span 
                className={`absolute left-0 w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : 'top-3'
                }`}
              />
              <span 
                className={`absolute left-0 w-6 h-0.5 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'
                }`}
              />
            </div>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen 
              ? 'max-h-[500px] opacity-100 mt-4' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="space-y-2">
            <Button 
              onClick={() => {
                setIsFormOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-white text-purple-600 hover:bg-gray-100 flex items-center justify-center gap-2 py-3"
            >
              <Plus className="h-4 w-4" />
              Add New Lead
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsImportOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-600 flex items-center justify-center gap-2 py-3"
            >
              <Upload className="h-4 w-4" />
              Import Leads
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                handleExport();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-600 flex items-center justify-center gap-2 py-3"
            >
              <FileText className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-600 flex items-center justify-center gap-2 py-3"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6 bg-white shadow-sm overflow-x-auto flex-nowrap">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2 whitespace-nowrap">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Users className="h-5 w-5" />
                    All Leads ({leads.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Export
                    </Button>
                    <Button
                      onClick={() => setIsFormOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Lead
                    </Button>
                  </div>
                </div>
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
      </div>

      {/* Forms */}
        {isFormOpen && (
          <LeadForm
            onClose={() => {
              setIsFormOpen(false);
              setEditingLead(null);
            }}
          onSubmit={editingLead ? handleUpdateLead : handleAddLead}
          lead={editingLead}
          />
        )}

        {isImportOpen && (
            <ImportLeads
          onClose={() => setIsImportOpen(false)}
              onImport={handleImportLeads}
            />
        )}
    </div>
  );
};

export default Index;
