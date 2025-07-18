/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, SVGProps, FC, useEffect, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS, CartItem } from './components/POS';
import { Reports } from './components/Reports';
import { SalesHistory } from './components/SalesHistory';
import { Login } from './components/Login';
import { ProfileModal } from './components/ProfileModal';
import { products as initialProducts, categories as initialCategories, taxRates as initialTaxRates, Product, Category, Sale, TaxRate } from './data/mockData';

// --- SVG Icons (as components for reusability) ---
const icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4h-13A1.5 1.5 0 0 0 4 5.5V6h16v-.5zM4 8v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8H4zm10.75-2.5L12 8.25 9.25 5.5h-1.5l3.5 3.5 3.5-3.5h-1.5z"/>
    </svg>
  ),
  dashboard: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  pos: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  inventory: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  reports: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  receipt: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  menu: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
};

type NavItemType = {
  name: string;
  icon: FC<SVGProps<SVGSVGElement>>;
};

const navItems: NavItemType[] = [
  { name: 'Dashboard', icon: icons.dashboard },
  { name: 'POS', icon: icons.pos },
  { name: 'Sales History', icon: icons.receipt },
  { name: 'Inventory', icon: icons.inventory },
  { name: 'Reports', icon: icons.reports },
];

export const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);


  // Centralized state
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [sales, setSales] = useState<Sale[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>(initialTaxRates);

  // --- Auth Handlers ---
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);
  
  // --- Close dropdown on click outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);


  // --- CRUD Handlers ---

  // Product Handlers
  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    setProducts(prev => {
        const newId = Math.max(...prev.map(p => p.id), 0) + 1;
        return [...prev, { ...productData, id: newId }];
    });
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  
  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Category Handlers
  const handleAddCategory = (name: string): boolean => {
      if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
          alert("Category with this name already exists.");
          return false;
      }
      const newId = Math.max(...categories.map(c => c.id), 0) + 1;
      setCategories(prev => [...prev, {id: newId, name}]);
      return true;
  };
  
  const handleUpdateCategory = (oldName: string, newName: string): boolean => {
      if (oldName.toLowerCase() !== newName.toLowerCase() && categories.some(c => c.name.toLowerCase() === newName.toLowerCase())) {
          alert("Another category with this name already exists.");
          return false;
      }
      setCategories(prev => prev.map(c => c.name === oldName ? { ...c, name: newName } : c));
      setProducts(prev => prev.map(p => p.category === oldName ? { ...p, category: newName } : p));
      return true;
  };

  const handleDeleteCategory = (name: string): boolean => {
      const isUsed = products.some(p => p.category === name);
      if (isUsed) {
          alert("Cannot delete category. It is currently in use by one or more products.");
          return false;
      }
      setCategories(prev => prev.filter(c => c.name !== name));
      return true;
  };

  // Tax Handlers
  const handleAddTax = (taxData: Omit<TaxRate, 'id'>): boolean => {
    if (taxRates.some(t => t.name.toLowerCase() === taxData.name.toLowerCase())) {
        alert("A tax rate with this name already exists.");
        return false;
    }
    const newId = (taxRates.length > 0 ? Math.max(...taxRates.map(t => t.id)) : 0) + 1;
    setTaxRates(prev => [...prev, { ...taxData, id: newId }]);
    return true;
  };

  const handleUpdateTax = (updatedTax: TaxRate): boolean => {
      if (taxRates.some(t => t.id !== updatedTax.id && t.name.toLowerCase() === updatedTax.name.toLowerCase())) {
          alert("Another tax rate with this name already exists.");
          return false;
      }
      setTaxRates(prev => prev.map(t => t.id === updatedTax.id ? updatedTax : t));
      return true;
  };

  const handleDeleteTax = (taxId: number): boolean => {
      if (taxRates.length <= 1) {
          alert("Cannot delete the last tax rate.");
          return false;
      }
      setTaxRates(prev => prev.filter(t => t.id !== taxId));
      return true;
  };


  // Sale Handler
  const handleCompleteSale = (cartItems: CartItem[], taxInfo: TaxRate): boolean => {
    // Final stock check
    for (const item of cartItems) {
        const productInStock = products.find(p => p.id === item.id);
        if (!productInStock || productInStock.stock < item.quantity) {
            alert(`Sale failed. Not enough stock for ${item.name}. Only ${productInStock?.stock || 0} left.`);
            return false;
        }
    }

    // Update product stock
    setProducts(prevProducts => 
        prevProducts.map(p => {
            const itemInCart = cartItems.find(item => item.id === p.id);
            if (itemInCart) {
                return { ...p, stock: p.stock - itemInCart.quantity };
            }
            return p;
        })
    );

    // Create and record the sale with detailed financial info
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxAmount = subtotal * taxInfo.rate;
    const total = subtotal + taxAmount;
    const profit = cartItems.reduce((acc, item) => acc + (item.price - item.purchasedPrice) * item.quantity, 0);

    const newSale: Sale = {
        id: (sales.length > 0 ? Math.max(...sales.map(s => s.id)) : 0) + 1,
        date: new Date().toISOString(),
        items: cartItems.map(({ id, name, price, purchasedPrice, quantity }) => ({ id, name, price, purchasedPrice, quantity })),
        subtotal,
        taxAmount,
        taxRate: taxInfo.rate,
        profit,
        total,
    };
    setSales(prevSales => [...prevSales, newSale]);
    alert(`Sale completed! Total: Birr ${newSale.total.toFixed(2)}`);
    return true;
  };

  const renderContent = (page: string) => {
    switch (page) {
      case 'Dashboard':
        return <Dashboard products={products} sales={sales} />;
      case 'Inventory':
        return <Inventory 
            products={products}
            categories={categories}
            taxRates={taxRates}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddTax={handleAddTax}
            onUpdateTax={handleUpdateTax}
            onDeleteTax={handleDeleteTax}
        />;
      case 'POS':
        return <POS 
            products={products}
            categories={categories}
            taxRates={taxRates}
            onCompleteSale={handleCompleteSale}
        />;
      case 'Sales History':
        return <SalesHistory sales={sales} />;
      case 'Reports':
        return <Reports products={products} sales={sales} />;
      default:
        return <div>Page not found</div>;
    }
  };

  const handleNavClick = (page: string) => {
    setActivePage(page);
    if (window.innerWidth <= 768) {
        setSidebarOpen(false);
    }
  }

  const LogoIcon = icons.logo;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} LogoIcon={LogoIcon} />;
  }

  return (
    <>
      <div className="app-container">
        <button className="menu-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)} aria-label="Toggle menu">
          <icons.menu />
        </button>
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Main Navigation">
          <div className="sidebar-header">
            <LogoIcon className="logo-icon" />
            <span className="logo-text">PharmaSys</span>
          </div>
          <nav>
            <ul className="nav-list">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.name}
                    className={`nav-item ${activePage === item.name ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.name)}
                    role="button"
                    aria-current={activePage === item.name ? 'page' : undefined}
                  >
                    <Icon />
                    <span className="nav-text">{item.name}</span>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
        <div className="main-content">
          <header className="header">
            <h1>{activePage}</h1>
            <div className="user-profile" ref={profileRef} onClick={() => setDropdownOpen(prev => !prev)}>
                <span>Dr. Ada Lovelace</span>
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User avatar" />
                {isDropdownOpen && (
                    <div className="user-profile-dropdown" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setProfileModalOpen(true); setDropdownOpen(false); }}>Profile</button>
                        <button onClick={handleLogout}>Change User</button>
                        <button onClick={handleLogout}>Log Out</button>
                    </div>
                )}
            </div>
          </header>
          <main className="page-content" role="main" aria-labelledby="page-title">
              {renderContent(activePage)}
          </main>
        </div>
      </div>
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </>
  );
};