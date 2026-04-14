import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import socketService from '../services/socketService';
import { useAuth } from './useAuth';

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await notificationService.getAll();
            setNotifications(data || []);
            setUnreadCount((data || []).filter(n => !n.est_lu).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        if (user?.id) {
            socketService.connect(user.id);
            
            const handleNewNotification = (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            };

            socketService.on('notification_received', handleNewNotification);

            return () => {
                socketService.off('notification_received', handleNewNotification);
            };
        }
    }, [user?.id, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, est_lu: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };
};

export default useNotifications;
