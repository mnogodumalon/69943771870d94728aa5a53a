// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface TaeglicheEintraege {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    gewohnheit?: string; // applookup -> URL zu 'Gewohnheiten' Record
    datum?: string; // Format: YYYY-MM-DD oder ISO String
    erledigt?: boolean;
    menge?: number;
    notizen?: string;
  };
}

export interface Tagesprotokoll {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    protokoll_datum?: string; // Format: YYYY-MM-DD oder ISO String
    erledigte_gewohnheiten?: string; // applookup -> URL zu 'Gewohnheiten' Record
    tagesnotizen?: string;
  };
}

export interface Gewohnheiten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    gewohnheit_name?: string;
    beschreibung?: string;
    kategorie?: 'gesundheit_fitness' | 'ernaehrung' | 'produktivitaet' | 'persoenliche_entwicklung' | 'soziales' | 'finanzen' | 'sonstiges';
    ziel_haeufigkeit?: 'taeglich' | 'mehrmals_woche' | 'woechentlich' | 'monatlich';
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    zielwert?: string;
    messbar?: boolean;
  };
}

export const APP_IDS = {
  TAEGLICHE_EINTRAEGE: '69943738538c8e3d69467891',
  TAGESPROTOKOLL: '699437395ee05143dff4f81b',
  GEWOHNHEITEN: '6994372ab69af285cd5d3c3a',
} as const;

// Helper Types for creating new records
export type CreateTaeglicheEintraege = TaeglicheEintraege['fields'];
export type CreateTagesprotokoll = Tagesprotokoll['fields'];
export type CreateGewohnheiten = Gewohnheiten['fields'];