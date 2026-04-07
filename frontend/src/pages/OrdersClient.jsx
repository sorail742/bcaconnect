import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useDomainData';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates';
import { Package, Eye, MessageSquare, AlertCircle, CheckCircle, Clock, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const OrdersClient = () => {
    const { data: orders = [], loading, error } = useOrders();
    const [filterStatus, setFilterStatus] = useState('all');

    const statuses = {
        pending: { label: 'En attente', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        confirmed: { label: 'Confirmée', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        shipped: { label: 'Expédiée', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        delivered: { label: 'Livrée', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        cancelled: { label: 'Annulée', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    };

    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(o => o.statut === filterStatus);

    return (
        <div className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Package className="size-8 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                            Mes Commandes
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Suivi et gestion de vos commandes
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            filterStatus === 'all'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                    >
                        Toutes ({orders.length})
                    </button>
                    {Object.entries(statuses).map(([key, status]) => {
                        const count = orders.filter(o => o.statut === key).length;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilterStatus(key)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                    filterStatus === key
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-foreground hover:bg-muted/80'
                                }`}
                            >
                                <status.icon className="size-4" />
                                {status.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingState message="Chargement de vos commandes..." />
                ) : error ? (
                    <ErrorState error={error} />
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOrders.map((order, idx) => {
                            const status = statuses[order.statut] || statuses.pending;
                            const StatusIcon = status.icon;

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-foreground">
                                                    Commande #{order.id.slice(0, 8)}
                                                </h3>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
                                                    <StatusIcon className={`size-4 ${status.color}`} />
                                                    <span className={`text-sm font-semibold ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Total</p>
                                                    <p className="font-bold text-primary">
                                                        {order.total_ttc?.toLocaleString('fr-FR', {
                                                            style: 'currency',
                                                            currency: 'GNF'
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Articles</p>
                                                    <p className="font-bold text-foreground">{order.items_count || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Livraison</p>
                                                    <p className="font-bold text-foreground">
                                                        {order.frais_port?.toLocaleString('fr-FR', {
                                                            style: 'currency',
                                                            currency: 'GNF'
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Adresse</p>
                                                    <p className="font-bold text-foreground truncate">{order.adresse_livraison}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/tracking?orderId=${order.id}`}
                                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                                            >
                                                <Eye className="size-4" />
                                                Suivre
                                            </Link>
                                            <button className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all flex items-center gap-2">
                                                <MessageSquare className="size-4" />
                                                Contact
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState message="Vous n'avez pas encore de commandes" />
                )}
            </div>
        </div>
    );
};

export default OrdersClient;
