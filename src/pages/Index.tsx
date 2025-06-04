
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/hooks/useLeads';
import LeadForm from "@/components/LeadForm";
import LeadTable from "@/components/LeadTable";
import { Lead } from "@/types/Lead";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
      counts[lead.status]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management System</h1>
            <p className="text-gray-600">Welcome back, {user.email}!</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
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
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading leads...</p>
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
