import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages importées de manière synchrone (Core Experience)
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProductCatalogue from "../pages/Catalogue";
import ProductDetail from "../pages/ProductDetails";
import CartPage from "../pages/CartPage";
import NotFound from "../pages/NotFound";
import ComingSoon from "../pages/ComingSoon";
import PrivacyPage from "../pages/PrivacyPage";
import TermsPage from "../pages/TermsPage";
import AiMode from "../pages/AiMode";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import { ROLES } from "../constants/roles";

// Fallback component for lazy loading
const LazyFallback = () => (
  <div className="flex w-full h-1 bg-muted overflow-hidden animate-in fade-in duration-500">
    <div
      className="w-1/3 bg-primary animate-pulse"
      style={{
        transform: "translateX(-100%)",
        animation: "indeterminate 1.5s infinite ease-in-out",
      }}
    />
    <style>{`@keyframes indeterminate { 0% { transform: translateX(-100%); width: 33%; } 50% { width: 66%; } 100% { transform: translateX(300%); width: 33%; } }`}</style>
  </div>
);

// Public Pages - Lazy Loaded
const SearchPage = lazy(() => import("../pages/SearchPage"));
const StorePage = lazy(() => import("../pages/StorePage"));
const VendorsList = lazy(() => import("../pages/VendorsList"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const FaqPage = lazy(() => import("../pages/FaqPage"));
const HelpCenter = lazy(() => import("../pages/HelpCenter"));
const EducationCenter = lazy(() => import("../pages/EducationCenter"));
const GroupPurchase = lazy(() => import("../pages/GroupPurchase"));
const Unauthorized = lazy(() => import("../pages/auth/Unauthorized"));

// Protected Pages - Lazy Loaded
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const DashboardVendors = lazy(
  () => import("../pages/dashboard/DashboardVendors"),
);
const OrdersClient = lazy(() => import("../pages/OrdersClient"));
const UserWallet = lazy(() => import("../pages/Wallet"));
const UserProfile = lazy(() => import("../pages/Profile"));
const Messages = lazy(() => import("../pages/Messages"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Tracking = lazy(() => import("../pages/Tracking"));
const MyCredits = lazy(() => import("../pages/MyCredits"));
const CreditSimulator = lazy(() => import("../pages/CreditSimulator"));
const CreditCalendar = lazy(() => import("../pages/CreditCalendar"));
const DisputeReport = lazy(() => import("../pages/DisputeReport"));
const MyDisputes = lazy(() => import("../pages/MyDisputes"));
const DisputeDetail = lazy(() => import("../pages/DisputeDetail"));
const MyGuarantees = lazy(() => import("../pages/sav/MyGuarantees"));
const MyInterventions = lazy(() => import("../pages/sav/MyInterventions"));
const MaintenanceRequest = lazy(
  () => import("../pages/sav/MaintenanceRequest"),
);

// Vendor Pages - Lazy Loaded
const VendorDashboard = lazy(() => import("../pages/vendor/VendorDashboard"));
const Products = lazy(() => import("../pages/vendor/Products"));
const AddProduct = lazy(() => import("../pages/vendor/AddProduct"));
const StoreSettings = lazy(() => import("../pages/vendor/StoreSettings"));
const OrdersVendor = lazy(() => import("../pages/vendor/OrdersVendor"));
const VendorReports = lazy(() => import("../pages/vendor/VendorReports"));

// Carrier Pages - Lazy Loaded
const CarrierDashboard = lazy(
  () => import("../pages/carrier/CarrierDashboard"),
);

// Bank Pages - Lazy Loaded
const BankDashboard = lazy(() => import("../pages/bank/BankDashboard"));
const BankCredits = lazy(() => import("../pages/bank/BankCredits"));


// Technician Pages - Lazy Loaded
const TechnicianDashboard = lazy(() => import('../pages/technician/TechnicianDashboard'));
const TechnicianMissions = lazy(() => import('../pages/technician/TechnicianMissions'));
const TechnicianEquipment = lazy(() => import('../pages/technician/TechnicianEquipment'));

// Admin Pages - Lazy Loaded
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const Users = lazy(() => import("../pages/admin/Users"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminTransactions = lazy(
  () => import("../pages/admin/AdminTransactions"),
);
const Categories = lazy(() => import("../pages/admin/Categories"));
const AdminEducation = lazy(() => import("../pages/admin/AdminEducation"));
const Returns = lazy(() => import("../pages/admin/Returns"));
const AdManager = lazy(() => import("../pages/admin/AdManager"));
const AdminDisputes = lazy(() => import("../pages/admin/AdminDisputes"));
const AITrends = lazy(() => import("../pages/admin/AITrends"));
const FinancialReports = lazy(() => import("../pages/admin/FinancialReports"));
const AdminLogistics = lazy(() => import("../pages/admin/AdminLogistics"));
const PaymentSimulation = lazy(() => import("../pages/PaymentSimulation"));
const PaymentReturn = lazy(() => import("../pages/PaymentReturn"));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Suspense fallback={<LazyFallback />}>
            <LandingPage />
          </Suspense>
        }
      />

      <Route
        path="/payment/simulate/:transactionId"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <PaymentSimulation />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/payment/return"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <PaymentReturn />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/login"
        element={
          <Suspense fallback={<LazyFallback />}>
            <Login />
          </Suspense>
        }
      />

      <Route
        path="/register"
        element={
          <Suspense fallback={<LazyFallback />}>
            <Register />
          </Suspense>
        }
      />

      <Route
        path="/marketplace"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProductCatalogue />
          </Suspense>
        }
      />

      <Route
        path="/catalog"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProductCatalogue />
          </Suspense>
        }
      />

      <Route
        path="/product/:id"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProductDetail />
          </Suspense>
        }
      />
      <Route path="/ai-mode" element={<AiMode />} />

      <Route
        path="/cart"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.CLIENT, ROLES.ADMIN]}>
              <CartPage />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/search"
        element={
          <Suspense fallback={<LazyFallback />}>
            <SearchPage />
          </Suspense>
        }
      />

      <Route
        path="/shop/:slug"
        element={
          <Suspense fallback={<LazyFallback />}>
            <StorePage />
          </Suspense>
        }
      />

      <Route
        path="/vendors"
        element={
          <Suspense fallback={<LazyFallback />}>
            <VendorsList />
          </Suspense>
        }
      />

      <Route
        path="/about"
        element={
          <Suspense fallback={<LazyFallback />}>
            <AboutPage />
          </Suspense>
        }
      />

      <Route
        path="/contact"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ContactPage />
          </Suspense>
        }
      />

      <Route
        path="/faq"
        element={
          <Suspense fallback={<LazyFallback />}>
            <FaqPage />
          </Suspense>
        }
      />

      <Route
        path="/terms"
        element={
          <Suspense fallback={<LazyFallback />}>
            <TermsPage />
          </Suspense>
        }
      />

      <Route
        path="/privacy"
        element={
          <Suspense fallback={<LazyFallback />}>
            <PrivacyPage />
          </Suspense>
        }
      />

      <Route
        path="/help"
        element={
          <Suspense fallback={<LazyFallback />}>
            <HelpCenter />
          </Suspense>
        }
      />

      <Route
        path="/education"
        element={
          <Suspense fallback={<LazyFallback />}>
            <EducationCenter />
          </Suspense>
        }
      />
      <Route
        path="/group-purchase"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLIENT, ROLES.FOURNISSEUR, ROLES.BANQUE, ROLES.TECHNICIEN]}>
              <GroupPurchase />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/tracking"
        element={
          <Suspense fallback={<LazyFallback />}>
            <Tracking />
          </Suspense>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/dashboard/vendors"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <DashboardVendors />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/orders"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <OrdersClient />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/wallet"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <UserWallet />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/payments"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <UserWallet />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/messages"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/notifications"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          </Suspense>
        }
      />

        <Route
          path="/dashboard/credits"
          element={
            <Suspense fallback={<LazyFallback />}>
              <ProtectedRoute>
                <MyCredits />
              </ProtectedRoute>
            </Suspense>
          }
        />

        <Route
          path="/dashboard/credit-calendar"
          element={
            <Suspense fallback={<LazyFallback />}>
              <ProtectedRoute>
                <CreditCalendar />
              </ProtectedRoute>
            </Suspense>
          }
        />

      <Route
        path="/credits/simulate"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <CreditSimulator />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/profile"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/settings"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/checkout"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.CLIENT, ROLES.ADMIN]}>
              <Checkout />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/disputes"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <MyDisputes />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/disputes/:id"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <DisputeDetail />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/dispute/:orderId"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <DisputeReport />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/sav/guarantees"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <MyGuarantees />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/sav/maintenance/new"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <MaintenanceRequest />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/sav/interventions"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <MyInterventions />
            </ProtectedRoute>
          </Suspense>
        }
      />

      {/* Vendor Routes */}
      <Route
        path="/vendor/dashboard"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR]}>
              <VendorDashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/vendor/products"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR]}>
              <Products />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/vendor/products/add"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR]}>
              <AddProduct />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/vendor/products/edit/:id"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR]}>
              <AddProduct />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/vendor/store"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR]}>
              <StoreSettings />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/vendor/orders"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR]}>
              <OrdersVendor />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/vendor/reports"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR]}>
              <VendorReports />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/vendor/ads"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR, ROLES.ADMIN]}>
              <AdManager />
            </ProtectedRoute>
          </Suspense>
        }
      />

      {/* Carrier Routes */}
      <Route
        path="/carrier/dashboard"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.TRANSPORTEUR]}>
              <CarrierDashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />

      {/* Bank Routes */}
      <Route
        path="/bank/dashboard"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.BANQUE]}>
              <BankDashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />
      <Route
        path="/bank/credits"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.BANQUE, ROLES.ADMIN]}>
              <BankCredits />
            </ProtectedRoute>
          </Suspense>
        }
      />

      {/* Technician Routes */}
      <Route
        path="/technician/dashboard"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.TECHNICIEN]}>
              <TechnicianDashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/technician/missions"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.TECHNICIEN]}>
              <TechnicianMissions />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/technician/equipment"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.TECHNICIEN]}>
              <TechnicianEquipment />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/technician/wallet"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.TECHNICIEN]}>
              <UserWallet />
            </ProtectedRoute>
          </Suspense>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/users"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Users />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/products"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminProducts />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/transactions"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminTransactions />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Categories />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/education"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminEducation />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/returns"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Returns />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/ads"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdManager />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/disputes"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDisputes />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/trends"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AITrends />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/financial"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.BANQUE]}>
              <FinancialReports />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/logistics"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLogistics />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <Suspense fallback={<LazyFallback />}>
            <Unauthorized />
          </Suspense>
        }
      />

      {/* Redirections vers pages existantes */}
      <Route path="/ads" element={<Navigate to="/marketplace" replace />} />
      <Route path="/insights" element={<Navigate to="/about" replace />} />
      <Route path="/ai-trends" element={<Navigate to="/education" replace />} />
      <Route path="/logistics" element={<Navigate to="/tracking" replace />} />
      <Route path="/carrier-join" element={<Navigate to="/register" replace />} />
      <Route path="/download" element={<Navigate to="/help" replace />} />
      <Route path="/returns" element={<Navigate to="/help" replace />} />

      {/* Pages en cours de développement */}
      {["/careers", "/consultant", "/blog", "/investors"].map((path) => (
        <Route key={path} path={path} element={<ComingSoon />} />
      ))}

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <Suspense fallback={<LazyFallback />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
