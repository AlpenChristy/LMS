import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, CheckCircle, Clock, Users, Target, Calendar, Award, Filter, Bell, AlertCircle, X } from "lucide-react";
import { Lead } from "@/types/Lead";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { LeadStatus } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardProps {
  leads: Lead[];
  isLoading: boolean;
}

function Dashboard({ leads, isLoading }: DashboardProps) {
  const [dateFilter, setDateFilter] = useState('all');
  const [potentialFilter, setPotentialFilter] = useState('all');
  const [showFollowUpReminder, setShowFollowUpReminder] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Calculate follow-ups due today
  const today = new Date().toISOString().split('T')[0];
  const followUpsDueToday = leads.filter(lead => {
    const nextFollowUp = lead.next_follow_up?.split('T')[0];
    return nextFollowUp === today;
  });

  // Show follow-up reminder only once when website is opened
  useEffect(() => {
    const hasShownReminder = localStorage.getItem('hasShownFollowUpReminder');
    if (!hasShownReminder && followUpsDueToday.length > 0) {
      setShowFollowUpReminder(true);
      localStorage.setItem('hasShownFollowUpReminder', 'true');
    }
  }, [followUpsDueToday.length]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const getFilteredLeads = () => {
    let filteredLeads = [...leads];

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 60));

      filteredLeads = filteredLeads.filter(lead => {
        const createdDate = new Date(lead.created_at || '');
        switch (dateFilter) {
          case '30days':
            return createdDate >= thirtyDaysAgo;
          case '90days':
            return createdDate >= ninetyDaysAgo;
          default:
            return true;
        }
      });
    }

    // Apply potential filter
    if (potentialFilter !== 'all') {
      filteredLeads = filteredLeads.filter(lead => {
        const potential = lead.potential || 0;
        switch (potentialFilter) {
          case 'high':
            return potential >= 75;
          case 'medium':
            return potential >= 50 && potential < 75;
          case 'low':
            return potential < 50;
          default:
            return true;
        }
      });
    }

    return filteredLeads;
  };

  const filteredLeads = getFilteredLeads();

  const getStatusCounts = () => {
    const counts = {
      new: 0,
      contacted: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
      payment_pending: 0,
    };
    
    filteredLeads.forEach(lead => {
      counts[lead.status]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalLeads = filteredLeads.length;
  const potentialRevenue = filteredLeads.reduce((sum, lead) => {
    if (lead.status === 'won') return sum + 15000; // Assuming average deal value
    if (lead.status === 'negotiation') return sum + (15000 * lead.potential / 100);
    return sum;
  }, 0);

  const pieData = [
    { name: 'Converted', value: statusCounts.won, color: '#10B981' },
    { name: 'Lost', value: statusCounts.lost, color: '#EF4444' },
    { name: 'In Progress', value: statusCounts.contacted + statusCounts.negotiation, color: '#3B82F6' },
    { name: 'New', value: statusCounts.new, color: '#F59E0B' },
  ];

  // Calculate monthly conversion data
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthlyData = [];

    // Get data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthLeads = filteredLeads.filter(lead => {
        const leadDate = new Date(lead.created_at || '');
        return leadDate >= monthDate && leadDate <= monthEnd;
      });

      const converted = monthLeads.filter(lead => lead.status === 'won').length;
      const lost = monthLeads.filter(lead => lead.status === 'lost').length;

      monthlyData.push({
        month: months[monthDate.getMonth()],
        converted,
        lost
      });
    }

    return monthlyData;
  };

  const monthlyData = getMonthlyData();

  const getProposalStatusCounts = () => {
    const counts = {
      not_given: 0,
      given: 0,
      approved: 0,
      rejected: 0,
    };
    
    filteredLeads.forEach(lead => {
      counts[lead.proposal_status]++;
    });
    
    return counts;
  };

  const proposalStatusCounts = getProposalStatusCounts();

  const handleStatusCardClick = (status: LeadStatus) => {
    setSelectedStatus(status);
    setIsDialogOpen(true);
  };

  const getStatusLeads = (status: LeadStatus) => {
    return filteredLeads.filter(lead => lead.status === status);
  };

  const getStatusTitle = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'New Leads';
      case 'contacted':
        return 'Contacted Leads';
      case 'negotiation':
        return 'Leads in Negotiation';
      case 'won':
        return 'Won Leads';
      case 'lost':
        return 'Lost Leads';
      default:
        return 'Leads';
    }
  };

  return (
    <div className="space-y-6">
      {/* Follow-up Reminder Banner */}
      {showFollowUpReminder && followUpsDueToday.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Follow-up Reminder
                </h3>
                <p className="text-sm text-yellow-700">
                  You have {followUpsDueToday.length} follow-up{followUpsDueToday.length > 1 ? 's' : ''} due today
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFollowUpReminder(false)}
              className="text-yellow-700 hover:text-yellow-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleStatusCardClick('new')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{totalLeads}</div>
                <div className="text-blue-100">Total Leads</div>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleStatusCardClick('new')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{statusCounts.new}</div>
                <div className="text-orange-100">New Leads</div>
              </div>
              <Award className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleStatusCardClick('contacted')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{statusCounts.contacted + statusCounts.negotiation}</div>
                <div className="text-green-100">Follow-up Done</div>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleStatusCardClick('new')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{statusCounts.new}</div>
                <div className="text-red-100">Follow-up Pending</div>
              </div>
              <Clock className="h-12 w-12 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Leads Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedStatus ? getStatusTitle(selectedStatus) : 'Leads'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {selectedStatus && getStatusLeads(selectedStatus).map(lead => (
                <div key={lead.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{lead.company_name}</h3>
                    <Badge variant="outline" className="capitalize">
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><span className="font-medium">Contact:</span> {lead.contact_name}</p>
                      <p><span className="font-medium">Phone:</span> {lead.contact_number}</p>
                      <p><span className="font-medium">Email:</span> {lead.email}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Potential:</span> {lead.potential || 0}%</p>
                      <p><span className="font-medium">Next Follow-up:</span> {lead.next_follow_up ? format(new Date(lead.next_follow_up), 'MMM d, yyyy h:mm a') : 'Not set'}</p>
                      {lead.meeting_date && (
                        <p><span className="font-medium">Meeting:</span> {lead.meeting_date} at {lead.meeting_time}</p>
                      )}
                    </div>
                  </div>
                  {lead.requirements && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">Requirements:</p>
                      <p>{lead.requirements}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Follow-ups and Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Follow-ups Section */}
        <Card className="shadow-lg border-0 h-[400px] flex flex-col">
          <div className="p-4 border-b bg-white flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Follow-ups
            </h3>
          </div>
          <CardContent className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-3">
              {leads.some(lead => lead.next_follow_up && lead.next_follow_up.split('T')[0] === new Date().toISOString().split('T')[0]) ? (
                leads
                  .filter(lead => lead.next_follow_up && lead.next_follow_up.split('T')[0] === new Date().toISOString().split('T')[0])
                  .sort((a, b) => {
                    const timeA = a.next_follow_up ? new Date(a.next_follow_up).getTime() : 0;
                    const timeB = b.next_follow_up ? new Date(b.next_follow_up).getTime() : 0;
                    return timeA - timeB;
                  })
                  .map(lead => {
                    const statusColor = {
                      new: 'bg-blue-100 text-blue-800',
                      contacted: 'bg-yellow-100 text-yellow-800',
                      negotiation: 'bg-purple-100 text-purple-800',
                      won: 'bg-green-100 text-green-800',
                      lost: 'bg-red-100 text-red-800'
                    }[lead.status];

                    return (
                      <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{lead.company_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Potential: {lead.potential || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{lead.contact_number}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No follow-ups due today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meetings Section */}
        <Card className="shadow-lg border-0 h-[400px] flex flex-col">
          <div className="p-4 border-b bg-white flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meetings
            </h3>
          </div>
          <CardContent className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* Today's Meetings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Today's Meetings</h4>
                {leads.some(lead => lead.meeting_date === today) ? (
                  <div className="space-y-2">
                    {leads
                      .filter(lead => lead.meeting_date === today)
                      .sort((a, b) => (a.meeting_time || '').localeCompare(b.meeting_time || ''))
                      .map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{lead.company_name}</h4>
                              <div className="text-sm text-gray-500">
                                Time: {lead.meeting_time}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">{lead.contact_number}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-500">
                    No meetings scheduled for today
                  </div>
                )}
              </div>

              {/* Upcoming Meetings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming Meetings</h4>
                {leads.some(lead => lead.meeting_date && lead.meeting_date > today) ? (
                  <div className="space-y-2">
                    {leads
                      .filter(lead => lead.meeting_date && lead.meeting_date > today)
                      .sort((a, b) => {
                        const dateCompare = (a.meeting_date || '').localeCompare(b.meeting_date || '');
                        if (dateCompare !== 0) return dateCompare;
                        return (a.meeting_time || '').localeCompare(b.meeting_time || '');
                      })
                      .map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{lead.company_name}</h4>
                              <div className="text-sm text-gray-500">
                                {lead.meeting_date} at {lead.meeting_time}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">{lead.contact_number}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-500">
                    No upcoming meetings scheduled
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-up Done Status */}
        <Card className="shadow-lg border-0">
          <div className="p-6 border-b bg-white">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Follow-up Done Status
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="shadow-lg border-0">
          <div className="p-6 border-b bg-white">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Summary
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="converted" fill="#3B82F6" name="Converted" />
                  <Bar dataKey="lost" fill="#EF4444" name="Lost" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Summary Table */}
      <Card className="shadow-lg border-0">
        <div className="p-6 border-b bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lead Processing Summary
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={potentialFilter} onValueChange={setPotentialFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Potential" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Potential</SelectItem>
                    <SelectItem value="high">High (75%+)</SelectItem>
                    <SelectItem value="medium">Medium (50-74%)</SelectItem>
                    <SelectItem value="low">Low (&lt;50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-gray-600">Status</th>
                  <th className="text-center py-3 text-gray-600">Count</th>
                  <th className="text-center py-3 text-gray-600">Avg. Potential</th>
                  <th className="text-center py-3 text-gray-600">Last Follow-up</th>
                  <th className="text-center py-3 text-gray-600">Next Follow-up</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">New Leads</td>
                  <td className="text-center py-3">{statusCounts.new}</td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'new').reduce((acc, lead) => acc + (lead.potential || 0), 0) / (statusCounts.new || 1)}%
                  </td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3">-</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">Contacted</td>
                  <td className="text-center py-3">{statusCounts.contacted}</td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'contacted').reduce((acc, lead) => acc + (lead.potential || 0), 0) / (statusCounts.contacted || 1)}%
                  </td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'contacted' && l.last_follow_up)
                      .sort((a, b) => new Date(b.last_follow_up!).getTime() - new Date(a.last_follow_up!).getTime())[0]?.last_follow_up?.split('T')[0] || '-'}
                  </td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'contacted' && l.next_follow_up)
                      .sort((a, b) => new Date(a.next_follow_up!).getTime() - new Date(b.next_follow_up!).getTime())[0]?.next_follow_up?.split('T')[0] || '-'}
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">In Negotiation</td>
                  <td className="text-center py-3">{statusCounts.negotiation}</td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'negotiation').reduce((acc, lead) => acc + (lead.potential || 0), 0) / (statusCounts.negotiation || 1)}%
                  </td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'negotiation' && l.last_follow_up)
                      .sort((a, b) => new Date(b.last_follow_up!).getTime() - new Date(a.last_follow_up!).getTime())[0]?.last_follow_up?.split('T')[0] || '-'}
                  </td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'negotiation' && l.next_follow_up)
                      .sort((a, b) => new Date(a.next_follow_up!).getTime() - new Date(b.next_follow_up!).getTime())[0]?.next_follow_up?.split('T')[0] || '-'}
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">Won</td>
                  <td className="text-center py-3">{statusCounts.won}</td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'won').reduce((acc, lead) => acc + (lead.potential || 0), 0) / (statusCounts.won || 1)}%
                  </td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'won' && l.last_follow_up)
                      .sort((a, b) => new Date(b.last_follow_up!).getTime() - new Date(a.last_follow_up!).getTime())[0]?.last_follow_up?.split('T')[0] || '-'}
                  </td>
                  <td className="text-center py-3">-</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">Lost</td>
                  <td className="text-center py-3">{statusCounts.lost}</td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'lost').reduce((acc, lead) => acc + (lead.potential || 0), 0) / (statusCounts.lost || 1)}%
                  </td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'lost' && l.last_follow_up)
                      .sort((a, b) => new Date(b.last_follow_up!).getTime() - new Date(a.last_follow_up!).getTime())[0]?.last_follow_up?.split('T')[0] || '-'}
                  </td>
                  <td className="text-center py-3">-</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">Payment Pending</td>
                  <td className="text-center py-3">{statusCounts.payment_pending}</td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'payment_pending').reduce((acc, lead) => acc + (lead.potential || 0), 0) / (statusCounts.payment_pending || 1)}%
                  </td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'payment_pending' && l.last_follow_up)
                      .sort((a, b) => new Date(b.last_follow_up!).getTime() - new Date(a.last_follow_up!).getTime())[0]?.last_follow_up?.split('T')[0] || '-'}
                  </td>
                  <td className="text-center py-3">
                    {filteredLeads.filter(l => l.status === 'payment_pending' && l.next_follow_up)
                      .sort((a, b) => new Date(a.next_follow_up!).getTime() - new Date(b.next_follow_up!).getTime())[0]?.next_follow_up?.split('T')[0] || '-'}
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">Proposal Status</td>
                  <td className="text-center py-3" colSpan={4}>
                    <div className="flex flex-wrap justify-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{proposalStatusCounts.not_given}</div>
                        <div className="text-sm text-gray-500">Not Given</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{proposalStatusCounts.given}</div>
                        <div className="text-sm text-gray-500">Given</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{proposalStatusCounts.approved}</div>
                        <div className="text-sm text-gray-500">Approved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{proposalStatusCounts.rejected}</div>
                        <div className="text-sm text-gray-500">Rejected</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
