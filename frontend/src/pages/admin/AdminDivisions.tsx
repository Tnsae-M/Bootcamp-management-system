import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Loader2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { divisionsService } from '@/services/divisions.service';
import { Division } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDivisions() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Division Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    setLoading(true);
    try {
      const data = await divisionsService.getDivisions();
      setDivisions(data);
    } catch {
      toast.error('Failed to load divisions');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error('Division name and slug are required');
      return;
    }

    setCreating(true);
    try {
      await divisionsService.createDivision({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });

      toast.success(`Division "${name}" created successfully!`);
      setCreateModalOpen(false);
      setName('');
      setSlug('');
      setDescription('');
      loadDivisions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create division');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Specialization Divisions"
        description="Configure academic divisions, curriculum tracks, and division-scoped authority boundaries"
        action={
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Division
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
      ) : divisions.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-10 w-10" />}
          title="No Divisions Configured"
          description="Create your initial CSEC-ASTU division tracks (e.g. Competitive Programming, Development)."
          action={{
            label: 'Create First Division',
            onClick: () => setCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((div) => (
            <Card key={div.id} className="border-[var(--border)] shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                    ACTIVE
                  </span>
                </div>
                <CardTitle className="text-lg font-bold mt-2">{div.name}</CardTitle>
                <CardDescription className="text-xs text-[var(--muted-foreground)]">
                  Identifier: <code className="font-mono">{div.slug}</code>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 text-xs space-y-2">
                <p className="text-[var(--muted-foreground)] line-clamp-2">
                  {div.description || 'Specialized engineering curriculum track operated by division leads and mentors.'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>Division Scope & RBAC Protected</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Division"
        subtitle="Establish a new specialization track for CSEC-ASTU"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Division Name" required>
            <Input
              placeholder="e.g. Cybersecurity & Defense"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={creating}
            />
          </FormField>

          <FormField label="URL Slug / Identifier" required hint="Alphanumeric lowercase identifier with dashes">
            <Input
              placeholder="cybersecurity-defense"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={creating}
            />
          </FormField>

          <FormField label="Division Overview / Charter">
            <Textarea
              rows={3}
              placeholder="Goals, target competencies, and curriculum focus of this division..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={creating}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Create Division'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
