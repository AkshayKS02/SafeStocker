export async function fetchFromOpenFoodFacts(barcode) {
    const url = `https://world.openfoodfacts.net/api/v2/product/${barcode}.json`;

    const authHeader = "Basic " + Buffer.from("off:off").toString("base64");

    const res = await fetch(url, {
        method: "GET",
        headers: { "Authorization": authHeader }
    });

    return res.json();
}
