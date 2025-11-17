import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getAuthenticatedUser } from "@/lib/auth/getUser";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await getAuthenticatedUser();

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex h-screen w-full flex-col">{children}</div>
    </SidebarProvider>
  );
}
