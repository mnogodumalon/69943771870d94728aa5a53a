import { useState, useEffect, useMemo } from 'react';
import type { TaeglicheEintraege, Tagesprotokoll, Gewohnheiten } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { format, parseISO, startOfDay, subDays, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import { Plus, Pencil, Trash2, Flame, Check, FileText } from 'lucide-react';

// Charts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

// Category colors for badges
const KATEGORIE_COLORS: Record<string, string> = {
  gesundheit_fitness: 'bg-emerald-100 text-emerald-700',
  ernaehrung: 'bg-orange-100 text-orange-700',
  produktivitaet: 'bg-blue-100 text-blue-700',
  persoenliche_entwicklung: 'bg-purple-100 text-purple-700',
  soziales: 'bg-pink-100 text-pink-700',
  finanzen: 'bg-yellow-100 text-yellow-700',
  sonstiges: 'bg-gray-100 text-gray-700',
};

// Helper to get today's date string in YYYY-MM-DD format
function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// Progress Ring Component
function ProgressRing({ progress, size, strokeWidth, children }: {
  progress: number;
  size: number;
  strokeWidth: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
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
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// Gewohnheit Dialog (Create/Edit)
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
    kategorie: 'sonstiges' as NonNullable<Gewohnheiten['fields']['kategorie']>,
    ziel_haeufigkeit: 'taeglich' as NonNullable<Gewohnheiten['fields']['ziel_haeufigkeit']>,
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
      toast.error('Bitte gib einen Namen ein');
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

      if (isEditing && gewohnheit) {
        await LivingAppsService.updateGewohnheitenEntry(gewohnheit.record_id, apiData);
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
          <DialogTitle>{isEditing ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name der Gewohnheit *</Label>
            <Input
              id="name"
              value={formData.gewohnheit_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, gewohnheit_name: e.target.value }))}
              placeholder="z.B. Meditation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={formData.beschreibung}
              onChange={(e) => setFormData((prev) => ({ ...prev, beschreibung: e.target.value }))}
              placeholder="Was genau möchtest du erreichen?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategorie *</Label>
              <Select
                value={formData.kategorie}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    kategorie: value as NonNullable<Gewohnheiten['fields']['kategorie']>,
                  }))
                }
              >
                <SelectTrigger>
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
              <Label>Häufigkeit *</Label>
              <Select
                value={formData.ziel_haeufigkeit}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    ziel_haeufigkeit: value as NonNullable<Gewohnheiten['fields']['ziel_haeufigkeit']>,
                  }))
                }
              >
                <SelectTrigger>
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
              onChange={(e) => setFormData((prev) => ({ ...prev, startdatum: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zielwert">Zielwert (optional)</Label>
            <Input
              id="zielwert"
              value={formData.zielwert}
              onChange={(e) => setFormData((prev) => ({ ...prev, zielwert: e.target.value }))}
              placeholder="z.B. 8 Gläser Wasser"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="messbar"
              checked={formData.messbar}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, messbar: checked === true }))
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

// Eintrag Dialog (Create/Edit)
function EintragDialog({
  open,
  onOpenChange,
  eintrag,
  gewohnheiten,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eintrag?: TaeglicheEintraege | null;
  gewohnheiten: Gewohnheiten[];
  onSuccess: () => void;
}) {
  const isEditing = !!eintrag;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gewohnheit: '',
    datum: getTodayString(),
    erledigt: true,
    menge: '',
    notizen: '',
  });

  const selectedGewohnheit = useMemo(() => {
    if (!formData.gewohnheit) return null;
    return gewohnheiten.find((g) => g.record_id === formData.gewohnheit);
  }, [formData.gewohnheit, gewohnheiten]);

  useEffect(() => {
    if (open) {
      const gewohnheitId = eintrag?.fields.gewohnheit
        ? extractRecordId(eintrag.fields.gewohnheit)
        : '';
      setFormData({
        gewohnheit: gewohnheitId ?? '',
        datum: eintrag?.fields.datum ?? getTodayString(),
        erledigt: eintrag?.fields.erledigt ?? true,
        menge: eintrag?.fields.menge?.toString() ?? '',
        notizen: eintrag?.fields.notizen ?? '',
      });
    }
  }, [open, eintrag]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.gewohnheit) {
      toast.error('Bitte wähle eine Gewohnheit aus');
      return;
    }
    setSubmitting(true);

    try {
      const apiData = {
        gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, formData.gewohnheit),
        datum: formData.datum,
        erledigt: formData.erledigt,
        menge: formData.menge ? parseFloat(formData.menge) : undefined,
        notizen: formData.notizen || undefined,
      };

      if (isEditing && eintrag) {
        await LivingAppsService.updateTaeglicheEintraegeEntry(eintrag.record_id, apiData);
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
          <DialogTitle>{isEditing ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Gewohnheit *</Label>
            <Select
              value={formData.gewohnheit || 'placeholder'}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, gewohnheit: value === 'placeholder' ? '' : value }))
              }
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gewohnheit auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>
                  Gewohnheit auswählen...
                </SelectItem>
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
              onChange={(e) => setFormData((prev) => ({ ...prev, datum: e.target.value }))}
              disabled={isEditing}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="erledigt"
              checked={formData.erledigt}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, erledigt: checked === true }))
              }
            />
            <Label htmlFor="erledigt" className="font-normal">
              Erledigt
            </Label>
          </div>

          {selectedGewohnheit?.fields.messbar && (
            <div className="space-y-2">
              <Label htmlFor="menge">Menge/Wert</Label>
              <Input
                id="menge"
                type="number"
                step="0.1"
                value={formData.menge}
                onChange={(e) => setFormData((prev) => ({ ...prev, menge: e.target.value }))}
                placeholder="z.B. 8"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notizen">Notizen</Label>
            <Textarea
              id="notizen"
              value={formData.notizen}
              onChange={(e) => setFormData((prev) => ({ ...prev, notizen: e.target.value }))}
              placeholder="Optionale Notizen..."
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

// Tagesprotokoll Dialog (Create/Edit)
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
    erledigte_gewohnheiten: '',
    tagesnotizen: '',
  });

  useEffect(() => {
    if (open) {
      const gewohnheitId = protokoll?.fields.erledigte_gewohnheiten
        ? extractRecordId(protokoll.fields.erledigte_gewohnheiten)
        : '';
      setFormData({
        protokoll_datum: protokoll?.fields.protokoll_datum ?? getTodayString(),
        erledigte_gewohnheiten: gewohnheitId ?? '',
        tagesnotizen: protokoll?.fields.tagesnotizen ?? '',
      });
    }
  }, [open, protokoll]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData = {
        protokoll_datum: formData.protokoll_datum,
        erledigte_gewohnheiten: formData.erledigte_gewohnheiten
          ? createRecordUrl(APP_IDS.GEWOHNHEITEN, formData.erledigte_gewohnheiten)
          : undefined,
        tagesnotizen: formData.tagesnotizen || undefined,
      };

      if (isEditing && protokoll) {
        await LivingAppsService.updateTagesprotokollEntry(protokoll.record_id, apiData);
        toast.success('Tagesprotokoll aktualisiert');
      } else {
        await LivingAppsService.createTagesprotokollEntry(apiData);
        toast.success('Tagesprotokoll erstellt');
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
          <DialogTitle>{isEditing ? 'Tagesnotiz bearbeiten' : 'Neue Tagesnotiz'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="protokoll_datum">Datum</Label>
            <Input
              id="protokoll_datum"
              type="date"
              value={formData.protokoll_datum}
              onChange={(e) => setFormData((prev) => ({ ...prev, protokoll_datum: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Gewohnheit (optional)</Label>
            <Select
              value={formData.erledigte_gewohnheiten || 'none'}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  erledigte_gewohnheiten: value === 'none' ? '' : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Keine Gewohnheit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Gewohnheit</SelectItem>
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
              onChange={(e) => setFormData((prev) => ({ ...prev, tagesnotizen: e.target.value }))}
              placeholder="Wie war dein Tag?"
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

// Delete Confirmation Dialog
function DeleteConfirmDialog({
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
    } catch (err) {
      toast.error(`Fehler beim Löschen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
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

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="flex flex-col items-center mb-8">
          <Skeleton className="h-44 w-44 rounded-full mb-4" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  // Data state
  const [gewohnheiten, setGewohnheiten] = useState<Gewohnheiten[]>([]);
  const [eintraege, setEintraege] = useState<TaeglicheEintraege[]>([]);
  const [protokolle, setProtokolle] = useState<Tagesprotokoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Dialog states
  const [gewohnheitDialog, setGewohnheitDialog] = useState<{
    open: boolean;
    gewohnheit: Gewohnheiten | null;
  }>({ open: false, gewohnheit: null });
  const [eintragDialog, setEintragDialog] = useState<{
    open: boolean;
    eintrag: TaeglicheEintraege | null;
  }>({ open: false, eintrag: null });
  const [protokollDialog, setProtokollDialog] = useState<{
    open: boolean;
    protokoll: Tagesprotokoll | null;
  }>({ open: false, protokoll: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({ open: false, title: '', description: '', onConfirm: async () => {} });

  // Fetch all data
  async function fetchData() {
    try {
      setLoading(true);
      const [g, e, p] = await Promise.all([
        LivingAppsService.getGewohnheiten(),
        LivingAppsService.getTaeglicheEintraege(),
        LivingAppsService.getTagesprotokoll(),
      ]);
      setGewohnheiten(g);
      setEintraege(e);
      setProtokolle(p);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Create a map for quick gewohnheit lookup
  const gewohnheitMap = useMemo(() => {
    const map = new Map<string, Gewohnheiten>();
    gewohnheiten.forEach((g) => map.set(g.record_id, g));
    return map;
  }, [gewohnheiten]);

  // Filter entries for today
  const todayString = getTodayString();
  const heuteEintraege = useMemo(() => {
    return eintraege.filter((e) => e.fields.datum === todayString);
  }, [eintraege, todayString]);

  // Create a map of today's entries by gewohnheit ID
  const heuteEintraegeMap = useMemo(() => {
    const map = new Map<string, TaeglicheEintraege>();
    heuteEintraege.forEach((e) => {
      const gId = extractRecordId(e.fields.gewohnheit);
      if (gId) map.set(gId, e);
    });
    return map;
  }, [heuteEintraege]);

  // Calculate today's progress
  const todayProgress = useMemo(() => {
    const total = gewohnheiten.filter((g) => g.fields.ziel_haeufigkeit === 'taeglich').length || gewohnheiten.length;
    const completed = heuteEintraege.filter((e) => e.fields.erledigt).length;
    return {
      completed,
      total: Math.max(total, completed),
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [gewohnheiten, heuteEintraege]);

  // Calculate streak (consecutive days with at least one completed habit)
  const streak = useMemo(() => {
    let count = 0;
    const today = startOfDay(new Date());

    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      const dayString = format(day, 'yyyy-MM-dd');
      const dayEntries = eintraege.filter(
        (e) => e.fields.datum === dayString && e.fields.erledigt
      );

      if (dayEntries.length > 0) {
        count++;
      } else if (i > 0) {
        // Allow today to be incomplete
        break;
      }
    }

    return count;
  }, [eintraege]);

  // Calculate weekly data for chart
  const weeklyData = useMemo(() => {
    const data: { day: string; count: number }[] = [];
    const today = startOfDay(new Date());

    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const dayString = format(day, 'yyyy-MM-dd');
      const dayEntries = eintraege.filter(
        (e) => e.fields.datum === dayString && e.fields.erledigt
      );

      data.push({
        day: format(day, 'EEE', { locale: de }),
        count: dayEntries.length,
      });
    }

    return data;
  }, [eintraege]);

  // Today's protokoll
  const todayProtokoll = useMemo(() => {
    return protokolle.find((p) => p.fields.protokoll_datum === todayString);
  }, [protokolle, todayString]);

  // Toggle habit completion for today
  async function toggleHabit(gewohnheit: Gewohnheiten) {
    const existingEntry = heuteEintraegeMap.get(gewohnheit.record_id);

    try {
      if (existingEntry) {
        // Toggle existing entry
        await LivingAppsService.updateTaeglicheEintraegeEntry(existingEntry.record_id, {
          erledigt: !existingEntry.fields.erledigt,
        });
        toast.success(
          existingEntry.fields.erledigt
            ? 'Als nicht erledigt markiert'
            : 'Als erledigt markiert'
        );
      } else {
        // Create new entry as completed
        await LivingAppsService.createTaeglicheEintraegeEntry({
          gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, gewohnheit.record_id),
          datum: todayString,
          erledigt: true,
        });
        toast.success('Als erledigt markiert');
      }
      fetchData();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    }
  }

  // Delete handlers
  async function deleteGewohnheit(g: Gewohnheiten) {
    await LivingAppsService.deleteGewohnheitenEntry(g.record_id);
    toast.success('Gewohnheit gelöscht');
    fetchData();
  }

  async function deleteEintrag(e: TaeglicheEintraege) {
    await LivingAppsService.deleteTaeglicheEintraegeEntry(e.record_id);
    toast.success('Eintrag gelöscht');
    fetchData();
  }

  async function deleteProtokoll(p: Tagesprotokoll) {
    await LivingAppsService.deleteTagesprotokollEntry(p.record_id);
    toast.success('Tagesprotokoll gelöscht');
    fetchData();
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Fehler beim Laden: {error.message}</p>
            <Button onClick={fetchData}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Gewohnheitstracker</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setGewohnheitDialog({ open: true, gewohnheit: null })}
            aria-label="Neue Gewohnheit"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Progress Ring */}
                  <div className="flex flex-col items-center">
                    <ProgressRing
                      progress={todayProgress.percentage}
                      size={180}
                      strokeWidth={10}
                    >
                      <div className="text-center">
                        <div className="text-5xl font-extrabold">{todayProgress.completed}</div>
                        <div className="text-sm text-muted-foreground">
                          von {todayProgress.total} heute
                        </div>
                      </div>
                    </ProgressRing>

                    {/* Streak Badge */}
                    {streak > 0 && (
                      <Badge variant="secondary" className="mt-4 gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {streak} {streak === 1 ? 'Tag' : 'Tage'} in Folge
                      </Badge>
                    )}
                  </div>

                  {/* Weekly Chart (Desktop only) */}
                  <div className="hidden md:block flex-1 h-[160px]">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Letzte 7 Tage</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value} erledigt`, '']}
                        />
                        <Bar
                          dataKey="count"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Habits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Heute</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(), 'EEEE, d. MMMM', { locale: de })}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setEintragDialog({ open: true, eintrag: null })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Eintrag
                </Button>
              </CardHeader>
              <CardContent>
                {gewohnheiten.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Noch keine Gewohnheiten angelegt.</p>
                    <Button
                      variant="link"
                      onClick={() => setGewohnheitDialog({ open: true, gewohnheit: null })}
                    >
                      Erste Gewohnheit erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gewohnheiten
                      .sort((a, b) => {
                        const aCompleted = heuteEintraegeMap.get(a.record_id)?.fields.erledigt;
                        const bCompleted = heuteEintraegeMap.get(b.record_id)?.fields.erledigt;
                        if (aCompleted === bCompleted) return 0;
                        return aCompleted ? 1 : -1;
                      })
                      .map((g) => {
                        const entry = heuteEintraegeMap.get(g.record_id);
                        const isCompleted = entry?.fields.erledigt ?? false;

                        return (
                          <div
                            key={g.record_id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              isCompleted
                                ? 'bg-accent/50 border-accent'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <button
                              onClick={() => toggleHabit(g)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground hover:border-primary'
                              }`}
                              aria-label={isCompleted ? 'Als nicht erledigt markieren' : 'Als erledigt markieren'}
                            >
                              {isCompleted && <Check className="h-4 w-4" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium truncate ${
                                  isCompleted ? 'line-through text-muted-foreground' : ''
                                }`}
                              >
                                {g.fields.gewohnheit_name}
                              </p>
                              {g.fields.messbar && entry?.fields.menge != null && (
                                <p className="text-sm text-muted-foreground">
                                  Menge: {entry.fields.menge}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${KATEGORIE_COLORS[g.fields.kategorie ?? 'sonstiges']}`}
                            >
                              {KATEGORIE_LABELS[g.fields.kategorie ?? 'sonstiges']}
                            </Badge>
                            {entry && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 opacity-50 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEintragDialog({ open: true, eintrag: entry });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Today's Note */}
                <div className="mt-4 pt-4 border-t">
                  {todayProtokoll ? (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {todayProtokoll.fields.tagesnotizen || 'Keine Notizen'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() =>
                            setProtokollDialog({ open: true, protokoll: todayProtokoll })
                          }
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              title: 'Tagesnotiz löschen?',
                              description: `Möchtest du die Tagesnotiz vom ${format(
                                parseISO(todayProtokoll.fields.protokoll_datum ?? todayString),
                                'd. MMMM yyyy',
                                { locale: de }
                              )} wirklich löschen?`,
                              onConfirm: () => deleteProtokoll(todayProtokoll),
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => setProtokollDialog({ open: true, protokoll: null })}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Tagesnotiz hinzufügen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Habits Management */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Meine Gewohnheiten</CardTitle>
                  <Badge variant="secondary">{gewohnheiten.length}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setGewohnheitDialog({ open: true, gewohnheit: null })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {gewohnheiten.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Keine Gewohnheiten vorhanden.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gewohnheiten
                      .sort((a, b) =>
                        (a.fields.gewohnheit_name ?? '').localeCompare(b.fields.gewohnheit_name ?? '')
                      )
                      .map((g) => (
                        <div
                          key={g.record_id}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{g.fields.gewohnheit_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={`text-xs ${KATEGORIE_COLORS[g.fields.kategorie ?? 'sonstiges']}`}
                              >
                                {KATEGORIE_LABELS[g.fields.kategorie ?? 'sonstiges']}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {HAEUFIGKEIT_LABELS[g.fields.ziel_haeufigkeit ?? 'taeglich']}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setGewohnheitDialog({ open: true, gewohnheit: g })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  title: 'Gewohnheit löschen?',
                                  description: `Möchtest du die Gewohnheit "${g.fields.gewohnheit_name}" wirklich löschen? Alle zugehörigen Einträge bleiben erhalten.`,
                                  onConfirm: () => deleteGewohnheit(g),
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Protokolle */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Tagesnotizen</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProtokollDialog({ open: true, protokoll: null })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {protokolle.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Keine Tagesnotizen vorhanden.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {protokolle
                      .sort((a, b) =>
                        (b.fields.protokoll_datum ?? '').localeCompare(a.fields.protokoll_datum ?? '')
                      )
                      .slice(0, 5)
                      .map((p) => (
                        <div
                          key={p.record_id}
                          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {p.fields.protokoll_datum
                                ? format(parseISO(p.fields.protokoll_datum), 'd. MMMM yyyy', {
                                    locale: de,
                                  })
                                : 'Kein Datum'}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {p.fields.tagesnotizen || 'Keine Notizen'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => setProtokollDialog({ open: true, protokoll: p })}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  title: 'Tagesnotiz löschen?',
                                  description: `Möchtest du die Tagesnotiz vom ${
                                    p.fields.protokoll_datum
                                      ? format(parseISO(p.fields.protokoll_datum), 'd. MMMM yyyy', {
                                          locale: de,
                                        })
                                      : 'unbekanntem Datum'
                                  } wirklich löschen?`,
                                  onConfirm: () => deleteProtokoll(p),
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* FAB for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setEintragDialog({ open: true, eintrag: null })}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Dialogs */}
      <GewohnheitDialog
        open={gewohnheitDialog.open}
        onOpenChange={(open) => setGewohnheitDialog({ open, gewohnheit: null })}
        gewohnheit={gewohnheitDialog.gewohnheit}
        onSuccess={fetchData}
      />

      <EintragDialog
        open={eintragDialog.open}
        onOpenChange={(open) => setEintragDialog({ open, eintrag: null })}
        eintrag={eintragDialog.eintrag}
        gewohnheiten={gewohnheiten}
        onSuccess={fetchData}
      />

      <TagesprotokollDialog
        open={protokollDialog.open}
        onOpenChange={(open) => setProtokollDialog({ open, protokoll: null })}
        protokoll={protokollDialog.protokoll}
        gewohnheiten={gewohnheiten}
        onSuccess={fetchData}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, title: '', description: '', onConfirm: async () => {} })
        }
        title={deleteDialog.title}
        description={deleteDialog.description}
        onConfirm={deleteDialog.onConfirm}
      />
    </div>
  );
}
