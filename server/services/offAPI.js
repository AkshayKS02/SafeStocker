export async function fetchFromOpenFoodFacts(barcode) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    const res = await fetch(url);

    const text = await res.text();

    try {
        return JSON.parse(text);
    } catch (err) {
        console.error("❌ OFF API returned non-JSON:");
        console.error(text);
        throw new Error("Invalid OFF API response");
    }
}