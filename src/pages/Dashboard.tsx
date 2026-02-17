import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, startOfWeek, addDays, isToday, subDays, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Plus,
  Pencil,
  Trash2,
  Flame,
  Calendar,
  Target,
  CheckCircle2,
  FileText,
  ChevronRight,
  X,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

import type {
  Gewohnheiten,
  TaeglicheEintraege,
  Tagesprotokoll,
} from '@/types/app';
import { APP_IDS } from '@/types/app';
import {
  LivingAppsService,
  extractRecordId,
  createRecordUrl,
} from '@/services/livingAppsService';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Toaster } from '@/components/ui/sonner';

// Category labels mapping
const KATEGORIE_LABELS: Record<string, string> = {
  gesundheit_fitness: 'Gesundheit & Fitness',
  ernaehrung: 'Ernährung',
  produktivitaet: 'Produktivität',
  persoenliche_entwicklung: 'Persönliche Entwicklung',
  soziales: 'Soziales',
  finanzen: 'Finanzen',
  sonstiges: 'Sonstiges',
};

const HAEUFIGKEIT_LABELS: Record<string, string> = {
  taeglich: 'Täglich',
  mehrmals_woche: 'Mehrmals pro Woche',
  woechentlich: 'Wöchentlich',
  monatlich: 'Monatlich',
};

// Today's date in YYYY-MM-DD format
const getTodayString = () => format(new Date(), 'yyyy-MM-dd');

