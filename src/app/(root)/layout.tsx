import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex h-screen w-full flex-col">{children}</div>
    </SidebarProvider>
  );
}
