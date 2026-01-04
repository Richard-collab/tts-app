import { useState, useCallback } from 'react';
import { login } from '../utils/baizeApi';
import { logAction, ActionTypes } from '../utils/logger';

/**
 * Custom hook to manage Baize authentication logic.
 * Encapsulates state for user, token, login dialog, and login form inputs.
 * Handles login submission and logout actions with side effects (localStorage, logging).
 *
 * @param {Function} setMessage - Callback function to display global messages/alerts in the UI.
 * @returns {Object} An object containing auth state variables and event handlers.
 */
export const useBaizeAuth = (setMessage) => {
    // Lazy initialization to access localStorage only once on mount
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('audioEditor_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('audioEditor_token');
    });

    const [loginOpen, setLoginOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginOpen = useCallback(() => {
        setLoginOpen(true);
    }, []);

    const handleLoginClose = useCallback(() => {
        setLoginOpen(false);
    }, []);

    const handleLoginSubmit = useCallback(async () => {
        if (!username || !password) {
            setMessage({ text: '请输入用户名和密码', type: 'error' });
            return;
        }
        try {
            const result = await login(username, password);
            // API might return account in result, or we use the input username
            const newUser = { account: result.account || username };
            const newToken = result.token;

            setUser(newUser);
            setToken(newToken);

            localStorage.setItem('audioEditor_user', JSON.stringify(newUser));
            localStorage.setItem('audioEditor_token', newToken);

            logAction(ActionTypes.AUTH_LOGIN, { username: newUser.account }, 'success');
            setMessage({ text: `登录成功: ${newUser.account}`, type: 'success' });
            handleLoginClose();
        } catch (error) {
            logAction(ActionTypes.AUTH_LOGIN, { username: username, error: error.message }, 'error');
            setMessage({ text: `登录失败: ${error.message}`, type: 'error' });
        }
    }, [username, password, setMessage, handleLoginClose]);

    const handleLogout = useCallback(() => {
        const account = user ? user.account : 'Unknown';
        setUser(null);
        setToken(null);
        localStorage.removeItem('audioEditor_user');
        localStorage.removeItem('audioEditor_token');

        logAction(ActionTypes.AUTH_LOGOUT, { username: account }, 'success');
        setMessage({ text: '已退出登录', type: 'success' });
    }, [user, setMessage]);

    return {
        user,
        token,
        loginOpen,
        username,
        password,
        setUsername,
        setPassword,
        handleLoginOpen,
        handleLoginClose,
        handleLoginSubmit,
        handleLogout
    };
};
