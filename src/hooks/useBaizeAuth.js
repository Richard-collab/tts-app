import { useState, useCallback } from 'react';
import { login } from '../utils/baizeApi';
import { logAction, ActionTypes } from '../utils/logger';

/**
 * Custom hook to manage Baize authentication state and logic.
 * Encapsulates user/token management, login dialog state, and login/logout actions.
 *
 * @param {Function} setMessage - Callback function to display UI messages (e.g., success/error alerts).
 * @returns {Object} Authentication state and handlers.
 * @returns {Object|null} return.user - The current logged-in user object or null.
 * @returns {string|null} return.token - The current authentication token or null.
 * @returns {boolean} return.loginOpen - State of the login dialog visibility.
 * @returns {string} return.loginUsername - Current value of the username input.
 * @returns {Function} return.setLoginUsername - Setter for username input.
 * @returns {string} return.loginPassword - Current value of the password input.
 * @returns {Function} return.setLoginPassword - Setter for password input.
 * @returns {Function} return.handleLoginOpen - Function to open the login dialog.
 * @returns {Function} return.handleLoginClose - Function to close the login dialog.
 * @returns {Function} return.handleLoginSubmit - Async function to handle login submission.
 * @returns {Function} return.logout - Function to handle user logout and state cleanup.
 */
export const useBaizeAuth = (setMessage) => {
    // Baize API State
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('audioEditor_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => {
        return localStorage.getItem('audioEditor_token');
    });

    const [loginOpen, setLoginOpen] = useState(false);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLoginOpen = useCallback(() => setLoginOpen(true), []);
    const handleLoginClose = useCallback(() => setLoginOpen(false), []);

    const handleLoginSubmit = useCallback(async () => {
        if (!loginUsername || !loginPassword) {
            setMessage({ text: '请输入用户名和密码', type: 'error' });
            return;
        }
        try {
            const result = await login(loginUsername, loginPassword);
            const newUser = { account: result.account || loginUsername };
            const newToken = result.token;

            setUser(newUser);
            setToken(newToken);

            localStorage.setItem('audioEditor_user', JSON.stringify(newUser));
            localStorage.setItem('audioEditor_token', newToken);

            logAction(ActionTypes.AUTH_LOGIN, { username: newUser.account }, 'success');
            setMessage({ text: `登录成功: ${newUser.account}`, type: 'success' });
            handleLoginClose();
        } catch (error) {
            logAction(ActionTypes.AUTH_LOGIN, { username: loginUsername, error: error.message }, 'error');
            setMessage({ text: `登录失败: ${error.message}`, type: 'error' });
        }
    }, [loginUsername, loginPassword, setMessage, handleLoginClose]);

    const logout = useCallback(() => {
        const username = user ? user.account : 'Unknown';
        setUser(null);
        setToken(null);
        localStorage.removeItem('audioEditor_user');
        localStorage.removeItem('audioEditor_token');
        logAction(ActionTypes.AUTH_LOGOUT, { username }, 'success');
        setMessage({ text: '已退出登录', type: 'success' });
    }, [user, setMessage]);

    return {
        user,
        token,
        loginOpen,
        loginUsername,
        setLoginUsername,
        loginPassword,
        setLoginPassword,
        handleLoginOpen,
        handleLoginClose,
        handleLoginSubmit,
        logout
    };
};
