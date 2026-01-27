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
    <MainLayout showHeader={false} title={t("login")}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button
            variant="ghost"
            asChild
            className="mb-4 hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Link>
          </Button>

          <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md">
            <CardHeader className="text-center pb-2">
              <div className="w-24 mx-auto mb-4 flex items-center justify-center bg-white rounded-2xl p-2 shadow-sm border border-primary/5">
                <img
                  src="/logo.png"
                  alt="Black Lion Hospital QMS"
                  className="w-full h-full object-contain"
                />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                {t("welcomeBack")}
              </CardTitle>
              <CardDescription className="text-base">
                {t("loginDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              {/* Login Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("email")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your@email.com"
                            {...field}
                            className="h-12 border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
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
                        <div className="flex items-center justify-between">
                          <FormLabel>{t("password")}</FormLabel>
                          <span className="text-xs text-primary/50 cursor-not-allowed">
                            Forgot Password?
                          </span>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="h-12 border-gray-200 pr-10 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {t("loading")}
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
