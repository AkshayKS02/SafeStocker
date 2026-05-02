export function getToken() {
    return localStorage.getItem("auth_token");
}

export async function apiFetch(url, options = {}) {
    const token = getToken();

    const headers = {
        ...(options.headers || {}),
        ...(token && { Authorization: `Bearer ${token}` })
    };

    const res = await fetch(url, {
        ...options,
        headers
    });

    if (res.status === 401 && token) {
        console.warn("Unauthorized - clearing stored auth token");
        localStorage.removeItem("auth_token");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        return null;
    }

    return res;
}
