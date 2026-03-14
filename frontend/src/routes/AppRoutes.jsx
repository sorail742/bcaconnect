import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

// Importation des pages (Refactorisées et Réorganisées)
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';

// Pages Vendeur
import VendorDashboard from '../pages/vendor/VendorDashboard';
import Products from '../pages/vendor/Products';
import AddProduct from '../pages/vendor/AddProduct';
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

// Pages Client & Commun
import ProductCatalogue from '../pages/Catalogue';
import ProductDetail from '../pages/ProductDetails';
import OrdersClient from '../pages/OrdersClient';
import UserWallet from '../pages/Wallet';
import UserProfile from '../pages/Profile';
import Messages from '../pages/Messages';
import Notifications from '../pages/Notifications';
import Checkout from '../pages/Checkout';
import VendorsList from '../pages/VendorsList';
import Tracking from '../pages/Tracking';

// Pages Banque
import BankDashboard from '../pages/bank/BankDashboard';

import LandingPage from '../pages/LandingPage';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={<LandingPage />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Routes Protégées */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/catalog" element={<ProtectedRoute><ProductCatalogue /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><ProductCatalogue /></ProtectedRoute>} />
            <Route path="/vendors" element={<ProtectedRoute><VendorsList /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersClient /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><UserWallet /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><UserWallet /></ProtectedRoute>} />
            <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

            {/* Routes Vendeur (Vendor) */}
            <Route path="/vendor/dashboard" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
            <Route path="/vendor/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/vendor/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/vendor/store" element={<ProtectedRoute><StoreSettings /></ProtectedRoute>} />
            <Route path="/vendor/orders" element={<ProtectedRoute><OrdersVendor /></ProtectedRoute>} />

            {/* Routes Transporteur (Carrier) */}
            <Route path="/carrier/dashboard" element={<ProtectedRoute><CarrierDashboard /></ProtectedRoute>} />

            {/* Routes Banque */}
            <Route path="/bank/dashboard" element={<ProtectedRoute><BankDashboard /></ProtectedRoute>} />

            {/* Routes Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/transactions" element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/admin/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />

            {/* Route par défaut (404) */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;

