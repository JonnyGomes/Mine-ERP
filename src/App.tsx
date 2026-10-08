/**
 * JG_IERP - Mini IERP Gerencial & PDV
 * Sistema ERP comercial completo com PDV ágil e emissão de pedidos A4 e térmicos
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { PrintModal } from './components/print/PrintModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages & Modules
import { DashboardPage } from './pages/DashboardPage';
import { PDVView } from './components/pdv/PDVView';
import { OrdersPage } from './pages/OrdersPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { AuxiliaryEntitiesPage } from './pages/AuxiliaryEntitiesPage';
import { StockPage } from './pages/StockPage';
import { CashierPage } from './pages/CashierPage';
import { ReceivablesPage } from './pages/ReceivablesPage';
import { PayablesPage } from './pages/PayablesPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

function ERPApp() {
  const [currentModule, setCurrentModule] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const navigateTo = (module: string) => {
    setCurrentModule(module);
    setIsMobileSidebarOpen(false);
  };

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardPage onNavigate={navigateTo} />;
      case 'pdv':
        return <PDVView />;
      case 'pedidos':
        return <OrdersPage />;
      case 'clientes':
        return <CustomersPage />;
      case 'produtos':
        return <ProductsPage />;
      case 'grupos':
        return <AuxiliaryEntitiesPage initialTab="GRUPOS" />;
      case 'fornecedores':
        return <AuxiliaryEntitiesPage initialTab="FORNECEDORES" />;
      case 'estoque':
        return <StockPage />;
      case 'caixa':
        return <CashierPage />;
      case 'contas_receber':
        return <ReceivablesPage />;
      case 'contas_pagar':
        return <PayablesPage />;
      case 'relatorios':
        return <ReportsPage />;
      case 'usuarios':
        return <UsersPage />;
      case 'auditoria':
        return <AuditPage />;
      case 'configuracoes':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onNavigate={navigateTo}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentModule={currentModule}
          onNavigate={navigateTo}
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderModule()}
        </main>
      </div>

      {/* Global Notifications and Print Engine */}
      <ToastContainer />
      <PrintModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <ProtectedRoute>
            <ERPApp />
          </ProtectedRoute>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
