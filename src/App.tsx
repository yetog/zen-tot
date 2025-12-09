import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotesProvider } from "@/contexts/NotesContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import NoteDetail from "./pages/NoteDetail";
import Assistant from "./pages/Assistant";
import Settings from "./pages/Settings";
import Folders from "./pages/Folders";
import Tags from "./pages/Tags";
import NotFound from "./pages/NotFound";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <SidebarInset className="flex-1">
                  <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                    <div className="flex items-center gap-4">
                      <SidebarTrigger className="-ml-1 transition-transform hover:scale-105" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2">
                        <img src={logo} alt="Zen TOT" className="w-8 h-8 rounded-lg transition-transform hover:scale-105" />
                        <span className="text-lg font-bold">Zen <span className="text-primary">TOT</span></span>
                      </div>
                      <ThemeToggle />
                    </div>
                  </header>

                  <main className="animate-fade-in">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/note/:id" element={<NoteDetail />} />
                      <Route path="/assistant" element={<Assistant />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/folders" element={<Folders />} />
                      <Route path="/tags" element={<Tags />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </NotesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
