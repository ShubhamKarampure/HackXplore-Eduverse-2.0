"use client";
import React, { useState } from 'react';
import {
    FaBirthdayCake,
    FaBook,
    FaInfo,
    FaUserCircle, // Added for image placeholder/icon
    FaUpload // Added for button icon
} from 'react-icons/fa';
import ComponentCard from "../courses/dashboard/stats/common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField"; // Assuming this can handle type="file" or use a standard input
import Form from "../form/Form";
import Button from "../ui/button/Button";
import { createUserProfile } from '@/api/authApi'; // Ensure this path is correct
import { useRouter } from "next/navigation";
import { useAlert } from '@/context/AlertContext'; // Ensure this path is correct

export default function CompleteUserProfileForm() {
    const router = useRouter();
    const { showAlert, alertTypes } = useAlert();

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
    // --- New state for image ---
    const [profileImage, setProfileImage] = useState(null); // To hold the File object
    const [imagePreview, setImagePreview] = useState(null); // To hold the preview URL
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state


    const handleProfileChange = (field, value) => {
        // ... your existing handleProfileChange logic remains the same ...
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

    // --- New handler for image change ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setProfileImage(file); // Store the file object

            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result); // Set preview URL (Data URL)
            };
            reader.readAsDataURL(file);
        } else {
            // Reset if no file or non-image file is selected
            setProfileImage(null);
            setImagePreview(null);
            if (file) { // If a file was selected but it wasn't an image
                showAlert('Please select a valid image file (e.g., JPG, PNG, GIF).', alertTypes.ERROR);
            }
        }
    };


    // --- Modified handleSubmit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Set loading state

        // Use FormData to send multipart data (including file)
        const formData = new FormData();

        // Append text fields
        formData.append('role', userProfile.role);
        // How you append complex objects/arrays depends on your backend middleware (e.g., multer, express-fileupload)
        // Option 1: Send nested parts (might work with some middleware)
        formData.append('dob[day]', userProfile.dob.day);
        formData.append('dob[month]', userProfile.dob.month);
        formData.append('dob[year]', userProfile.dob.year);
        // Option 2: Stringify JSON (reliable, requires backend parsing)
        // formData.append('dob', JSON.stringify(userProfile.dob));

        // Append array (check backend how it expects arrays from FormData)
        // Option 1: Append each item (might work)
        userProfile.interests.forEach((interest, index) => {
           formData.append(`interests[${index}]`, interest);
        });
        // Option 2: Send comma-separated string
        // formData.append('interests', userProfile.interests.join(','));
        // Option 3: Stringify JSON array
        // formData.append('interests', JSON.stringify(userProfile.interests));

        formData.append('about', userProfile.about);

        // Append the image file IF one is selected
        if (profileImage) {
            // The key 'profileImage' MUST match the name expected by your backend middleware (e.g., upload.single('profileImage'))
            formData.append('profileImage', profileImage);
        }

        // For debugging: Log FormData contents
        // for (let [key, value] of formData.entries()) {
        //   console.log(`${key}:`, value);
        // }

        try {
            // Pass the FormData object to the API call
            await createUserProfile(formData); // Pass formData here
            showAlert(
                `Profile created successfully`,
                alertTypes.SUCCESS
            );
            router.push("/dashboard");
        } catch (error) {
            console.error("Profile Update Error:", error); // Log the full error
            const errorMessage = error.response?.data?.message || error.message || "Error updating user profile";
            showAlert(errorMessage, alertTypes.ERROR);
        } finally {
             setIsSubmitting(false); // Reset loading state
        }
    };

    return (
        <ComponentCard title="Complete Your Profile">
            {/* Add noValidate if doing client-side validation feedback */}
            <Form onSubmit={handleSubmit} /* noValidate */ >
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* ... other heading ... */}
                     <div className="col-span-full">
                         <h4 className="pb-4 text-base font-medium text-gray-800 border-b border-gray-200 dark:border-gray-800 dark:text-white/90">
                             Additional Profile Details
                         </h4>
                     </div>


                    {/* --- Profile Image Upload Section --- */}
                    <div className="col-span-full flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        <div className="flex-shrink-0">
                             {imagePreview ? (
                                 <img
                                     src={imagePreview}
                                     alt="Profile Preview"
                                     className="w-24 h-24 rounded-full object-cover border border-gray-300"
                                 />
                             ) : (
                                 <FaUserCircle className="w-24 h-24 text-gray-400" /> // Placeholder Icon
                             )}
                        </div>
                        <div className="flex-grow">
                             <Label htmlFor="profileImage" className="mb-2">Profile Picture</Label>
                             <Input
                                 type="file"
                                 id="profileImage"
                                 name="profileImage" // Name attribute can be useful
                                 accept="image/png, image/jpeg, image/gif" // Specify accepted image types
                                 onChange={handleImageChange}
                                 // Basic file input styling (Tailwind example, adjust as needed)
                                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                             />
                             <p className="mt-1 text-xs text-gray-500">PNG, JPG or GIF (MAX. 2MB - implement size check if needed).</p>
                        </div>
                    </div>


                    {/* --- Role Selection --- */}
                    <div className="col-span-full">
                        {/* ... Role input unchanged ... */}
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
                                     required // Example validation
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
                                     required
                                 />
                                 <span className="ml-2">Teacher</span>
                             </label>
                         </div>
                    </div>

                    {/* --- Date of Birth --- */}
                    <div className="col-span-full grid grid-cols-3 gap-2">
                         {/* ... DOB inputs unchanged ... */}
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
                                 required
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
                                 required
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
                                 required
                             />
                         </div>
                         <span className="col-span-full text-gray-500 text-sm flex items-center">
                            <FaBirthdayCake className="inline mr-2 flex-shrink-0" />
                             Enter your date of birth
                         </span>
                    </div>


                    {/* --- Interests --- */}
                    <div className="col-span-full">
                        {/* ... Interests input unchanged ... */}
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

                    {/* --- About You --- */}
                    <div className="col-span-full">
                        {/* ... About input unchanged ... */}
                         <Label htmlFor="about">About You</Label>
                         <div className="relative">
                             {/* Assuming your Input component can handle type="textarea" or renders a <textarea> */}
                             <Input
                                 type="textarea"
                                 id="about"
                                 name="about"
                                 placeholder="Tell us a bit about yourself"
                                 value={userProfile.about}
                                 onChange={(e) => handleProfileChange('about', e.target.value)}
                                 className="pl-11 h-24" // Make sure Input component applies this correctly
                                 rows={4} // Standard textarea attribute
                             />
                              <span className="absolute text-gray-500 top-4 left-4 dark:text-gray-400">
                                 <FaInfo />
                             </span>
                         </div>
                    </div>

                    {/* --- Buttons --- */}
                    <div className="flex gap-3 col-span-full">
                         <Button type="submit" disabled={isSubmitting}>
                             {isSubmitting ? 'Updating...' : 'Update Profile'}
                             {!isSubmitting && <FaUpload className="ml-2 inline-block" />}
                         </Button>
                         <Button
                            type="button"
                            size="md"
                            variant="outline"
                            onClick={() => router.back()} // Example cancel action
                            disabled={isSubmitting}
                         >
                             Cancel
                         </Button>
                    </div>
                </div>
            </Form>
        </ComponentCard>
    );
}