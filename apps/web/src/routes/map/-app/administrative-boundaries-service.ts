import type { Feature, FeatureCollection } from 'geojson';
import { orpc } from '../../../lib/orpc/client';

export type AdministrativeLevel = 'national' | 'province' | 'regency';

export interface AdministrativeBoundary {
  id: string;
  name: string;
  level: AdministrativeLevel;
  code: string; // For provinces and regencies to match with GeoJSON files
}

export class AdministrativeBoundariesService {
  /**
   * Get boundaries for a specific administrative level
   * @param level The administrative level to fetch boundaries for
   * @returns Promise resolving to GeoJSON FeatureCollection
   */
  // async getBoundaries(level: AdministrativeLevel): Promise<FeatureCollection> {
  //   switch (level) {
  //     case 'national':
  //       return this.loadNationalBoundaries();
  //     case 'province':
  //       return this.loadProvinceBoundaries();
  //     case 'regency':
  //       return this.loadRegencyBoundaries();
  //     default:
  //       throw new Error(`Unsupported administrative level: ${level}`);
  //   }
  // }

  /**
   * Get a specific boundary by its ID and level
   * @param level The administrative level
   * @param id The ID of the boundary
   * @returns Promise resolving to GeoJSON Feature or null if not found
   */
  // async getBoundaryById(
  //   level: AdministrativeLevel,
  //   id: string
  // ): Promise<Feature | null> {
  //   const boundaries = await this.getBoundaries(level);
  //   const feature = boundaries.features.find((f: any) => f.id === id);
  //   return feature || null;
  // }

  /**
   * Get all boundary IDs for a specific level
   * @param level The administrative level
   * @returns Promise resolving to array of boundary IDs
   */
  // async getAllBoundariesForLevel(
  //   level: AdministrativeLevel
  // ): Promise<string[]> {
  //   const boundaries = await this.getBoundaries(level);
  //   return boundaries.features.map((feature: any) => feature.id);
  // }

  /**
   * Get all administrative boundaries for a level with metadata
   * @param level The administrative level
   * @returns Promise resolving to array of AdministrativeBoundary objects
   */
  getAdministrativeBoundaries(
    level: AdministrativeLevel
  ): Promise<AdministrativeBoundary[]> {
    switch (level) {
      case 'national':
        return this.getNationalBoundaries();
      case 'province':
        return this.getProvinceBoundaries();
      case 'regency':
        return this.getRegencyBoundaries();
      default:
        throw new Error(`Unsupported administrative level: ${level}`);
    }
  }

  // private async loadNationalBoundaries(): Promise<FeatureCollection> {
  //   // For national level, we'll use a simplified Indonesia boundary
  //   try {
  //     const response = await fetch('/data/indonesia-boundary.geojson');
  //     if (!response.ok) {
  //       throw new Error(
  //         `Failed to load national boundaries: ${response.statusText}`
  //       );
  //     }
  //     return await response.json();
  //   } catch (error) {
  //     console.error('Error loading national boundaries:', error);
  //     // Return a fallback empty collection
  //     return {
  //       type: 'FeatureCollection',
  //       features: [],
  //     };
  //   }
  // }

  // private async loadProvinceBoundaries(): Promise<FeatureCollection> {
  //   // This would load all province boundaries from combined GeoJSON
  //   try {
  //     const response = await fetch(
  //       '/src/lib/data/provinces-boundaries.geojson'
  //     );
  //     if (!response.ok) {
  //       throw new Error(
  //         `Failed to load province boundaries: ${response.statusText}`
  //       );
  //     }
  //     return await response.json();
  //   } catch (error) {
  //     console.error('Error loading province boundaries:', error);
  //     // Return a fallback empty collection
  //     return {
  //       type: 'FeatureCollection',
  //       features: [],
  //     };
  //   }
  // }

  // private async loadRegencyBoundaries(): Promise<FeatureCollection> {
  //   // This would load all regency boundaries from combined GeoJSON
  //   try {
  //     const response = await fetch(
  //       '/src/lib/data/regencies-boundaries.geojson'
  //     );
  //     if (!response.ok) {
  //       throw new Error(
  //         `Failed to load regency boundaries: ${response.statusText}`
  //       );
  //     }
  //     return await response.json();
  //   } catch (error) {
  //     console.error('Error loading regency boundaries:', error);
  //     // Return a fallback empty collection
  //     return {
  //       type: 'FeatureCollection',
  //       features: [],
  //     };
  //   }
  // }

  private async getNationalBoundaries(): Promise<AdministrativeBoundary[]> {
    // Return Indonesia as a single national boundary
    console.log('Fetching national boundaries');
    return [
      {
        id: 'd56c1151-c54b-45c7-ab14-1162ca281d7a',
        name: 'Indonesia',
        level: 'national',
        code: 'ID',
      },
    ];
  }

  private async getProvinceBoundaries(): Promise<AdministrativeBoundary[]> {
    try {
      const res = await orpc.admin.region.province.get.call({});
      const provinces = res?.data ?? res;
      return (provinces || []).map((province: any) => ({
        id: province.id,
        name: province.name,
        level: 'province' as const,
        code: province.code || province.id,
      }));
    } catch (err) {
      console.error('Error fetching province boundaries from oRPC:', err);
      return [];
    }
  }

  private async getRegencyBoundaries(): Promise<AdministrativeBoundary[]> {
    try {
      const res = await orpc.admin.region.regency.get.call({});
      const regencies = res?.data ?? res;
      return (regencies || []).map((regency: any) => ({
        id: regency.id,
        name: regency.name,
        level: 'regency' as const,
        code: regency.code || regency.id,
      }));
    } catch (error) {
      console.error('Error fetching regency boundaries from oRPC:', error);
      // Return an empty array if oRPC call fails
      return [];
    }
  }

  /**
   * Get regencies filtered by province id
   */
  async getRegencyBoundariesByProvince(
    provinceId: string
  ): Promise<AdministrativeBoundary[]> {
    try {
      const res = await orpc.admin.region.regency.get.call({ provinceId });
      const regencies = res?.data ?? res;
      return (regencies || []).map((regency: any) => ({
        id: regency.id,
        name: regency.name,
        level: 'regency' as const,
        code: regency.code || regency.id,
      }));
    } catch (error) {
      console.error(
        'Error fetching regency boundaries by province from oRPC:',
        error
      );
      return [];
    }
  }
}
