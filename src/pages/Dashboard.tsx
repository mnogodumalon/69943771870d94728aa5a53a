import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TaeglicheEintraege, Tagesprotokoll, Gewohnheiten } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, isToday, subDays, isSameDay, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Pencil, Trash2, Check, AlertCircle, BookOpen, Target, Flame, CalendarDays } from 'lucide-react';

// ── Category colors ──
const CATEGORY_COLORS: Record<string, string> = {
  gesundheit_fitness: '#22c55e',
  ernaehrung: '#f97316',
  produktivitaet: '#3b82f6',
  persoenliche_entwicklung: '#a855f7',
  soziales: '#ec4899',
  finanzen: '#eab308',
  sonstiges: '#9ca3af',
};

const CATEGORY_LABELS: Record<string, string> = {
  gesundheit_fitness: 'Gesundheit & Fitness',
  ernaehrung: 'Ernährung',
  produktivitaet: 'Produktivität',
  persoenliche_entwicklung: 'Persönliche Entwicklung',
  soziales: 'Soziales',
  finanzen: 'Finanzen',
  sonstiges: 'Sonstiges',
};

const FREQUENCY_LABELS: Record<string, string> = {
  taeglich: 'Täglich',
  mehrmals_woche: 'Mehrmals/Woche',
  woechentlich: 'Wöchentlich',
  monatlich: 'Monatlich',
};

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

// ── Progress Ring SVG ──
function ProgressRing({ percentage, size, strokeWidth }: { percentage: number; size: number; strokeWidth: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);
  const targetOffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOffset(targetOffset), 50);
    return () => clearTimeout(timer);
  }, [targetOffset]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(145 20% 92%)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(158 45% 30%)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={animatedOffset}
        style={{ transition: 'stroke-dashoffset 800ms ease-out' }}
      />
    </svg>
  );
}

