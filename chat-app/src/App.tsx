import React, { useEffect } from 'react';
import { ChatProvider } from './context/ChatContext.tsx';
import { useChatContext } from './context/useChatContext.ts';
import { Sidebar } from './components/Sidebar/Sidebar.tsx';
import { ChatWindow } from './components/ChatWindow/ChatWindow.tsx';
import { ContextMenu } from './components/ContextMenu/ContextMenu.tsx';
import { NewChatDialog } from './components/NewChatDialog/NewChatDialog.tsx';
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel.tsx';
import { useResponsive } from './hooks/useMediaQuery.ts';
import './styles/global.css';

const MainApp: React.FC = () => {
  const { state, dispatch } = useChatContext();
  const { isMobile } = useResponsive();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close menus, dialogs, or go back to sidebar on mobile
      if (e.key === 'Escape') {
        if (state.contextMenu) {
          dispatch({ type: 'CLOSE_CONTEXT_MENU' });
        } else if (state.isNewChatOpen) {
          dispatch({ type: 'OPEN_NEW_CHAT', payload: false });
        } else if (state.isSettingsOpen) {
          dispatch({ type: 'OPEN_SETTINGS', payload: false });
        } else if (isMobile && state.activeChatId) {
          dispatch({ type: 'SELECT_CHAT', payload: null });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, isMobile, dispatch]);

  const showSidebar = !isMobile || !state.activeChatId;
  const showChatWindow = !isMobile || !!state.activeChatId;

  return (
    <div className="app-container">
      {/* Sidebar (Chat list, folders, search, new chat) */}
      {showSidebar && <Sidebar isMobileHidden={isMobile && !!state.activeChatId} />}

      {/* Main Chat Window */}
      {showChatWindow && <ChatWindow />}

      {/* Global Context Menu */}
      <ContextMenu />

      {/* New Chat Modal Dialog */}
      <NewChatDialog />

      {/* Settings & Profile Drawer */}
      <SettingsPanel />
    </div>
  );
};

export default function App() {
  return (
    <ChatProvider>
      <MainApp />
    </ChatProvider>
  );
}
