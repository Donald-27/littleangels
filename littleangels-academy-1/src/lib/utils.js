import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge Tailwind CSS classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency for Kenya Shillings
export function formatCurrency(amount, currency = 'KES') {
  if (currency === 'KES') {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Format date to local Kenya time
export function formatDate(date, options = {}) {
  const defaultOptions = {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-KE', defaultOptions).format(new Date(date));
}

// Format time to local Kenya time
export function formatTime(date, includeSeconds = false) {
  const options = {
    timeZone: 'Africa/Nairobi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  
  if (includeSeconds) {
    options.second = '2-digit';
  }
  
  return new Intl.DateTimeFormat('en-KE', options).format(new Date(date));
}

// Generate a random color for avatars
export function generateAvatarColor(name) {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// Get initials from name
export function getInitials(name) {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

// Generate QR code data for students
export function generateQRData(studentId, schoolId) {
  return btoa(JSON.stringify({
    studentId,
    schoolId,
    timestamp: Date.now(),
    type: 'student_transport',
  }));
}

// Parse QR code data
export function parseQRData(qrData) {
  try {
    return JSON.parse(atob(qrData));
  } catch (error) {
    throw new Error('Invalid QR code data');
  }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Estimate arrival time based on distance and speed
export function estimateArrivalTime(distance, averageSpeed = 30) {
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = Math.round(timeInHours * 60);
  return timeInMinutes;
}

// Format phone number to Kenya format
export function formatPhoneNumber(phone) {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 254, it's already in international format
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  }
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  }
  
  // If it's 9 digits, assume it's missing the 254 prefix
  if (cleaned.length === 9) {
    return `+254${cleaned}`;
  }
  
  // Return as is if we can't determine the format
  return phone;
}

// Validate email address
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Kenya format)
export function isValidPhoneNumber(phone) {
  const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Generate random student ID
export function generateStudentId(prefix = 'LAS') {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

// Generate transaction ID
export function generateTransactionId(prefix = 'TXN') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth) {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Get academic year based on date
export function getAcademicYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  
  // Academic year in Kenya typically starts in January
  if (month >= 0) { // January onwards
    return year;
  } else {
    return year - 1;
  }
}

// Get current term based on date
export function getCurrentTerm(date = new Date()) {
  const month = date.getMonth() + 1; // 1-indexed for easier comparison
  
  if (month >= 1 && month <= 4) {
    return 'term1';
  } else if (month >= 5 && month <= 8) {
    return 'term2';
  } else {
    return 'term3';
  }
}

// Debounce function for search inputs
export function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Sleep function for async operations
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if user is online
export function isOnline() {
  return navigator.onLine;
}

// Download file as blob
export function downloadFile(data, filename, type = 'text/plain') {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Convert array to CSV
export function arrayToCSV(data, headers = null) {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = [csvHeaders.join(',')];
  
  for (const row of data) {
    const values = csvHeaders.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Get status color based on status type
export function getStatusColor(status, type = 'default') {
  const statusColors = {
    default: {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    },
    vehicle: {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      out_of_service: 'bg-red-100 text-red-800',
    },
    student: {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      early_pickup: 'bg-blue-100 text-blue-800',
      missed: 'bg-red-100 text-red-800',
    },
    payment: {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
  };
  
  return statusColors[type]?.[status] || statusColors.default[status] || 'bg-gray-100 text-gray-800';
}
