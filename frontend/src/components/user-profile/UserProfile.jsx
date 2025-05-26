import React from 'react';
import { User, Mail, Calendar, BookOpen, Award } from 'lucide-react';
import useUserStore from '../path/to/useUserStore';

const UserProfile = () => {
  const { user } = useUserStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const formatDate = (dob) => {
    if (!dob) return 'Not specified';
    return `${dob.day}/${dob.month}/${dob.year}`;
  };

  const getAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob.year, dob.month - 1, dob.day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `(${age} years)`;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        
        {/* Profile Info */}
        <div className="relative px-6 py-10 md:px-10">
          {/* Profile Image */}
          <div className="absolute -top-16 left-10 border-4 border-white rounded-full shadow-md">
            {user.profile?.image?.url ? (
              <img 
                src={user.profile.image.url} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={48} className="text-gray-400" />
              </div>
            )}
          </div>
          
          {/* User Name & Role */}
          <div className="mt-16 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{user.firstName} {user.lastName}</h1>
            <div className="flex items-center mt-1">
              <Award className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-blue-600 font-medium">{user.role}</span>
            </div>
          </div>
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Contact Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-gray-800">
                      {formatDate(user.profile?.dob)} {getAge(user.profile?.dob)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interests */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {user.profile?.interests && user.profile.interests.length > 0 ? (
                  user.profile.interests.map((interest, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No interests specified</p>
                )}
              </div>
            </div>
          </div>
          
          {/* About Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">About Me</h2>
            <div className="flex items-start">
              <BookOpen className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
              <p className="text-gray-700">{user.profile?.about || "No information provided"}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end mt-6">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition mr-3">
              Edit Profile
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
              Share Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;