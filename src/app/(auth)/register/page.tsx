import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const metadata = { title: "Регистрация | ИИ Хаб" };

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
