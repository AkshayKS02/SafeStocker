let initialized = false;

export async function initApp({ authenticated = false } = {}) {
    if (initialized) return;
    initialized = true;

    await Promise.all([
        import("../nav/nav.events.js"),
        import("../auth/auth.events.js"),
        import("../events/track.events.js"),
        import("../events/entry.events.js"),
        import("../events/billing.events.js"),
        import("../events/stock.events.js"),
        import("../barcode/barcode.events.js"),
        import("../alerts/alerts.events.js")
    ]);

    if (authenticated) {
        const { initDashboard } = await import("../events/dashboard.events.js");
        initDashboard();
    }
}
