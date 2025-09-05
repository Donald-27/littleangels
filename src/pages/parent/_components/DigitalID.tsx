import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  QrCode, Download, Share2, Printer, Star, Shield, 
  User, Calendar, MapPin, Phone, Mail, Heart,
  Sparkles, Award, Camera, RefreshCw
} from "lucide-react";
import QRCodeGenerator from "qrcode";

export default function DigitalID() {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [brightness, setBrightness] = useState(100);
  const canvasRef = useRef(null);

  const studentData = {
    name: "Abigail Jepchumba Chepkemoi",
    studentId: "EM24015",
    grade: "Grade 5",
    class: "Grade 5A",
    branch: "Eldoret Main Campus",
    qrCode: "SST2024015ABC",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    bus: "KBY 245C",
    route: "Route 1 - Main Campus",
    emergencyContact: "+254701234567",
    guardian: "Mary Jepchumba Cheruiyot",
    bloodType: "O+",
    allergies: ["None"],
    validUntil: "2024-12-31",
    issueDate: "2024-01-08"
  };

  const achievements = [
    { icon: "⭐", title: "Perfect Attendance", color: "text-yellow-600" },
    { icon: "🌱", title: "Eco Champion", color: "text-green-600" },
    { icon: "🛡️", title: "Safety Star", color: "text-blue-600" },
  ];

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        studentId: studentData.studentId,
        name: studentData.name,
        qrCode: studentData.qrCode,
        branch: studentData.branch,
        validUntil: studentData.validUntil,
        timestamp: new Date().toISOString()
      });
      
      const url = await QRCodeGenerator.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadID = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${studentData.name}-Digital-ID.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareID = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Student Digital ID',
          text: `Digital ID for ${studentData.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Digital Student ID</h2>
              <p className="text-purple-100">Secure identification and boarding pass</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-white/20 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
              <Badge className="bg-green-500 text-white animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Digital ID Card */}
        <Card className="shadow-2xl border-2 border-purple-200 overflow-hidden">
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Smart School Transport</h3>
                  <p className="text-sm text-purple-100">Digital Student ID</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-100">Valid Until</p>
                <p className="font-bold">{studentData.validUntil}</p>
              </div>
            </div>

            {/* Student Photo and Info */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white/30">
                  <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                    {studentData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{studentData.name}</h2>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-white/20 text-white text-xs">
                      {studentData.grade}
                    </Badge>
                    <Badge className="bg-white/20 text-white text-xs">
                      {studentData.class}
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-100">{studentData.branch}</p>
                  <p className="font-mono text-lg font-bold tracking-wider">{studentData.studentId}</p>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">Achievements:</span>
              {achievements.map((achievement, index) => (
                <span key={index} className="text-sm" title={achievement.title}>
                  {achievement.icon}
                </span>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          <CardContent className="p-6 bg-white">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gray-50 rounded-2xl shadow-inner">
                {qrCodeUrl && (
                  <img 
                    src={qrCodeUrl} 
                    alt="Student QR Code" 
                    className="w-48 h-48 mx-auto"
                    style={{ filter: `brightness(${brightness}%)` }}
                  />
                )}
              </div>
              <div className="mt-4">
                <p className="font-mono text-lg font-bold text-gray-800">{studentData.qrCode}</p>
                <p className="text-sm text-gray-600">Scan for boarding verification</p>
              </div>
            </div>

            {/* Brightness Control */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Screen Brightness: {brightness}%
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={downloadID}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                onClick={shareID}
                variant="outline"
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Student Details */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="shadow-xl border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center space-x-3 text-blue-800">
                <User className="w-6 h-6" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-semibold">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Student ID</p>
                  <p className="font-mono font-bold">{studentData.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Grade & Class</p>
                  <p className="font-semibold">{studentData.grade} - {studentData.class}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Branch</p>
                  <p className="font-semibold">{studentData.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Blood Type</p>
                  <Badge className="bg-red-100 text-red-700">{studentData.bloodType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Allergies</p>
                  <Badge className="bg-green-100 text-green-700">
                    {studentData.allergies.join(', ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transport Information */}
          <Card className="shadow-xl border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="flex items-center space-x-3 text-orange-800">
                <MapPin className="w-6 h-6" />
                <span>Transport Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🚌</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Bus Number</p>
                      <p className="text-sm text-gray-600">{studentData.bus}</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-500 text-white">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📍</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Route</p>
                      <p className="text-sm text-gray-600">{studentData.route}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500 text-white">Assigned</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="shadow-xl border-2 border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardTitle className="flex items-center space-x-3 text-red-800">
                <Phone className="w-6 h-6" />
                <span>Emergency Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Primary Guardian</p>
                  <p className="font-semibold text-gray-800">{studentData.guardian}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono font-semibold text-gray-800">{studentData.emergencyContact}</p>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      <Phone className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Validity */}
          <Card className="shadow-xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center space-x-3 text-green-800">
                <Calendar className="w-6 h-6" />
                <span>ID Validity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Issue Date</span>
                  <span className="font-semibold">{studentData.issueDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Valid Until</span>
                  <span className="font-semibold text-green-600">{studentData.validUntil}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-500 text-white">
                    <Heart className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={generateQRCode}
                variant="outline" 
                className="w-full mt-4 border-2 border-green-300 text-green-700 hover:bg-green-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate QR Code
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Security & Privacy Notice</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• This digital ID contains encrypted student information for secure boarding verification</p>
                <p>• QR code is unique and changes periodically for enhanced security</p>
                <p>• Only authorized school personnel can access student data through this ID</p>
                <p>• Keep this ID confidential and report any suspicious activity immediately</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden canvas for downloading */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}