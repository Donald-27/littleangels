import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Bell,
  Receipt,
  Target,
  BarChart3,
  Wallet,
  Calculator
} from 'lucide-react';

const AccountsDashboard = () => {
  const { user } = useAuth();
  const [financialStats, setFinancialStats] = useState({});

  useEffect(() => {
    // TODO: Fetch financial data from Supabase
    setFinancialStats({
      totalRevenue: 125000,
      monthlyTarget: 150000,
      pendingPayments: 15000,
      completedPayments: 110000,
      overduePayments: 5000
    });
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Accounts Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Accountant'}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">5</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={`$${financialStats.totalRevenue?.toLocaleString()}`} 
            icon={DollarSign} 
            trend={8.2}
            color="green"
          />
          <StatCard 
            title="Monthly Target" 
            value={`$${financialStats.monthlyTarget?.toLocaleString()}`} 
            icon={Target} 
            color="blue"
          />
          <StatCard 
            title="Pending Payments" 
            value={`$${financialStats.pendingPayments?.toLocaleString()}`} 
            icon={Clock} 
            color="yellow"
          />
          <StatCard 
            title="Completed Payments" 
            value={`$${financialStats.completedPayments?.toLocaleString()}`} 
            icon={CheckCircle} 
            color="green"
          />
          <StatCard 
            title="Overdue Payments" 
            value={`$${financialStats.overduePayments?.toLocaleString()}`} 
            icon={FileText} 
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Receipt className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calculator className="h-4 w-4 mr-2" />
                  Budget Planning
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    student: "Sarah Johnson",
                    amount: 250,
                    type: "Transport Fee",
                    status: "completed",
                    date: "2024-01-15"
                  },
                  {
                    id: 2,
                    student: "Mike Chen",
                    amount: 250,
                    type: "Transport Fee", 
                    status: "pending",
                    date: "2024-01-14"
                  },
                  {
                    id: 3,
                    student: "Emma Davis",
                    amount: 300,
                    type: "Late Fee",
                    status: "overdue",
                    date: "2024-01-10"
                  }
                ].map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.status === 'completed' ? 'bg-green-100' :
                        transaction.status === 'pending' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        <DollarSign className={`h-5 w-5 ${
                          transaction.status === 'completed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.student}</p>
                        <p className="text-sm text-gray-600">{transaction.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${transaction.amount}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {transaction.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{transaction.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsDashboard;