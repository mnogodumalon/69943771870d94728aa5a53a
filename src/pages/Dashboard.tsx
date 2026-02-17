import { useState, useEffect, useMemo } from 'react';
import type { Gewohnheiten, TaeglicheEintraege, Tagesprotokoll } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { format, parseISO, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// Icons
import {
  Plus,
  Pencil,
  Trash2,
  Settings,
  Target,
  Flame,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
} from 'lucide-react';

// Constants
const KATEGORIE_LABELS: Record<string, string> = {
  gesundheit_fitness: 'Gesundheit & Fitness',
  ernaehrung: 'Ernährung',
  produktivitaet: 'Produktivität',
  persoenliche_entwicklung: 'Persönliche Entwicklung',
  soziales: 'Soziales',
  finanzen: 'Finanzen',
  sonstiges: 'Sonstiges',
};

const KATEGORIE_COLORS: Record<string, string> = {
  gesundheit_fitness: 'bg-green-100 text-green-800',
  ernaehrung: 'bg-orange-100 text-orange-800',
  produktivitaet: 'bg-blue-100 text-blue-800',
  persoenliche_entwicklung: 'bg-purple-100 text-purple-800',
  soziales: 'bg-pink-100 text-pink-800',
  finanzen: 'bg-yellow-100 text-yellow-800',
  sonstiges: 'bg-gray-100 text-gray-800',
};

const HAEUFIGKEIT_LABELS: Record<string, string> = {
  taeglich: 'Täglich',
  mehrmals_woche: 'Mehrmals pro Woche',
  woechentlich: 'Wöchentlich',
  monatlich: 'Monatlich',
};

// Helper functions
function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function getWeekDays(): Date[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Progress Ring Component
function ProgressRing({
  percentage,
  size = 180,
  strokeWidth = 10,
  className = '',
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-600 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold">{Math.round(percentage)}%</span>
        <span className="text-sm text-muted-foreground mt-1">Heute erledigt</span>
      </div>
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Hero skeleton */}
        <div className="flex flex-col items-center py-8">
          <Skeleton className="h-44 w-44 rounded-full" />
          <div className="flex gap-4 mt-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        {/* Habits skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Empty State
function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Target className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
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
      toast.error('Bitte gib einen Namen für die Gewohnheit ein.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        gewohnheit_name: formData.gewohnheit_name,
        beschreibung: formData.beschreibung || undefined,
        kategorie: formData.kategorie,
        ziel_haeufigkeit: formData.ziel_haeufigkeit,
        startdatum: formData.startdatum,
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
            <Label htmlFor="gewohnheit_name">Name der Gewohnheit *</Label>
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
              placeholder="Warum ist diese Gewohnheit wichtig für dich?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kategorie">Kategorie</Label>
              <Select
                value={formData.kategorie || 'sonstiges'}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    kategorie: v as Gewohnheiten['fields']['kategorie'],
                  }))
                }
              >
                <SelectTrigger id="kategorie" className="w-full">
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
              <Label htmlFor="ziel_haeufigkeit">Häufigkeit</Label>
              <Select
                value={formData.ziel_haeufigkeit || 'taeglich'}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    ziel_haeufigkeit: v as Gewohnheiten['fields']['ziel_haeufigkeit'],
                  }))
                }
              >
                <SelectTrigger id="ziel_haeufigkeit" className="w-full">
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
              placeholder="z.B. 30 Minuten, 8 Gläser"
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
            <Label htmlFor="messbar" className="text-sm font-normal cursor-pointer">
              Messbare Gewohnheit (mit Zahlen/Mengen tracken)
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
  preselectedGewohnheit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eintrag?: TaeglicheEintraege | null;
  gewohnheiten: Gewohnheiten[];
  onSuccess: () => void;
  preselectedGewohnheit?: string;
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
        : preselectedGewohnheit || '';

      setFormData({
        gewohnheit: gewohnheitId || '',
        datum: eintrag?.fields.datum ?? getTodayString(),
        erledigt: eintrag?.fields.erledigt ?? true,
        menge: eintrag?.fields.menge?.toString() ?? '',
        notizen: eintrag?.fields.notizen ?? '',
      });
    }
  }, [open, eintrag, preselectedGewohnheit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.gewohnheit) {
      toast.error('Bitte wähle eine Gewohnheit aus.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
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
        toast.success('Eintrag hinzugefügt');
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
            <Label htmlFor="gewohnheit">Gewohnheit *</Label>
            <Select
              value={formData.gewohnheit || 'select-habit'}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, gewohnheit: v === 'select-habit' ? '' : v }))
              }
              disabled={isEditing}
            >
              <SelectTrigger id="gewohnheit" className="w-full">
                <SelectValue placeholder="Gewohnheit auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select-habit" disabled>
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
            <Label htmlFor="erledigt" className="text-sm font-normal cursor-pointer">
              Erledigt
            </Label>
          </div>

          {selectedGewohnheit?.fields.messbar && (
            <div className="space-y-2">
              <Label htmlFor="menge">
                Menge/Wert {selectedGewohnheit.fields.zielwert && `(Ziel: ${selectedGewohnheit.fields.zielwert})`}
              </Label>
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
              placeholder="Optionale Notizen zum Eintrag..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Hinzufügen'}
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
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protokoll?: Tagesprotokoll | null;
  onSuccess: () => void;
}) {
  const isEditing = !!protokoll;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    protokoll_datum: getTodayString(),
    tagesnotizen: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        protokoll_datum: protokoll?.fields.protokoll_datum ?? getTodayString(),
        tagesnotizen: protokoll?.fields.tagesnotizen ?? '',
      });
    }
  }, [open, protokoll]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    try {
      const payload = {
        protokoll_datum: formData.protokoll_datum,
        tagesnotizen: formData.tagesnotizen || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateTagesprotokollEntry(protokoll!.record_id, payload);
        toast.success('Tagesnotiz aktualisiert');
      } else {
        await LivingAppsService.createTagesprotokollEntry(payload);
        toast.success('Tagesnotiz hinzugefügt');
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
          <DialogTitle>{isEditing ? 'Tagesnotiz bearbeiten' : 'Tagesnotiz hinzufügen'}</DialogTitle>
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
            <Label htmlFor="tagesnotizen">Notizen zum Tag</Label>
            <Textarea
              id="tagesnotizen"
              value={formData.tagesnotizen}
              onChange={(e) => setFormData((prev) => ({ ...prev, tagesnotizen: e.target.value }))}
              placeholder="Wie war dein Tag? Was hast du erreicht?"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Hinzufügen'}
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

// Habit Card Component
function HabitCard({
  gewohnheit,
  todayEntry,
  onToggle,
  onEdit,
  onDelete,
  onAddEntry,
}: {
  gewohnheit: Gewohnheiten;
  todayEntry?: TaeglicheEintraege;
  onToggle: (gewohnheitId: string, currentEntry?: TaeglicheEintraege) => void;
  onEdit: (gewohnheit: Gewohnheiten) => void;
  onDelete: (gewohnheit: Gewohnheiten) => void;
  onAddEntry: (gewohnheitId: string) => void;
}) {
  const isCompleted = todayEntry?.fields.erledigt === true;
  const kategorie = gewohnheit.fields.kategorie || 'sonstiges';

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        isCompleted ? 'bg-accent/50 border-accent' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Completion Toggle */}
          <button
            onClick={() => onToggle(gewohnheit.record_id, todayEntry)}
            className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            aria-label={isCompleted ? 'Als nicht erledigt markieren' : 'Als erledigt markieren'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-8 h-8 text-primary" />
            ) : (
              <Circle className="w-8 h-8 text-muted-foreground" />
            )}
          </button>

          {/* Habit Info */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : ''}`}
              >
                {gewohnheit.fields.gewohnheit_name}
              </span>
              <Badge variant="secondary" className={`text-xs ${KATEGORIE_COLORS[kategorie]}`}>
                {KATEGORIE_LABELS[kategorie]}
              </Badge>
            </div>
            {gewohnheit.fields.zielwert && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Ziel: {gewohnheit.fields.zielwert}
              </p>
            )}
            {todayEntry?.fields.menge !== undefined && todayEntry.fields.menge !== null && (
              <p className="text-sm text-primary mt-0.5">
                Heute: {todayEntry.fields.menge} {gewohnheit.fields.zielwert}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {gewohnheit.fields.messbar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddEntry(gewohnheit.record_id)}
                aria-label="Menge eintragen"
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(gewohnheit)}
              aria-label="Bearbeiten"
              className="h-9 w-9"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(gewohnheit)}
              aria-label="Löschen"
              className="h-9 w-9 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Weekly Overview Component
function WeeklyOverview({
  eintraege,
  gewohnheitenCount,
}: {
  eintraege: TaeglicheEintraege[];
  gewohnheitenCount: number;
}) {
  const weekDays = getWeekDays();

  const dayData = weekDays.map((day) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const dayEntries = eintraege.filter((e) => e.fields.datum === dayString && e.fields.erledigt);
    const completedCount = dayEntries.length;
    const percentage = gewohnheitenCount > 0 ? (completedCount / gewohnheitenCount) * 100 : 0;

    return {
      date: day,
      dayAbbr: format(day, 'EEEEEE', { locale: de }),
      completedCount,
      percentage,
      isToday: isToday(day),
    };
  });

  return (
    <div className="flex justify-between gap-1">
      {dayData.map((day, index) => (
        <div key={index} className="flex flex-col items-center gap-1.5">
          <span className={`text-xs ${day.isToday ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
            {day.dayAbbr}
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              day.percentage >= 80
                ? 'bg-primary text-primary-foreground'
                : day.percentage >= 50
                ? 'bg-primary/50 text-primary-foreground'
                : day.percentage > 0
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            } ${day.isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
          >
            {day.completedCount}
          </div>
        </div>
      ))}
    </div>
  );
}

