/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, FC, SVGProps } from 'react';
import { Sale } from '../data/mockData';

// --- ICONS ---
const EyeIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.443-7.04a1 1 0 011.593-.115l.755.428a1 1 0 001.242 0l.755-.428a1 1 0 011.593.115l4.443 7.04a1.012 1.012 0 010 .639l-4.443 7.04a1 1 0 01-1.593.115l-.755-.428a1 1 0 00-1.242 0l-.755.428a1 1 0 01-1.593-.115L2.036 12.322z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const XMarkIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


// --- MAIN COMPONENT ---
export const SalesHistory: FC<{ sales: Sale[] }> = ({ sales }) => {
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    const filteredSales = useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const isDateToday = (d: Date) => {
            const dStart = new Date(d);
            dStart.setHours(0,0,0,0);
            return dStart.getTime() === startOfToday.getTime();
        }

        const isDateInThisWeek = (d: Date) => {
            const dCopy = new Date(d);
            const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon...
            const firstDayOfWeek = new Date(startOfToday);
            // Adjust to Monday
            firstDayOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); 

            const lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
            
            return dCopy >= firstDayOfWeek && dCopy < new Date(lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 1));
        };

        const isDateInThisMonth = (d: Date) => d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

        const isDateInThisYear = (d: Date) => d.getFullYear() === today.getFullYear();

        let salesToShow = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (filter !== 'All') {
            salesToShow = salesToShow.filter(sale => {
                const saleDate = new Date(sale.date);
                switch (filter) {
                    case 'Today': return isDateToday(saleDate);
                    case 'This Week': return isDateInThisWeek(saleDate);
                    case 'This Month': return isDateInThisMonth(saleDate);
                    case 'This Year': return isDateInThisYear(saleDate);
                    default: return true;
                }
            });
        }
        
        if (searchTerm.trim()) {
            salesToShow = salesToShow.filter(sale => String(sale.id).includes(searchTerm.trim()));
        }

        return salesToShow;
    }, [sales, filter, searchTerm]);

    return (
        <>
            <div className="content-card">
                <div className="inventory-header">
                    <input
                        type="text"
                        placeholder="Search by Sale ID..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search by Sale ID"
                    />
                    <div className="pos-category-filter">
                        {['All', 'Today', 'This Week', 'This Month', 'This Year'].map(f => (
                            <button
                                key={f}
                                className={`category-filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Sale ID</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Items</th>
                                <th>Subtotal</th>
                                <th>Tax</th>
                                <th>Profit</th>
                                <th>Total</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.length > 0 ? filteredSales.map(sale => (
                                <tr key={sale.id}>
                                    <td>#{sale.id}</td>
                                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                                    <td>{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{sale.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                                    <td>Birr {sale.subtotal.toFixed(2)}</td>
                                    <td>Birr {sale.taxAmount.toFixed(2)}</td>
                                    <td style={{color: 'var(--status-instock-text)'}}>Birr {sale.profit.toFixed(2)}</td>
                                    <td style={{fontWeight: 700}}>Birr {sale.total.toFixed(2)}</td>
                                    <td>
                                        <button className="action-btn" onClick={() => setSelectedSale(sale)} aria-label={`View details for sale #${sale.id}`}>
                                            <EyeIcon/>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>No sales match the current filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedSale && <SaleDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
        </>
    );
};


// --- Sale Details Modal Sub-component ---
const SaleDetailsModal: FC<{ sale: Sale; onClose: () => void; }> = ({ sale, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Sale Details #{sale.id}</h2>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close modal"><XMarkIcon /></button>
                </div>
                <div className="modal-body">
                    <p style={{color: 'var(--text-color-secondary)', marginBottom: '1.5rem'}}>
                        Completed on {new Date(sale.date).toLocaleString()}
                    </p>

                    <h4 style={{marginBottom: '1rem', fontWeight: 600}}>Items Sold</h4>
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem'}}>
                        {sale.items.map(item => (
                             <div key={item.id} className="cart-item" style={{padding: '0.75rem 0.25rem'}}>
                                <div className="cart-item-details">
                                    <h4>{item.name}</h4>
                                    <p>{item.quantity} x Birr {item.price.toFixed(2)}</p>
                                </div>
                                <span style={{fontWeight: 500}}>Birr {(item.quantity * item.price).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary" style={{marginTop: '1rem'}}>
                        <div className="summary-line">
                            <span>Subtotal</span>
                            <span>Birr {sale.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Tax ({(sale.taxRate * 100).toFixed(0)}%)</span>
                            <span>Birr {sale.taxAmount.toFixed(2)}</span>
                        </div>
                        <hr style={{border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0.75rem 0'}} />
                        <div className="summary-line summary-total">
                            <span>Total Paid</span>
                            <span>Birr {sale.total.toFixed(2)}</span>
                        </div>
                         <div className="summary-line" style={{fontSize: '0.9rem', color: 'var(--status-instock-text)'}}>
                            <span>Profit from this sale</span>
                            <span>Birr {sale.profit.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};