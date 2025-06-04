
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, CheckCircle, Clock, Users, Target, Calendar, Award } from "lucide-react";
import { Lead } from "@/types/Lead";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  leads: Lead[];
  isLoading: boolean;
}

const Dashboard = ({ leads, isLoading }: DashboardProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

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
  const totalLeads = leads.length;
  const potentialRevenue = leads.reduce((sum, lead) => {
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

  const monthlyData = [
    { month: 'Jan', converted: 12, lost: 8 },
    { month: 'Feb', converted: 15, lost: 6 },
    { month: 'Mar', converted: 18, lost: 9 },
    { month: 'Apr', converted: 22, lost: 7 },
    { month: 'May', converted: 25, lost: 5 },
    { month: 'Jun', converted: 28, lost: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
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

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">₹ {Math.round(potentialRevenue).toLocaleString()}</div>
                <div className="text-orange-100">Potential Collection</div>
              </div>
              <DollarSign className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
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

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
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
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Processing Summary
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-gray-600">Process</th>
                  <th className="text-center py-3 text-gray-600">2 Months Back</th>
                  <th className="text-center py-3 text-gray-600">Last Month</th>
                  <th className="text-center py-3 text-gray-600">Current Month</th>
                  <th className="text-center py-3 text-gray-600">Next Month</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">Interested Open</td>
                  <td className="text-center py-3">2</td>
                  <td className="text-center py-3">12</td>
                  <td className="text-center py-3">{statusCounts.new}</td>
                  <td className="text-center py-3">-</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">Payment Collection</td>
                  <td className="text-center py-3">0</td>
                  <td className="text-center py-3">0</td>
                  <td className="text-center py-3">{statusCounts.contacted}</td>
                  <td className="text-center py-3">-</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">Payment Collected</td>
                  <td className="text-center py-3">0</td>
                  <td className="text-center py-3">0</td>
                  <td className="text-center py-3">{statusCounts.won}</td>
                  <td className="text-center py-3">-</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">Policy Generated</td>
                  <td className="text-center py-3">0</td>
                  <td className="text-center py-3">0</td>
                  <td className="text-center py-3">{statusCounts.negotiation}</td>
                  <td className="text-center py-3">-</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 font-medium">Lost</td>
                  <td className="text-center py-3">18</td>
                  <td className="text-center py-3">12</td>
                  <td className="text-center py-3">{statusCounts.lost}</td>
                  <td className="text-center py-3">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
