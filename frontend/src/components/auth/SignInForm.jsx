"use client";
import { useState, useEffect, useRef } from "react";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { loginUser, googleloginUser } from "@/api/authApi.js";
import { useRouter } from 'next/navigation';
import Form from "@/components/form/Form";
import { useAlert } from "@/context/AlertContext";

export default function SignInForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { showAlert, alertTypes } = useAlert();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const tokenClientRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      /* global google */
      tokenClientRef.current = google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.events",
        prompt: "consent",
        callback: async (tokenResponse) => {
          console.log("Token Response:", tokenResponse);

          if (tokenResponse?.access_token) {
            try {
              await googleloginUser({ token: tokenResponse.access_token });
              router.push("/dashboard");
              showAlert(`Successfully logged in with Google`, alertTypes.SUCCESS);
            } catch (error) {
              showAlert(
                error.response?.data?.message || "Google Calendar auth failed",
                alertTypes.ERROR
              );
            }
          } else {
            showAlert("Failed to get access token", alertTypes.ERROR);
          }
        },
      });
    };
    document.head.appendChild(script);
  }, []);

  const handleGoogleCalendarLogin = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
    } else {
      showAlert("Google OAuth not initialized yet", alertTypes.ERROR);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    try {
      const response = await loginUser(formData);
      router.push("/dashboard");
      showAlert(`Successfully logged in`, alertTypes.SUCCESS);
    } catch (err) {
      showAlert(
        err?.message || "Invalid email or password. Please try again.",
        alertTypes.ERROR
      );
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto sm:pt-10 mb-5">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-5">
            <Button onClick={handleGoogleCalendarLogin} type="button" variant="outline">
              Sign in with Google (Calendar Access)
            </Button>
          </div>

          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                Or
              </span>
            </div>
          </div>

          <Form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                name="email"
                placeholder="info@gmail.com"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeCloseIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">
                Forgot password?
              </Link>
            </div>
            <Button type="submit">
              Sign In
            </Button>
          </Form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
