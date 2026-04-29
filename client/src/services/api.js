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

    if (res.status === 401) {
        console.warn("Unauthorized → logging out");
        localStorage.removeItem("auth_token");
        window.location.reload();
        return null;
    }

    return res;
}