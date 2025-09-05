import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, Star, Trophy, Target, Gift, Zap, 
  TrendingUp, Calendar, Leaf, Shield, Clock, BookOpen
} from "lucide-react";

export default function RewardsPanel() {
  const totalPoints = 285;
  const level = 5;
  const nextLevelPoints = 350;
  const progressToNext = ((totalPoints % 50) / 50) * 100;

  const achievements = [
    {
      id: 1,
      title: "Perfect Attendance Champion",
      description: "30 consecutive school days without absence",
      icon: "⭐",
      color: "from-yellow-400 to-orange-500",
      points: 50,
      earned: true,
      date: "2024-01-30",
      rarity: "Epic"
    },
    {
      id: 2,
      title: "Eco Warrior",
      description: "Top 10% in CO₂ savings through bus transport",
      icon: "🌱",
      color: "from-green-400 to-emerald-500",
      points: 40,
      earned: true,
      date: "2024-02-15",
      rarity: "Rare"
    },
    {
      id: 3,
      title: "Safety Champion",
      description: "Always follows safety protocols and wears seatbelt",
      icon: "🛡️",
      color: "from-blue-400 to-cyan-500",
      points: 35,
      earned: true,
      date: "2024-01-15",
      rarity: "Rare"
    },
    {
      id: 4,
      title: "Punctuality Master",
      description: "Never late for bus pickup in a month",
      icon: "⏰",
      color: "from-purple-400 to-pink-500",
      points: 30,
      earned: false,
      progress: 90,
      daysLeft: 3,
      rarity: "Common"
    },
    {
      id: 5,
      title: "Good Behavior Star",
      description: "Excellent conduct during transport",
      icon: "⭐",
      color: "from-indigo-400 to-purple-500",
      points: 25,
      earned: false,
      progress: 75,
      daysLeft: 7,
      rarity: "Common"
    },
    {
      id: 6,
      title: "Academic Excellence",
      description: "Maintain A grade average for full term",
      icon: "📚",
      color: "from-red-400 to-pink-500",
      points: 60,
      earned: false,
      progress: 85,
      daysLeft: 14,
      rarity: "Legendary"
    }
  ];

  const monthlyStats = {
    january: { points: 125, rank: 8, co2: 15.8, trips: 42 },
    february: { points: 160, rank: 5, co2: 18.2, trips: 38 },
    current: { points: 285, rank: 3, co2: 47.5, trips: 164 }
  };

  const leaderboard = [
    { rank: 1, name: "Emily Kipchoge", points: 420, avatar: "EK", school: "Main Campus" },
    { rank: 2, name: "Daniel Rotich", points: 385, avatar: "DR", school: "Pioneer Branch" },
    { rank: 3, name: "Abigail Chepkemoi", points: 285, avatar: "AC", school: "Main Campus", isCurrentUser: true },
    { rank: 4, name: "Grace Mutai", points: 275, avatar: "GM", school: "Langas Branch" },
    { rank: 5, name: "Brian Kiprotich", points: 260, avatar: "BK", school: "Pioneer Branch" }
  ];

  const availableRewards = [
    {
      id: 1,
      title: "School Supplies Kit",
      description: "Premium stationery set with notebooks and pens",
      pointsCost: 100,
      image: "🎒",
      category: "Academic",
      inStock: true
    },
    {
      id: 2,
      title: "Extra Playtime Pass",
      description: "15 minutes extra break time",
      pointsCost: 50,
      image: "🎮",
      category: "Fun",
      inStock: true
    },
    {
      id: 3,
      title: "Healthy Snack Box",
      description: "Assorted fruits and healthy snacks",
      pointsCost: 75,
      image: "🍎",
      category: "Health",
      inStock: true
    },
    {
      id: 4,
      title: "Certificate of Excellence",
      description: "Personalized achievement certificate",
      pointsCost: 150,
      image: "🏆",
      category: "Recognition",
      inStock: true
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "from-purple-500 to-pink-500";
      case "Epic": return "from-yellow-500 to-orange-500";
      case "Rare": return "from-blue-500 to-cyan-500";
      case "Common": return "from-gray-500 to-gray-600";
      default: return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center">
                <Trophy className="w-8 h-8 mr-3" />
                Rewards & Achievements
              </h2>
              <p className="text-yellow-100">Earn points and unlock amazing rewards through good behavior and achievements!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{totalPoints}</div>
              <p className="text-yellow-100">Total Points</p>
              <Badge className="bg-white/20 text-white mt-2">
                Level {level}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress */}
          <Card className="shadow-xl border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center space-x-3 text-purple-800">
                <Zap className="w-6 h-6" />
                <span>Level Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-purple-600">Level {level}</div>
                  <p className="text-gray-600">You're doing amazing!</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-800">{totalPoints} / {nextLevelPoints}</div>
                  <p className="text-sm text-gray-600">{nextLevelPoints - totalPoints} points to Level {level + 1}</p>
                </div>
              </div>
              
              <Progress value={progressToNext} className="h-3 mb-4" />
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">#{monthlyStats.current.rank}</div>
                  <p className="text-sm text-gray-600">School Rank</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{achievements.filter(a => a.earned).length}</div>
                  <p className="text-sm text-gray-600">Badges Earned</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{monthlyStats.current.co2} kg</div>
                  <p className="text-sm text-gray-600">CO₂ Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Grid */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-yellow-600" />
                <span>Achievements & Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`${
                    achievement.earned 
                      ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' 
                      : 'border border-gray-200 bg-gray-50'
                  } transition-all duration-300 hover:shadow-lg`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${achievement.color} flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-lg`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-800">{achievement.title}</h4>
                            <Badge className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white text-xs`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                          
                          {achievement.earned ? (
                            <div className="flex items-center justify-between">
                              <Badge className="bg-green-100 text-green-700">
                                <Trophy className="w-3 h-3 mr-1" />
                                Earned
                              </Badge>
                              <div className="text-right">
                                <div className="font-bold text-yellow-600">{achievement.points} pts</div>
                                <div className="text-xs text-gray-500">{achievement.date}</div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm text-gray-600">{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} className="h-2 mb-2" />
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {achievement.daysLeft} days left
                                </Badge>
                                <div className="font-bold text-gray-600">{achievement.points} pts</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance */}
          <Card className="shadow-xl border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center space-x-3 text-blue-800">
                <TrendingUp className="w-6 h-6" />
                <span>Monthly Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-3">January 2024</h4>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">{monthlyStats.january.points}</div>
                    <p className="text-sm text-gray-600">Points Earned</p>
                    <Badge className="bg-blue-500 text-white">Rank #{monthlyStats.january.rank}</Badge>
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-3">February 2024</h4>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">{monthlyStats.february.points}</div>
                    <p className="text-sm text-gray-600">Points Earned</p>
                    <Badge className="bg-green-500 text-white">Rank #{monthlyStats.february.rank}</Badge>
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">Current Total</h4>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-purple-600">{monthlyStats.current.points}</div>
                    <p className="text-sm text-gray-600">Total Points</p>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      Rank #{monthlyStats.current.rank}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Leaderboard & Rewards */}
        <div className="space-y-6">
          {/* School Leaderboard */}
          <Card className="shadow-xl border-2 border-yellow-200">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="flex items-center space-x-3 text-yellow-800">
                <Trophy className="w-6 h-6" />
                <span>School Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {leaderboard.map((student) => (
                  <div key={student.rank} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    student.isCurrentUser 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300' 
                      : 'bg-gray-50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      student.rank === 1 ? 'bg-yellow-500' :
                      student.rank === 2 ? 'bg-gray-400' :
                      student.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                      {student.avatar}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${student.isCurrentUser ? 'text-purple-800' : 'text-gray-800'}`}>
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-600">{student.school}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{student.points}</div>
                      <p className="text-xs text-gray-600">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Rewards */}
          <Card className="shadow-xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center space-x-3 text-green-800">
                <Gift className="w-6 h-6" />
                <span>Redeem Rewards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {availableRewards.map((reward) => (
                  <div key={reward.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{reward.image}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{reward.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {reward.category}
                            </Badge>
                            {reward.inStock && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                In Stock
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">{reward.pointsCost} pts</div>
                            <Button 
                              size="sm" 
                              disabled={totalPoints < reward.pointsCost}
                              className={`${
                                totalPoints >= reward.pointsCost 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                                  : 'bg-gray-400'
                              } text-white text-xs`}
                            >
                              {totalPoints >= reward.pointsCost ? 'Redeem' : 'Need More Points'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="shadow-xl border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center space-x-3 text-indigo-800">
                <Target className="w-6 h-6" />
                <span>How to Earn More Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { icon: Clock, text: "Be on time for bus pickup", points: "5 pts/day" },
                  { icon: BookOpen, text: "Perfect school attendance", points: "10 pts/day" },
                  { icon: Shield, text: "Follow safety protocols", points: "3 pts/trip" },
                  { icon: Leaf, text: "Use school transport daily", points: "2 pts/trip" },
                  { icon: Star, text: "Good behavior reports", points: "15 pts/week" }
                ].map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-indigo-50 rounded-lg">
                      <Icon className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{tip.text}</p>
                      </div>
                      <Badge className="bg-indigo-500 text-white text-xs">
                        {tip.points}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}