// ============================================================================
// Progress Ring Component
// ============================================================================
function ProgressRing({
  progress,
  size = 160,
  strokeWidth = 12,
  className = '',
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(152 45% 35%)" />
            <stop offset="100%" stopColor="hsl(158 50% 50%)" />
          </linearGradient>
        </defs>
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-foreground md:text-7xl">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Gewohnheit Dialog (Create/Edit)
// ============================================================================
function GewohnheitDialog({
  open,
  onOpenChange,
  gewohnheit,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gewohnheit?: Gewohnheiten | null;
  onSuccess: () => void;
}) {
  const isEditing = !!gewohnheit;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gewohnheit_name: '',
    beschreibung: '',
    kategorie: 'sonstiges' as Gewohnheiten['fields']['kategorie'],
    ziel_haeufigkeit: 'taeglich' as Gewohnheiten['fields']['ziel_haeufigkeit'],
    startdatum: getTodayString(),
    zielwert: '',
    messbar: false,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        gewohnheit_name: gewohnheit?.fields.gewohnheit_name ?? '',
        beschreibung: gewohnheit?.fields.beschreibung ?? '',
        kategorie: gewohnheit?.fields.kategorie ?? 'sonstiges',
        ziel_haeufigkeit: gewohnheit?.fields.ziel_haeufigkeit ?? 'taeglich',
        startdatum: gewohnheit?.fields.startdatum ?? getTodayString(),
        zielwert: gewohnheit?.fields.zielwert ?? '',
        messbar: gewohnheit?.fields.messbar ?? false,
      });
    }
  }, [open, gewohnheit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.gewohnheit_name.trim()) {
      toast.error('Name der Gewohnheit ist erforderlich');
      return;
    }
    setSubmitting(true);

    try {
      const apiData = {
        gewohnheit_name: formData.gewohnheit_name,
        beschreibung: formData.beschreibung || undefined,
        kategorie: formData.kategorie,
        ziel_haeufigkeit: formData.ziel_haeufigkeit,
        startdatum: formData.startdatum,
        zielwert: formData.zielwert || undefined,
        messbar: formData.messbar,
      };

      if (isEditing) {
        await LivingAppsService.updateGewohnheitenEntry(gewohnheit!.record_id, apiData);
        toast.success('Gewohnheit aktualisiert');
      } else {
        await LivingAppsService.createGewohnheitenEntry(apiData);
        toast.success('Gewohnheit erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name der Gewohnheit *</Label>
            <Input
              id="name"
              value={formData.gewohnheit_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, gewohnheit_name: e.target.value }))
              }
              placeholder="z.B. 2L Wasser trinken"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={formData.beschreibung}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, beschreibung: e.target.value }))
              }
              placeholder="Optional: Weitere Details..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select
                value={formData.kategorie}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    kategorie: v as Gewohnheiten['fields']['kategorie'],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KATEGORIE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Häufigkeit</Label>
              <Select
                value={formData.ziel_haeufigkeit}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    ziel_haeufigkeit: v as Gewohnheiten['fields']['ziel_haeufigkeit'],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HAEUFIGKEIT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startdatum">Startdatum</Label>
            <Input
              id="startdatum"
              type="date"
              value={formData.startdatum}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startdatum: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zielwert">Zielwert (optional)</Label>
            <Input
              id="zielwert"
              value={formData.zielwert}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zielwert: e.target.value }))
              }
              placeholder="z.B. 2L, 30 Minuten, 10.000 Schritte"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="messbar"
              checked={formData.messbar}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, messbar: !!checked }))
              }
            />
            <Label htmlFor="messbar" className="font-normal">
              Messbare Gewohnheit (mit Zahlen/Mengen)
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Eintrag Dialog (Create/Edit daily entry)
// ============================================================================
function EintragDialog({
  open,
  onOpenChange,
  eintrag,
  gewohnheiten,
  preselectedGewohnheitId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eintrag?: TaeglicheEintraege | null;
  gewohnheiten: Gewohnheiten[];
  preselectedGewohnheitId?: string;
  onSuccess: () => void;
}) {
  const isEditing = !!eintrag;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gewohnheit_id: '',
    datum: getTodayString(),
    erledigt: true,
    menge: '',
    notizen: '',
  });

  const selectedGewohnheit = useMemo(() => {
    return gewohnheiten.find((g) => g.record_id === formData.gewohnheit_id);
  }, [gewohnheiten, formData.gewohnheit_id]);

  useEffect(() => {
    if (open) {
      if (eintrag) {
        const gewohnheitId = extractRecordId(eintrag.fields.gewohnheit);
        setFormData({
          gewohnheit_id: gewohnheitId ?? '',
          datum: eintrag.fields.datum?.split('T')[0] ?? getTodayString(),
          erledigt: eintrag.fields.erledigt ?? true,
          menge: eintrag.fields.menge?.toString() ?? '',
          notizen: eintrag.fields.notizen ?? '',
        });
      } else {
        setFormData({
          gewohnheit_id: preselectedGewohnheitId ?? '',
          datum: getTodayString(),
          erledigt: true,
          menge: '',
          notizen: '',
        });
      }
    }
  }, [open, eintrag, preselectedGewohnheitId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.gewohnheit_id) {
      toast.error('Bitte wähle eine Gewohnheit aus');
      return;
    }
    setSubmitting(true);

    try {
      const apiData = {
        gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, formData.gewohnheit_id),
        datum: formData.datum,
        erledigt: formData.erledigt,
        menge: formData.menge ? parseFloat(formData.menge) : undefined,
        notizen: formData.notizen || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateTaeglicheEintraegeEntry(eintrag!.record_id, apiData);
        toast.success('Eintrag aktualisiert');
      } else {
        await LivingAppsService.createTaeglicheEintraegeEntry(apiData);
        toast.success('Eintrag erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Gewohnheit *</Label>
            <Select
              value={formData.gewohnheit_id || 'placeholder'}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, gewohnheit_id: v === 'placeholder' ? '' : v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gewohnheit auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {gewohnheiten.map((g) => (
                  <SelectItem key={g.record_id} value={g.record_id}>
                    {g.fields.gewohnheit_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datum">Datum</Label>
            <Input
              id="datum"
              type="date"
              value={formData.datum}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, datum: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="erledigt"
              checked={formData.erledigt}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, erledigt: !!checked }))
              }
            />
            <Label htmlFor="erledigt" className="font-normal">
              Erledigt
            </Label>
          </div>

          {selectedGewohnheit?.fields.messbar && (
            <div className="space-y-2">
              <Label htmlFor="menge">
                Menge/Wert{' '}
                {selectedGewohnheit.fields.zielwert && (
                  <span className="text-muted-foreground font-normal">
                    (Ziel: {selectedGewohnheit.fields.zielwert})
                  </span>
                )}
              </Label>
              <Input
                id="menge"
                type="number"
                step="0.1"
                value={formData.menge}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, menge: e.target.value }))
                }
                placeholder="z.B. 2.5"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notizen">Notizen</Label>
            <Textarea
              id="notizen"
              value={formData.notizen}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notizen: e.target.value }))
              }
              placeholder="Optionale Anmerkungen..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Tagesprotokoll Dialog (Create/Edit)
