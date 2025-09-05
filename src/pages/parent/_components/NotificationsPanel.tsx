import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, CheckCircle, AlertTriangle, Info, Star, 
  Bus, Calendar, Phone, Mail, MessageSquare,
  Filter, Search, Archive, Trash2, Volume2, Settings
} from "lucide-react";

export default function NotificationsPanel() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Bus Arriving Soon! 🚌",
      message: "Your child's bus (KBY 245C) will arrive at Pioneer Estate in 3 minutes. Please ensure your child is ready at the pickup point.",
      time: "2 minutes ago",
      date: "2024-02-20",
      type: "pickup",
      priority: "high",
      read: false,
      icon: Bus,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      data: {
        busNumber: "KBY 245C",
        eta: "3 minutes",
        location: "Pioneer Estate"
      }
    },
    {
      id: 2,
      title: "Perfect Attendance Achievement! ⭐",
      message: "Congratulations! Abigail has earned the Perfect Attendance badge for maintaining 30 consecutive school days without absence.",
      time: "1 hour ago",
      date: "2024-02-20",
      type: "achievement",
      priority: "medium",
      read: false,
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
      data: {
        badgeType: "Perfect Attendance",
        points: 50,
        streak: 30
      }
    },
    {
      id: 3,
      title: "Parent-Teacher Meeting Scheduled 📚",
      message: "A parent-teacher conference has been scheduled for February 25th at 2:00 PM in the Main Hall. Please confirm your attendance.",
      time: "3 hours ago",
      date: "2024-02-20",
      type: "announcement",
      priority: "medium",
      read: true,
      icon: Calendar,
      color: "from-blue-500 to-purple-500",
      bgColor: "from-blue-50 to-purple-50",
      borderColor: "border-blue-200",
      data: {
        eventDate: "2024-02-25",
        eventTime: "14:00",
        location: "Main Hall"
      }
    },
    {
      id: 4,
      title: "Route Delay Notice ⚠️",
      message: "Due to road construction on Uganda Road, today's evening pickup may be delayed by 15-20 minutes. We apologize for any inconvenience.",
      time: "5 hours ago",
      date: "2024-02-20",
      type: "delay",
      priority: "high",
      read: true,
      icon: AlertTriangle,
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-50 to-pink-50",
      borderColor: "border-red-200",
      data: {
        delayTime: "15-20 minutes",
        reason: "Road construction",
        affectedRoute: "Uganda Road"
      }
    },
    {
      id: 5,
      title: "Monthly Transport Fee Due 💳",
      message: "The transport fee for March 2024 (KES 3,500) is due on February 25th. You can pay via M-Pesa or at the school office.",
      time: "1 day ago",
      date: "2024-02-19",
      type: "payment",
      priority: "medium",
      read: true,
      icon: Phone,
      color: "from-green-500 to-teal-500",
      bgColor: "from-green-50 to-teal-50",
      borderColor: "border-green-200",
      data: {
        amount: 3500,
        dueDate: "2024-02-25",
        month: "March 2024"
      }
    },
    {
      id: 6,
      title: "Eco Champion Badge Earned! 🌱",
      message: "Amazing! Abigail is now in the top 15 students for CO₂ savings this month. She has saved 15.8 kg of CO₂ through bus transport.",
      time: "2 days ago",
      date: "2024-02-18",
      type: "achievement",
      priority: "low",
      read: true,
      icon: Star,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      data: {
        co2Saved: 15.8,
        rank: 15,
        badgeType: "Eco Champion"
      }
    },
    {
      id: 7,
      title: "School Closure - Mid-Term Break 🏖️",
      message: "School will be closed from March 1st to March 8th for mid-term break. Transport services will resume on March 11th.",
      time: "3 days ago",
      date: "2024-02-17",
      type: "announcement",
      priority: "high",
      read: true,
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      data: {
        startDate: "2024-03-01",
        endDate: "2024-03-08",
        resumeDate: "2024-03-11"
      }
    },
    {
      id: 8,
      title: "Weekly Safety Report ✅",
      message: "This week's safety summary: All buses passed safety inspection, 98.5% on-time performance, zero incidents reported.",
      time: "1 week ago",
      date: "2024-02-13",
      type: "safety",
      priority: "low",
      read: true,
      icon: CheckCircle,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      data: {
        onTimePercentage: 98.5,
        incidents: 0,
        safetyScore: "Excellent"
      }
    }
  ];

  const notificationTypes = [
    { id: "all", label: "All", count: notifications.length },
    { id: "pickup", label: "Pickup/Dropoff", count: notifications.filter(n => n.type === "pickup" || n.type === "dropoff").length },
    { id: "achievement", label: "Achievements", count: notifications.filter(n => n.type === "achievement").length },
    { id: "announcement", label: "Announcements", count: notifications.filter(n => n.type === "announcement").length },
    { id: "payment", label: "Payments", count: notifications.filter(n => n.type === "payment").length },
    { id: "delay", label: "Delays", count: notifications.filter(n => n.type === "delay").length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === "all" || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    // Implementation would update notification read status
    console.log(`Marking notification ${id} as read`);
  };

  const markAllAsRead = () => {
    // Implementation would mark all notifications as read
    console.log("Marking all notifications as read");
  };

  const deleteNotification = (id: number) => {
    // Implementation would delete notification
    console.log(`Deleting notification ${id}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center">
                <Bell className="w-8 h-8 mr-3" />
                Notifications
              </h2>
              <p className="text-purple-100">Stay updated with your child's transport and school activities</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4 mb-2">
                <Badge className="bg-white/20 text-white text-lg px-3 py-1">
                  {unreadCount} Unread
                </Badge>
                <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={markAllAsRead} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark All Read
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filter by:</span>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {notificationTypes.map((type) => (
              <Button
                key={type.id}
                variant={filter === type.id ? "default" : "outline"}
                onClick={() => setFilter(type.id)}
                className={`${
                  filter === type.id 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {type.label}
                {type.count > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-current">
                    {type.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card 
                key={notification.id} 
                className={`shadow-lg hover:shadow-xl transition-all duration-300 ${
                  !notification.read ? `border-2 ${notification.borderColor}` : 'border border-gray-200'
                } overflow-hidden`}
              >
                <div className={`h-1 bg-gradient-to-r ${notification.color}`}></div>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${notification.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className={`font-bold text-lg ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">{notification.time}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {/* Notification Data */}
                      {notification.data && (
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${notification.bgColor} border ${notification.borderColor} mb-4`}>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(notification.data).map(([key, value]) => (
                              <div key={key} className="text-center">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="font-semibold text-gray-800">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {notification.read ? "Read" : "Mark Read"}
                          </Button>
                          
                          {notification.type === "pickup" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Bus className="w-3 h-3 mr-1" />
                              Track Bus
                            </Button>
                          )}
                          
                          {notification.type === "announcement" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-300 text-green-600 hover:bg-green-50"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Add to Calendar
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Notifications Found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `No notifications match "${searchTerm}"`
                  : "You're all caught up! No new notifications at the moment."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notification Settings */}
      <Card className="shadow-xl border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center space-x-3 text-blue-800">
            <Settings className="w-6 h-6" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Delivery Methods</h4>
              <div className="space-y-3">
                {[
                  { icon: Bell, label: "Push Notifications", enabled: true },
                  { icon: Mail, label: "Email Notifications", enabled: true },
                  { icon: MessageSquare, label: "SMS Alerts", enabled: false },
                  { icon: Phone, label: "WhatsApp Messages", enabled: true }
                ].map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{method.label}</span>
                      </div>
                      <Badge className={method.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {method.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Notification Types</h4>
              <div className="space-y-3">
                {[
                  { label: "Pickup/Dropoff Alerts", enabled: true, priority: "high" },
                  { label: "Achievement Notifications", enabled: true, priority: "medium" },
                  { label: "School Announcements", enabled: true, priority: "medium" },
                  { label: "Payment Reminders", enabled: true, priority: "medium" },
                  { label: "Safety Updates", enabled: true, priority: "high" },
                  { label: "Promotional Messages", enabled: false, priority: "low" }
                ].map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{type.label}</span>
                      <Badge className={`ml-2 ${getPriorityColor(type.priority)}`}>
                        {type.priority}
                      </Badge>
                    </div>
                    <Badge className={type.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                      {type.enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">Quiet Hours</h4>
                <p className="text-sm text-gray-600">No notifications between 9:00 PM and 6:00 AM</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}