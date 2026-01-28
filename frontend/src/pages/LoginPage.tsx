import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Loader2,
  ArrowLeft,
  User,
  Stethoscope,
  FlaskConical,
  Shield,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
  const { t } = useLanguage();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: LoginFormValues) => {
    console.log("[LOGIN PAGE] Form submission started");
    const success = await login(values.email, values.password);

    if (success) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dashboardRoutes: Record<string, string> = {
        Admin: "/admin",
        Doctor: "/doctor",
        "Lab Technician": "/lab",
        Patient: "/patient",
      };

      const redirectRoute = dashboardRoutes[user.role] || from;
      navigate(redirectRoute, { replace: true });
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    form.setValue("email", demoEmail);
    form.setValue("password", demoPassword);

    const success = await login(demoEmail, demoPassword);

    if (success) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dashboardRoutes: Record<string, string> = {
        Admin: "/admin",
        Doctor: "/doctor",
        "Lab Technician": "/lab",
        Patient: "/patient",
      };

      const redirectRoute = dashboardRoutes[user.role] || "/";
      navigate(redirectRoute, { replace: true });
    }
  };

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>

          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <img
                  src="/logo.png"
                  alt="Black Lion Hospital"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <CardTitle className="text-2xl font-bold">
                {t("welcomeBack")}
              </CardTitle>
              <CardDescription className="text-sm">
                {t("loginDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("password")}</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="text-base pr-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showPassword"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="showPassword" className="text-sm">
                      Show Password
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-base py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("login")}
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        {t("login")}
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center pt-2">
                <Separator className="mb-6 border-gray-50" />
                <p className="text-sm text-gray-500 font-medium">
                  {t("noAccount")}{" "}
                  <Link
                    to="/register"
                    className="text-primary font-bold hover:underline transition-all"
                  >
                    {t("createOneHere")}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
