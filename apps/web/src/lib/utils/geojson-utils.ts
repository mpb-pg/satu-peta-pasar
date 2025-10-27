/**
 * Utility functions for loading GeoJSON data based on administrative codes
 */

/**
 * Load province GeoJSON file by its code
 * @param code The province code from the database (e.g., '11' for Aceh)
 * @returns Promise resolving to the GeoJSON Feature
 */
export async function loadProvinceGeoJSON(code: string): Promise<any> {
  try {
    // Construct the path based on the code to match files in src/lib/data/provinces/
    // e.g., /src/lib/data/provinces/11.geojson for Aceh
    const response = await fetch(`/src/lib/data/provinces/${code}.geojson`);
    if (!response.ok) {
      throw new Error(`Failed to load province GeoJSON for code ${code}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading province GeoJSON for code ${code}:`, error);
    throw error;
  }
}

/**
 * Load regency GeoJSON file by its code
 * @param code The regency code from the database (e.g., '3204' for Kabupaten Bandung)
 * @returns Promise resolving to the GeoJSON Feature
 */
export async function loadRegencyGeoJSON(code: string): Promise<any> {
  try {
    // Construct the path based on the code to match files in src/lib/data/regencies/
    // e.g., /src/lib/data/regencies/3204.geojson for Kabupaten Bandung
    const response = await fetch(`/src/lib/data/regencies/${code}.geojson`);
    if (!response.ok) {
      throw new Error(`Failed to load regency GeoJSON for code ${code}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading regency GeoJSON for code ${code}:`, error);
    throw error;
  }
}

/**
 * Get the list of available province codes from the data directory
 * @returns Promise resolving to array of province codes
 */
export async function getAvailableProvinceCodes(): Promise<string[]> {
  // In a real implementation, this would fetch from the database
  // For now, return an empty array as this requires server-side directory reading
  return [];
}

/**
 * Get the list of available regency codes from the data directory
 * @returns Promise resolving to array of regency codes
 */
export async function getAvailableRegencyCodes(): Promise<string[]> {
  // In a real implementation, this would fetch from the database
  // For now, return an empty array as this requires server-side directory reading
  return [];
}