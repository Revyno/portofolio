import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-s0 px-6">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#4CE0FF",
            colorBackground: "#0E0E0E",
            colorForeground: "#ffffff",
            colorInput: "#111111",
            borderRadius: "0px",
          },
        }}
      />
    </main>
  );
}
