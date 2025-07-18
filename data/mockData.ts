/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    purchasedPrice: number;
    stock: number;
    expiryDate: string; // YYYY-MM-DD format
}

export interface Category {
    id: number;
    name: string;
}

export interface TaxRate {
    id: number;
    name: string;
    rate: number;
}

export interface SaleItem {
    id: number;
    name: string;
    price: number;
    purchasedPrice: number;
    quantity: number;
}

export interface Sale {
    id: number;
    date: string; // ISO 8601 format
    items: SaleItem[];
    subtotal: number;
    taxAmount: number;
    taxRate: number; // The rate used for this sale, e.g., 0.15
    profit: number;
    total: number;
}


export const taxRates: TaxRate[] = [
    { id: 1, name: 'Standard VAT', rate: 0.15 },
    { id: 2, name: 'Reduced Rate', rate: 0.05 },
    { id: 3, name: 'Exempt', rate: 0.00 },
];

export const categories: Category[] = [
    { id: 1, name: 'Pain Relief' },
    { id: 2, name: 'Allergy' },
    { id: 3, name: 'Antibiotics' },
    { id: 4, name: 'Vitamins' },
    { id: 5, name: 'Diabetes' },
    { id: 6, name: 'Blood Pressure' },
    { id: 7, name: 'Cholesterol' },
    { id: 8, name: 'Cold & Flu' },
    { id: 9, name: 'First Aid' },
];

export const products: Product[] = [
    { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief', price: 5.99, purchasedPrice: 2.50, stock: 120, expiryDate: '2025-12-31' },
    { id: 2, name: 'Ibuprofen 200mg', category: 'Pain Relief', price: 7.49, purchasedPrice: 3.10, stock: 85, expiryDate: '2024-08-15' },
    { id: 3, name: 'Aspirin 100mg', category: 'Pain Relief', price: 4.25, purchasedPrice: 1.80, stock: 200, expiryDate: '2026-01-01' },
    { id: 4, name: 'Loratadine 10mg', category: 'Allergy', price: 12.99, purchasedPrice: 6.50, stock: 50, expiryDate: '2024-07-30' },
    { id: 5, name: 'Cetirizine 10mg', category: 'Allergy', price: 11.50, purchasedPrice: 5.75, stock: 8, expiryDate: '2023-12-01' },
    { id: 6, name: 'Amoxicillin 250mg', category: 'Antibiotics', price: 15.00, purchasedPrice: 8.00, stock: 30, expiryDate: '2025-05-20' },
    { id: 7, name: 'Azithromycin 500mg', category: 'Antibiotics', price: 25.75, purchasedPrice: 14.20, stock: 22, expiryDate: '2024-09-01' },
    { id: 8, name: 'Vitamin C 1000mg', category: 'Vitamins', price: 9.99, purchasedPrice: 4.80, stock: 150, expiryDate: '2026-06-30' },
    { id: 9, name: 'Vitamin D3 2000IU', category: 'Vitamins', price: 14.50, purchasedPrice: 7.00, stock: 0, expiryDate: '2025-02-28' },
    { id: 10, name: 'Metformin 500mg', category: 'Diabetes', price: 18.20, purchasedPrice: 9.50, stock: 65, expiryDate: '2024-11-10' },
    { id: 11, name: 'Lisinopril 10mg', category: 'Blood Pressure', price: 10.80, purchasedPrice: 5.25, stock: 75, expiryDate: '2025-08-01' },
    { id: 12, name: 'Atorvastatin 20mg', category: 'Cholesterol', price: 22.40, purchasedPrice: 11.00, stock: 40, expiryDate: '2024-08-25' },
    { id: 13, name: 'Cough Syrup', category: 'Cold & Flu', price: 8.99, purchasedPrice: 4.00, stock: 90, expiryDate: '2025-10-15' },
    { id: 14, name: 'Nasal Spray', category: 'Cold & Flu', price: 6.50, purchasedPrice: 2.75, stock: 5, expiryDate: '2024-06-30' },
    { id: 15, name: 'Band-Aids (Box)', category: 'First Aid', price: 3.50, purchasedPrice: 1.20, stock: 300, expiryDate: '2028-01-01' },
];