// Gewohnheiten Management Section
function GewohnheitenSection({
  gewohnheiten,
  onEdit,
  onDelete,
  onCreate,
}: {
  gewohnheiten: Gewohnheiten[];
  onEdit: (g: Gewohnheiten) => void;
  onDelete: (g: Gewohnheiten) => void;
  onCreate: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Alle Gewohnheiten</CardTitle>
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-1" /> Neu
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {gewohnheiten.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Gewohnheiten erstellt.
          </p>
        ) : (
          gewohnheiten.map((g) => (
            <div
              key={g.record_id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{g.fields.gewohnheit_name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${KATEGORIE_COLORS[g.fields.kategorie || 'sonstiges']}`}>
                    {KATEGORIE_LABELS[g.fields.kategorie || 'sonstiges']}
                  </Badge>
                  <span>{HAEUFIGKEIT_LABELS[g.fields.ziel_haeufigkeit || 'taeglich']}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(g)} className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(g)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Tagesprotokoll Section
function TagesprotokollSection({
  protokoll,
  onEdit,
  onDelete,
  onCreate,
}: {
  protokoll?: Tagesprotokoll;
  onEdit: (p: Tagesprotokoll) => void;
  onDelete: (p: Tagesprotokoll) => void;
  onCreate: () => void;
}) {
  if (!protokoll) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <button
            onClick={onCreate}
            className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <FileText className="h-4 w-4" />
            <span className="text-sm">Tagesnotiz hinzufügen</span>
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Tagesnotiz
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(protokoll)} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(protokoll)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{protokoll.fields.tagesnotizen || 'Keine Notizen'}</p>
      </CardContent>
    </Card>
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
  const [deleteGewohnheit, setDeleteGewohnheit] = useState<Gewohnheiten | null>(null);

  const [showEintragDialog, setShowEintragDialog] = useState(false);
  const [editEintrag, setEditEintrag] = useState<TaeglicheEintraege | null>(null);
  const [deleteEintrag, setDeleteEintrag] = useState<TaeglicheEintraege | null>(null);
  const [preselectedGewohnheit, setPreselectedGewohnheit] = useState<string>('');

  const [showProtokollDialog, setShowProtokollDialog] = useState(false);
  const [editProtokoll, setEditProtokoll] = useState<Tagesprotokoll | null>(null);
  const [deleteProtokoll, setDeleteProtokoll] = useState<Tagesprotokoll | null>(null);

  // View state
  const [activeTab, setActiveTab] = useState<'heute' | 'gewohnheiten'>('heute');

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

  const dailyGewohnheiten = useMemo(() => {
    return gewohnheiten.filter(
      (g) => g.fields.ziel_haeufigkeit === 'taeglich' || !g.fields.ziel_haeufigkeit
    );
  }, [gewohnheiten]);

  const todayCompletedCount = useMemo(() => {
    return todayEntries.filter((e) => e.fields.erledigt).length;
  }, [todayEntries]);

  const todayPercentage = useMemo(() => {
    if (dailyGewohnheiten.length === 0) return 0;
    return (todayCompletedCount / dailyGewohnheiten.length) * 100;
  }, [todayCompletedCount, dailyGewohnheiten.length]);

  const currentStreak = useMemo(() => {
    // Calculate consecutive days with all habits completed
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = format(addDays(today, -i), 'yyyy-MM-dd');
      const dayEntries = eintraege.filter((e) => e.fields.datum === checkDate && e.fields.erledigt);

      // If today and no entries yet, continue checking
      if (i === 0 && dayEntries.length === 0) continue;

      // Check if at least 80% of daily habits completed
      const completionRate = dailyGewohnheiten.length > 0
        ? dayEntries.length / dailyGewohnheiten.length
        : 0;

      if (completionRate >= 0.8) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }, [eintraege, dailyGewohnheiten.length]);

  const todayProtokoll = useMemo(() => {
    return protokolle.find((p) => p.fields.protokoll_datum === today);
  }, [protokolle, today]);

  // Data fetching
  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [g, e, p] = await Promise.all([
        LivingAppsService.getGewohnheiten(),
        LivingAppsService.getTaeglicheEintraege(),
        LivingAppsService.getTagesprotokoll(),
      ]);
      setGewohnheiten(g);
      setEintraege(e);
      setProtokolle(p);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Event handlers
  async function handleToggleHabit(gewohnheitId: string, currentEntry?: TaeglicheEintraege) {
    try {
      if (currentEntry) {
        // Toggle existing entry
        await LivingAppsService.updateTaeglicheEintraegeEntry(currentEntry.record_id, {
          erledigt: !currentEntry.fields.erledigt,
        });
        toast.success(currentEntry.fields.erledigt ? 'Als nicht erledigt markiert' : 'Erledigt!');
      } else {
        // Create new entry
        await LivingAppsService.createTaeglicheEintraegeEntry({
          gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, gewohnheitId),
          datum: today,
          erledigt: true,
        });
        toast.success('Erledigt!');
      }
      loadData();
    } catch (err) {
      toast.error('Fehler beim Aktualisieren');
    }
  }

  function handleOpenGewohnheitDialog(gewohnheit?: Gewohnheiten) {
    setEditGewohnheit(gewohnheit || null);
    setShowGewohnheitDialog(true);
  }

  function handleOpenEintragDialog(preselected?: string, eintrag?: TaeglicheEintraege) {
    setEditEintrag(eintrag || null);
    setPreselectedGewohnheit(preselected || '');
    setShowEintragDialog(true);
  }

  function handleOpenProtokollDialog(protokoll?: Tagesprotokoll) {
    setEditProtokoll(protokoll || null);
    setShowProtokollDialog(true);
  }

  async function handleDeleteGewohnheit() {
    if (!deleteGewohnheit) return;
    await LivingAppsService.deleteGewohnheitenEntry(deleteGewohnheit.record_id);
    toast.success('Gewohnheit gelöscht');
    setDeleteGewohnheit(null);
    loadData();
  }

  async function handleDeleteEintrag() {
    if (!deleteEintrag) return;
    await LivingAppsService.deleteTaeglicheEintraegeEntry(deleteEintrag.record_id);
    toast.success('Eintrag gelöscht');
    setDeleteEintrag(null);
    loadData();
  }

  async function handleDeleteProtokoll() {
    if (!deleteProtokoll) return;
    await LivingAppsService.deleteTagesprotokollEntry(deleteProtokoll.record_id);
    toast.success('Tagesnotiz gelöscht');
    setDeleteProtokoll(null);
    loadData();
  }

  // Loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fehler beim Laden</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={loadData}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Gewohnheiten</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Hero Section */}
          <section className="flex flex-col items-center py-6">
            <ProgressRing percentage={todayPercentage} size={180} strokeWidth={10} />
            <div className="flex gap-4 mt-6">
              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                <Target className="h-4 w-4 mr-1.5" />
                {todayCompletedCount} von {dailyGewohnheiten.length}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                <Flame className="h-4 w-4 mr-1.5" />
                {currentStreak} Tage Streak
              </Badge>
            </div>
          </section>

          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('heute')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'heute'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Heute
            </button>
            <button
              onClick={() => setActiveTab('gewohnheiten')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'gewohnheiten'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Alle Gewohnheiten
            </button>
          </div>

          {activeTab === 'heute' ? (
            <>
              {/* Today's Date */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {format(new Date(), "EEEE, d. MMMM", { locale: de })}
                </span>
              </div>

              {/* Today's Habits */}
              {dailyGewohnheiten.length === 0 ? (
                <EmptyState
                  title="Keine Gewohnheiten"
                  description="Erstelle deine erste Gewohnheit, um mit dem Tracken zu beginnen."
                  action={
                    <Button onClick={() => handleOpenGewohnheitDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Gewohnheit erstellen
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {dailyGewohnheiten.map((g) => (
                    <HabitCard
                      key={g.record_id}
                      gewohnheit={g}
                      todayEntry={todayEntriesMap.get(g.record_id)}
                      onToggle={handleToggleHabit}
                      onEdit={handleOpenGewohnheitDialog}
                      onDelete={setDeleteGewohnheit}
                      onAddEntry={(id) => handleOpenEintragDialog(id)}
                    />
                  ))}
                </div>
              )}

              {/* Weekly Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Diese Woche</CardTitle>
                </CardHeader>
                <CardContent>
                  <WeeklyOverview eintraege={eintraege} gewohnheitenCount={dailyGewohnheiten.length} />
                </CardContent>
              </Card>

              {/* Tagesprotokoll */}
              <TagesprotokollSection
                protokoll={todayProtokoll}
                onEdit={handleOpenProtokollDialog}
                onDelete={setDeleteProtokoll}
                onCreate={() => handleOpenProtokollDialog()}
              />
            </>
          ) : (
            <GewohnheitenSection
              gewohnheiten={gewohnheiten}
              onEdit={handleOpenGewohnheitDialog}
              onDelete={setDeleteGewohnheit}
              onCreate={() => handleOpenGewohnheitDialog()}
            />
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Kategorien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {Object.entries(KATEGORIE_LABELS).map(([key, label]) => {
                  const count = gewohnheiten.filter((g) => g.fields.kategorie === key).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <span className="text-sm">{label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Button className="w-full" onClick={() => handleOpenGewohnheitDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Gewohnheit
            </Button>
          </aside>

          {/* Main Content */}
          <div className="col-span-6 space-y-6">
            {/* Hero Section */}
            <section className="flex flex-col items-center py-8 bg-card rounded-xl border">
              <ProgressRing percentage={todayPercentage} size={200} strokeWidth={12} />
              <div className="flex gap-4 mt-6">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Target className="h-4 w-4 mr-2" />
                  {todayCompletedCount} von {dailyGewohnheiten.length} Gewohnheiten
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Flame className="h-4 w-4 mr-2" />
                  {currentStreak} Tage Streak
                </Badge>
              </div>
            </section>

            {/* Today's Date */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                {format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })}
              </span>
            </div>

            {/* Today's Habits */}
            {dailyGewohnheiten.length === 0 ? (
              <EmptyState
                title="Keine Gewohnheiten"
                description="Erstelle deine erste Gewohnheit, um mit dem Tracken zu beginnen."
                action={
                  <Button onClick={() => handleOpenGewohnheitDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Gewohnheit erstellen
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {dailyGewohnheiten.map((g) => (
                  <HabitCard
                    key={g.record_id}
                    gewohnheit={g}
                    todayEntry={todayEntriesMap.get(g.record_id)}
                    onToggle={handleToggleHabit}
                    onEdit={handleOpenGewohnheitDialog}
                    onDelete={setDeleteGewohnheit}
                    onAddEntry={(id) => handleOpenEintragDialog(id)}
                  />
                ))}
              </div>
            )}

            {/* Tagesprotokoll */}
            <TagesprotokollSection
              protokoll={todayProtokoll}
              onEdit={handleOpenProtokollDialog}
              onDelete={setDeleteProtokoll}
              onCreate={() => handleOpenProtokollDialog()}
            />
          </div>

          {/* Right Sidebar - Stats */}
          <aside className="col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Diese Woche</CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyOverview eintraege={eintraege} gewohnheitenCount={dailyGewohnheiten.length} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Statistiken</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Aktive Gewohnheiten</span>
                  <span className="font-semibold">{gewohnheiten.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Längster Streak</span>
                  <span className="font-semibold">{currentStreak} Tage</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Einträge gesamt</span>
                  <span className="font-semibold">{eintraege.length}</span>
                </div>
              </CardContent>
            </Card>

            <GewohnheitenSection
              gewohnheiten={gewohnheiten}
              onEdit={handleOpenGewohnheitDialog}
              onDelete={setDeleteGewohnheit}
              onCreate={() => handleOpenGewohnheitDialog()}
            />
          </aside>
        </div>
      </main>

      {/* FAB for Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => handleOpenEintragDialog()}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Dialogs */}
      <GewohnheitDialog
        open={showGewohnheitDialog}
        onOpenChange={setShowGewohnheitDialog}
        gewohnheit={editGewohnheit}
        onSuccess={loadData}
      />

      <EintragDialog
        open={showEintragDialog}
        onOpenChange={setShowEintragDialog}
        eintrag={editEintrag}
        gewohnheiten={gewohnheiten}
        onSuccess={loadData}
        preselectedGewohnheit={preselectedGewohnheit}
      />

      <TagesprotokollDialog
        open={showProtokollDialog}
        onOpenChange={setShowProtokollDialog}
        protokoll={editProtokoll}
        onSuccess={loadData}
      />

      <DeleteConfirmDialog
        open={!!deleteGewohnheit}
        onOpenChange={(open) => !open && setDeleteGewohnheit(null)}
        title="Gewohnheit löschen?"
        description={`Möchtest du die Gewohnheit "${deleteGewohnheit?.fields.gewohnheit_name}" wirklich löschen? Alle zugehörigen Einträge bleiben erhalten.`}
        onConfirm={handleDeleteGewohnheit}
      />

      <DeleteConfirmDialog
        open={!!deleteEintrag}
        onOpenChange={(open) => !open && setDeleteEintrag(null)}
        title="Eintrag löschen?"
        description={`Eintrag vom ${deleteEintrag?.fields.datum} löschen?`}
        onConfirm={handleDeleteEintrag}
      />

      <DeleteConfirmDialog
        open={!!deleteProtokoll}
        onOpenChange={(open) => !open && setDeleteProtokoll(null)}
        title="Tagesnotiz löschen?"
        description={`Tagesnotiz vom ${deleteProtokoll?.fields.protokoll_datum} löschen?`}
        onConfirm={handleDeleteProtokoll}
      />
    </div>
  );
}
