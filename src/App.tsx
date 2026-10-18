import React, { useState } from 'react';
import { TicketProvider } from './context/TicketContext';
import { useTickets } from './context/useTickets';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TicketListView } from './components/TicketListView';
import { TicketDetailView } from './components/TicketDetailView';
import { CreateTicketModal } from './components/CreateTicketModal';
import { StorageNotice } from './components/StorageNotice';
import { Toast } from './components/Toast';
import './App.css';

const MainContent: React.FC<{ onOpenMobileSidebar: () => void }> = ({ onOpenMobileSidebar }) => {
  const { activeView, selectedTicketId } = useTickets();

  return (
    <div className="app-main-layout">
      <Header onOpenMobileSidebar={onOpenMobileSidebar} />
      <StorageNotice />
      
      <main className="app-content-area" id="main-content" tabIndex={-1}>
        {selectedTicketId ? (
          <TicketDetailView />
        ) : activeView === 'dashboard' ? (
          <DashboardView />
        ) : (
          <TicketListView />
        )}
      </main>

      <CreateTicketModal />
      <Toast />
    </div>
  );
};

export function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <TicketProvider>
      <div className="app-shell">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <MainContent onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
      </div>
    </TicketProvider>
  );
}

export default App;
