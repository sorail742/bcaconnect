import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { LoadingState } from '../components/ui/DataStates';

// Fallback component for lazy loading
const LazyFallback = () => (
    <MainLayout>
        <LoadingState message="Chargement de la page..." />
    </MainLayout>
);

// Public Pages - Lazy Loaded
const LandingPage = lazy(() => import('../pages/LandingPage'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ProductCatalogue = lazy(() => import('../pages/Catalogue'));
const ProductDetail = lazy(() => import('../pages/ProductDetails'));
const CartPage = lazy(() => import('../pages/CartPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const StorePage = lazy(() => import('../pages/StorePage'));
const VendorsList = lazy(() => import('../pages/VendorsList'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const FaqPage = lazy(() => import('../pages/FaqPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/TermsPage'));
const HelpCenter = lazy(() => import('../pages/HelpCenter'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Protected Pages - Lazy Loaded
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const OrdersClient = lazy(() => import('../pages/OrdersClient'));
const UserWallet = lazy(() => import('../pages/Wallet'));
const UserProfile = lazy(() => import('../pages/Profile'));
const Messages = lazy(() => import('../pages/Messages'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Tracking = lazy(() => import('../pages/Tracking'));
const DisputeReport = lazy(() => import('../pages/DisputeReport'));

// Vendor Pages - Lazy Loaded
const VendorDashboard = lazy(() => import('../pages/vendor/VendorDashboard'));
const Products = lazy(() => import('../pages/vendor/Products'));
const AddProduct = lazy(() => import('../pages/vendor/AddProduct'));
const StoreSettings = lazy(() => import('../pages/vendor/StoreSettings'));
const OrdersVendor = lazy(() => import('../pages/vendor/OrdersVendor'));

// Carrier Pages - Lazy Loaded
const CarrierDashboard = lazy(() => import('../pages/carrier/CarrierDashboard'));

// Bank Pages - Lazy Loaded
const BankDashboard = lazy(() => import('../pages/bank/BankDashboard'));

// Admin Pages - Lazy Loaded
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const Users = lazy(() => import('../pages/admin/Users'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminTransactions = lazy(() => import('../pages/admin/AdminTransactions'));
const Categories = lazy(() => import('../pages/admin/Categories'));
const Returns = lazy(() => import('../pages/admin/Returns'));
const AdManager = lazy(() => import('../pages/admin/AdManager'));
const AdminDisputes = lazy(() => import('../pages/admin/AdminDisputes'));

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={
                <Suspense fallback={<LazyFallback />}>
                    <LandingPage />
                </Suspense>
            } />

            <Route path="/login" element={
                <Suspense fallback={<LazyFallback />}>
                    <Login />
                </Suspense>
            } />

            <Route path="/register" element={
                <Suspense fallback={<LazyFallback />}>
                    <Register />
                </Suspense>
            } />

            <Route path="/marketplace" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <ProductCatalogue />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/catalog" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <ProductCatalogue />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/product/:id" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <ProductDetail />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/cart" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <CartPage />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/search" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <SearchPage />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/shop/:slug" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <StorePage />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/vendors" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <VendorsList />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/about" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <AboutPage />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/contact" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <ContactPage />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/faq" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <FaqPage />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/terms" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <TermsPage />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/privacy" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <PrivacyPage />
                    </MainLayout>
                </Suspense>
            } />

            <Route path="/help" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <HelpCenter />
                    </MainLayout>
                </Suspense>
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/orders" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <OrdersClient />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/wallet" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <UserWallet />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/payments" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <UserWallet />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/messages" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <Messages />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/notifications" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <Notifications />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/profile" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <UserProfile />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/settings" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <UserProfile />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/checkout" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <Checkout />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/tracking" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <Tracking />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/dispute/:orderId" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <DisputeReport />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            {/* Vendor Routes */}
            <Route path="/vendor/dashboard" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <VendorDashboard />
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/vendor/products" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <Products />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/vendor/products/add" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <AddProduct />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/vendor/products/edit/:id" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <AddProduct />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/vendor/store" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <StoreSettings />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/vendor/orders" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <OrdersVendor />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            {/* Carrier Routes */}
            <Route path="/carrier/dashboard" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <CarrierDashboard />
                    </ProtectedRoute>
                </Suspense>
            } />

            {/* Bank Routes */}
            <Route path="/bank/dashboard" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <BankDashboard />
                    </ProtectedRoute>
                </Suspense>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/admin/users" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <Users />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/admin/products" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <AdminProducts />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/admin/transactions" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <AdminTransactions />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/admin/categories" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <Categories />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/admin/returns" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <Returns />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/admin/ads" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <AdManager />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            <Route path="/admin/disputes" element={
                <Suspense fallback={<LazyFallback />}>
                    <ProtectedRoute>
                        <MainLayout>
                            <AdminDisputes />
                        </MainLayout>
                    </ProtectedRoute>
                </Suspense>
            } />

            {/* 404 Route */}
            <Route path="*" element={
                <Suspense fallback={<LazyFallback />}>
                    <MainLayout>
                        <NotFound />
                    </MainLayout>
                </Suspense>
            } />
        </Routes>
    );
};

export default AppRoutes;
