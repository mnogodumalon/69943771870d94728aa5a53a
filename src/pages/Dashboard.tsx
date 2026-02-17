import { useState, useEffect, useMemo } from 'react';
import type { TaeglicheEintraege, Tagesprotokoll, Gewohnheiten } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { format, parseISO, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Plus,
  Pencil,
  Trash2,
  Flame,
  Settings,
  Calendar,
  Target,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Toaster } from 'sonner';

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

// Helper to get today's date string
function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// Progress Ring Component
function ProgressRing({
  completed,
  total,
  size = 200,
}: {
  completed: number;
  total: number;
  size?: number;
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
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
          stroke="hsl(var(--accent))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: percentage === 100 ? 'drop-shadow(0 0 8px hsl(var(--accent)))' : 'none',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-foreground">
          {completed}/{total}
        </span>
        <span className="text-sm text-muted-foreground mt-1">Heute erledigt</span>
      </div>
    </div>
  );
}

// Gewohnheit Dialog for Create/Edit
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
    kategorie: 'sonstiges' as string,
    ziel_haeufigkeit: 'taeglich' as string,
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
      const payload = {
        gewohnheit_name: formData.gewohnheit_name,
        beschreibung: formData.beschreibung || undefined,
        kategorie: formData.kategorie as Gewohnheiten['fields']['kategorie'],
        ziel_haeufigkeit: formData.ziel_haeufigkeit as Gewohnheiten['fields']['ziel_haeufigkeit'],
        startdatum: formData.startdatum || undefined,
        zielwert: formData.zielwert || undefined,
        messbar: formData.messbar,
      };

      if (isEditing) {
        await LivingAppsService.updateGewohnheitenEntry(gewohnheit!.record_id, payload);
        toast.success('Gewohnheit aktualisiert');
      } else {
        await LivingAppsService.createGewohnheitenEntry(payload);
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
            <Label htmlFor="gewohnheit_name">Name *</Label>
            <Input
              id="gewohnheit_name"
              value={formData.gewohnheit_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, gewohnheit_name: e.target.value }))}
              placeholder="z.B. 30 Minuten lesen"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={formData.beschreibung}
              onChange={(e) => setFormData((prev) => ({ ...prev, beschreibung: e.target.value }))}
              placeholder="Optionale Details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select
                value={formData.kategorie}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, kategorie: v }))}
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
                onValueChange={(v) => setFormData((prev) => ({ ...prev, ziel_haeufigkeit: v }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, startdatum: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zielwert">Zielwert (optional)</Label>
            <Input
              id="zielwert"
              value={formData.zielwert}
              onChange={(e) => setFormData((prev) => ({ ...prev, zielwert: e.target.value }))}
              placeholder="z.B. 30 Minuten, 2 Liter"
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
            <Label htmlFor="messbar" className="cursor-pointer">
              Mit Mengen/Zahlen tracken
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

// Eintrag Dialog for Create/Edit daily entry
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
  preselectedGewohnheitId?: string | null;
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

  // Get selected gewohnheit to check if it's messbar
  const selectedGewohnheit = useMemo(() => {
    return gewohnheiten.find((g) => g.record_id === formData.gewohnheit);
  }, [gewohnheiten, formData.gewohnheit]);

  useEffect(() => {
    if (open) {
      const gewohnheitId = eintrag
        ? extractRecordId(eintrag.fields.gewohnheit)
        : preselectedGewohnheitId;
      setFormData({
        gewohnheit: gewohnheitId ?? '',
        datum: eintrag?.fields.datum ?? getTodayString(),
        erledigt: eintrag?.fields.erledigt ?? true,
        menge: eintrag?.fields.menge?.toString() ?? '',
        notizen: eintrag?.fields.notizen ?? '',
      });
    }
  }, [open, eintrag, preselectedGewohnheitId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.gewohnheit) {
      toast.error('Bitte wähle eine Gewohnheit aus');
      return;
    }
    setSubmitting(true);

    try {
      const payload: TaeglicheEintraege['fields'] = {
        gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, formData.gewohnheit),
        datum: formData.datum,
        erledigt: formData.erledigt,
        menge: formData.menge ? parseFloat(formData.menge) : undefined,
        notizen: formData.notizen || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateTaeglicheEintraegeEntry(eintrag!.record_id, payload);
        toast.success('Eintrag aktualisiert');
      } else {
        await LivingAppsService.createTaeglicheEintraegeEntry(payload);
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
          <DialogTitle>{isEditing ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Gewohnheit *</Label>
            <Select
              value={formData.gewohnheit || 'select-placeholder'}
              onValueChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  gewohnheit: v === 'select-placeholder' ? '' : v,
                }))
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
              onChange={(e) => setFormData((prev) => ({ ...prev, datum: e.target.value }))}
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
            <Label htmlFor="erledigt" className="cursor-pointer">
              Erledigt
            </Label>
          </div>

          {selectedGewohnheit?.fields.messbar && (
            <div className="space-y-2">
              <Label htmlFor="menge">Menge/Wert</Label>
              <Input
                id="menge"
                type="number"
                step="any"
                value={formData.menge}
                onChange={(e) => setFormData((prev) => ({ ...prev, menge: e.target.value }))}
                placeholder="z.B. 30"
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

// Tagesprotokoll Dialog
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
      setFormData({
        protokoll_datum: protokoll?.fields.protokoll_datum ?? getTodayString(),
        erledigte_gewohnheiten: protokoll?.fields.erledigte_gewohnheiten
          ? extractRecordId(protokoll.fields.erledigte_gewohnheiten) ?? ''
          : '',
        tagesnotizen: protokoll?.fields.tagesnotizen ?? '',
      });
    }
  }, [open, protokoll]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.tagesnotizen.trim()) {
      toast.error('Bitte gib eine Notiz ein');
      return;
    }
    setSubmitting(true);

    try {
      const payload: Tagesprotokoll['fields'] = {
        protokoll_datum: formData.protokoll_datum,
        erledigte_gewohnheiten: formData.erledigte_gewohnheiten
          ? createRecordUrl(APP_IDS.GEWOHNHEITEN, formData.erledigte_gewohnheiten)
          : undefined,
        tagesnotizen: formData.tagesnotizen,
      };

      if (isEditing) {
        await LivingAppsService.updateTagesprotokollEntry(protokoll!.record_id, payload);
        toast.success('Tagesprotokoll aktualisiert');
      } else {
        await LivingAppsService.createTagesprotokollEntry(payload);
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
          <DialogTitle>
            {isEditing ? 'Tagesprotokoll bearbeiten' : 'Tagesprotokoll erstellen'}
          </DialogTitle>
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
            <Label>Highlight-Gewohnheit (optional)</Label>
            <Select
              value={formData.erledigte_gewohnheiten || 'none'}
              onValueChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  erledigte_gewohnheiten: v === 'none' ? '' : v,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Keine Auswahl" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Auswahl</SelectItem>
                {gewohnheiten.map((g) => (
                  <SelectItem key={g.record_id} value={g.record_id}>
                    {g.fields.gewohnheit_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagesnotizen">Notizen zum Tag *</Label>
            <Textarea
              id="tagesnotizen"
              value={formData.tagesnotizen}
              onChange={(e) => setFormData((prev) => ({ ...prev, tagesnotizen: e.target.value }))}
              placeholder="Was war heute besonders? Wie hast du dich gefühlt?"
              rows={4}
              required
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
    } catch (err) {
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
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? 'Löscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Habit Card for today's habits list
function HabitCard({
  gewohnheit,
  todayEntry,
  onToggle,
  onEdit,
  onDelete,
}: {
  gewohnheit: Gewohnheiten;
  todayEntry?: TaeglicheEintraege;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isCompleted = todayEntry?.fields.erledigt ?? false;

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
        isCompleted ? 'bg-accent/5 border-accent/30' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            <Checkbox
              checked={isCompleted}
              className="h-6 w-6 rounded-full"
              onCheckedChange={() => onToggle()}
            />
          </div>
          <div className="flex-1 min-w-0" onClick={onEdit}>
            <div
              className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
            >
              {gewohnheit.fields.gewohnheit_name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {KATEGORIE_LABELS[gewohnheit.fields.kategorie || 'sonstiges']}
              </Badge>
              {gewohnheit.fields.messbar && todayEntry?.fields.menge != null && (
                <span className="text-xs text-muted-foreground">
                  {todayEntry.fields.menge} {gewohnheit.fields.zielwert}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Week Day Dot
function WeekDayDot({
  date,
  completedCount,
  totalCount,
  isToday: isTodayProp,
}: {
  date: Date;
  completedCount: number;
  totalCount: number;
  isToday: boolean;
}) {
  const percentage = totalCount > 0 ? completedCount / totalCount : 0;
  let bgColor = 'bg-muted';
  if (percentage === 1) bgColor = 'bg-accent';
  else if (percentage >= 0.5) bgColor = 'bg-accent/50';
  else if (percentage > 0) bgColor = 'bg-accent/25';

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground">{format(date, 'EEEEEE', { locale: de })}</span>
      <div
        className={`w-6 h-6 rounded-full ${bgColor} ${
          isTodayProp ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
      />
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex justify-center">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
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

  // Dialog state
  const [showGewohnheitDialog, setShowGewohnheitDialog] = useState(false);
  const [editGewohnheit, setEditGewohnheit] = useState<Gewohnheiten | null>(null);
  const [showEintragDialog, setShowEintragDialog] = useState(false);
  const [editEintrag, setEditEintrag] = useState<TaeglicheEintraege | null>(null);
  const [preselectedGewohnheitId, setPreselectedGewohnheitId] = useState<string | null>(null);
  const [showProtokollDialog, setShowProtokollDialog] = useState(false);
  const [editProtokoll, setEditProtokoll] = useState<Tagesprotokoll | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'gewohnheit' | 'eintrag' | 'protokoll';
    item: Gewohnheiten | TaeglicheEintraege | Tagesprotokoll;
  } | null>(null);

  // FAB menu state
  const [showFabMenu, setShowFabMenu] = useState(false);

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

  // Computed values
  const today = getTodayString();

  const todayEntries = useMemo(() => {
    return eintraege.filter((e) => e.fields.datum === today);
  }, [eintraege, today]);

  const todayEntriesMap = useMemo(() => {
    const map = new Map<string, TaeglicheEintraege>();
    todayEntries.forEach((entry) => {
      const gewohnheitId = extractRecordId(entry.fields.gewohnheit);
      if (gewohnheitId) {
        map.set(gewohnheitId, entry);
      }
    });
    return map;
  }, [todayEntries]);

  const completedToday = useMemo(() => {
    return todayEntries.filter((e) => e.fields.erledigt).length;
  }, [todayEntries]);

  const totalHabits = gewohnheiten.length;

  // Calculate streak
  const streak = useMemo(() => {
    if (gewohnheiten.length === 0) return 0;

    let currentStreak = 0;
    const dateToCheck = new Date();

    while (true) {
      const dateStr = format(dateToCheck, 'yyyy-MM-dd');
      const dayEntries = eintraege.filter(
        (e) => e.fields.datum === dateStr && e.fields.erledigt
      );

      // If today and no entries yet, check yesterday
      if (isToday(dateToCheck) && dayEntries.length === 0) {
        dateToCheck.setDate(dateToCheck.getDate() - 1);
        continue;
      }

      // Check if all habits were completed on this day
      if (dayEntries.length >= gewohnheiten.length) {
        currentStreak++;
        dateToCheck.setDate(dateToCheck.getDate() - 1);
      } else {
        break;
      }

      // Safety limit
      if (currentStreak > 365) break;
    }

    return currentStreak;
  }, [eintraege, gewohnheiten]);

  // Weekly chart data
  const weekData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const data = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayEntries = eintraege.filter(
        (e) => e.fields.datum === dateStr && e.fields.erledigt
      );

      data.push({
        name: format(date, 'EEEEEE', { locale: de }),
        date: date,
        dateStr: dateStr,
        completed: dayEntries.length,
        total: gewohnheiten.length,
      });
    }

    return data;
  }, [eintraege, gewohnheiten]);

  // Today's protocol
  const todayProtokoll = useMemo(() => {
    return protokolle.find((p) => p.fields.protokoll_datum === today);
  }, [protokolle, today]);

  // Sort habits: pending first
  const sortedGewohnheiten = useMemo(() => {
    return [...gewohnheiten].sort((a, b) => {
      const aCompleted = todayEntriesMap.get(a.record_id)?.fields.erledigt ?? false;
      const bCompleted = todayEntriesMap.get(b.record_id)?.fields.erledigt ?? false;
      if (aCompleted === bCompleted) {
        return (a.fields.gewohnheit_name ?? '').localeCompare(b.fields.gewohnheit_name ?? '');
      }
      return aCompleted ? 1 : -1;
    });
  }, [gewohnheiten, todayEntriesMap]);

  // Toggle habit completion
  async function handleToggleHabit(gewohnheit: Gewohnheiten) {
    const existingEntry = todayEntriesMap.get(gewohnheit.record_id);

    try {
      if (existingEntry) {
        // Toggle existing entry
        await LivingAppsService.updateTaeglicheEintraegeEntry(existingEntry.record_id, {
          erledigt: !existingEntry.fields.erledigt,
        });
        toast.success(existingEntry.fields.erledigt ? 'Rückgängig gemacht' : 'Erledigt!');
      } else {
        // Create new entry
        await LivingAppsService.createTaeglicheEintraegeEntry({
          gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, gewohnheit.record_id),
          datum: today,
          erledigt: true,
        });
        toast.success('Erledigt!');
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
          break;
        case 'eintrag':
          await LivingAppsService.deleteTaeglicheEintraegeEntry(deleteTarget.item.record_id);
          toast.success('Eintrag gelöscht');
          break;
        case 'protokoll':
          await LivingAppsService.deleteTagesprotokollEntry(deleteTarget.item.record_id);
          toast.success('Tagesprotokoll gelöscht');
          break;
      }
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      throw err;
    }
  }

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-destructive mb-4">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Fehler beim Laden</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={fetchData}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state (no habits)
  if (gewohnheiten.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Toaster richColors position="top-center" />
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-primary mb-4">
              <CheckCircle2 className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Keine Gewohnheiten</h2>
            <p className="text-muted-foreground mb-4">
              Erstelle deine erste Gewohnheit, um loszulegen!
            </p>
            <Button onClick={() => setShowGewohnheitDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Gewohnheit
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
      <Toaster richColors position="top-center" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold">Gewohnheiten</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={() => setShowGewohnheitDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Gewohnheit
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column (Main) - 3/5 on desktop */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero Section */}
            <section className="flex flex-col items-center py-8">
              <ProgressRing completed={completedToday} total={totalHabits} size={200} />

              {streak > 0 && (
                <Badge variant="secondary" className="mt-4 text-sm">
                  <Flame className="h-4 w-4 mr-1 text-orange-500" />
                  {streak} Tage Streak
                </Badge>
              )}
            </section>

            {/* Today's Habits */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Heute
                  <Badge variant="outline">{totalHabits} Gewohnheiten</Badge>
                </h2>
              </div>

              <div className="space-y-3">
                {sortedGewohnheiten.map((g) => (
                  <HabitCard
                    key={g.record_id}
                    gewohnheit={g}
                    todayEntry={todayEntriesMap.get(g.record_id)}
                    onToggle={() => handleToggleHabit(g)}
                    onEdit={() => {
                      const entry = todayEntriesMap.get(g.record_id);
                      if (entry) {
                        setEditEintrag(entry);
                        setPreselectedGewohnheitId(null);
                      } else {
                        setEditEintrag(null);
                        setPreselectedGewohnheitId(g.record_id);
                      }
                      setShowEintragDialog(true);
                    }}
                    onDelete={() => {
                      const entry = todayEntriesMap.get(g.record_id);
                      if (entry) {
                        setDeleteTarget({ type: 'eintrag', item: entry });
                      }
                    }}
                  />
                ))}
              </div>
            </section>

            {/* Mobile Week Overview */}
            <section className="lg:hidden">
              <h2 className="text-lg font-semibold mb-4">Diese Woche</h2>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    {weekData.map((day, i) => (
                      <WeekDayDot
                        key={i}
                        date={day.date}
                        completedCount={day.completed}
                        totalCount={day.total}
                        isToday={isSameDay(day.date, new Date())}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Column (Supporting) - 2/5 on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Desktop Week Chart */}
            <section className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Diese Woche</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis
                          domain={[0, totalHabits]}
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value} erledigt`, '']}
                        />
                        <Bar dataKey="completed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* All Habits Management */}
            <section>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Alle Gewohnheiten</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditGewohnheit(null);
                      setShowGewohnheitDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {gewohnheiten.map((g) => (
                    <div
                      key={g.record_id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {g.fields.gewohnheit_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {HAEUFIGKEIT_LABELS[g.fields.ziel_haeufigkeit || 'taeglich']}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditGewohnheit(g);
                            setShowGewohnheitDialog(true);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget({ type: 'gewohnheit', item: g })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            {/* Daily Journal */}
            <section>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Tagesprotokoll
                  </CardTitle>
                  {!todayProtokoll && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditProtokoll(null);
                        setShowProtokollDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {todayProtokoll ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {todayProtokoll.fields.tagesnotizen?.substring(0, 200)}
                        {(todayProtokoll.fields.tagesnotizen?.length ?? 0) > 200 && '...'}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditProtokoll(todayProtokoll);
                            setShowProtokollDialog(true);
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setDeleteTarget({ type: 'protokoll', item: todayProtokoll })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Noch kein Eintrag für heute. Wie war dein Tag?
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Recent Protokolle */}
            {protokolle.length > 0 && (
              <section>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Letzte Einträge</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {protokolle
                      .filter((p) => p.fields.protokoll_datum !== today)
                      .sort(
                        (a, b) =>
                          (b.fields.protokoll_datum ?? '').localeCompare(
                            a.fields.protokoll_datum ?? ''
                          )
                      )
                      .slice(0, 3)
                      .map((p) => (
                        <div
                          key={p.record_id}
                          className="p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setEditProtokoll(p);
                            setShowProtokollDialog(true);
                          }}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {p.fields.protokoll_datum
                              ? format(parseISO(p.fields.protokoll_datum), 'PPP', { locale: de })
                              : '-'}
                          </div>
                          <p className="text-sm line-clamp-2">
                            {p.fields.tagesnotizen?.substring(0, 100)}
                            {(p.fields.tagesnotizen?.length ?? 0) > 100 && '...'}
                          </p>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        {showFabMenu && (
          <div className="absolute bottom-16 right-0 bg-card border rounded-xl shadow-xl p-2 space-y-1 min-w-[180px] animate-in fade-in slide-in-from-bottom-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setShowFabMenu(false);
                setEditEintrag(null);
                setPreselectedGewohnheitId(null);
                setShowEintragDialog(true);
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Eintrag hinzufügen
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setShowFabMenu(false);
                setEditGewohnheit(null);
                setShowGewohnheitDialog(true);
              }}
            >
              <Target className="h-4 w-4 mr-2" />
              Neue Gewohnheit
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setShowFabMenu(false);
                setEditProtokoll(null);
                setShowProtokollDialog(true);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Tagesprotokoll
            </Button>
          </div>
        )}
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowFabMenu(!showFabMenu)}
        >
          <Plus className={`h-6 w-6 transition-transform ${showFabMenu ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      {/* Dialogs */}
      <GewohnheitDialog
        open={showGewohnheitDialog}
        onOpenChange={(open) => {
          setShowGewohnheitDialog(open);
          if (!open) setEditGewohnheit(null);
        }}
        gewohnheit={editGewohnheit}
        onSuccess={fetchData}
      />

      <EintragDialog
        open={showEintragDialog}
        onOpenChange={(open) => {
          setShowEintragDialog(open);
          if (!open) {
            setEditEintrag(null);
            setPreselectedGewohnheitId(null);
          }
        }}
        eintrag={editEintrag}
        gewohnheiten={gewohnheiten}
        preselectedGewohnheitId={preselectedGewohnheitId}
        onSuccess={fetchData}
      />

      <TagesprotokollDialog
        open={showProtokollDialog}
        onOpenChange={(open) => {
          setShowProtokollDialog(open);
          if (!open) setEditProtokoll(null);
        }}
        protokoll={editProtokoll}
        gewohnheiten={gewohnheiten}
        onSuccess={fetchData}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget?.type === 'gewohnheit'
            ? 'Gewohnheit löschen?'
            : deleteTarget?.type === 'eintrag'
            ? 'Eintrag löschen?'
            : 'Tagesprotokoll löschen?'
        }
        description={
          deleteTarget?.type === 'gewohnheit'
            ? `Möchtest du die Gewohnheit "${(deleteTarget?.item as Gewohnheiten)?.fields?.gewohnheit_name}" wirklich löschen? Alle zugehörigen Einträge bleiben erhalten.`
            : deleteTarget?.type === 'eintrag'
            ? 'Möchtest du diesen Eintrag wirklich löschen?'
            : `Möchtest du den Tageseintrag vom ${
                (deleteTarget?.item as Tagesprotokoll)?.fields?.protokoll_datum
                  ? format(
                      parseISO((deleteTarget?.item as Tagesprotokoll).fields.protokoll_datum!),
                      'PPP',
                      { locale: de }
                    )
                  : ''
              } wirklich löschen?`
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
