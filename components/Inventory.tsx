/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, FC, SVGProps, FormEvent } from 'react';
import { Product, Category, TaxRate } from '../data/mockData';

// --- ICONS ---
const PencilSquareIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const TrashIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const XMarkIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const getStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', className: 'status-outofstock' };
    if (stock < 10) return { text: 'Low Stock', className: 'status-lowstock' };
    return { text: 'In Stock', className: 'status-instock' };
};

const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Expired', className: 'status-outofstock' };
    if (diffDays <= 30) return { text: `Expires in ${diffDays} day(s)`, className: 'status-lowstock' };
    return { text: new Date(expiryDate).toLocaleDateString(), className: '' };
};

type OmitId<T> = Omit<T, 'id'>;

interface InventoryProps {
    products: Product[];
    categories: Category[];
    taxRates: TaxRate[];
    onAddProduct: (productData: OmitId<Product>) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (productId: number) => void;
    onAddCategory: (name: string) => boolean;
    onUpdateCategory: (oldName: string, newName: string) => boolean;
    onDeleteCategory: (name: string) => boolean;
    onAddTax: (taxData: Omit<TaxRate, 'id'>) => boolean;
    onUpdateTax: (tax: TaxRate) => boolean;
    onDeleteTax: (taxId: number) => boolean;
}

