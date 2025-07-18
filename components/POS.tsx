/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import { Product, Category, TaxRate } from '../data/mockData';

export interface CartItem extends Product {
    quantity: number;
}

interface POSProps {
    products: Product[];
    categories: Category[];
    taxRates: TaxRate[];
    onCompleteSale: (cartItems: CartItem[], taxInfo: TaxRate) => boolean;
}

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>

const XMarkIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const POS: FC<POSProps> = ({ products: allProducts, categories, taxRates, onCompleteSale }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate>(taxRates[0] || { id: 0, name: 'No Tax Available', rate: 0});
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [lastSale, setLastSale] = useState<{
        items: CartItem[];
        subtotal: number;
        tax: number;
        total: number;
        taxRate: TaxRate;
    } | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // If the currently selected tax rate is no longer in the list (e.g., it was deleted),
        // reset to the first available one to prevent errors.
        if (!taxRates.find(t => t.id === selectedTaxRate.id)) {
            setSelectedTaxRate(taxRates[0] || { id: 0, name: 'No Tax Available', rate: 0 });
        }
    }, [taxRates, selectedTaxRate]);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return product.stock > 0 && matchesCategory && matchesSearch;
        });
    }, [searchTerm, allProducts, selectedCategory]);

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                 if (existingItem.quantity < product.stock) { // Check against available stock
                    return prevCart.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                } else {
                    alert(`Cannot add more ${product.name}. Only ${product.stock} left in stock.`);
                    return prevCart;
                }
            }
             if (product.stock > 0) {
                return [...prevCart, { ...product, quantity: 1 }];
            }
            return prevCart;
        });
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        } 
        
        const productInStock = allProducts.find(p => p.id === productId);
        if (productInStock && newQuantity > productInStock.stock) {
            alert(`Cannot set quantity to ${newQuantity}. Only ${productInStock.stock} units of ${productInStock.name} are in stock.`);
            return;
        }
        
        setCart(cart.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    }

    const { subtotal, tax, total, profit } = useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const profit = cart.reduce((acc, item) => acc + (item.price - item.purchasedPrice) * item.quantity, 0);
        const tax = subtotal * selectedTaxRate.rate;
        const total = subtotal + tax;
        return { subtotal, tax, total, profit };
    }, [cart, selectedTaxRate]);
    
    const handleCompleteSale = () => {
        if (cart.length === 0) {
            alert("Cart is empty!");
            return;
        }
        if (onCompleteSale(cart, selectedTaxRate)) {
            // Save sale info for receipt
            setLastSale({
                items: cart,
                subtotal,
                tax,
                total,
                taxRate: selectedTaxRate
            });
            setSuccessModalOpen(true);
            clearCart();
        }
    }
    
    const handleTaxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTaxId = Number(e.target.value);
        const newTaxRate = taxRates.find(t => t.id === newTaxId);
        if (newTaxRate) {
            setSelectedTaxRate(newTaxRate);
        }
    };

    return (
        <>
        <div className="pos-container">
            <div className="pos-products content-card">
                <div className="pos-products-header">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                     <div className="pos-category-filter">
                        <button 
                            className={`category-filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('All')}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id} 
                                className={`category-filter-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.name)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                            <h3>{product.name}</h3>
                            <p>Birr {product.price.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="pos-cart content-card">
                <h3>Current Sale</h3>
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-color-secondary)', marginTop: '2rem' }}>Cart is empty</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-details">
                                    <h4>{item.name}</h4>
                                    <p>Birr {item.price.toFixed(2)}</p>
                                </div>
                                <div className="cart-item-actions">
                                    <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity"><MinusIcon /></button>
                                    <span>{item.quantity}</span>
                                    <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity"><PlusIcon /></button>
                                    <button className="remove-btn" onClick={() => removeFromCart(item.id)} aria-label="Remove item"><TrashIcon /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {cart.length > 0 && (
                    <div className="cart-summary">
                        <div className="form-group" style={{marginBottom: '1rem'}}>
                            <label htmlFor="tax-rate-select">Tax Rate</label>
                            <select id="tax-rate-select" value={selectedTaxRate.id} onChange={handleTaxChange} >
                                {taxRates.map(tax => <option key={tax.id} value={tax.id}>{tax.name} ({(tax.rate * 100).toFixed(1)}%)</option>)}
                            </select>
                        </div>
                        <div className="summary-line">
                            <span>Subtotal</span>
                            <span>Birr {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Tax ({(selectedTaxRate.rate * 100).toFixed(1)}%)</span>
                            <span>Birr {tax.toFixed(2)}</span>
                        </div>
                        <hr style={{border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0.75rem 0'}} />
                        <div className="summary-line summary-total">
                            <span>Total</span>
                            <span>Birr {total.toFixed(2)}</span>
                        </div>
                         <div className="summary-line" style={{fontSize: '0.9rem', color: 'var(--status-instock-text)'}}>
                            <span>Gross Profit</span>
                            <span>Birr {profit.toFixed(2)}</span>
                        </div>
                        <div className="checkout-actions">
                             <button className="btn btn-secondary" onClick={clearCart}>Clear Cart</button>
                             <button className="btn btn-checkout" onClick={handleCompleteSale}>Complete Sale</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        {successModalOpen && lastSale && (
            <div className="modal-overlay" onClick={() => setSuccessModalOpen(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
                    <div className="modal-header">
                        <h2>Sale Successful</h2>
                        <button className="modal-close-btn" onClick={() => setSuccessModalOpen(false)}><XMarkIcon /></button>
                    </div>
                    <div className="modal-body">
                        <div style={{textAlign: 'center', marginBottom: '1rem'}}>
                            <span style={{fontSize: '2.5rem', color: 'var(--primary-color)'}}>&#10003;</span>
                            <h3 style={{margin: '1rem 0 0.5rem'}}>Thank you for your purchase!</h3>
                            <p style={{color: 'var(--text-color-secondary)'}}>The sale was completed successfully.</p>
                        </div>
                        <div ref={receiptRef} style={{background: 'rgba(0,0,0,0.03)', borderRadius: 8, padding: '1rem', marginBottom: '1rem'}}>
                            <div style={{textAlign: 'center', marginBottom: 8}}>
                                <span style={{fontWeight: 700, fontSize: '1.2rem', letterSpacing: 1}}>Khalid Pharmacy</span><br/>
                                <span style={{fontSize: '0.95rem', color: 'var(--text-color-secondary)'}}>Receipt</span>
                            </div>
                            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                {lastSale.items.map(item => (
                                    <li key={item.id} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: 4}}>
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>Birr {(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                            <hr style={{margin: '0.5rem 0'}} />
                            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem'}}>
                                <span>Subtotal</span>
                                <span>Birr {lastSale.subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem'}}>
                                <span>Tax ({(lastSale.taxRate.rate * 100).toFixed(1)}%)</span>
                                <span>Birr {lastSale.tax.toFixed(2)}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.05rem', marginTop: 6}}>
                                <span>Total</span>
                                <span>Birr {lastSale.total.toFixed(2)}</span>
                            </div>
                            <div style={{marginTop: 16, textAlign: 'center', fontSize: '0.98rem', color: 'var(--primary-color)', fontWeight: 500}}>
                                Thank you for purchasing from Khalid Pharmacy!
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer" style={{justifyContent: 'center'}}>
                        <button className="btn" onClick={() => {
                            // Print only the receipt
                            if (receiptRef.current) {
                                const printContents = receiptRef.current.innerHTML;
                                const printWindow = window.open('', '', 'width=400,height=600');
                                if (printWindow) {
                                    printWindow.document.write(`
                                        <html><head><title>Receipt</title>
                                        <style>
                                            body { font-family: 'Inter', sans-serif; color: #222; background: #fff; margin: 0; padding: 1rem; }
                                            h4 { margin-bottom: 8px; }
                                            ul { list-style: none; padding: 0; margin: 0; }
                                            li { display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 4px; }
                                            hr { margin: 0.5rem 0; }
                                            div { display: flex; justify-content: space-between; font-size: 0.95rem; }
                                            .total { font-weight: 600; font-size: 1.05rem; margin-top: 6px; }
                                            .receipt-header { text-align: center; margin-bottom: 8px; font-weight: 700; font-size: 1.2rem; letter-spacing: 1px; }
                                            .receipt-footer { margin-top: 16px; text-align: center; font-size: 0.98rem; color: #00A99D; font-weight: 500; }
                                        </style>
                                        </head><body>` + printContents + `</body></html>`);
                                    printWindow.document.close();
                                    printWindow.focus();
                                    printWindow.print();
                                    printWindow.close();
                                }
                            }
                        }}>Print Receipt</button>
                        <button className="btn btn-secondary" onClick={() => setSuccessModalOpen(false)}>Close</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};