import React, { useEffect, useState } from 'react';
import {
  Library,
  Plus,
  FileText,
  ExternalLink,
  Loader2,
  Trash2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { resourcesService } from '@/services/index';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload/Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('DOCUMENT');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await resourcesService.getResources();
      setResources(data);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error('Title and URL/link are required');
      return;
    }

    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('url', url.trim());
      formData.append('type', type);

      await resourcesService.uploadResource(formData);
      toast.success('Resource published to cohort repository!');
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setUrl('');
      loadResources();
    } catch {
      toast.error('Failed to publish resource');
    } finally {
      setCreating(false);
    }
  };

  const filtered = resources.filter((r) =>
    (r.title || r.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Resources Library"
        description="Publish curriculum slides, lab starter repositories, and documentation"
        action={
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Publish Resource
          </Button>
        }
      />

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
        <Input
          placeholder="Filter resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Library className="h-10 w-10" />}
          title="No Resources Published"
          description="Upload slides, starter repositories, or cheat sheets for your students."
          action={{
            label: 'Publish First Resource',
            onClick: () => setCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((res) => (
            <Card key={res.id} className="flex flex-col justify-between border-[var(--border)] shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase text-[var(--muted-foreground)]">
                    {res.type || 'DOCUMENT'}
                  </span>
                </div>
                <CardTitle className="text-base font-bold mt-2">{res.title || res.name}</CardTitle>
                {res.description && (
                  <CardDescription className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                    {res.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-2 border-t border-[var(--border)] flex justify-end">
                {res.url && (
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <a href={res.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      View Link
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish Learning Resource"
        subtitle="Add materials accessible to enrolled cohort students"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Resource Title" required>
            <Input
              placeholder="e.g. Week 2 Lecture Slides: Pointers & Memory Layout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={creating}
            />
          </FormField>

          <FormField label="External URL / Repo Link" required>
            <Input
              placeholder="https://github.com/csec-astu/lab-starter or Google Drive link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={creating}
            />
          </FormField>

          <FormField label="Resource Category">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
            >
              <option value="SLIDES">Lecture Slides</option>
              <option value="CODE_REPO">Starter Code / Repo</option>
              <option value="DOCUMENT">Documentation / Cheat Sheet</option>
              <option value="RECORDING">Recorded Video Session</option>
            </select>
          </FormField>

          <FormField label="Description (Optional)">
            <Textarea
              rows={2}
              placeholder="Brief summary of what this resource covers..."
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
              {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Publish Resource'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
