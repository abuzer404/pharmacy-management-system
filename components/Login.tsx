/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FC, FormEvent, SVGProps } from 'react';

interface LoginProps {
    onLogin: () => void;
    LogoIcon: FC<SVGProps<SVGSVGElement>>;
}

export const Login: FC<LoginProps> = ({ onLogin, LogoIcon }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (username.trim() === '' || password.trim() === '') {
            setError('Please enter both username and password.');
            return;
        }
        // Simulate successful login
        setError('');
        onLogin();
    };

    return (
        <div className="login-container">
            <div className="content-card login-card">
                <div className="login-header">
                    <LogoIcon className="logo-icon" />
                    <h1>PharmaSys</h1>
                    <p>Please log in to continue</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="e.g., adovelace"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p style={{ color: 'var(--status-outofstock-text)', textAlign: 'center' }}>{error}</p>}
                    <button type="submit" className="btn">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};
