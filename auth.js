/**
 * auth.js — Client-side authentication gate using Google Identity Services.
 * Include this script on any page that requires login.
 * 
 * Security notes:
 * - Uses sessionStorage (cleared when tab closes) instead of localStorage
 * - Validates token expiry before granting access
 * - Fails closed: if anything is wrong, redirect to login
 */

const Auth = (() => {
    const SESSION_KEY = 'ghn_auth_user';
    const LOGIN_PAGE = 'login.html';

    /**
     * Check if user is authenticated. If not, redirect to login page.
     * Call this at the top of every protected page.
     */
    function requireAuth() {
        const user = getUser();
        if (!user) {
            window.location.href = LOGIN_PAGE;
            return false;
        }
        // Check token expiry
        if (user.exp && Date.now() > user.exp) {
            logout();
            return false;
        }
        return true;
    }

    /**
     * Save user data after successful Google Sign-In.
     */
    function saveUser(userData) {
        const safeData = {
            name: String(userData.name || '').substring(0, 200),
            email: String(userData.email || '').substring(0, 200),
            picture: String(userData.picture || ''),
            exp: userData.exp || (Date.now() + 3600000) // 1 hour default
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeData));
    }

    /**
     * Get current user data, or null if not logged in.
     */
    function getUser() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const user = JSON.parse(raw);
            if (!user || !user.email) return null;
            return user;
        } catch (e) {
            return null;
        }
    }

    /**
     * Log out: clear session and redirect to login page.
     */
    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = LOGIN_PAGE;
    }

    /**
     * Render user info in a target element (avatar + name + logout button).
     */
    function renderUserInfo(containerId) {
        const user = getUser();
        if (!user) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        container.innerHTML = '';
        container.style.cssText = 'display:flex;align-items:center;gap:10px;';

        // Avatar
        if (user.picture) {
            const img = document.createElement('img');
            img.src = user.picture;
            img.alt = 'Avatar';
            img.referrerPolicy = 'no-referrer';
            img.style.cssText = 'width:32px;height:32px;border-radius:50%;border:2px solid var(--primary, #F26522);';
            container.appendChild(img);
        }

        // Name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = user.name || user.email;
        nameSpan.style.cssText = 'font-size:0.85rem;font-weight:600;color:#475569;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        container.appendChild(nameSpan);

        // Logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Đăng xuất';
        logoutBtn.style.cssText = 'background:none;border:1px solid #e2e8f0;color:#64748b;padding:4px 12px;border-radius:8px;font-size:0.75rem;cursor:pointer;font-family:Inter,sans-serif;transition:all 0.2s;';
        logoutBtn.addEventListener('mouseenter', () => {
            logoutBtn.style.borderColor = '#F26522';
            logoutBtn.style.color = '#F26522';
        });
        logoutBtn.addEventListener('mouseleave', () => {
            logoutBtn.style.borderColor = '#e2e8f0';
            logoutBtn.style.color = '#64748b';
        });
        logoutBtn.addEventListener('click', logout);
        container.appendChild(logoutBtn);
    }

    return { requireAuth, saveUser, getUser, logout, renderUserInfo };
})();
