// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { TaeglicheEintraege, Tagesprotokoll, Gewohnheiten } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://ci04.ci.xist4c.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://ci04.ci.xist4c.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- TAEGLICHE_EINTRAEGE ---
  static async getTaeglicheEintraege(): Promise<TaeglicheEintraege[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.TAEGLICHE_EINTRAEGE}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getTaeglicheEintraegeEntry(id: string): Promise<TaeglicheEintraege | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.TAEGLICHE_EINTRAEGE}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createTaeglicheEintraegeEntry(fields: TaeglicheEintraege['fields']) {
    return callApi('POST', `/apps/${APP_IDS.TAEGLICHE_EINTRAEGE}/records`, { fields });
  }
  static async updateTaeglicheEintraegeEntry(id: string, fields: Partial<TaeglicheEintraege['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.TAEGLICHE_EINTRAEGE}/records/${id}`, { fields });
  }
  static async deleteTaeglicheEintraegeEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.TAEGLICHE_EINTRAEGE}/records/${id}`);
  }

  // --- TAGESPROTOKOLL ---
  static async getTagesprotokoll(): Promise<Tagesprotokoll[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.TAGESPROTOKOLL}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getTagesprotokollEntry(id: string): Promise<Tagesprotokoll | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.TAGESPROTOKOLL}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createTagesprotokollEntry(fields: Tagesprotokoll['fields']) {
    return callApi('POST', `/apps/${APP_IDS.TAGESPROTOKOLL}/records`, { fields });
  }
  static async updateTagesprotokollEntry(id: string, fields: Partial<Tagesprotokoll['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.TAGESPROTOKOLL}/records/${id}`, { fields });
  }
  static async deleteTagesprotokollEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.TAGESPROTOKOLL}/records/${id}`);
  }

  // --- GEWOHNHEITEN ---
  static async getGewohnheiten(): Promise<Gewohnheiten[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.GEWOHNHEITEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getGewohnheitenEntry(id: string): Promise<Gewohnheiten | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.GEWOHNHEITEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createGewohnheitenEntry(fields: Gewohnheiten['fields']) {
    return callApi('POST', `/apps/${APP_IDS.GEWOHNHEITEN}/records`, { fields });
  }
  static async updateGewohnheitenEntry(id: string, fields: Partial<Gewohnheiten['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.GEWOHNHEITEN}/records/${id}`, { fields });
  }
  static async deleteGewohnheitenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.GEWOHNHEITEN}/records/${id}`);
  }

}