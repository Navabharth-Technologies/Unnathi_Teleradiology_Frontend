/**
 * Utility to encode and decode study metadata for shareable standalone URLs.
 * This enables viewing both the Report PDF and Scanned Images DICOM viewer on remote devices
 * (such as mobile phones opening WhatsApp links on GitHub Pages) without needing a local database or local storage.
 */

export function encodeStudyPayload(payload) {
  try {
    const jsonStr = JSON.stringify(payload);
    // Use base64 encoding safe for URLs
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return encodeURIComponent(base64);
  } catch (e) {
    console.error("Failed to encode study payload:", e);
    return "";
  }
}

export function decodeStudyPayload(encodedParam) {
  if (!encodedParam) return null;
  try {
    const base64 = decodeURIComponent(encodedParam);
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to decode study payload:", e);
    return null;
  }
}
