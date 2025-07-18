/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, SVGProps } from 'react';

const XMarkIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '450px'}}>
                <div className="modal-header">
                    <h2>User Profile</h2>
                    <button className="modal-close-btn" onClick={onClose}><XMarkIcon /></button>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                         <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--primary-color)'}}/>
                         <div style={{textAlign: 'center'}}>
                            <h3 style={{fontSize: '1.5rem', color: 'var(--text-color)'}}>Dr. Ada Lovelace</h3>
                            <p style={{color: 'var(--text-color-secondary)'}}>Administrator</p>
                         </div>
                    </div>
                     <div style={{marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem'}}>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="text" value="ada.lovelace@pharmasys.io" disabled />
                        </div>
                        <div className="form-group" style={{marginTop: '1rem'}}>
                            <label>Member Since</label>
                            <input type="text" value="January 1, 2024" disabled />
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
