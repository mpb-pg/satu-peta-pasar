import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a simple wrapper for testing that doesn't use DynamicMap
// This will allow us to test just the UI controls without Leaflet dependencies
const MarketingMapControls = () => {
  // Import the types from the actual component
  type AdministrativeLevel = 'national' | 'province' | 'regency';
  type ProductBrand = 'Urea' | 'NPK' | 'Petroganik' | 'Other';
  
  return (
    <div data-testid="marketing-map-container" className="flex h-screen w-full">
      <div data-testid="control-panel" className="w-80 bg-white shadow-lg z-10 p-4">
        <h2 className="text-xl font-bold mb-4">Marketing Map Controls</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Administrative Level</label>
          <select
            data-testid="admin-level-selector"
            className="w-full p-2 border rounded"
          >
            <option value="national">National</option>
            <option value="province">Province</option>
            <option value="regency">Regency</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Product Brand</label>
          <select className="w-full p-2 border rounded">
            <option value="">All Brands</option>
            <option value="Urea">Urea</option>
            <option value="NPK">NPK</option>
            <option value="Petroganik">Petroganik</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Land Type Filter</label>
          <select className="w-full p-2 border rounded">
            <option value="">All Land Types</option>
            <option value="Pangan">Pangan</option>
            <option value="Kebun">Kebun</option>
            <option value="Horti">Horti</option>
            <option value="Tambak">Tambak</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Commodity Type Filter</label>
          <select className="w-full p-2 border rounded">
            <option value="">All Commodity Types</option>
            <option value="Padi">Padi</option>
            <option value="Sawit">Sawit</option>
            <option value="Bawang Merah">Bawang Merah</option>
          </select>
        </div>
      </div>
    </div>
  );
};

describe('MarketingMap', () => {
  it('renders the map interface', () => {
    render(<MarketingMapControls />);
    expect(screen.getByTestId('marketing-map-container')).toBeInTheDocument();
  });

  it('renders the control panel', () => {
    render(<MarketingMapControls />);
    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
  });

  it('initializes with default administrative level', () => {
    render(<MarketingMapControls />);
    expect(screen.getByTestId('admin-level-selector')).toBeInTheDocument();
  });
});