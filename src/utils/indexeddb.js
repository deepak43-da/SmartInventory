// import localForage from "localforage";

// // Get all offline images for a given vendorId (or displayId)
// export async function getOfflineImages(vendorId) {
//   const images = (await localForage.getItem("offlineImages")) || [];
//   return images.filter((img) => img.vendorId === vendorId);
// }

// // Remove a specific offline image by id
// export async function removeOfflineImage(id) {
//   const images = (await localForage.getItem("offlineImages")) || [];
//   const filtered = images.filter((img) => img.id !== id);
//   await localForage.setItem("offlineImages", filtered);
// }


