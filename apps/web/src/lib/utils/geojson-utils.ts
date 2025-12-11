/**
 * Utility functions for loading GeoJSON data based on administrative codes
 */

/**
 * Load province GeoJSON file by its code
 * @param code The province code from the database (e.g., '11' for Aceh)
 * @returns Promise resolving to the GeoJSON Feature
 */
export async function loadProvinceGeoJSON(
  code: string
): Promise<GeoJSON.GeoJSON> {
  const response = await fetch('/data/indonesia-boundary.geojson');
  // get specific coordinates for the province code
  const data = await response.json();
  const feature = data.features.find(
    (f: any) => f.properties.code.toString() === code
  );
  if (!feature) {
    throw new Error(`Province with code ${code} not found in GeoJSON data`);
  }
  return feature;
}

/**
 * Load regency GeoJSON file by its code
 * @param code The regency code from the database (e.g., '3204' for Kabupaten Bandung)
 * @returns Promise resolving to the GeoJSON Feature
 */
export async function loadRegencyGeoJSON(
  code: string
): Promise<GeoJSON.GeoJSON> {
  const response = await fetch(`/data/regencies/${code}.geojson`);
  if (!response.ok) {
    throw new Error(
      `Failed to load regency GeoJSON for code ${code}: ${response.statusText}`
    );
  }
  return await response.json();
}

/**
 * Get the list of available province codes from the data directory
 * @returns Promise resolving to array of province codes
 */
export function getAvailableProvinceCodes(): Promise<string[]> {
  // In a real implementation, this would fetch from the database
  // For now, return an empty array as this requires server-side directory reading
  return Promise.resolve([]);
}

/**
 * Get the list of available regency codes from the data directory
 * @returns Promise resolving to array of regency codes
 */
export function getAvailableRegencyCodes(): Promise<string[]> {
  // In a real implementation, this would fetch from the database
  // For now, return an empty array as this requires server-side directory reading
  return Promise.resolve([]);
}
