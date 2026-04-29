import { apiFetch } from "./api.js";

export async function createItem(payload) {
    const res = await apiFetch("/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res) throw new Error("Unauthorized");

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Failed to save item");
    }

    return data;
}
