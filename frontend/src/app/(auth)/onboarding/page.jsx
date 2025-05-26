"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CompleteUserProfileForm from "@/components/onboarding/profile";

export default function Onboarding() {
 
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-2xl p-6 shadow-lg bg-white">
            <CompleteUserProfileForm/>
       </Card>
    </div>
  );
}