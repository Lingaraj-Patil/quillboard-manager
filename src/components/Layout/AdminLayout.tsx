import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/10">
        <AdminSidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};