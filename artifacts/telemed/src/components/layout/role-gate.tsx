import { ReactNode } from "react";
import { Show } from "@clerk/react";
import { Redirect } from "wouter";
import { useGetMyProfile } from "@workspace/api-client-react";
import { Spinner } from "@/components/ui/spinner";

export function SignedInOnly({ children }: { children: ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

export function RoleGate({
  role,
  children,
}: {
  role: "patient" | "doctor";
  children: ReactNode;
}) {
  return (
    <SignedInOnly>
      <RoleCheck role={role}>{children}</RoleCheck>
    </SignedInOnly>
  );
}

function RoleCheck({
  role,
  children,
}: {
  role: "patient" | "doctor";
  children: ReactNode;
}) {
  const { data: profile, isLoading } = useGetMyProfile();
  if (isLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (profile.role === "unset") return <Redirect to="/role-select" />;
  if (profile.role !== role) {
    return <Redirect to={profile.role === "doctor" ? "/doctor" : "/patient"} />;
  }
  return <>{children}</>;
}