export const Inventory: FC<InventoryProps> = ({
    products, categories, taxRates,
    onAddProduct, onUpdateProduct, onDeleteProduct,
    onAddCategory, onUpdateCategory, onDeleteCategory,
    onAddTax, onUpdateTax, onDeleteTax
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isTaxModalOpen, setTaxModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    const defaultProductState: OmitId<Product> = { name: '', category: '', price: 0, purchasedPrice: 0, stock: 0, expiryDate: '' };
    const [productForm, setProductForm] = useState<OmitId<Product>>(defaultProductState);

    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, products]);
    
    // --- Modal Handlers ---
    const openAddProductModal = () => {
        setEditingProduct(null);
        const today = new Date();
        const defaultExpiry = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
        setProductForm({ name: '', category: categories[0]?.name || '', price: 0, purchasedPrice: 0, stock: 0, expiryDate: defaultExpiry });
        setProductModalOpen(true);
    };

    const openEditProductModal = (product: Product) => {
        setEditingProduct(product);
        setProductForm(product);
        setProductModalOpen(true);
    };

    const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: (name === 'price' || name === 'stock' || name === 'purchasedPrice') ? parseFloat(value) : value }));
    };

    const handleProductSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!productForm.name || !productForm.category || !productForm.expiryDate) {
            alert('Please fill in all required fields.');
            return;
        }
        if (editingProduct) {
            onUpdateProduct({ ...productForm, id: editingProduct.id });
        } else {
            onAddProduct(productForm);
        }
        setProductModalOpen(false);
    };

    const handleDeleteClick = (productId: number) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            onDeleteProduct(productId);
        }
    };

    return (
        <>
            <div className="content-card">
                <div className="inventory-header">
                     <input
                        type="text"
                        placeholder="Search products..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search products"
                    />
                    <div className="inventory-actions">
                        <button className="btn btn-secondary" onClick={() => setTaxModalOpen(true)}>Manage Taxes</button>
                        <button className="btn btn-secondary" onClick={() => setCategoryModalOpen(true)}>Manage Categories</button>
                        <button className="btn" onClick={openAddProductModal}>Add New Product</button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Selling Price</th>
                                <th>Stock</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => {
                                const status = getStatus(product.stock);
                                const expiryStatus = getExpiryStatus(product.expiryDate);
                                return (
                                    <tr key={product.id}>
                                        <td>{product.name}</td>
                                        <td>{product.category}</td>
                                        <td>Birr {product.price.toFixed(2)}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <span className={`status-badge ${expiryStatus.className}`}>
                                                {expiryStatus.text}
                                            </span>
                                        </td>
                                        <td><span className={`status-badge ${status.className}`}>{status.text}</span></td>
                                        <td className="table-actions">
                                            <button className="action-btn edit" onClick={() => openEditProductModal(product)} aria-label={`Edit ${product.name}`}><PencilSquareIcon/></button>
                                            <button className="action-btn delete" onClick={() => handleDeleteClick(product.id)} aria-label={`Delete ${product.name}`}><TrashIcon/></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isProductModalOpen && (
                 <div className="modal-overlay" onClick={() => setProductModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="modal-close-btn" onClick={() => setProductModalOpen(false)}><XMarkIcon/></button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="modal-form">
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="name">Product Name</label>
                                    <input type="text" id="name" name="name" value={productForm.name} onChange={handleProductFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <select id="category" name="category" value={productForm.category} onChange={handleProductFormChange} required>
                                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-row">
                                     <div className="form-group">
                                        <label htmlFor="purchasedPrice">Purchased Price</label>
                                        <input type="number" id="purchasedPrice" name="purchasedPrice" value={productForm.purchasedPrice} onChange={handleProductFormChange} required min="0" step="0.01" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="price">Selling Price</label>
                                        <input type="number" id="price" name="price" value={productForm.price} onChange={handleProductFormChange} required min="0" step="0.01" />
                                    </div>
                                </div>
                                 <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="stock">Stock Quantity</label>
                                        <input type="number" id="stock" name="stock" value={productForm.stock} onChange={handleProductFormChange} required min="0" step="1"/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="expiryDate">Expiry Date</label>
                                        <input type="date" id="expiryDate" name="expiryDate" value={productForm.expiryDate} onChange={handleProductFormChange} required/>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setProductModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn">{editingProduct ? 'Save Changes' : 'Add Product'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {isCategoryModalOpen && (
                <CategoryManagerModal 
                    isOpen={isCategoryModalOpen}
                    onClose={() => setCategoryModalOpen(false)}
                    categories={categories}
                    onAdd={onAddCategory}
                    onUpdate={onUpdateCategory}
                    onDelete={onDeleteCategory}
                />
            )}

            {isTaxModalOpen && (
                <TaxManagerModal
                    isOpen={isTaxModalOpen}
                    onClose={() => setTaxModalOpen(false)}
                    taxRates={taxRates}
                    onAdd={onAddTax}
                    onUpdate={onUpdateTax}
                    onDelete={onDeleteTax}
                />
            )}
        </>
    );
};

// Sub-component for managing categories to keep main component cleaner
const CategoryManagerModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    categories: Category[],
    onAdd: (name: string) => boolean,
    onUpdate: (oldName: string, newName: string) => boolean,
    onDelete: (name: string) => boolean
}> = ({ isOpen, onClose, categories, onAdd, onUpdate, onDelete }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<{id: number, name: string} | null>(null);

    const handleAdd = () => {
        if(newCategoryName.trim()){
            if (onAdd(newCategoryName.trim())) {
                setNewCategoryName('');
            }
        }
    };
    
    const handleUpdate = (id: number, oldName: string) => {
        const newName = (document.getElementById(`cat-edit-${id}`) as HTMLInputElement).value.trim();
        if(newName && oldName !== newName) {
            if(onUpdate(oldName, newName)){
                setEditingCategory(null);
            }
        } else {
             setEditingCategory(null);
        }
    };

    const handleDelete = (name: string) => {
        if(window.confirm(`Are you sure you want to delete the "${name}" category?`)){
            onDelete(name);
        }
    };

    if(!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Manage Categories</h2>
                    <button className="modal-close-btn" onClick={onClose}><XMarkIcon /></button>
                </div>
                <div className="modal-body">
                    <div className="category-management-list">
                        {categories.map(cat => (
                            <div key={cat.id} className="category-item">
                                {editingCategory?.id === cat.id ? (
                                    <input type="text" id={`cat-edit-${cat.id}`} defaultValue={cat.name} className="search-input" autoFocus onBlur={() => handleUpdate(cat.id, cat.name)} onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id, cat.name)} />
                                ) : (
                                    <span>{cat.name}</span>
                                )}
                                <div className="category-item-actions">
                                    <button className="action-btn edit" onClick={() => setEditingCategory(cat)}><PencilSquareIcon/></button>
                                    <button className="action-btn delete" onClick={() => handleDelete(cat.name)}><TrashIcon/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="add-category-form">
                        <input type="text" placeholder="New category name" className="search-input" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}/>
                        <button className="btn" onClick={handleAdd}>Add</button>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};

// Sub-component for managing taxes
const TaxManagerModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    taxRates: TaxRate[],
    onAdd: (data: Omit<TaxRate, 'id'>) => boolean,
    onUpdate: (tax: TaxRate) => boolean,
    onDelete: (id: number) => boolean
}> = ({ isOpen, onClose, taxRates, onAdd, onUpdate, onDelete }) => {
    const [newTaxName, setNewTaxName] = useState('');
    const [newTaxRate, setNewTaxRate] = useState('');
    const [editingTax, setEditingTax] = useState<Omit<TaxRate, 'rate'> & { rate: number | string } | null>(null);

    const handleAdd = () => {
        const rateVal = parseFloat(newTaxRate);
        if (newTaxName.trim() && !isNaN(rateVal) && rateVal >= 0) {
            if (onAdd({ name: newTaxName.trim(), rate: rateVal / 100 })) {
                setNewTaxName('');
                setNewTaxRate('');
            }
        } else {
            alert('Please enter a valid name and a non-negative rate.');
        }
    };
    
    const handleStartEdit = (tax: TaxRate) => {
        setEditingTax({ ...tax, rate: tax.rate * 100 });
    };

    const handleSaveEdit = () => {
        if (!editingTax) return;
        const rateVal = parseFloat(String(editingTax.rate));
        if (editingTax.name.trim() && !isNaN(rateVal) && rateVal >= 0) {
            if (onUpdate({ ...editingTax, rate: rateVal / 100 })) {
                setEditingTax(null);
            }
        } else {
            alert('Please enter a valid name and non-negative rate.');
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm(`Are you sure you want to delete this tax rate? This cannot be undone.`)) {
            if (onDelete(id)) {
                setEditingTax(null);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Manage Tax Rates</h2>
                    <button className="modal-close-btn" onClick={onClose}><XMarkIcon /></button>
                </div>
                <div className="modal-body">
                    <div className="category-management-list">
                        {taxRates.map(tax => (
                            <div key={tax.id} className="category-item">
                                {editingTax?.id === tax.id ? (
                                    <>
                                        <input type="text" value={editingTax.name} onChange={e => setEditingTax({ ...editingTax, name: e.target.value })} className="search-input" style={{flex: '2 1 0%'}} />
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 0%'}}>
                                            <input type="number" value={editingTax.rate} onChange={e => setEditingTax({ ...editingTax, rate: e.target.value })} className="search-input" style={{textAlign: 'right'}} />
                                            <span>%</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span>{tax.name}</span>
                                        <span style={{color: 'var(--text-color-secondary)'}}>{(tax.rate * 100).toFixed(2)}%</span>
                                    </>
                                )}
                                <div className="category-item-actions">
                                    {editingTax?.id === tax.id ? (
                                        <button className="btn" style={{padding: '0.5rem 1rem'}} onClick={handleSaveEdit}>Save</button>
                                    ) : (
                                        <button className="action-btn edit" onClick={() => handleStartEdit(tax)}><PencilSquareIcon /></button>
                                    )}
                                    <button className="action-btn delete" onClick={() => handleDelete(tax.id)}><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="add-category-form">
                        <input type="text" placeholder="New tax name" className="search-input" style={{flex: '2 1 0%'}} value={newTaxName} onChange={e => setNewTaxName(e.target.value)} />
                        <input type="number" placeholder="Rate" className="search-input" style={{flex: '1 1 0%', textAlign: 'right'}} value={newTaxRate} onChange={e => setNewTaxRate(e.target.value)} />
                        <span style={{flexShrink: 0}}>%</span>
                        <button className="btn" onClick={handleAdd}>Add</button>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};