import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, FolderOpen, Tags, Bot, Settings, Brain } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.png";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const items = [
    { title: "All Notes", url: "/", icon: Home },
    { title: "Folders", url: "/folders", icon: FolderOpen },
    { title: "Tags", url: "/tags", icon: Tags },
    { title: "Knowledge Graph", url: "/knowledge-graph", icon: Brain },
    { title: "Assistant", url: "/assistant", icon: Bot },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted";

  return (
    <Sidebar 
      className={`transition-all duration-300 ${collapsed ? "w-14" : "w-60"} border-r border-border`} 
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className={`p-4 border-b border-border ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Zen TOT" 
              className={`${collapsed ? 'w-10 h-10' : 'w-10 h-10'} rounded-lg`}
            />
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg">Zen TOT</h1>
                <p className="text-xs text-muted-foreground">Train of Thought</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="p-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="transition-all duration-200 rounded-lg"
                  >
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && (
                        <span className="ml-3">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
