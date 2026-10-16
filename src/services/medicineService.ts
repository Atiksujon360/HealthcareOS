import { MedicineCatalogItem } from '../types';
import { BANGLADESH_MEDICINE_CATALOG, SIMULATED_ONLINE_MEDICINES } from '../data/mockMedicines';

/**
 * Proposed Spring Boot REST API Endpoint Contracts:
 * 
 * 1. GET /api/v1/medicines/search
 *    Query params: 
 *      - q: string (e.g. "paracetamol" or "napa 500")
 *      - provider: "local" | "online"
 *      - locale: "en-BD" | "bn-BD"
 *    Response: {
 *      status: "SUCCESS",
 *      timestamp: "2026-10-16T10:00:00Z",
 *      query: string,
 *      provider: string,
 *      totalResults: number,
 *      results: MedicineSearchResult[]
 *    }
 * 
 * 2. GET /api/v1/medicines/{medicineId}
 *    Response: {
 *      status: "SUCCESS",
 *      data: MedicineCatalogItem
 *    }
 * 
 * 3. POST /api/v1/prescriptions
 *    Body: { encounterId: string, doctorId: string, items: PrescriptionItem[], signed: boolean }
 */

export interface MedicineSearchResult {
  item: MedicineCatalogItem;
  matchScore: number;
  matchedFields: ('brandName' | 'genericName' | 'strength' | 'dosageForm' | 'manufacturer')[];
}

export interface SearchMedicinesParams {
  query: string;
  provider: 'local' | 'online';
  locale?: string;
  signal?: AbortSignal;
}

/**
 * Cleans and tokenizes search query
 */
function sanitizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s/.-]/gi, '')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Searches local or external medicine catalogs
 * Includes simulated backend latency, multi-token ranking, and cancelation support
 */
export async function searchMedicines({
  query,
  provider,
  locale = 'en-BD',
  signal,
}: SearchMedicinesParams): Promise<MedicineSearchResult[]> {
  // Simulate network latency (250ms for local, 600ms for simulated online)
  const latency = provider === 'online' ? 650 : 220;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, latency);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Search request aborted', 'AbortError'));
      });
    }
  });

  const tokens = sanitizeQuery(query);
  if (tokens.length === 0) {
    return [];
  }

  // Choose catalog source
  const dataset: MedicineCatalogItem[] = 
    provider === 'online' 
      ? [...SIMULATED_ONLINE_MEDICINES, ...BANGLADESH_MEDICINE_CATALOG] 
      : BANGLADESH_MEDICINE_CATALOG;

  const results: MedicineSearchResult[] = [];

  for (const item of dataset) {
    const brandLower = item.brandName.toLowerCase();
    const genericLower = item.genericName.toLowerCase();
    const strengthLower = item.strength.toLowerCase();
    const formLower = item.dosageForm.toLowerCase();
    const mfgLower = item.manufacturer.toLowerCase();

    const matchedFields: ('brandName' | 'genericName' | 'strength' | 'dosageForm' | 'manufacturer')[] = [];
    let matchScore = 0;

    // Check if every token matches at least one field
    const allTokensMatch = tokens.every((token) => {
      let tokenMatched = false;

      if (brandLower.includes(token)) {
        if (!matchedFields.includes('brandName')) matchedFields.push('brandName');
        matchScore += brandLower.startsWith(token) ? 50 : 30;
        tokenMatched = true;
      }
      if (genericLower.includes(token)) {
        if (!matchedFields.includes('genericName')) matchedFields.push('genericName');
        matchScore += genericLower.startsWith(token) ? 40 : 25;
        tokenMatched = true;
      }
      if (strengthLower.includes(token)) {
        if (!matchedFields.includes('strength')) matchedFields.push('strength');
        matchScore += 20;
        tokenMatched = true;
      }
      if (formLower.includes(token)) {
        if (!matchedFields.includes('dosageForm')) matchedFields.push('dosageForm');
        matchScore += 15;
        tokenMatched = true;
      }
      if (mfgLower.includes(token)) {
        if (!matchedFields.includes('manufacturer')) matchedFields.push('manufacturer');
        matchScore += 10;
        tokenMatched = true;
      }

      return tokenMatched;
    });

    if (allTokensMatch && matchedFields.length > 0) {
      // Bonus score for verified local DGDA items
      if (item.verified) matchScore += 10;
      results.push({ item, matchScore, matchedFields });
    }
  }

  // Rank by match score descending
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Fetches specific medicine details by ID
 */
export async function getMedicineDetails(medicineId: string): Promise<MedicineCatalogItem | null> {
  const all = [...BANGLADESH_MEDICINE_CATALOG, ...SIMULATED_ONLINE_MEDICINES];
  const found = all.find((m) => m.id === medicineId);
  return found || null;
}
