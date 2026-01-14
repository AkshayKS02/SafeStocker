const LAST_ALERT_CHECK = "lastAlertCheck";
const ALERT_INTERVAL =   60 * 1000; // 5 hours

export function shouldCheckAlerts() {
  const last = localStorage.getItem(LAST_ALERT_CHECK);
  if (!last) return true;
  return Date.now() - Number(last) > ALERT_INTERVAL;
}

export function generateAlerts(stockItems) {
  return stockItems.filter(item =>
    item.color === "orange" && item.inStock > 0
  );
}


export function markAlertCheckDone() {
  localStorage.setItem(LAST_ALERT_CHECK, Date.now());
}
