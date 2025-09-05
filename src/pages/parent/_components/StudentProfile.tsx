import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, BookOpen, Calendar, MapPin, Phone, Mail, Heart,
  Award, TrendingUp, Clock, CheckCircle, AlertTriangle,
  Star, Shield, Camera, Edit, Download, Share2,
  Activity, Target, Zap, Gift
} from "lucide-react";

export default function StudentProfile() {
  const [activeTab, setActiveTab] = useState("overview");

  const studentData = {
    name: "Abigail Jepchumba Chepkemoi",
    nickname: "Abby",
    studentId: "EM24015",
    grade: "Grade 5",
    class: "Grade 5A",
    branch: "Eldoret Main Campus",
    dateOfBirth: "2014-03-15",
    age: 10,
    gender: "Female",
    admissionDate: "2022-01-10",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    bloodType: "O+",
    allergies: ["None"],
    medicalConditions: ["None"],
    parentName: "Mary Jepchumba Cheruiyot",
    parentPhone: "+254701234567",
    parentEmail: "mary.cheruiyot@gmail.com",
    emergencyContact: "+254702345678",
    address: "Pioneer Estate, House No. 45, Eldoret",
    transportRoute: "Route 1 - Main Campus",
    busNumber: "KBY 245C",
    pickupLocation: "Pioneer Estate Stage",
    pickupTime: "07:15 AM",
    dropoffTime: "04:30 PM"
  };

  const academicInfo = {
    currentTerm: "Term 1, 2024",
    overallGrade: "A-",
    subjects: [
      { name: "Mathematics", grade: "A", score: 89, teacher: "Mrs. Jane Kimani" },
      { name: "English", grade: "A-", score: 85, teacher: "Mr. David Mutua" },
      { name: "Kiswahili", grade: "B+", score: 82, teacher: "Ms. Grace Wanjiku" },
      { name: "Science", grade: "A", score: 91, teacher: "Mr. Peter Otieno" },
      { name: "Social Studies", grade: "B+", score: 80, teacher: "Mrs. Ann Njeri" },
      { name: "Arts & Crafts", grade: "A", score: 95, teacher: "Ms. Lucy Akinyi" }
    ],
    classRank: 3,
    totalStudents: 28,
    attendance: {
      present: 42,
      absent: 2,
      late: 1,
      percentage: 95.6
    }
  };

  const transportStats = {
    totalTrips: 164,
    onTimePercentage: 98.2,
    averageRating: 4.9,
    co2Saved: 47.5,
    monthlyStats: [
      { month: "Jan", trips: 42, onTime: 41, co2: 15.8 },
      { month: "Feb", trips: 38, onTime: 37, co2: 14.2 },
      { month: "Mar", trips: 44, onTime: 43, co2: 17.5 }
    ]
  };

  const achievements = [
    {
      id: 1,
      title: "Perfect Attendance Champion",
      description: "30 consecutive school days without absence",
      icon: "⭐",
      color: "from-yellow-400 to-orange-500",
      earned: true,
      date: "2024-01-30",
      points: 50
    },
    {
      id: 2,
      title: "Eco Warrior",
      description: "Top 10% in CO₂ savings through bus transport",
      icon: "🌱",
      color: "from-green-400 to-emerald-500",
      earned: true,
      date: "2024-02-15",
      points: 40
    },
    {
      id: 3,
      title: "Safety Star",
      description: "Always follows safety protocols",
      icon: "🛡️",
      color: "from-blue-400 to-cyan-500",
      earned: true,
      date: "2024-01-15",
      points: 35
    },
    {
      id: 4,
      title: "Academic Excellence",
      description: "Maintain A grade average for full term",
      icon: "📚",
      color: "from-purple-400 to-pink-500",
      earned: false,
      progress: 85,
      points: 60
    },
    {
      id: 5,
      title: "Punctuality Master",
      description: "Never late for bus pickup in a month",
      icon: "⏰",
      color: "from-indigo-400 to-purple-500",
      earned: false,
      progress: 90,
      points: 30
    }
  ];

  const recentActivities = [
    {
      date: "2024-02-20",
      type: "academic",
      title: "Mathematics Test",
      description: "Scored 89/100 in algebra assessment",
      icon: "📝",
      color: "text-blue-600"
    },
    {
      date: "2024-02-19",
      type: "transport",
      title: "Perfect Week",
      description: "On-time boarding for entire week",
      icon: "🚌",
      color: "text-green-600"
    },
    {
      date: "2024-02-18",
      type: "achievement",
      title: "Eco Champion Badge",
      description: "Earned for outstanding environmental contribution",
      icon: "🏆",
      color: "text-yellow-600"
    },
    {
      date: "2024-02-17",
      type: "health",
      title: "Health Checkup",
      description: "Annual health screening completed",
      icon: "🏥",
      color: "text-red-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 border-4 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                  {studentData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold mb-1">{studentData.name}</h2>
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className="bg-white/20 text-white">
                    {studentData.grade}
                  </Badge>
                  <Badge className="bg-white/20 text-white">
                    {studentData.studentId}
                  </Badge>
                  <Badge className="bg-white/20 text-white">
                    Age {studentData.age}
                  </Badge>
                </div>
                <p className="text-purple-100">{studentData.branch}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex space-x-2 mb-2">
                <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg">{academicInfo.overallGrade}</div>
                  <div className="text-purple-100">Overall Grade</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">#{academicInfo.classRank}</div>
                  <div className="text-purple-100">Class Rank</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{academicInfo.attendance.percentage}%</div>
                  <div className="text-purple-100">Attendance</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg rounded-xl p-2">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <User className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="academic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
            <BookOpen className="w-4 h-4 mr-2" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="transport" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
            <MapPin className="w-4 h-4 mr-2" />
            Transport
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="activities" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />
            Activities
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center space-x-3 text-blue-800">
                  <User className="w-6 h-6" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold">{studentData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nickname</p>
                    <p className="font-semibold">{studentData.nickname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-semibold">{studentData.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-semibold">{studentData.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-mono font-bold">{studentData.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admission Date</p>
                    <p className="font-semibold">{studentData.admissionDate}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    Health Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <Badge className="bg-red-100 text-red-700">{studentData.bloodType}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Allergies</p>
                      <Badge className="bg-green-100 text-green-700">
                        {studentData.allergies.join(', ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information */}
            <Card className="shadow-xl border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center space-x-3 text-green-800">
                  <Phone className="w-6 h-6" />
                  <span>Guardian Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Primary Guardian</p>
                  <p className="font-semibold text-lg">{studentData.parentName}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-semibold">{studentData.parentPhone}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      Call
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold">{studentData.parentEmail}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-600">
                      Email
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Home Address</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{studentData.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{academicInfo.overallGrade}</div>
                <p className="text-sm text-gray-600">Current Grade</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600">#{academicInfo.classRank}</div>
                <p className="text-sm text-gray-600">Class Ranking</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600">{academicInfo.attendance.percentage}%</div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">{achievements.filter(a => a.earned).length}</div>
                <p className="text-sm text-gray-600">Achievements</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <span>Subject Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {academicInfo.subjects.map((subject, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                          <Badge className={`${
                            subject.grade.startsWith('A') ? 'bg-green-500' :
                            subject.grade.startsWith('B') ? 'bg-blue-500' : 'bg-orange-500'
                          } text-white`}>
                            {subject.grade}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">Teacher: {subject.teacher}</p>
                          <p className="font-bold text-gray-800">{subject.score}/100</p>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              subject.score >= 90 ? 'bg-green-500' :
                              subject.score >= 80 ? 'bg-blue-500' :
                              subject.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${subject.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-center">Academic Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{academicInfo.overallGrade}</div>
                    <p className="text-gray-600">Overall Grade</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">#{academicInfo.classRank}</div>
                    <p className="text-gray-600">out of {academicInfo.totalStudents} students</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600 mb-1">{academicInfo.currentTerm}</div>
                    <p className="text-gray-600">Current Term</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-orange-600" />
                    <span>Attendance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Present</span>
                      <span className="font-bold text-green-600">{academicInfo.attendance.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absent</span>
                      <span className="font-bold text-red-600">{academicInfo.attendance.absent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Late</span>
                      <span className="font-bold text-yellow-600">{academicInfo.attendance.late}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="font-semibold">Percentage</span>
                        <span className="font-bold text-lg text-blue-600">{academicInfo.attendance.percentage}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Other tab contents would be similar with relevant data */}
        <TabsContent value="transport">
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Transport Information</h3>
            <p className="text-gray-500">Detailed transport statistics and route information</p>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`shadow-xl ${achievement.earned ? 'border-2 border-yellow-300' : 'border-gray-200 opacity-75'}`}>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3`}>
                      {achievement.icon}
                    </div>
                    <h3 className="font-bold text-gray-800">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  </div>
                  
                  {achievement.earned ? (
                    <div className="text-center">
                      <Badge className="bg-green-500 text-white mb-2">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Earned
                      </Badge>
                      <p className="text-xs text-gray-500">Earned on {achievement.date}</p>
                      <p className="text-sm font-semibold text-yellow-600">{achievement.points} points</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{achievement.progress}% complete</p>
                      <p className="text-sm font-semibold text-gray-600">{achievement.points} points</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-purple-600" />
                <span>Recent Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10`}>
                      <span className="text-lg">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                        <span className="text-sm text-gray-500">{activity.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}