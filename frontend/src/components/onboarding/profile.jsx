"use client"
import React, { useState } from 'react';
import { 
    FaBirthdayCake, 
    FaBook, 
    FaInfo 
} from 'react-icons/fa';
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Form from "../form/Form";
import Button from "../ui/button/Button";
import { createUserProfile } from '@/api/authApi';
import { useRouter } from "next/navigation";
import { useAlert } from '@/context/AlertContext';

export default function CompleteUserProfileForm() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState({
        role: '',
        dob: {
            day: '',
            month: '',
            year: ''
        },
        interests: [],
        about: ''
    });
 const { showAlert, alertTypes } = useAlert();
 
    
    const handleProfileChange = (field, value) => {
        if (field === 'dob') {
            setUserProfile(prev => ({
                ...prev,
                dob: { ...prev.dob, ...value }
            }));
        } else if (field === 'interests') {
            const interests = value.split(',').map(interest => interest.trim()).filter(interest => interest);
            setUserProfile(prev => ({
                ...prev,
                interests
            }));
        } else {
            setUserProfile(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await createUserProfile(userProfile)
            showAlert(
                `Profile created successfully`,
                alertTypes.SUCCESS
            );
            router.push("/dashboard");
        } catch (error) {
            showAlert(
                error.response?.data?.message || "Error updating user profile",
                alertTypes.ERROR
            );
        }      
    };

    return (
        <ComponentCard title="Complete Your Profile">
            <Form onSubmit={handleSubmit}>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="col-span-full">
                        <h4 className="pb-4 text-base font-medium text-gray-800 border-b border-gray-200 dark:border-gray-800 dark:text-white/90">
                            Additional Profile Details
                        </h4>
                    </div>

                    <div className="col-span-full">
                        <Label htmlFor="role">Role</Label>
                        <div className="flex gap-4">
                            <label className="inline-flex items-center">
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="Student"
                                    checked={userProfile.role === 'Student'}
                                    onChange={() => handleProfileChange('role', 'Student')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Student</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="Teacher"
                                    checked={userProfile.role === 'Teacher'}
                                    onChange={() => handleProfileChange('role', 'Teacher')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Teacher</span>
                            </label>
                        </div>
                    </div>

                    <div className="col-span-full grid grid-cols-3 gap-2">
                        <div>
                            <Label htmlFor="dobDay">Day</Label>
                            <Input 
                                type="number" 
                                id="dobDay"
                                name="dobDay"
                                placeholder="DD"
                                min="1"
                                max="31"
                                value={userProfile.dob.day}
                                onChange={(e) => handleProfileChange('dob', { day: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="dobMonth">Month</Label>
                            <Input 
                                type="number" 
                                id="dobMonth"
                                name="dobMonth"
                                placeholder="MM"
                                min="1"
                                max="12"
                                value={userProfile.dob.month}
                                onChange={(e) => handleProfileChange('dob', { month: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="dobYear">Year</Label>
                            <Input 
                                type="number" 
                                id="dobYear"
                                name="dobYear"
                                placeholder="YYYY"
                                min="1900"
                                max={new Date().getFullYear()}
                                value={userProfile.dob.year}
                                onChange={(e) => handleProfileChange('dob', { year: e.target.value })}
                            />
                        </div>
                        <span className="col-span-full text-gray-500 text-sm">
                            <FaBirthdayCake className="inline mr-2" />
                            Enter your date of birth
                        </span>
                    </div>

                    <div className="col-span-full">
                        <Label htmlFor="interests">Interests</Label>
                        <div className="relative">
                            <Input 
                                type="text" 
                                id="interests"
                                name="interests"
                                placeholder="Enter interests separated by commas"
                                value={userProfile.interests.join(', ')}
                                onChange={(e) => handleProfileChange('interests', e.target.value)}
                                className="pl-11"
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-4 top-1/2 dark:text-gray-400">
                                <FaBook />
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                                Example: Programming, Design, Music
                            </p>
                        </div>
                    </div>

                    <div className="col-span-full">
                        <Label htmlFor="about">About You</Label>
                        <div className="relative">
                            <Input 
                                type="textarea"
                                id="about"
                                name="about"
                                placeholder="Tell us a bit about yourself"
                                value={userProfile.about}
                                onChange={(e) => handleProfileChange('about', e.target.value)}
                                className="pl-11 h-24"
                            />
                            <span className="absolute text-gray-500 top-4 left-4 dark:text-gray-400">
                                <FaInfo />
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 col-span-full">
                        <Button type="submit">
                        Update Profile
                        </Button>
                        <Button type="button" size="md" variant="outline">
                            Cancel
                        </Button>
                    </div>
                </div>
            </Form>
        </ComponentCard>
    );
}