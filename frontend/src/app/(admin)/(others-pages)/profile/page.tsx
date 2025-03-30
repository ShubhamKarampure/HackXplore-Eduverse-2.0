import UserInfoCard from "@/components/user-profile/UserInfoCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Eduverse",
  description:
    "AI assisted learning platform",
};

export default function Profile() {
  return (
    <div>
          <UserInfoCard />
    </div>
  );
}
