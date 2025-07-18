/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
  PieChart, Pie, Cell,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Sale } from '../data/mockData';

const COLORS = ['#00A99D', '#1f2e4d', '#4ade80', '#f97316', '#ef4444', '#3b82f6'];

interface CustomPieLabelProps {
    cx?: number; cy?: number; midAngle?: number; outerRadius?: number;
    name?: string; percent?: number; [key: string]: any;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, percent }: CustomPieLabelProps) => {
    if (percent === undefined || percent < 0.03 || cx === undefined || cy === undefined || midAngle === undefined || outerRadius === undefined) {
        return null;
    }
    const radius = outerRadius + 40;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 25) * cos;
    const my = cy + (outerRadius + 25) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 12;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={'var(--text-color-secondary)'} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={'var(--text-color-secondary)'} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill={'var(--text-color)'} dominantBaseline="central" fontSize="0.9rem">
                {`${name} (${(percent * 100).toFixed(0)}%)`}
            </text>
        </g>
    );
};

// --- Helper Functions for Exporting ---
const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = String(row[header]);
                return `"${value.replace(/"/g, '""')}"`;
            }).join(',')
        )
    ];
    return csvRows.join('\n');
};

const downloadPdf = (data: any[], filename: string, title: string) => {
    if (data.length === 0) return;
    const doc = new jsPDF();
    const headers = Object.keys(data[0]);
    const body = data.map(row => headers.map(header => row[header]));

    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);

    autoTable(doc, {
        startY: 30,
        head: [headers],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [0, 169, 157] } // --primary-color
    });

    doc.save(filename);
};

