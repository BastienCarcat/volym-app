import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default async function VerifyPage(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;

  const email = searchParams.email;
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center text-sm">
            Click the link in the email to reset your password. If you
            don&apos;t see it, check your spam folder.
          </p>
          {/* <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/auth/login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button> */}
        </CardContent>
      </Card>
    </div>
  );
}
