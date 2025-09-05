import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Award, Target, Globe, Recycle } from "lucide-react";

export default function EcoMetrics() {
  const ecoData = {
    monthlyTrips: 42,
    totalTrips: 164,
    co2SavedMonth: 15.8,
    co2SavedTotal: 47.5,
    fuelSavedMonth: 6.2,
    fuelSavedTotal: 18.6,
    treesEquivalentMonth: 3,
    treesEquivalentTotal: 9,
    schoolRank: 15,
    totalStudents: 200,
    monthlyGoal: 50,
    yearlyGoal: 200
  };

  return (
    <Card className="shadow-xl border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center space-x-3 text-green-800">
          <Leaf className="w-6 h-6" />
          <span>Environmental Impact</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-green-600 mb-2">{ecoData.co2SavedMonth} kg</div>
          <p className="text-gray-600 mb-4">CO₂ Saved This Month</p>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{ecoData.monthlyTrips}</div>
              <p className="text-xs text-gray-600">Bus Trips</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{ecoData.fuelSavedMonth}L</div>
              <p className="text-xs text-gray-600">Fuel Saved</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{ecoData.treesEquivalentMonth}</div>
              <p className="text-xs text-gray-600">Trees Saved</p>
            </div>
          </div>
          
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <Award className="w-3 h-3 mr-1" />
            Rank #{ecoData.schoolRank} of {ecoData.totalStudents}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Goal Progress</span>
              <span>{ecoData.monthlyTrips}/{ecoData.monthlyGoal} trips</span>
            </div>
            <Progress value={(ecoData.monthlyTrips / ecoData.monthlyGoal) * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Yearly Goal Progress</span>
              <span>{ecoData.totalTrips}/{ecoData.yearlyGoal} trips</span>
            </div>
            <Progress value={(ecoData.totalTrips / ecoData.yearlyGoal) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}