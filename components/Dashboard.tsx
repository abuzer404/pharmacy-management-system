/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { SVGProps, useMemo } from 'react';
import { Product, Sale } from '../data/mockData';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// --- ICONS ---
const DollarSignIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const DocumentTextIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0A2.25 2.25 0 015.625 7.5h12.75a2.25 2.25 0 012.25 2.25m-16.5 0v-1.125c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v1.125" />
    </svg>
);
const ArchiveBoxIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);
const ExclamationTriangleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const ExpiryIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25m10.5-2.25v2.25m-10.5 0H6a2.25 2.25 0 00-2.25 2.25v11.25a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H17.25m-10.5 0h10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a.75.75 0 00.75-.75V11.25a.75.75 0 00-1.5 0v6a.75.75 0 00.75.75zM12 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
    </svg>
);


const PIE_COLORS = ['#00A99D', '#1f2e4d', '#4ade80', '#f97316', '#ef4444', '#3b82f6'];

// --- COMPONENTS ---
interface StatCardProps {
    title: string;
    value: string;
    footer: string;
    Icon: React.FC<SVGProps<SVGSVGElement>>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, footer, Icon }) => (
    <div className="stat-card" role="region" aria-label={`${title} statistic`}>
        <div className="stat-card-header">
            <span>{title}</span>
            <Icon />
        </div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-footer">{footer}</div>
    </div>
);

const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
};

export const Dashboard = ({ products, sales }: { products: Product[], sales: Sale[] }) => {
    const dashboardData = useMemo(() => {
        const todaysSales = sales.filter(sale => isToday(sale.date));
        const todaysRevenue = todaysSales.reduce((acc, sale) => acc + sale.total, 0);
        const todaysProfit = todaysSales.reduce((acc, sale) => acc + sale.profit, 0);
        
        const lowStockItems = products.filter(p => p.stock > 0 && p.stock < 10).length;
        const inventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);

        const expiringSoonCount = products.filter(p => {
            if (p.stock === 0) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expiry = new Date(p.expiryDate);
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 30;
        }).length;

        return {
            todaysRevenue,
            todaysProfit,
            todaysTransactions: todaysSales.length,
            lowStockItems,
            inventoryValue,
            expiringSoonCount,
        };
    }, [products, sales]);

    const recentSales = useMemo(() => sales.slice(-5).reverse(), [sales]);

    const expiringSoonProducts = useMemo(() => {
        return products
            .filter(p => {
                if (p.stock === 0) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const expiry = new Date(p.expiryDate);
                const diffTime = expiry.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                // Include expired items and those expiring in 30 days
                return diffDays <= 30;
            })
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
            .slice(0, 5); // Show top 5 most urgent
    }, [products]);

    
    const categoryRevenueData = useMemo(() => {
        const todaysSales = sales.filter(sale => isToday(sale.date));
        const revenueByCategory: Record<string, number> = {};

        todaysSales.forEach(sale => {
            sale.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const category = product.category;
                    if (!revenueByCategory[category]) {
                        revenueByCategory[category] = 0;
                    }
                    revenueByCategory[category] += item.price * item.quantity;
                }
            });
        });
        
        return Object.entries(revenueByCategory).map(([name, value]) => ({ name, value }));
    }, [sales, products]);

    return (
        <div>
            <div className="dashboard-grid">
                <StatCard
                    title="Today's Revenue"
                    value={`Birr ${dashboardData.todaysRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    footer={`from ${dashboardData.todaysTransactions} transactions`}
                    Icon={DollarSignIcon}
                />
                 <StatCard
                    title="Expiring Soon"
                    value={dashboardData.expiringSoonCount.toString()}
                    footer="Items expiring in next 30 days"
                    Icon={ExpiryIcon}
                />
                <StatCard
                    title="Low Stock Items"
                    value={dashboardData.lowStockItems.toString()}
                    footer="Items with < 10 units"
                    Icon={ExclamationTriangleIcon}
                />
                <StatCard
                    title="Total Inventory Value"
                    value={`Birr ${dashboardData.inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    footer={`${products.length} unique products`}
                    Icon={ArchiveBoxIcon}
                />
            </div>

            <div className="dashboard-details-grid">
                <div className="content-card">
                    <h3 className="chart-title">Recent Sales</h3>
                    {recentSales.length > 0 ? (
                        <ul className="recent-sales-list">
                            {recentSales.map(sale => (
                                <li key={sale.id} className="recent-sale-item">
                                    <div className="recent-sale-info">
                                        <span className="sale-id">Sale #{sale.id}</span>
                                        <span className="sale-time">{new Date(sale.date).toLocaleTimeString()} - {sale.items.length} item(s)</span>
                                    </div>
                                    <span className="recent-sale-total">
                                        Birr {sale.total.toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No sales recorded yet.</p>
                    )}
                </div>
                 <div className="content-card">
                    <h3 className="chart-title">Products Expiring Soon</h3>
                    {expiringSoonProducts.length > 0 ? (
                        <ul className="recent-sales-list">
                            {expiringSoonProducts.map(product => {
                                const expiry = new Date(product.expiryDate);
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const diffTime = expiry.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                let expiryText;
                                let textColor = 'var(--status-lowstock-text)';
                                if (diffDays < 0) {
                                    expiryText = `Expired ${Math.abs(diffDays)} days ago`;
                                    textColor = 'var(--status-outofstock-text)';
                                } else if (diffDays === 0) {
                                    expiryText = 'Expires Today';
                                } else {
                                    expiryText = `in ${diffDays} days`;
                                }

                                return (
                                    <li key={product.id} className="recent-sale-item">
                                        <div className="recent-sale-info">
                                            <span className="sale-id">{product.name}</span>
                                            <span className="sale-time">Stock: {product.stock}</span>
                                        </div>
                                        <span className="recent-sale-total" style={{ color: textColor }}>
                                            {expiryText}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p>No products expiring in the next 30 days.</p>
                    )}
                </div>
            </div>
        </div>
    );
};