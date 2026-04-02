import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

// Pages Publiques
import StorePage from '../pages/StorePage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import FaqPage from '../pages/FaqPage';
import PrivacyPage from '../pages/PrivacyPage';
import TermsPage from '../pages/TermsPage';
import HelpCenter from '../pages/HelpCenter';

// Importation des pages (Refactorisées et Réorganisées)
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';

// Pages Vendeur
import VendorDashboard from '../pages/vendor/VendorDashboard';
import Products from '../pages/vendor/Products';
import AddProduct from '../pages/vendor/AddProduct'; // Formulaire unifié ajout + édition
import StoreSettings from '../pages/vendor/StoreSettings';
import OrdersVendor from '../pages/vendor/OrdersVendor';

// Pages Transporteur
import CarrierDashboard from '../pages/carrier/CarrierDashboard';

// Pages Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminTransactions from '../pages/admin/AdminTransactions';
import Categories from '../pages/admin/Categories';
import Returns from '../pages/admin/Returns';
import AdManager from '../pages/admin/AdManager';
import AdminDisputes from '../pages/admin/AdminDisputes';

// Pages Client & Commun
import ProductCatalogue from '../pages/Catalogue';
import ProductDetail from '../pages/ProductDetails';
import CartPage from '../pages/CartPage';
import OrdersClient from '../pages/OrdersClient';
import UserWallet from '../pages/Wallet';
import UserProfile from '../pages/Profile';
import Messages from '../pages/Messages';
import Notifications from '../pages/Notifications';
import Checkout from '../pages/Checkout';
import VendorsList from '../pages/VendorsList';
import Tracking from '../pages/Tracking';
import DisputeReport from '../pages/DisputeReport';

// Pages Banque
import BankDashboard from '../pages/bank/BankDashboard';

import LandingPage from '../pages/LandingPage';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Public Routes Wrapped in MainLayout */}
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
            <Route path="/marketplace" element={<MainLayout><ProductCatalogue /></MainLayout>} />
            <Route path="/catalog" element={<MainLayout><ProductCatalogue /></MainLayout>} />
            <Route path="/vendors" element={<MainLayout><VendorsList /></MainLayout>} />
            <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
            <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
            <Route path="/tracking" element={<MainLayout><Tracking /></MainLayout>} />
            <Route path="/shop/:slug" element={<MainLayout><StorePage /></MainLayout>} />
            <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
            <Route path="/faq" element={<MainLayout><FaqPage /></MainLayout>} />
            <Route path="/terms" element={<MainLayout><TermsPage /></MainLayout>} />
            <Route path="/privacy" element={<MainLayout><PrivacyPage /></MainLayout>} />
            <Route path="/help" element={<MainLayout><HelpCenter /></MainLayout>} />

            {/* Protected Routes (Usually have their own specific layout like DashboardLayout) */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersClient /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><UserWallet /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><UserWallet /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/dispute/:orderId" element={<ProtectedRoute><DisputeReport /></ProtectedRoute>} />

            {/* Vendor Routes */}
            <Route path="/vendor/dashboard" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
            <Route path="/vendor/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/vendor/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/vendor/products/edit/:id" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/vendor/store" element={<ProtectedRoute><StoreSettings /></ProtectedRoute>} />
            <Route path="/vendor/orders" element={<ProtectedRoute><OrdersVendor /></ProtectedRoute>} />

            {/* Carrier Routes */}
            <Route path="/carrier/dashboard" element={<ProtectedRoute><CarrierDashboard /></ProtectedRoute>} />

            {/* Bank Routes */}
            <Route path="/bank/dashboard" element={<ProtectedRoute><BankDashboard /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/transactions" element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/admin/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />
            <Route path="/admin/ads" element={<ProtectedRoute><AdManager /></ProtectedRoute>} />
            <Route path="/admin/disputes" element={<ProtectedRoute><AdminDisputes /></ProtectedRoute>} />

            <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
    );
};

export default AppRoutes;
