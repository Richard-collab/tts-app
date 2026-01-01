import { useState, useCallback } from 'react';
import { login } from '../utils/baizeApi';
import { logAction, ActionTypes } from '../utils/logger';

export const useBaizeAuth = (setMessage) => {
    // Lazy init from localStorage
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('audioEditor_user');
        return saved ? JSON.parse(saved) : null;
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

    const handleLogout = useCallback(() => {
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
        handleLogout
    };
};
