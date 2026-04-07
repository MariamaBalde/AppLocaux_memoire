import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Auth from './pages/client/Auth';
import Home from './pages/client/Home';
import Shipping from './pages/client/Shipping';
import About from './pages/client/About';
import Vendors from './pages/client/Vendors';
import Products from './pages/client/Products';
import ProductDetail from './pages/client/ProductDetail';
import Cart from './pages/client/Cart';
import Checkout from './pages/client/Checkout';
import Orders from './pages/client/Orders';
import OrderDetail from './pages/client/OrderDetail';
import OrderConfirmation from './pages/client/OrderConfirmation';
import Profile from './pages/client/Profile';
import VendorDashboard from './pages/vendor/Dashboard';
import ManageProducts from './pages/vendor/ManageProducts';
import VendorCreateProduct from './pages/vendor/CreateProduct';
import VendorOrders from './pages/vendor/Orders';
import VendorOrderDetail from './pages/vendor/OrderDetail';
import VendorShipments from './pages/vendor/Shipments';
import VendorRevenue from './pages/vendor/Revenue';
import VendorStatistics from './pages/vendor/Statistics';
import VendorShopProfile from './pages/vendor/ShopProfile';
import VendorSettings from './pages/vendor/Settings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCreateProductForVendor from './pages/admin/CreateProductForVendor';

function normalizeRole(role) {
  if (!role || typeof role !== 'string') return '';
  return role.toLowerCase();
}

function getDefaultRouteForRole(role) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === 'admin') return '/admin/dashboard';
  if (normalizedRole === 'vendeur') return '/vendeur/dashboard';
  return '/products';
}

function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const currentRole = normalizeRole(user?.role);
    const isAllowed = allowedRoles.map(normalizeRole).includes(currentRole);

    if (!isAllowed) {
      return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
    }
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Auth />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Auth />
          </PublicOnlyRoute>
        }
      />
      <Route path="/" element={<Products />} />
      <Route path="/home" element={<Home />} />
      <Route path="/shipping" element={<Shipping />} />
      <Route path="/shipping-info" element={<Shipping />} />
      <Route path="/about" element={<About />} />
      <Route path="/a-propos" element={<About />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/vendeurs" element={<Vendors />} />

      {/* Catalogue public */}
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />

      {/* Routes client protégées */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id/confirmation"
        element={
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Page de test */}
      <Route
        path="/test-dashboard"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Routes vendeur */}
      <Route
        path="/vendeur/dashboard"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeur/products"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <ManageProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeur/products/new"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorCreateProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeur/orders"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeur/orders/:id"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorOrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeur/shipments"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorShipments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeur/revenue"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorRevenue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeur/statistics"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorStatistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeur/shop-profile"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorShopProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeur/settings"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorSettings />
          </ProtectedRoute>
        }
      />

      {/* Routes admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/create"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCreateProductForVendor />
          </ProtectedRoute>
        }
      />

      {/* Route dashboard intelligente selon role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Wildcard - redirection */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
