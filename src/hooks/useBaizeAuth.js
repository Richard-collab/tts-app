import { useState, useEffect } from 'react';
import { login } from '../utils/baizeApi';
import { logAction, ActionTypes } from '../utils/logger';

/**
 * Custom hook for Baize authentication logic.
 *
 * @param {function} setMessage - Callback to set UI messages (e.g., alerts).
 * @returns {object} - Auth state and handlers.
 */
export const useBaizeAuth = (setMessage) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [anchorElUser, setAnchorElUser] = useState(null);

    // Init user from local storage
    useEffect(() => {
        const savedUser = localStorage.getItem('audioEditor_user');
        const savedToken = localStorage.getItem('audioEditor_token');
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
    }, []);

    // Login Handlers
    const handleLoginOpen = () => setLoginOpen(true);
    const handleLoginClose = () => setLoginOpen(false);

    const handleLoginSubmit = async () => {
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
    };

    const handleLogout = () => {
        const username = user ? user.account : 'Unknown';
        setUser(null);
        setToken(null);
        localStorage.removeItem('audioEditor_user');
        localStorage.removeItem('audioEditor_token');
        logAction(ActionTypes.AUTH_LOGOUT, { username }, 'success');
        setMessage({ text: '已退出登录', type: 'success' });
        setAnchorElUser(null);
    };

    // User Menu Handlers
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return {
        user,
        token,
        loginOpen,
        loginUsername,
        loginPassword,
        anchorElUser,
        setLoginUsername,
        setLoginPassword,
        handleLoginOpen,
        handleLoginClose,
        handleLoginSubmit,
        handleLogout,
        handleOpenUserMenu,
        handleCloseUserMenu
    };
};
