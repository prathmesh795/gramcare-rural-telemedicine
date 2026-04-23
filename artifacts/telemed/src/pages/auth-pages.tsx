import { SignIn, SignUp } from "@clerk/react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function SignInPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2 bg-background">
      <AuthSidebar />
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SignIn
            routing="path"
            path={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
          />
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link href="/" className="underline">
              {t("auth.backHome")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function SignUpPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2 bg-background">
      <AuthSidebar />
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SignUp
            routing="path"
            path={`${basePath}/sign-up`}
            signInUrl={`${basePath}/sign-in`}
          />
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link href="/" className="underline">
              {t("auth.backHome")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthSidebar() {
  const { t } = useTranslation();
  return (
    <div className="hidden md:flex flex-col justify-between p-10 bg-primary text-primary-foreground">
      <Link href="/" className="flex items-center gap-2">
        <BrandLogo size={32} />
        <span className="font-semibold text-lg">{t("app.name")}</span>
      </Link>
      <div>
        <h2 className="text-3xl font-semibold leading-tight">
          {t("landing.hero")}
        </h2>
        <p className="mt-4 text-primary-foreground/90 leading-relaxed">
          {t("landing.sub")}
        </p>
      </div>
      <p className="text-sm text-primary-foreground/80">
        {t("app.tagline")}
      </p>
    </div>
  );
}