const downloadDoc = (data: any[], filename: string, title: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);

    const html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${title}</title>
        <style>
            body { font-family: sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
            th { background-color: #f2f2f2; }
            h1 { font-size: 18px; }
            p { font-size: 12px; }
        </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <table>
                <thead>
                    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.map(row => `<tr>${headers.map(h => `<td>${String(row[h])}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    downloadFile(html, filename, 'application/msword');
};

interface ReportsProps {
    products: Product[];
    sales: Sale[];
}

export const Reports: React.FC<ReportsProps> = ({ products, sales }) => {
    const [reportType, setReportType] = useState('');
    const [exportFormat, setExportFormat] = useState('');

    // Memoize chart data calculations
    const monthlySalesData = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyTotals: Record<string, number> = {};
        
        sales.forEach(sale => {
            const monthIndex = new Date(sale.date).getMonth();
            const monthName = monthNames[monthIndex];
            if (!monthlyTotals[monthName]) {
                monthlyTotals[monthName] = 0;
            }
            monthlyTotals[monthName] += sale.total;
        });

        // Ensure all months are present for a stable chart, sort them correctly
        return monthNames.map(name => ({
            name,
            sales: monthlyTotals[name] || 0,
        }));
    }, [sales]);

    const topSellingProducts = useMemo(() => {
        const soldCounts: Record<string, {name: string, sold: number}> = {};

        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!soldCounts[item.id]) {
                    soldCounts[item.id] = { name: item.name, sold: 0 };
                }
                soldCounts[item.id].sold += item.quantity;
            });
        });

        return Object.values(soldCounts)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);
    }, [sales]);

    const pieData = useMemo(() => {
        const inventoryByCategory = products.reduce((acc, product) => {
            const category = product.category;
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += product.stock;
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(inventoryByCategory).map(name => ({
            name,
            value: inventoryByCategory[name]
        }));
    }, [products]);

    const uniqueCategories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
    
    const [statusFilters, setStatusFilters] = useState({
        inStock: true,
        lowStock: true,
        outOfStock: true,
    });

    const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>(
        () => uniqueCategories.reduce((acc, cat) => ({...acc, [cat]: true }), {})
    );

    // Effect to update category filters if categories change
    React.useEffect(() => {
         setCategoryFilters(uniqueCategories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {}));
    }, [uniqueCategories])


    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setStatusFilters(prev => ({...prev, [name]: checked }));
    };

    const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setCategoryFilters(prev => ({...prev, [name]: checked }));
    };

    const handleGenerateExport = () => {
        if (!reportType || !exportFormat) return;

        let dataToExport: any[] = [];
        let baseFilename = '';
        let reportTitle = '';

        if (reportType === 'inventory') {
            baseFilename = 'inventory_report';
            reportTitle = 'Inventory Status Report';
            const selectedStatuses = Object.entries(statusFilters)
                .filter(([, checked]) => checked)
                .map(([status]) => status);

            const selectedCategories = Object.entries(categoryFilters)
                .filter(([, checked]) => checked)
                .map(([category]) => category);
            
            dataToExport = products.filter(p => {
                let status = 'inStock';
                if (p.stock === 0) status = 'outOfStock';
                else if (p.stock < 10) status = 'lowStock';

                const statusMatch = selectedStatuses.includes(status);
                const categoryMatch = selectedCategories.includes(p.category);

                return statusMatch && categoryMatch;
            }).map(({id, ...rest}) => rest); // Exclude ID from export

        } else if (reportType === 'sales') {
            baseFilename = 'monthly_sales_report';
            reportTitle = 'Monthly Sales Report';
            dataToExport = monthlySalesData.filter(d => d.sales > 0); // Only export months with sales
        }

        if (dataToExport.length === 0) {
            alert("No data to export based on current filters.");
            return;
        }

        const date = new Date().toISOString().split('T')[0];
        const filename = `${baseFilename}_${date}.${exportFormat}`;

        if (exportFormat === 'json') {
            downloadFile(JSON.stringify(dataToExport, null, 2), filename, 'application/json');
        } else if (exportFormat === 'csv') {
            downloadFile(convertToCSV(dataToExport), filename, 'text/csv');
        } else if (exportFormat === 'pdf') {
            downloadPdf(dataToExport, filename, reportTitle);
        } else if (exportFormat === 'doc') {
            downloadDoc(dataToExport, filename, reportTitle);
        }
    };


    return (
        <div className="reports-grid">
            <div className="content-card">
                <h3 className="chart-title">Monthly Sales Overview</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySalesData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="var(--text-color-secondary)" tick={{ fill: 'var(--text-color-secondary)' }} />
                            <YAxis stroke="var(--text-color-secondary)" tick={{ fill: 'var(--text-color-secondary)' }} tickFormatter={(value) => `Birr ${value}`}/>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--glass-border)' }} formatter={(value: number) => `Birr ${value.toFixed(2)}`}/>
                            <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
                            <Line type="monotone" dataKey="sales" name="Sales (Birr)" stroke="#00A99D" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="content-card">
                <h3 className="chart-title">Top 5 Selling Products</h3>
                 <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topSellingProducts} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" stroke="var(--text-color-secondary)" tick={{ fill: 'var(--text-color-secondary)' }} allowDecimals={false}/>
                            <YAxis type="category" dataKey="name" width={140} stroke="var(--text-color-secondary)" tick={{ fill: 'var(--text-color-secondary)', fontSize: '0.9rem' }} interval={0} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--glass-border)' }} cursor={{fill: 'rgba(0, 169, 157, 0.1)'}} />
                            <Bar dataKey="sold" name="Units Sold" fill="var(--primary-color)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="content-card">
                <h3 className="chart-title">Inventory by Category</h3>
                <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
                        <Pie
                            data={pieData} cx="50%" cy="50%" labelLine={false}
                            outerRadius={90} fill="#8884d8" dataKey="value"
                            nameKey="name" label={renderCustomizedLabel}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--glass-border)' }} />
                    </PieChart>
                </ResponsiveContainer>
                </div>
            </div>

            <div className="content-card export-panel">
                 <h3 className="chart-title">Export Reports</h3>
                 <form className="export-form" onSubmit={e => e.preventDefault()}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="report-type">Report Type</label>
                            <select id="report-type" value={reportType} onChange={e => setReportType(e.target.value)}>
                                <option value="" disabled>Select a report...</option>
                                <option value="inventory">Inventory Status</option>
                                <option value="sales">Monthly Sales</option>
                            </select>
                        </div>
                         <div className="form-group">
                            <label htmlFor="export-format">Export Format</label>
                            <select id="export-format" value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
                                <option value="" disabled>Select a format...</option>
                                <option value="csv">CSV</option>
                                <option value="json">JSON</option>
                                <option value="pdf">PDF</option>
                                <option value="doc">DOC</option>
                            </select>
                        </div>
                    </div>

                    {reportType === 'inventory' && (
                        <div className="filter-section">
                            <fieldset>
                                <legend>Filter by Stock Status</legend>
                                <div className="filter-group">
                                    {Object.keys(statusFilters).map(status => (
                                         <label key={status} className="custom-checkbox">
                                            {status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            <input type="checkbox" name={status} checked={statusFilters[status as keyof typeof statusFilters]} onChange={handleStatusFilterChange} />
                                            <span className="checkmark"></span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                             <fieldset style={{marginTop: '1.5rem'}}>
                                <legend>Filter by Category</legend>
                                <div className="filter-group">
                                     {uniqueCategories.map(cat => (
                                         <label key={cat} className="custom-checkbox">
                                            {cat}
                                            <input type="checkbox" name={cat} checked={categoryFilters[cat] ?? true} onChange={handleCategoryFilterChange} />
                                            <span className="checkmark"></span>
                                        </label>
                                     ))}
                                </div>
                            </fieldset>
                        </div>
                    )}
                    
                    <button className="btn" style={{marginTop: '1rem', alignSelf: 'flex-start'}} onClick={handleGenerateExport} disabled={!reportType || !exportFormat}>
                        Generate & Download
                    </button>
                 </form>
            </div>
        </div>
    );
};