import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { I18nProvider } from './context/I18nContext';

// Pages
import Login from './pages/client/Login';
import Register from './pages/client/Register';
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
import ForgotPassword from './pages/client/ForgotPassword';
import ResetPassword from './pages/client/ResetPassword';
import VerifyEmailNotice from './pages/client/VerifyEmailNotice';
import CheckoutPayment from './pages/client/CheckoutPayment';
import VendorDashboard from './pages/vendor/Dashboard';
import ManageProducts from './pages/vendor/ManageProducts';
import VendorCreateProduct from './pages/vendor/CreateProduct';
import VendorEditProduct from './pages/vendor/EditProduct';
import VendorOrders from './pages/vendor/Orders';
import VendorOrderDetail from './pages/vendor/OrderDetail';
import VendorShipments from './pages/vendor/Shipments';
import VendorRevenue from './pages/vendor/Revenue';
import VendorStatistics from './pages/vendor/Statistics';
import VendorShopProfile from './pages/vendor/ShopProfile';
import VendorSettings from './pages/vendor/Settings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCreateProductForVendor from './pages/admin/CreateProductForVendor';
import AdminManageProducts from './pages/admin/ManageProducts';
import AdminSettings from './pages/admin/Settings';

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
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmailNotice />} />
      <Route path="/" element={<Products />} />
      <Route path="/home" element={<Navigate to="/products" replace />} />
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
        path="/checkout/payment"
        element={
          <ProtectedRoute>
            <CheckoutPayment />
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
        path="/order-confirmation"
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
      <Route
        path="/profile/edit"
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
        path="/vendeur/products/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendorEditProduct />
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

      {/* Aliases seller */}
      <Route path="/seller/dashboard" element={<Navigate to="/vendeur/dashboard" replace />} />
      <Route path="/seller/products" element={<Navigate to="/vendeur/products" replace />} />
      <Route path="/seller/products/new" element={<Navigate to="/vendeur/products/new" replace />} />
      <Route path="/seller/products/:id/edit" element={<SellerProductEditAliasRedirect />} />
      <Route path="/seller/orders" element={<Navigate to="/vendeur/orders" replace />} />
      <Route path="/seller/orders/:id" element={<SellerOrderAliasRedirect />} />
      <Route path="/seller/shipments" element={<Navigate to="/vendeur/shipments" replace />} />
      <Route path="/seller/revenue" element={<Navigate to="/vendeur/revenue" replace />} />
      <Route path="/seller/statistics" element={<Navigate to="/vendeur/statistics" replace />} />
      <Route path="/seller/shop-profile" element={<Navigate to="/vendeur/shop-profile" replace />} />
      <Route path="/seller/settings" element={<Navigate to="/vendeur/settings" replace />} />

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
        path="/admin/vendors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminManageProducts />
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
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettings />
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

function SellerOrderAliasRedirect() {
  const { id } = useParams();
  return <Navigate to={`/vendeur/orders/${id}`} replace />;
}

function SellerProductEditAliasRedirect() {
  const { id } = useParams();
  return <Navigate to={`/vendeur/products/${id}/edit`} replace />;
}

function App() {
  return (
    <Router>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </Router>
  );
}

export default App;
