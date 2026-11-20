import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages importées de manière synchrone (Core Experience)
import LandingPage from "../landing/pages/LandingPage";
import Login from "../auth/pages/Login";
import Register from "../auth/pages/Register";
import ForgotPassword from "../auth/pages/ForgotPassword";
import ProductCatalogue from "../product/pages/Catalogue";
import ProductDetail from "../product/pages/ProductDetails";
import CartPage from "../cart/pages/CartPage";
import NotFound from "../pages/NotFound";
import ComingSoon from "../pages/ComingSoon";
import PrivacyPage from "../pages/PrivacyPage";
import TermsPage from "../pages/TermsPage";
import AiMode from "../ai/pages/AiMode";

import ProtectedRoute from "../auth/components/ProtectedRoute";
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
const StorePage = lazy(() => import("../shop/pages/StorePage"));
const VendorsList = lazy(() => import("../shop/pages/VendorsList"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const FaqPage = lazy(() => import("../pages/FaqPage"));
const HelpCenter = lazy(() => import("../support/pages/HelpCenter"));
const EducationCenter = lazy(() => import("../education/pages/EducationCenter"));
const GroupPurchase = lazy(() => import("../group-purchase/pages/GroupPurchase"));
const Rfq = lazy(() => import("../rfq/pages/Rfq"));
const RfqProjects = lazy(() => import("../rfq/pages/RfqProjects"));
const Coupons = lazy(() => import("../coupon/pages/Coupons"));
const Unauthorized = lazy(() => import("../auth/pages/Unauthorized"));

// Protected Pages - Lazy Loaded
const Dashboard = lazy(() => import("../dashboard/pages/Dashboard"));
const DashboardVendors = lazy(
  () => import("../dashboard/pages/DashboardVendors"),
);
const VendorsMap = lazy(() => import("../dashboard/pages/VendorsMap"));
const OrdersClient = lazy(() => import("../order/pages/OrdersClient"));
const UserWallet = lazy(() => import("../wallet/pages/Wallet"));
const Organizations = lazy(() => import("../organization/pages/Organizations"));
const UserProfile = lazy(() => import("../user/pages/Profile"));
const Messages = lazy(() => import("../message/pages/Messages"));
const Notifications = lazy(() => import("../notification/pages/Notifications"));
const Checkout = lazy(() => import("../order/pages/Checkout"));
const Tracking = lazy(() => import("../delivery/pages/Tracking"));
const MyCredits = lazy(() => import("../credit/pages/MyCredits"));
const CreditSimulator = lazy(() => import("../credit/pages/CreditSimulator"));
const CreditCalendar = lazy(() => import("../credit/pages/CreditCalendar"));
const DisputeReport = lazy(() => import("../dispute/pages/DisputeReport"));
const MyDisputes = lazy(() => import("../dispute/pages/MyDisputes"));
const DisputeDetail = lazy(() => import("../dispute/pages/DisputeDetail"));
const MyGuarantees = lazy(() => import("../sav/pages/MyGuarantees"));
const MyInterventions = lazy(() => import("../sav/pages/MyInterventions"));
const MaintenanceRequest = lazy(
  () => import("../sav/pages/MaintenanceRequest"),
);

// Vendor Pages - Lazy Loaded
const VendorDashboard = lazy(() => import("../dashboard/pages/VendorDashboard"));
const Products = lazy(() => import("../product/pages/Products"));
const AddProduct = lazy(() => import("../product/pages/AddProduct"));
const StoreSettings = lazy(() => import("../shop/pages/StoreSettings"));
const OrdersVendor = lazy(() => import("../order/pages/OrdersVendor"));
const VendorReports = lazy(() => import("../dashboard/pages/VendorReports"));
const ClientsMap = lazy(() => import("../dashboard/pages/ClientsMap"));

// Carrier Pages - Lazy Loaded
const CarrierDashboard = lazy(
  () => import("../delivery/pages/CarrierDashboard"),
);

// Bank Pages - Lazy Loaded
const BankDashboard = lazy(() => import("../dashboard/pages/BankDashboard"));
const BankCredits = lazy(() => import("../credit/pages/BankCredits"));
const CreditApplicantsMap = lazy(() => import("../credit/pages/CreditApplicantsMap"));


// Technician Pages - Lazy Loaded
const TechnicianDashboard = lazy(() => import('../technician/pages/TechnicianDashboard'));
const TechnicianMissions = lazy(() => import('../technician/pages/TechnicianMissions'));
const TechnicianMissionsMap = lazy(() => import('../technician/pages/MissionsMap'));
const TechnicianEquipment = lazy(() => import('../technician/pages/TechnicianEquipment'));

// Admin Pages - Lazy Loaded
const AdminDashboard = lazy(() => import("../dashboard/pages/AdminDashboard"));
const Users = lazy(() => import("../user/pages/Users"));
const AdminProducts = lazy(() => import("../product/pages/AdminProducts"));
const DocumentGenerator = lazy(() => import("../order/pages/DocumentGenerator"));
const AdminTransactions = lazy(
  () => import("../dashboard/pages/AdminTransactions"),
);
const Categories = lazy(() => import("../category/pages/Categories"));
const AdminEducation = lazy(() => import("../education/pages/AdminEducation"));
const Returns = lazy(() => import("../dispute/pages/Returns"));
const AdManager = lazy(() => import("../ad/pages/AdManager"));
const AdminDisputes = lazy(() => import("../dispute/pages/AdminDisputes"));
const AITrends = lazy(() => import("../dashboard/pages/AITrends"));
const FinancialReports = lazy(() => import("../dashboard/pages/FinancialReports"));
const AdminLogistics = lazy(() => import("../delivery/pages/AdminLogistics"));
const AdminUserMap = lazy(() => import("../user/pages/AdminUserMap"));
const DeletionHistory = lazy(() => import("../deletion-log/pages/DeletionHistory"));
const AuditLogPage = lazy(() => import("../audit-log/pages/AuditLogPage"));
const AdminWebinars = lazy(() => import("../webinar/pages/AdminWebinars"));
const AdminCertifications = lazy(() => import("../certification/pages/AdminCertifications"));
const VendorCertifications = lazy(() => import("../certification/pages/VendorCertifications"));
const AdminSAV = lazy(() => import("../sav/pages/AdminSAV"));
const PaymentSimulation = lazy(() => import("../wallet/pages/PaymentSimulation"));
const PaymentReturn = lazy(() => import("../wallet/pages/PaymentReturn"));

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

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />

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
        path="/rfq"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLIENT, ROLES.FOURNISSEUR]}>
              <Rfq />
            </ProtectedRoute>
          </Suspense>
        }
      />
      <Route
        path="/rfq/projects"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLIENT, ROLES.FOURNISSEUR]}>
              <RfqProjects />
            </ProtectedRoute>
          </Suspense>
        }
      />
      <Route
        path="/coupons"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.FOURNISSEUR]}>
              <Coupons />
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
        path="/dashboard/vendors-map"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.CLIENT, ROLES.ADMIN]}>
              <VendorsMap />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/orders"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={['client']}>
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
        path="/organizations"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute>
              <Organizations />
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
        path="/vendor/clients-map"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR]}>
              <ClientsMap />
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

      <Route
        path="/bank/applicants-map"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.BANQUE, ROLES.ADMIN]}>
              <CreditApplicantsMap />
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
        path="/technician/missions-map"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.TECHNICIEN]}>
              <TechnicianMissionsMap />
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
        path="/admin/documents"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <DocumentGenerator />
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
        path="/admin/deletion-history"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <DeletionHistory />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/audit-log"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AuditLogPage />
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
        path="/admin/user-map"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminUserMap />
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


      <Route
        path="/admin/webinars"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminWebinars />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/certifications"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminCertifications />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/vendor/certifications"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.FOURNISSEUR]}>
              <VendorCertifications />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/admin/sav"
        element={
          <Suspense fallback={<LazyFallback />}>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminSAV />
            </ProtectedRoute>
          </Suspense>
        }
      />

      {/* Redirections vers pages existantes */}
      <Route path="/legal" element={<Navigate to="/terms" replace />} />
      <Route path="/report" element={<Navigate to="/contact?subject=report" replace />} />
      <Route path="/ads" element={<Navigate to="/marketplace" replace />} />
      <Route path="/insights" element={<Navigate to="/about" replace />} />
      <Route path="/ai-trends" element={<Navigate to="/education" replace />} />
      <Route path="/logistics" element={<Navigate to="/tracking" replace />} />
      <Route path="/carrier-join" element={<Navigate to="/register?role=transporteur" replace />} />
      <Route path="/download" element={<Navigate to="/help" replace />} />
      <Route path="/returns" element={<Navigate to="/sav/guarantees" replace />} />

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
