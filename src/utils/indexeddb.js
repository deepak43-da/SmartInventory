import localForage from "localforage";

// Get all offline images for a given vendorId (or displayId)
export async function getOfflineImages(vendorId) {
  const images = (await localForage.getItem("offlineImages")) || [];
  return images.filter((img) => img.vendorId === vendorId);
}

// Remove a specific offline image by id
export async function removeOfflineImage(id) {
  const images = (await localForage.getItem("offlineImages")) || [];
  const filtered = images.filter((img) => img.id !== id);
  await localForage.setItem("offlineImages", filtered);
}
// Utility for offline image storage using localForage
export async function saveImageOffline(vendorId, imageData) {
  const images = (await localForage.getItem("offlineImages")) || [];
  images.push({ id: Date.now(), vendorId, imageData, timestamp: Date.now() });
  await localForage.setItem("offlineImages", images);
}

export async function uploadOfflineImages() {
  const images = (await localForage.getItem("offlineImages")) || [];
  for (const img of images) {
    try {
      // Replace with actual API endpoint
      await fetch(
        // `https://api.example.com/admin/vendor/${img.vendorId}/adddisplay`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: img.imageData }),
        }
      );
      await removeOfflineImage(img.id);
    } catch (err) {
      // Keep image for next attempt
    }
  }
}