// ============================================================================
function TagesprotokollDialog({
  open,
  onOpenChange,
  protokoll,
  gewohnheiten,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protokoll?: Tagesprotokoll | null;
  gewohnheiten: Gewohnheiten[];
  onSuccess: () => void;
}) {
  const isEditing = !!protokoll;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    protokoll_datum: getTodayString(),
    erledigte_gewohnheiten_id: '',
    tagesnotizen: '',
  });

  useEffect(() => {
    if (open) {
      if (protokoll) {
        const gewohnheitId = extractRecordId(protokoll.fields.erledigte_gewohnheiten);
        setFormData({
          protokoll_datum: protokoll.fields.protokoll_datum?.split('T')[0] ?? getTodayString(),
          erledigte_gewohnheiten_id: gewohnheitId ?? '',
          tagesnotizen: protokoll.fields.tagesnotizen ?? '',
        });
      } else {
        setFormData({
          protokoll_datum: getTodayString(),
          erledigte_gewohnheiten_id: '',
          tagesnotizen: '',
        });
      }
    }
  }, [open, protokoll]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData = {
        protokoll_datum: formData.protokoll_datum,
        erledigte_gewohnheiten: formData.erledigte_gewohnheiten_id
          ? createRecordUrl(APP_IDS.GEWOHNHEITEN, formData.erledigte_gewohnheiten_id)
          : undefined,
        tagesnotizen: formData.tagesnotizen || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateTagesprotokollEntry(protokoll!.record_id, apiData);
        toast.success('Tagesnotiz aktualisiert');
      } else {
        await LivingAppsService.createTagesprotokollEntry(apiData);
        toast.success('Tagesnotiz erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Tagesnotiz bearbeiten' : 'Tagesnotiz hinzufügen'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="protokoll_datum">Datum</Label>
            <Input
              id="protokoll_datum"
              type="date"
              value={formData.protokoll_datum}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, protokoll_datum: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Hervorgehobene Gewohnheit (optional)</Label>
            <Select
              value={formData.erledigte_gewohnheiten_id || 'none'}
              onValueChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  erledigte_gewohnheiten_id: v === 'none' ? '' : v,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Keine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine</SelectItem>
                {gewohnheiten.map((g) => (
                  <SelectItem key={g.record_id} value={g.record_id}>
                    {g.fields.gewohnheit_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagesnotizen">Notizen zum Tag</Label>
            <Textarea
              id="tagesnotizen"
              value={formData.tagesnotizen}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tagesnotizen: e.target.value }))
              }
              placeholder="Wie war dein Tag? Was hat gut funktioniert?"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Delete Confirmation Dialog
// ============================================================================
function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      toast.error('Fehler beim Löschen');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting ? 'Löscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// Gewohnheit Detail Sheet
// ============================================================================
function GewohnheitDetailSheet({
  open,
  onClose,
  gewohnheit,
  eintraege,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  gewohnheit: Gewohnheiten | null;
  eintraege: TaeglicheEintraege[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!gewohnheit) return null;

  const relatedEintraege = eintraege.filter((e) => {
    const gId = extractRecordId(e.fields.gewohnheit);
    return gId === gewohnheit.record_id;
  }).slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{gewohnheit.fields.gewohnheit_name}</DialogTitle>
              {gewohnheit.fields.kategorie && (
                <Badge variant="secondary" className="mt-2">
                  {KATEGORIE_LABELS[gewohnheit.fields.kategorie]}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {gewohnheit.fields.beschreibung && (
            <p className="text-muted-foreground">{gewohnheit.fields.beschreibung}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Häufigkeit:</span>
              <p className="font-medium">
                {HAEUFIGKEIT_LABELS[gewohnheit.fields.ziel_haeufigkeit ?? 'taeglich']}
              </p>
            </div>
            {gewohnheit.fields.startdatum && (
              <div>
                <span className="text-muted-foreground">Gestartet:</span>
                <p className="font-medium">
                  {format(parseISO(gewohnheit.fields.startdatum), 'dd.MM.yyyy', { locale: de })}
                </p>
              </div>
            )}
            {gewohnheit.fields.zielwert && (
              <div>
                <span className="text-muted-foreground">Zielwert:</span>
                <p className="font-medium">{gewohnheit.fields.zielwert}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Messbar:</span>
              <p className="font-medium">{gewohnheit.fields.messbar ? 'Ja' : 'Nein'}</p>
            </div>
          </div>

          {relatedEintraege.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Letzte Einträge</h4>
              <div className="space-y-2">
                {relatedEintraege.map((e) => (
                  <div
                    key={e.record_id}
                    className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                  >
                    <span>
                      {e.fields.datum
                        ? format(parseISO(e.fields.datum), 'dd.MM.yyyy', { locale: de })
                        : '-'}
                    </span>
                    <div className="flex items-center gap-2">
                      {e.fields.menge != null && (
                        <span className="text-muted-foreground">{e.fields.menge}</span>
                      )}
                      {e.fields.erledigt ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" /> Bearbeiten
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Dashboard Component
// ============================================================================
export default function Dashboard() {
  // Data state
  const [gewohnheiten, setGewohnheiten] = useState<Gewohnheiten[]>([]);
  const [eintraege, setEintraege] = useState<TaeglicheEintraege[]>([]);
  const [tagesprotokolle, setTagesprotokolle] = useState<Tagesprotokoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Dialog states
  const [showEintragDialog, setShowEintragDialog] = useState(false);
  const [editEintrag, setEditEintrag] = useState<TaeglicheEintraege | null>(null);
  const [preselectedGewohnheitId, setPreselectedGewohnheitId] = useState<string | undefined>();

  const [showGewohnheitDialog, setShowGewohnheitDialog] = useState(false);
  const [editGewohnheit, setEditGewohnheit] = useState<Gewohnheiten | null>(null);

  const [showProtokollDialog, setShowProtokollDialog] = useState(false);
  const [editProtokoll, setEditProtokoll] = useState<Tagesprotokoll | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'gewohnheit' | 'eintrag' | 'protokoll';
    item: Gewohnheiten | TaeglicheEintraege | Tagesprotokoll;
  } | null>(null);

  const [detailGewohnheit, setDetailGewohnheit] = useState<Gewohnheiten | null>(null);

  // Fetch all data
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [g, e, t] = await Promise.all([
        LivingAppsService.getGewohnheiten(),
        LivingAppsService.getTaeglicheEintraege(),
        LivingAppsService.getTagesprotokoll(),
      ]);
      setGewohnheiten(g);
      setEintraege(e);
      setTagesprotokolle(t);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Computed values
  const today = getTodayString();

  const todayEintraege = useMemo(() => {
    return eintraege.filter((e) => {
      const datum = e.fields.datum?.split('T')[0];
      return datum === today;
    });
  }, [eintraege, today]);

  const todayCompletedCount = useMemo(() => {
    return todayEintraege.filter((e) => e.fields.erledigt).length;
  }, [todayEintraege]);

  const totalHabits = gewohnheiten.length;
  const todayProgress = totalHabits > 0 ? (todayCompletedCount / totalHabits) * 100 : 0;

  // Streak calculation
  const currentStreak = useMemo(() => {
    if (eintraege.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date();

    // Check if today has any completed entries
    const hasCompletedToday = todayEintraege.some((e) => e.fields.erledigt);
    if (!hasCompletedToday) {
      // Start checking from yesterday
      checkDate = subDays(checkDate, 1);
    }

    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dayEntries = eintraege.filter((e) => {
        const datum = e.fields.datum?.split('T')[0];
        return datum === dateStr && e.fields.erledigt;
      });

      if (dayEntries.length > 0) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return streak;
  }, [eintraege, todayEintraege]);

  // Week chart data
  const weekChartData = useMemo(() => {
    const startOfCurrentWeek = startOfWeek(new Date(), { locale: de, weekStartsOn: 1 });
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(startOfCurrentWeek, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayName = format(day, 'EEE', { locale: de });

      const completedCount = eintraege.filter((e) => {
        const datum = e.fields.datum?.split('T')[0];
        return datum === dayStr && e.fields.erledigt;
      }).length;

      days.push({
        name: dayName,
        value: completedCount,
        isToday: isToday(day),
      });
    }

    return days;
  }, [eintraege]);

  const weekTotal = weekChartData.reduce((sum, d) => sum + d.value, 0);
  const weekExpected = totalHabits * 7;

  // Recent entries for desktop
  const recentEintraege = useMemo(() => {
    return [...eintraege]
      .sort((a, b) => {
        const aDate = a.fields.datum ?? a.createdat;
        const bDate = b.fields.datum ?? b.createdat;
        return bDate.localeCompare(aDate);
      })
      .slice(0, 10);
  }, [eintraege]);

  // Map gewohnheit_id -> name
  const gewohnheitMap = useMemo(() => {
    const map = new Map<string, Gewohnheiten>();
    gewohnheiten.forEach((g) => map.set(g.record_id, g));
    return map;
  }, [gewohnheiten]);

  // Check if habit is completed today
  function isHabitCompletedToday(habitId: string): boolean {
    return todayEintraege.some((e) => {
      const gId = extractRecordId(e.fields.gewohnheit);
      return gId === habitId && e.fields.erledigt;
    });
  }

  // Get today's entry for a habit
  function getTodayEntryForHabit(habitId: string): TaeglicheEintraege | undefined {
    return todayEintraege.find((e) => {
      const gId = extractRecordId(e.fields.gewohnheit);
      return gId === habitId;
    });
  }

  // Toggle habit completion
  async function toggleHabitCompletion(habit: Gewohnheiten) {
    const existingEntry = getTodayEntryForHabit(habit.record_id);

    try {
      if (existingEntry) {
        // Toggle existing entry
        await LivingAppsService.updateTaeglicheEintraegeEntry(existingEntry.record_id, {
          erledigt: !existingEntry.fields.erledigt,
        });
        toast.success(
          existingEntry.fields.erledigt
            ? `"${habit.fields.gewohnheit_name}" nicht erledigt`
            : `"${habit.fields.gewohnheit_name}" erledigt!`
        );
      } else {
        // Create new entry
        await LivingAppsService.createTaeglicheEintraegeEntry({
          gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, habit.record_id),
          datum: today,
          erledigt: true,
        });
        toast.success(`"${habit.fields.gewohnheit_name}" erledigt!`);
      }
      fetchData();
    } catch (err) {
      toast.error('Fehler beim Aktualisieren');
    }
  }

  // Delete handlers
  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      switch (deleteTarget.type) {
        case 'gewohnheit':
          await LivingAppsService.deleteGewohnheitenEntry(deleteTarget.item.record_id);
          toast.success('Gewohnheit gelöscht');
          setDetailGewohnheit(null);
          break;
        case 'eintrag':
          await LivingAppsService.deleteTaeglicheEintraegeEntry(deleteTarget.item.record_id);
          toast.success('Eintrag gelöscht');
          break;
        case 'protokoll':
          await LivingAppsService.deleteTagesprotokollEntry(deleteTarget.item.record_id);
          toast.success('Tagesnotiz gelöscht');
          break;
      }
      setDeleteTarget(null);
      fetchData();
    } catch {
      throw new Error('Löschen fehlgeschlagen');
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>

          {/* Hero skeleton */}
          <div className="flex justify-center py-8">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>

          {/* List skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-destructive text-5xl">!</div>
            <h2 className="text-xl font-semibold">Fehler beim Laden</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={fetchData}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state for no habits
  if (gewohnheiten.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Toaster position="top-center" />
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Target className="h-16 w-16 mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Noch keine Gewohnheiten</h2>
            <p className="text-muted-foreground">
              Erstelle deine erste Gewohnheit und beginne mit dem Tracking!
            </p>
            <Button onClick={() => setShowGewohnheitDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Erste Gewohnheit erstellen
            </Button>
          </CardContent>
        </Card>

        <GewohnheitDialog
          open={showGewohnheitDialog}
          onOpenChange={setShowGewohnheitDialog}
          gewohnheit={null}
          onSuccess={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Gewohnheiten</h1>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditGewohnheit(null);
              setShowGewohnheitDialog(true);
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        {/* Hero Section */}
        <section className="px-4 py-8 flex flex-col items-center">
          <ProgressRing progress={todayProgress} size={160} strokeWidth={12} />
          <p className="mt-4 text-muted-foreground">
            {todayCompletedCount} von {totalHabits} Gewohnheiten erledigt
          </p>
          {currentStreak > 0 && (
            <div className="mt-2 flex items-center gap-1 text-sm text-primary">
              <Flame className="h-4 w-4" />
              <span>{currentStreak} Tage in Folge</span>
            </div>
          )}
        </section>

        {/* Today's Habits */}
        <section className="px-4 pb-4">
          <h2 className="text-lg font-semibold mb-3">
            Heute, {format(new Date(), 'd. MMMM', { locale: de })}
          </h2>
          <div className="space-y-2">
            {gewohnheiten.map((habit) => {
              const isCompleted = isHabitCompletedToday(habit.record_id);
              return (
                <div
                  key={habit.record_id}
                  className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-all ${
                    isCompleted ? 'opacity-60' : ''
                  }`}
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => toggleHabitCompletion(habit)}
                    className="h-6 w-6"
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setDetailGewohnheit(habit)}
                  >
                    <p
                      className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {habit.fields.gewohnheit_name}
                    </p>
                    {habit.fields.kategorie && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {KATEGORIE_LABELS[habit.fields.kategorie]}
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Row */}
        <section className="px-4 pb-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Card className="flex-shrink-0 min-w-[120px]">
              <CardContent className="p-3 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="font-semibold">{currentStreak} Tage</p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 min-w-[120px]">
              <CardContent className="p-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Diese Woche</p>
                  <p className="font-semibold">
                    {weekTotal}/{weekExpected}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 min-w-[120px]">
              <CardContent className="p-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Gewohnheiten</p>
                  <p className="font-semibold">{totalHabits}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tagesnotiz Button */}
        <section className="px-4 pb-24">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setEditProtokoll(null);
              setShowProtokollDialog(true);
            }}
          >
            <FileText className="h-4 w-4 mr-2" /> Tagesnotiz hinzufügen
          </Button>
        </section>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button
            className="w-full h-14 text-lg"
            onClick={() => {
              setEditEintrag(null);
              setPreselectedGewohnheitId(undefined);
              setShowEintragDialog(true);
            }}
          >
            <Plus className="h-5 w-5 mr-2" /> Eintrag hinzufügen
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Gewohnheitstracker</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditGewohnheit(null);
                setShowGewohnheitDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Neue Gewohnheit
            </Button>
            <Button
              onClick={() => {
                setEditEintrag(null);
                setPreselectedGewohnheitId(undefined);
                setShowEintragDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Eintrag hinzufügen
            </Button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-[1fr_380px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Hero + Stats Row */}
            <div className="grid grid-cols-[1fr_200px] gap-6">
              {/* Hero */}
              <Card>
                <CardContent className="p-6 flex items-center gap-8">
                  <ProgressRing progress={todayProgress} size={200} strokeWidth={12} />
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Tagesfortschritt</h2>
                    <p className="text-muted-foreground text-lg">
                      {todayCompletedCount} von {totalHabits} Gewohnheiten erledigt
                    </p>
                    {currentStreak > 0 && (
                      <div className="flex items-center gap-2 text-primary">
                        <Flame className="h-5 w-5" />
                        <span className="font-medium">{currentStreak} Tage in Folge</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aktueller Streak</p>
                      <p className="text-xl font-bold">{currentStreak} Tage</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Diese Woche</p>
                      <p className="text-xl font-bold">
                        {weekTotal}/{weekExpected}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Week Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Diese Woche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekChartData}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value} erledigt`, 'Gewohnheiten']}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {weekChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isToday ? 'hsl(152 45% 35%)' : 'hsl(158 40% 70%)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Letzte Einträge</CardTitle>
              </CardHeader>
              <CardContent>
                {recentEintraege.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Noch keine Einträge vorhanden
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentEintraege.map((eintrag) => {
                      const gId = extractRecordId(eintrag.fields.gewohnheit);
                      const habit = gId ? gewohnheitMap.get(gId) : undefined;
                      return (
                        <div
                          key={eintrag.record_id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            setEditEintrag(eintrag);
                            setShowEintragDialog(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {eintrag.fields.erledigt ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium">
                                {habit?.fields.gewohnheit_name ?? 'Unbekannt'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {eintrag.fields.datum
                                  ? format(parseISO(eintrag.fields.datum), 'dd.MM.yyyy', {
                                      locale: de,
                                    })
                                  : '-'}
                                {eintrag.fields.menge != null && ` • ${eintrag.fields.menge}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ type: 'eintrag', item: eintrag });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tagesnotiz Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tagesnotizen</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditProtokoll(null);
                    setShowProtokollDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {tagesprotokolle.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Noch keine Tagesnotizen
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tagesprotokolle.slice(0, 5).map((p) => (
                      <div
                        key={p.record_id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setEditProtokoll(p);
                          setShowProtokollDialog(true);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {p.fields.protokoll_datum
                                ? format(parseISO(p.fields.protokoll_datum), 'dd.MM.yyyy', {
                                    locale: de,
                                  })
                                : '-'}
                            </p>
                            {p.fields.tagesnotizen && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {p.fields.tagesnotizen}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ type: 'protokoll', item: p });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Today's Habits */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Heute, {format(new Date(), 'd. MMMM', { locale: de })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {gewohnheiten.map((habit) => {
                    const isCompleted = isHabitCompletedToday(habit.record_id);
                    return (
                      <div
                        key={habit.record_id}
                        className={`group flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-all ${
                          isCompleted ? 'opacity-60' : ''
                        }`}
                      >
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleHabitCompletion(habit)}
                          className="h-5 w-5"
                        />
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => setDetailGewohnheit(habit)}
                        >
                          <p
                            className={`font-medium ${
                              isCompleted ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {habit.fields.gewohnheit_name}
                          </p>
                          {habit.fields.kategorie && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {KATEGORIE_LABELS[habit.fields.kategorie]}
                            </Badge>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditGewohnheit(habit);
                              setShowGewohnheitDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    setEditGewohnheit(null);
                    setShowGewohnheitDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Neue Gewohnheit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EintragDialog
        open={showEintragDialog}
        onOpenChange={setShowEintragDialog}
        eintrag={editEintrag}
        gewohnheiten={gewohnheiten}
        preselectedGewohnheitId={preselectedGewohnheitId}
        onSuccess={fetchData}
      />

      <GewohnheitDialog
        open={showGewohnheitDialog}
        onOpenChange={setShowGewohnheitDialog}
        gewohnheit={editGewohnheit}
        onSuccess={fetchData}
      />

      <TagesprotokollDialog
        open={showProtokollDialog}
        onOpenChange={setShowProtokollDialog}
        protokoll={editProtokoll}
        gewohnheiten={gewohnheiten}
        onSuccess={fetchData}
      />

      <GewohnheitDetailSheet
        open={!!detailGewohnheit}
        onClose={() => setDetailGewohnheit(null)}
        gewohnheit={detailGewohnheit}
        eintraege={eintraege}
        onEdit={() => {
          setEditGewohnheit(detailGewohnheit);
          setDetailGewohnheit(null);
          setShowGewohnheitDialog(true);
        }}
        onDelete={() => {
          if (detailGewohnheit) {
            setDeleteTarget({ type: 'gewohnheit', item: detailGewohnheit });
          }
        }}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget?.type === 'gewohnheit'
            ? 'Gewohnheit löschen?'
            : deleteTarget?.type === 'eintrag'
              ? 'Eintrag löschen?'
              : 'Tagesnotiz löschen?'
        }
        description={
          deleteTarget?.type === 'gewohnheit'
            ? `Möchtest du die Gewohnheit "${(deleteTarget.item as Gewohnheiten).fields.gewohnheit_name}" wirklich löschen? Alle zugehörigen Einträge bleiben erhalten.`
            : deleteTarget?.type === 'eintrag'
              ? 'Möchtest du diesen Eintrag wirklich löschen?'
              : 'Möchtest du diese Tagesnotiz wirklich löschen?'
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
