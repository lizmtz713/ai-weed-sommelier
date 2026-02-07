// Dispensary Finder Service
// Find nearby dispensaries, delivery services, and smoke shops

import { GeoPoint } from '../types';

// ============================================
// TYPES
// ============================================

export interface Dispensary {
  id: string;
  name: string;
  type: DispensaryType;
  location: GeoPoint;
  address: string;
  rating?: number;
  ratingCount?: number;
  priceLevel?: number;
  isOpen?: boolean;
  hours?: string[];
  phone?: string;
  website?: string;
  menuUrl?: string;
  photos?: string[];
  distance?: number;
  features: string[];
  license: 'recreational' | 'medical' | 'both';
}

export type DispensaryType = 
  | 'dispensary'
  | 'delivery'
  | 'smoke_shop'
  | 'cbd_store';

export interface DispensarySearchOptions {
  center: GeoPoint;
  radiusMeters?: number;
  types?: DispensaryType[];
  openNow?: boolean;
  medicalOnly?: boolean;
  deliveryOnly?: boolean;
  limit?: number;
}

// ============================================
// GOOGLE PLACES / WEEDMAPS API
// ============================================

const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';

export async function searchDispensaries(options: DispensarySearchOptions): Promise<Dispensary[]> {
  // In production, this would call Google Places API or Weedmaps API
  // For now, return mock data
  return searchDispensariesWithFallback(options);
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_DISPENSARIES: Dispensary[] = [
  {
    id: 'disp-1',
    name: 'Green Leaf Dispensary',
    type: 'dispensary',
    location: { latitude: 29.7604, longitude: -95.3698 },
    address: '420 Main St, Houston, TX',
    rating: 4.7,
    ratingCount: 1250,
    priceLevel: 2,
    isOpen: true,
    phone: '(555) 420-0001',
    website: 'https://greenleaf.example.com',
    distance: 1200,
    features: ['Online Menu', 'ATM', 'Wheelchair Accessible', 'First-Time Discount'],
    license: 'recreational',
  },
  {
    id: 'disp-2',
    name: 'Cloud Nine Cannabis',
    type: 'dispensary',
    location: { latitude: 29.7825, longitude: -95.3530 },
    address: '710 Smoke Ave, Houston, TX',
    rating: 4.5,
    ratingCount: 890,
    priceLevel: 3,
    isOpen: true,
    phone: '(555) 420-0002',
    website: 'https://cloudnine.example.com',
    distance: 2500,
    features: ['Premium Selection', 'Loyalty Program', 'Lab Tested'],
    license: 'both',
  },
  {
    id: 'disp-3',
    name: 'Express Cannabis Delivery',
    type: 'delivery',
    location: { latitude: 29.7500, longitude: -95.3600 },
    address: 'Delivery Only - Houston Area',
    rating: 4.6,
    ratingCount: 2100,
    priceLevel: 2,
    isOpen: true,
    phone: '(555) 420-0003',
    website: 'https://expressdelivery.example.com',
    distance: 0,
    features: ['Same-Day Delivery', 'No Minimum', 'Discreet Packaging'],
    license: 'recreational',
  },
  {
    id: 'disp-4',
    name: 'Healing Herb Medical',
    type: 'dispensary',
    location: { latitude: 29.7450, longitude: -95.3800 },
    address: '123 Wellness Blvd, Houston, TX',
    rating: 4.8,
    ratingCount: 650,
    priceLevel: 2,
    isOpen: false,
    phone: '(555) 420-0004',
    distance: 3200,
    features: ['Medical Only', 'Consultation Available', 'Veterans Discount'],
    license: 'medical',
  },
  {
    id: 'disp-5',
    name: 'Smoke City Head Shop',
    type: 'smoke_shop',
    location: { latitude: 29.7550, longitude: -95.3650 },
    address: '789 Glass Ln, Houston, TX',
    rating: 4.3,
    ratingCount: 420,
    priceLevel: 2,
    isOpen: true,
    phone: '(555) 420-0005',
    distance: 800,
    features: ['Glass Pipes', 'Vaporizers', 'Accessories', 'CBD Products'],
    license: 'recreational',
  },
];

export async function searchDispensariesWithFallback(options: DispensarySearchOptions): Promise<Dispensary[]> {
  // Filter mock data based on options
  let results = [...MOCK_DISPENSARIES];
  
  if (options.types && options.types.length > 0) {
    results = results.filter(d => options.types!.includes(d.type));
  }
  
  if (options.openNow) {
    results = results.filter(d => d.isOpen);
  }
  
  if (options.medicalOnly) {
    results = results.filter(d => d.license === 'medical' || d.license === 'both');
  }
  
  if (options.deliveryOnly) {
    results = results.filter(d => d.type === 'delivery');
  }
  
  // Sort by distance
  results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  
  return results.slice(0, options.limit || 20);
}

// ============================================
// HELPERS
// ============================================

export function formatDistance(meters: number): string {
  if (meters === 0) return 'Delivery';
  if (meters < 1000) return `${Math.round(meters)}m`;
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

export function formatPriceLevel(level?: number): string {
  if (!level) return '';
  return '$'.repeat(level);
}

export function getTypeLabel(type: DispensaryType): string {
  const labels: Record<DispensaryType, string> = {
    dispensary: 'Dispensary',
    delivery: 'Delivery',
    smoke_shop: 'Smoke Shop',
    cbd_store: 'CBD Store',
  };
  return labels[type];
}

export function getTypeColor(type: DispensaryType): string {
  const colors: Record<DispensaryType, string> = {
    dispensary: '#10B981',
    delivery: '#8B5CF6',
    smoke_shop: '#F59E0B',
    cbd_store: '#06B6D4',
  };
  return colors[type];
}
