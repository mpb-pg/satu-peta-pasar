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

  private async getNationalBoundaries(): Promise<AdministrativeBoundary[]> {
    // Return Indonesia as a single national boundary
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