// ── Delete Confirmation Dialog ──
function DeleteConfirmDialog({ open, onOpenChange, title, description, onConfirm }: {
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

// ── Eintrag Dialog (Create/Edit Tägliche Einträge) ──
function EintragDialog({ open, onOpenChange, record, gewohnheiten, onSuccess }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: TaeglicheEintraege | null;
  gewohnheiten: Gewohnheiten[];
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);

  const getInitialGewohnheitId = () => {
    if (!record?.fields.gewohnheit) return '';
    return extractRecordId(record.fields.gewohnheit) ?? '';
  };

  const [gewohnheitId, setGewohnheitId] = useState(getInitialGewohnheitId);
  const [datum, setDatum] = useState(record?.fields.datum?.split('T')[0] ?? todayStr());
  const [erledigt, setErledigt] = useState(record?.fields.erledigt ?? true);
  const [menge, setMenge] = useState<string>(record?.fields.menge?.toString() ?? '');
  const [notizen, setNotizen] = useState(record?.fields.notizen ?? '');

  useEffect(() => {
    if (open) {
      setGewohnheitId(record?.fields.gewohnheit ? extractRecordId(record.fields.gewohnheit) ?? '' : '');
      setDatum(record?.fields.datum?.split('T')[0] ?? todayStr());
      setErledigt(record?.fields.erledigt ?? true);
      setMenge(record?.fields.menge?.toString() ?? '');
      setNotizen(record?.fields.notizen ?? '');
    }
  }, [open, record]);

  const selectedHabit = gewohnheiten.find(g => g.record_id === gewohnheitId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gewohnheitId) { toast.error('Bitte eine Gewohnheit auswählen'); return; }
    setSubmitting(true);
    try {
      const fields: TaeglicheEintraege['fields'] = {
        gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, gewohnheitId),
        datum,
        erledigt,
        menge: menge ? Number(menge) : undefined,
        notizen: notizen || undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateTaeglicheEintraegeEntry(record!.record_id, fields);
        toast.success('Eintrag aktualisiert');
      } else {
        await LivingAppsService.createTaeglicheEintraegeEntry(fields);
        toast.success('Eintrag erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Eintrag bearbeiten' : 'Eintrag erfassen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Gewohnheit</Label>
            <Select value={gewohnheitId || 'none'} onValueChange={v => setGewohnheitId(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Gewohnheit wählen..." /></SelectTrigger>
              <SelectContent>
                {gewohnheiten.map(g => (
                  <SelectItem key={g.record_id} value={g.record_id}>
                    {g.fields.gewohnheit_name ?? 'Unbenannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Datum</Label>
            <Input type="date" value={datum} onChange={e => setDatum(e.target.value)} required />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={erledigt} onCheckedChange={setErledigt} />
            <Label>Erledigt</Label>
          </div>
          {selectedHabit?.fields.messbar && (
            <div className="space-y-2">
              <Label>Menge/Wert</Label>
              <Input type="number" step="any" value={menge} onChange={e => setMenge(e.target.value)} placeholder="z.B. 30" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Notizen</Label>
            <Textarea value={notizen} onChange={e => setNotizen(e.target.value)} placeholder="Optional..." rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Tagesprotokoll Dialog (Create/Edit) ──
function ProtokollDialog({ open, onOpenChange, record, gewohnheiten, onSuccess }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: Tagesprotokoll | null;
  gewohnheiten: Gewohnheiten[];
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);

  const getInitialGewohnheitId = () => {
    if (!record?.fields.erledigte_gewohnheiten) return '';
    return extractRecordId(record.fields.erledigte_gewohnheiten) ?? '';
  };

  const [datum, setDatum] = useState(record?.fields.protokoll_datum?.split('T')[0] ?? todayStr());
  const [gewohnheitId, setGewohnheitId] = useState(getInitialGewohnheitId);
  const [tagesnotizen, setTagesnotizen] = useState(record?.fields.tagesnotizen ?? '');

  useEffect(() => {
    if (open) {
      setDatum(record?.fields.protokoll_datum?.split('T')[0] ?? todayStr());
      setGewohnheitId(record?.fields.erledigte_gewohnheiten ? extractRecordId(record.fields.erledigte_gewohnheiten) ?? '' : '');
      setTagesnotizen(record?.fields.tagesnotizen ?? '');
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fields: Tagesprotokoll['fields'] = {
        protokoll_datum: datum,
        erledigte_gewohnheiten: gewohnheitId ? createRecordUrl(APP_IDS.GEWOHNHEITEN, gewohnheitId) : undefined,
        tagesnotizen: tagesnotizen || undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateTagesprotokollEntry(record!.record_id, fields);
        toast.success('Tageseintrag aktualisiert');
      } else {
        await LivingAppsService.createTagesprotokollEntry(fields);
        toast.success('Tageseintrag erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Tageseintrag bearbeiten' : 'Neuer Tageseintrag'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Datum</Label>
            <Input type="date" value={datum} onChange={e => setDatum(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Erledigte Gewohnheit (optional)</Label>
            <Select value={gewohnheitId || 'none'} onValueChange={v => setGewohnheitId(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Gewohnheit wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine</SelectItem>
                {gewohnheiten.map(g => (
                  <SelectItem key={g.record_id} value={g.record_id}>
                    {g.fields.gewohnheit_name ?? 'Unbenannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notizen zum Tag</Label>
            <Textarea value={tagesnotizen} onChange={e => setTagesnotizen(e.target.value)} placeholder="Wie war dein Tag?" rows={4} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Gewohnheit Dialog (Create/Edit) ──
function GewohnheitDialog({ open, onOpenChange, record, onSuccess }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: Gewohnheiten | null;
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(record?.fields.gewohnheit_name ?? '');
  const [beschreibung, setBeschreibung] = useState(record?.fields.beschreibung ?? '');
  const [kategorie, setKategorie] = useState<string>(record?.fields.kategorie ?? 'sonstiges');
  const [haeufigkeit, setHaeufigkeit] = useState<string>(record?.fields.ziel_haeufigkeit ?? 'taeglich');
  const [startdatum, setStartdatum] = useState(record?.fields.startdatum?.split('T')[0] ?? todayStr());
  const [zielwert, setZielwert] = useState(record?.fields.zielwert ?? '');
  const [messbar, setMessbar] = useState(record?.fields.messbar ?? false);

  useEffect(() => {
    if (open) {
      setName(record?.fields.gewohnheit_name ?? '');
      setBeschreibung(record?.fields.beschreibung ?? '');
      setKategorie(record?.fields.kategorie ?? 'sonstiges');
      setHaeufigkeit(record?.fields.ziel_haeufigkeit ?? 'taeglich');
      setStartdatum(record?.fields.startdatum?.split('T')[0] ?? todayStr());
      setZielwert(record?.fields.zielwert ?? '');
      setMessbar(record?.fields.messbar ?? false);
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error('Bitte einen Namen eingeben'); return; }
    setSubmitting(true);
    try {
      const fields: Gewohnheiten['fields'] = {
        gewohnheit_name: name.trim(),
        beschreibung: beschreibung || undefined,
        kategorie: kategorie as Gewohnheiten['fields']['kategorie'],
        ziel_haeufigkeit: haeufigkeit as Gewohnheiten['fields']['ziel_haeufigkeit'],
        startdatum,
        zielwert: zielwert || undefined,
        messbar,
      };
      if (isEditing) {
        await LivingAppsService.updateGewohnheitenEntry(record!.record_id, fields);
        toast.success('Gewohnheit aktualisiert');
      } else {
        await LivingAppsService.createGewohnheitenEntry(fields);
        toast.success('Gewohnheit erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}`);
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
            <Label>Name der Gewohnheit</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Joggen" required />
          </div>
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea value={beschreibung} onChange={e => setBeschreibung(e.target.value)} placeholder="Optional..." rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select value={kategorie} onValueChange={v => setKategorie(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zielhäufigkeit</Label>
              <Select value={haeufigkeit} onValueChange={v => setHaeufigkeit(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Startdatum</Label>
            <Input type="date" value={startdatum} onChange={e => setStartdatum(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Ziel/Zielwert</Label>
            <Input value={zielwert} onChange={e => setZielwert(e.target.value)} placeholder="z.B. 10.000 Schritte" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={messbar} onCheckedChange={setMessbar} />
            <Label>Messbare Gewohnheit (mit Zahlen/Mengen)</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Dashboard ──
export default function Dashboard() {
  const [eintraege, setEintraege] = useState<TaeglicheEintraege[]>([]);
  const [protokolle, setProtokolle] = useState<Tagesprotokoll[]>([]);
  const [gewohnheiten, setGewohnheiten] = useState<Gewohnheiten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Dialog states
  const [showEintragDialog, setShowEintragDialog] = useState(false);
  const [editEintrag, setEditEintrag] = useState<TaeglicheEintraege | null>(null);
  const [deleteEintrag, setDeleteEintrag] = useState<TaeglicheEintraege | null>(null);

  const [showProtokollDialog, setShowProtokollDialog] = useState(false);
  const [editProtokoll, setEditProtokoll] = useState<Tagesprotokoll | null>(null);
  const [deleteProtokoll, setDeleteProtokoll] = useState<Tagesprotokoll | null>(null);

  const [showGewohnheitDialog, setShowGewohnheitDialog] = useState(false);
  const [editGewohnheit, setEditGewohnheit] = useState<Gewohnheiten | null>(null);
  const [deleteGewohnheit, setDeleteGewohnheit] = useState<Gewohnheiten | null>(null);

  // Filter for today's habits
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [e, p, g] = await Promise.all([
        LivingAppsService.getTaeglicheEintraege(),
        LivingAppsService.getTagesprotokoll(),
        LivingAppsService.getGewohnheiten(),
      ]);
      setEintraege(e);
      setProtokolle(p);
      setGewohnheiten(g);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Computed data ──
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const gewohnheitMap = useMemo(() => {
    const map = new Map<string, Gewohnheiten>();
    gewohnheiten.forEach(g => map.set(g.record_id, g));
    return map;
  }, [gewohnheiten]);

  // Weekly entries
  const weeklyEntries = useMemo(() =>
    eintraege.filter(e => {
      const d = e.fields.datum ? parseISO(e.fields.datum.split('T')[0]) : null;
      return d && d >= weekStart && d <= weekEnd;
    }), [eintraege, weekStart, weekEnd]);

  const weeklyCompleted = useMemo(() =>
    weeklyEntries.filter(e => e.fields.erledigt), [weeklyEntries]);

  // Today's entries
  const todayEntries = useMemo(() =>
    eintraege.filter(e => {
      const d = e.fields.datum ? e.fields.datum.split('T')[0] : null;
      return d === todayStr();
    }), [eintraege]);

  const todayCompletedIds = useMemo(() => {
    const ids = new Set<string>();
    todayEntries.forEach(e => {
      if (e.fields.erledigt) {
        const id = extractRecordId(e.fields.gewohnheit);
        if (id) ids.add(id);
      }
    });
    return ids;
  }, [todayEntries]);

  // Weekly completion rate
  const weeklyRate = useMemo(() => {
    if (gewohnheiten.length === 0) return 0;
    const daysElapsed = Math.min(7, Math.floor((now.getTime() - weekStart.getTime()) / 86400000) + 1);
    const totalPossible = gewohnheiten.length * daysElapsed;
    if (totalPossible === 0) return 0;
    return Math.round((weeklyCompleted.length / totalPossible) * 100);
  }, [weeklyCompleted, gewohnheiten, weekStart, now]);

  // Monthly rate
  const monthlyEntries = useMemo(() =>
    eintraege.filter(e => {
      const d = e.fields.datum ? parseISO(e.fields.datum.split('T')[0]) : null;
      return d && d >= monthStart && d <= now;
    }), [eintraege, monthStart, now]);

  const monthlyCompleted = useMemo(() =>
    monthlyEntries.filter(e => e.fields.erledigt), [monthlyEntries]);

  const monthlyRate = useMemo(() => {
    if (gewohnheiten.length === 0) return 0;
    const daysElapsed = Math.floor((now.getTime() - monthStart.getTime()) / 86400000) + 1;
    const totalPossible = gewohnheiten.length * daysElapsed;
    if (totalPossible === 0) return 0;
    return Math.round((monthlyCompleted.length / totalPossible) * 100);
  }, [monthlyCompleted, gewohnheiten, monthStart, now]);

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0;
    let checkDate = new Date();
    // Check today first — if no completions today, start from yesterday
    const todayHasCompletions = eintraege.some(e => {
      const d = e.fields.datum ? e.fields.datum.split('T')[0] : null;
      return d === format(checkDate, 'yyyy-MM-dd') && e.fields.erledigt;
    });
    if (!todayHasCompletions) {
      checkDate = subDays(checkDate, 1);
    }
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const hasCompletion = eintraege.some(e => {
        const d = e.fields.datum ? e.fields.datum.split('T')[0] : null;
        return d === dateStr && e.fields.erledigt;
      });
      if (hasCompletion) {
        count++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    return count;
  }, [eintraege]);

  // Chart data: 7 days of the current week
  const chartData = useMemo(() => {
    const days: { name: string; count: number; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = eintraege.filter(e => {
        const ed = e.fields.datum ? e.fields.datum.split('T')[0] : null;
        return ed === dateStr && e.fields.erledigt;
      }).length;
      days.push({
        name: format(d, 'EEEEEE', { locale: de }),
        count,
        isToday: isSameDay(d, now),
      });
    }
    return days;
  }, [eintraege, weekStart, now]);

  // Today's habits with completion status
  const todayHabits = useMemo(() => {
    const sorted = [...gewohnheiten].sort((a, b) => {
      const catA = a.fields.kategorie ?? 'sonstiges';
      const catB = b.fields.kategorie ?? 'sonstiges';
      if (catA !== catB) return catA.localeCompare(catB);
      return (a.fields.gewohnheit_name ?? '').localeCompare(b.fields.gewohnheit_name ?? '');
    });
    return sorted.map(g => ({
      habit: g,
      completed: todayCompletedIds.has(g.record_id),
      entry: todayEntries.find(e => extractRecordId(e.fields.gewohnheit) === g.record_id),
    }));
  }, [gewohnheiten, todayCompletedIds, todayEntries]);

  const filteredHabits = filterOpen ? todayHabits.filter(h => !h.completed) : todayHabits;

  // Recent protokolle
  const recentProtokolle = useMemo(() =>
    [...protokolle]
      .sort((a, b) => (b.fields.protokoll_datum ?? '').localeCompare(a.fields.protokoll_datum ?? ''))
      .slice(0, 5),
    [protokolle]);

  // Grouped Gewohnheiten
  const groupedGewohnheiten = useMemo(() => {
    const groups: Record<string, Gewohnheiten[]> = {};
    gewohnheiten.forEach(g => {
      const cat = g.fields.kategorie ?? 'sonstiges';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(g);
    });
    Object.values(groups).forEach(arr => arr.sort((a, b) =>
      (a.fields.gewohnheit_name ?? '').localeCompare(b.fields.gewohnheit_name ?? '')));
    return groups;
  }, [gewohnheiten]);

  // ── Toggle habit completion ──
  async function toggleHabit(habitId: string, currentEntry?: TaeglicheEintraege) {
    try {
      if (currentEntry) {
        await LivingAppsService.updateTaeglicheEintraegeEntry(currentEntry.record_id, {
          erledigt: !currentEntry.fields.erledigt,
        });
        toast.success(currentEntry.fields.erledigt ? 'Als offen markiert' : 'Erledigt!');
      } else {
        await LivingAppsService.createTaeglicheEintraegeEntry({
          gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, habitId),
          datum: todayStr(),
          erledigt: true,
        });
        toast.success('Erledigt!');
      }
      fetchAll();
    } catch {
      toast.error('Fehler beim Aktualisieren');
    }
  }

  // ── Delete handlers ──
  async function handleDeleteEintrag() {
    if (!deleteEintrag) return;
    await LivingAppsService.deleteTaeglicheEintraegeEntry(deleteEintrag.record_id);
    toast.success('Eintrag gelöscht');
    setDeleteEintrag(null);
    fetchAll();
  }

  async function handleDeleteProtokoll() {
    if (!deleteProtokoll) return;
    await LivingAppsService.deleteTagesprotokollEntry(deleteProtokoll.record_id);
    toast.success('Tageseintrag gelöscht');
    setDeleteProtokoll(null);
    fetchAll();
  }

  async function handleDeleteGewohnheit() {
    if (!deleteGewohnheit) return;
    await LivingAppsService.deleteGewohnheitenEntry(deleteGewohnheit.record_id);
    toast.success('Gewohnheit gelöscht');
    setDeleteGewohnheit(null);
    fetchAll();
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 font-['DM_Sans']">
        <div className="mx-auto max-w-[1200px] space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex justify-center py-12">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 font-['DM_Sans'] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="text-lg font-bold">Fehler beim Laden</h2>
            <p className="text-muted-foreground text-sm">{error.message}</p>
            <Button onClick={fetchAll}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['DM_Sans']">
      <Toaster position="top-right" richColors />

      {/* ── Desktop Layout ── */}
      <div className="mx-auto max-w-[1200px] p-4 md:p-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-lg md:text-2xl font-bold tracking-tight">Gewohnheitstracker</h1>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="hidden md:flex"
              onClick={() => setShowGewohnheitDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Gewohnheit
            </Button>
            <Button
              size="sm"
              className="hidden md:flex"
              onClick={() => setShowEintragDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Eintrag erfassen
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="md:hidden"
              onClick={() => setShowGewohnheitDialog(true)}
            >
              <Target className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* ── 3-Column Grid (Desktop) / Single Column (Mobile) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[45%_30%_25%] gap-6 lg:gap-8">

          {/* ── LEFT COLUMN: Hero + Chart ── */}
          <div className="space-y-6">
            {/* Hero Progress Ring */}
            <div className="flex flex-col items-center py-6 md:py-10" style={{ filter: 'drop-shadow(0 4px 20px hsl(158 45% 30% / 0.1))' }}>
              <div className="relative">
                <ProgressRing percentage={weeklyRate} size={200} strokeWidth={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold leading-none">{weeklyRate}%</span>
                  <span className="text-[13px] font-light text-muted-foreground mt-1">diese Woche</span>
                </div>
              </div>
              <p className="text-sm font-medium mt-4 text-muted-foreground">
                {weeklyCompleted.length} von {gewohnheiten.length * Math.min(7, Math.floor((now.getTime() - weekStart.getTime()) / 86400000) + 1)} Gewohnheiten erledigt
              </p>
            </div>

            {/* Quick Stats Row (Mobile) */}
            <div className="flex items-center justify-around py-3 lg:hidden">
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Streak</p>
                <p className="text-xl font-bold flex items-center gap-1 justify-center">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {streak} <span className="text-sm font-normal text-muted-foreground">Tage</span>
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Heute</p>
                <p className="text-xl font-bold">
                  {todayCompletedIds.size} <span className="text-sm font-normal text-muted-foreground">/ {gewohnheiten.length}</span>
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Monat</p>
                <p className="text-xl font-bold">{monthlyRate}%</p>
              </div>
            </div>

            {/* Weekly Chart */}
            <Card className="border shadow-none hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Wochenverlauf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] md:h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="25%">
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: 'hsl(160 8% 48%)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: 'hsl(160 8% 48%)' }}
                        axisLine={false}
                        tickLine={false}
                        className="hidden md:block"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(40 33% 99%)',
                          border: '1px solid hsl(40 18% 88%)',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                        formatter={(value: number) => [`${value} erledigt`, 'Gewohnheiten']}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.isToday ? 'hsl(158 45% 30%)' : 'hsl(158 45% 30% / 0.5)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── CENTER COLUMN: Today's Habits ── */}
          <div className="space-y-6">
            <Card className="border shadow-none hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold">Heute</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={filterOpen ? 'default' : 'ghost'}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setFilterOpen(!filterOpen)}
                  >
                    {filterOpen ? 'Offen' : 'Alle'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                {filteredHabits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm px-6">
                    {filterOpen ? 'Alle Gewohnheiten erledigt!' : (
                      <>
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p>Noch keine Gewohnheiten angelegt.</p>
                        <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowGewohnheitDialog(true)}>
                          <Plus className="h-4 w-4 mr-1" /> Erste Gewohnheit anlegen
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredHabits.map(({ habit, completed, entry }, idx) => (
                      <div
                        key={habit.record_id}
                        className={`flex items-center gap-3 px-6 py-3 group hover:bg-muted/50 transition-colors cursor-pointer ${
                          idx < filteredHabits.length - 1 ? 'border-b' : ''
                        }`}
                      >
                        {/* Category dot */}
                        <div
                          className="w-[6px] h-[6px] rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[habit.fields.kategorie ?? 'sonstiges'] }}
                        />
                        {/* Name + frequency */}
                        <div
                          className="flex-1 min-w-0"
                          onClick={() => {
                            if (entry) setEditEintrag(entry);
                            else {
                              setEditEintrag(null);
                              setShowEintragDialog(true);
                            }
                          }}
                        >
                          <p className="text-[15px] font-medium truncate">{habit.fields.gewohnheit_name}</p>
                          <Badge variant="secondary" className="text-[11px] font-normal mt-0.5">
                            {FREQUENCY_LABELS[habit.fields.ziel_haeufigkeit ?? 'taeglich'] ?? habit.fields.ziel_haeufigkeit}
                          </Badge>
                        </div>
                        {/* Menge input for measurable habits */}
                        {habit.fields.messbar && entry && (
                          <Input
                            type="number"
                            className="w-16 h-8 text-sm text-center"
                            value={entry.fields.menge ?? ''}
                            onClick={e => e.stopPropagation()}
                            onChange={async (e) => {
                              const val = e.target.value ? Number(e.target.value) : undefined;
                              try {
                                await LivingAppsService.updateTaeglicheEintraegeEntry(entry.record_id, { menge: val });
                                fetchAll();
                              } catch { /* ignore */ }
                            }}
                          />
                        )}
                        {/* Edit/Delete on hover (desktop) */}
                        <div className="hidden group-hover:flex gap-1 shrink-0">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={e => { e.stopPropagation(); entry ? setEditEintrag(entry) : setShowEintragDialog(true); }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {entry && (
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={e => { e.stopPropagation(); setDeleteEintrag(entry); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        {/* Checkbox */}
                        <button
                          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-110 ${
                            completed
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={e => { e.stopPropagation(); toggleHabit(habit.record_id, entry); }}
                        >
                          {completed && <Check className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tagesnotizen Section (Mobile shows here, Desktop in right column) */}
            <div className="lg:hidden">
              <Card className="border shadow-none hover:shadow-sm transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Tagesnotizen
                  </CardTitle>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowProtokollDialog(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentProtokolle.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p>Noch keine Tagesnotizen.</p>
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowProtokollDialog(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Erste Notiz
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentProtokolle.map(p => {
                        const habitId = extractRecordId(p.fields.erledigte_gewohnheiten);
                        const habitName = habitId ? gewohnheitMap.get(habitId)?.fields.gewohnheit_name : null;
                        return (
                          <div
                            key={p.record_id}
                            className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                            onClick={() => setEditProtokoll(p)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-[13px] font-bold">
                                {p.fields.protokoll_datum ? format(parseISO(p.fields.protokoll_datum), 'dd.MM.yyyy', { locale: de }) : '—'}
                              </p>
                              <div className="hidden group-hover:flex gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); setEditProtokoll(p); }}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); setDeleteProtokoll(p); }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm font-light text-foreground/80 mt-1 line-clamp-2">
                              {p.fields.tagesnotizen || 'Keine Notizen'}
                            </p>
                            {habitName && (
                              <Badge variant="secondary" className="text-[11px] mt-2">{habitName}</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── RIGHT COLUMN (Desktop only: Stats + Journal + Habits) ── */}
          <div className="hidden lg:flex flex-col gap-6">
            {/* Quick Stats Stack */}
            <div className="space-y-3">
              <Card className="border shadow-none">
                <CardContent className="py-4 px-5 flex items-center gap-3">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Streak</p>
                    <p className="text-2xl font-bold">{streak} <span className="text-sm font-normal text-muted-foreground">Tage</span></p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border shadow-none">
                <CardContent className="py-4 px-5 flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Heute</p>
                    <p className="text-2xl font-bold">{todayCompletedIds.size} <span className="text-sm font-normal text-muted-foreground">/ {gewohnheiten.length}</span></p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border shadow-none">
                <CardContent className="py-4 px-5 flex items-center gap-3">
                  <Target className="h-5 w-5 text-chart-2" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Monatsrate</p>
                    <p className="text-2xl font-bold">{monthlyRate}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Journal (Desktop) */}
            <Card className="border shadow-none hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Tagesnotizen
                </CardTitle>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowProtokollDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {recentProtokolle.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <p>Noch keine Notizen.</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setShowProtokollDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Erste Notiz
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProtokolle.map(p => {
                      const habitId = extractRecordId(p.fields.erledigte_gewohnheiten);
                      const habitName = habitId ? gewohnheitMap.get(habitId)?.fields.gewohnheit_name : null;
                      return (
                        <div
                          key={p.record_id}
                          className="p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                          onClick={() => setEditProtokoll(p)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[13px] font-bold">
                              {p.fields.protokoll_datum ? format(parseISO(p.fields.protokoll_datum), 'dd.MM.yyyy', { locale: de }) : '—'}
                            </p>
                            <div className="hidden group-hover:flex gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); setEditProtokoll(p); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); setDeleteProtokoll(p); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-[13px] font-light text-foreground/80 mt-1 line-clamp-2">
                            {p.fields.tagesnotizen || 'Keine Notizen'}
                          </p>
                          {habitName && (
                            <Badge variant="secondary" className="text-[10px] mt-1.5">{habitName}</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Habit Management (Desktop) */}
            <Card className="border shadow-none hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-bold">Meine Gewohnheiten</CardTitle>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowGewohnheitDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {gewohnheiten.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <p>Noch keine Gewohnheiten.</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setShowGewohnheitDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Erste Gewohnheit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {Object.entries(groupedGewohnheiten).map(([cat, habits]) => (
                      <div key={cat}>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                          {CATEGORY_LABELS[cat] ?? cat}
                        </p>
                        {habits.map(h => (
                          <div
                            key={h.record_id}
                            className="flex items-center justify-between py-2 px-1 rounded hover:bg-muted/50 cursor-pointer group transition-colors"
                            onClick={() => setEditGewohnheit(h)}
                          >
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium truncate">{h.fields.gewohnheit_name}</p>
                              <div className="flex gap-1.5 mt-0.5">
                                <Badge variant="secondary" className="text-[10px]">
                                  {FREQUENCY_LABELS[h.fields.ziel_haeufigkeit ?? 'taeglich']}
                                </Badge>
                                {h.fields.messbar && <Badge variant="outline" className="text-[10px]">Messbar</Badge>}
                              </div>
                            </div>
                            <div className="hidden group-hover:flex gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); setEditGewohnheit(h); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); setDeleteGewohnheit(h); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Mobile-only: Meine Gewohnheiten ── */}
        <div className="lg:hidden mt-6">
          <Card className="border shadow-none hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold">Meine Gewohnheiten</CardTitle>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowGewohnheitDialog(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {gewohnheiten.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <p>Noch keine Gewohnheiten.</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => setShowGewohnheitDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Erste Gewohnheit
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedGewohnheiten).map(([cat, habits]) => (
                    <div key={cat}>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                        {CATEGORY_LABELS[cat] ?? cat}
                      </p>
                      {habits.map(h => (
                        <div
                          key={h.record_id}
                          className="flex items-center justify-between py-3 px-1 border-b last:border-0"
                          onClick={() => setEditGewohnheit(h)}
                        >
                          <div className="min-w-0">
                            <p className="text-[15px] font-medium truncate">{h.fields.gewohnheit_name}</p>
                            <div className="flex gap-1.5 mt-1">
                              <Badge variant="secondary" className="text-[11px]">
                                {FREQUENCY_LABELS[h.fields.ziel_haeufigkeit ?? 'taeglich']}
                              </Badge>
                              {h.fields.messbar && <Badge variant="outline" className="text-[11px]">Messbar</Badge>}
                            </div>
                            {h.fields.beschreibung && (
                              <p className="text-[13px] text-muted-foreground mt-1 line-clamp-1">{h.fields.beschreibung}</p>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); setEditGewohnheit(h); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={e => { e.stopPropagation(); setDeleteGewohnheit(h); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* spacer for mobile fixed button */}
        <div className="h-20 lg:hidden" />
      </div>

      {/* ── Mobile Fixed Bottom Action ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(12px,env(safe-area-inset-bottom))] bg-background/80 backdrop-blur-sm border-t lg:hidden">
        <Button className="w-full h-12 text-base font-bold" onClick={() => setShowEintragDialog(true)}>
          <Plus className="h-5 w-5 mr-2" /> Eintrag erfassen
        </Button>
      </div>

      {/* ── Dialogs ── */}
      {/* Create Eintrag */}
      <EintragDialog
        open={showEintragDialog}
        onOpenChange={setShowEintragDialog}
        record={null}
        gewohnheiten={gewohnheiten}
        onSuccess={fetchAll}
      />
      {/* Edit Eintrag */}
      <EintragDialog
        open={!!editEintrag}
        onOpenChange={open => { if (!open) setEditEintrag(null); }}
        record={editEintrag}
        gewohnheiten={gewohnheiten}
        onSuccess={fetchAll}
      />
      {/* Delete Eintrag */}
      <DeleteConfirmDialog
        open={!!deleteEintrag}
        onOpenChange={open => { if (!open) setDeleteEintrag(null); }}
        title="Eintrag löschen?"
        description={`Möchtest du diesen Eintrag vom ${deleteEintrag?.fields.datum?.split('T')[0] ?? ''} wirklich löschen?`}
        onConfirm={handleDeleteEintrag}
      />

      {/* Create Protokoll */}
      <ProtokollDialog
        open={showProtokollDialog}
        onOpenChange={setShowProtokollDialog}
        record={null}
        gewohnheiten={gewohnheiten}
        onSuccess={fetchAll}
      />
      {/* Edit Protokoll */}
      <ProtokollDialog
        open={!!editProtokoll}
        onOpenChange={open => { if (!open) setEditProtokoll(null); }}
        record={editProtokoll}
        gewohnheiten={gewohnheiten}
        onSuccess={fetchAll}
      />
      {/* Delete Protokoll */}
      <DeleteConfirmDialog
        open={!!deleteProtokoll}
        onOpenChange={open => { if (!open) setDeleteProtokoll(null); }}
        title="Tageseintrag löschen?"
        description={`Möchtest du den Tageseintrag vom ${deleteProtokoll?.fields.protokoll_datum ?? ''} wirklich löschen?`}
        onConfirm={handleDeleteProtokoll}
      />

      {/* Create Gewohnheit */}
      <GewohnheitDialog
        open={showGewohnheitDialog}
        onOpenChange={setShowGewohnheitDialog}
        record={null}
        onSuccess={fetchAll}
      />
      {/* Edit Gewohnheit */}
      <GewohnheitDialog
        open={!!editGewohnheit}
        onOpenChange={open => { if (!open) setEditGewohnheit(null); }}
        record={editGewohnheit}
        onSuccess={fetchAll}
      />
      {/* Delete Gewohnheit */}
      <DeleteConfirmDialog
        open={!!deleteGewohnheit}
        onOpenChange={open => { if (!open) setDeleteGewohnheit(null); }}
        title="Gewohnheit löschen?"
        description={`Möchtest du die Gewohnheit "${deleteGewohnheit?.fields.gewohnheit_name ?? ''}" wirklich löschen? Zugehörige Einträge bleiben erhalten.`}
        onConfirm={handleDeleteGewohnheit}
      />
    </div>
  );
}
