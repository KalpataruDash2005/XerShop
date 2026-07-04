import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/dashboard/Dashboard';
import Users from '@/pages/users/Users';
import UserDetail from '@/pages/users/UserDetail';
import Shops from '@/pages/shops/Shops';
import ShopDetail from '@/pages/shops/ShopDetail';
import Orders from '@/pages/orders/Orders';
import OrderDetail from '@/pages/orders/OrderDetail';
import Payments from '@/pages/payments/Payments';
import CMS from '@/pages/cms/CMS';
import Settings from '@/pages/settings/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="shops" element={<Shops />} />
            <Route path="shops/:id" element={<ShopDetail />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="payments" element={<Payments />} />
            <Route path="cms" element={<CMS />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A2740',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
