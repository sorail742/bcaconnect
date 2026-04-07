import { useFetchData, useFetchById, usePostData } from './useFetchData';

export const useProducts = () => useFetchData('/products');

export const useProductById = (id) => useFetchById('/products', id);

export const useCategories = () => useFetchData('/categories');

export const useOrders = () => useFetchData('/orders');

export const useOrderById = (id) => useFetchById('/orders', id);

export const useUser = () => useFetchData('/users/me');

export const useWallet = () => useFetchData('/wallet');

export const useNotifications = () => useFetchData('/notifications');

export const useMessages = () => useFetchData('/messages');

export const useVendors = () => useFetchData('/stores');

export const useVendorById = (id) => useFetchById('/stores', id);

export const useDeliveries = () => useFetchData('/delivery');

export const useDisputes = () => useFetchData('/disputes');

export const useDisputeById = (id) => useFetchById('/disputes', id);

export const useCredits = () => useFetchData('/credits');

export const useStats = () => useFetchData('/stats');

export const useAds = () => useFetchData('/ads');

export const useReviews = () => useFetchData('/reviews');

export const useUserProfile = () => useFetchData('/users/profile');

export const useVendorProducts = () => useFetchData('/products/me/products');

export const useVendorOrders = () => useFetchData('/orders/vendor');

export const useVendorStats = () => useFetchData('/stats/vendor');

export const useAdminUsers = () => useFetchData('/admin/users');

export const useAdminProducts = () => useFetchData('/admin/products');

export const useAdminTransactions = () => useFetchData('/admin/transactions');

export const useAdminDisputes = () => useFetchData('/admin/disputes');

export const useCarrierDeliveries = () => useFetchData('/delivery/carrier');

export const useBankTransactions = () => useFetchData('/bank/transactions');
