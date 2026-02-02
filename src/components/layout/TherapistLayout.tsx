import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TherapistSidebar } from "./TherapistSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface TherapistLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function TherapistLayout({ children, title, description }: TherapistLayoutProps) {
  return (
    <>
      <Helmet>
        <title>{title} - Therapist | Montrose Myo</title>
      </Helmet>

      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <TherapistSidebar />
          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 sticky top-0 z-10">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/therapist">Therapist</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              {description && (
                <div className="border-b bg-muted/30 px-6 py-3">
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              )}
              <div className="p-6">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}
