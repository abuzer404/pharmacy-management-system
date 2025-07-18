/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Add type definition for Vanta.js to the global window object
declare global {
  interface Window {
    VANTA?: {
      CELLS: (options: any) => void;
    };
  }
}

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize Vanta.js background animation
if (window.VANTA) {
  window.VANTA.CELLS({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    color1: 0x00a99d, // --primary-color
    color2: 0x1f2e4d, 
    size: 3.00,
    speed: 1.00
  });
}