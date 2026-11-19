import React, { useEffect, useState } from 'react';
import {
  Library,
  FileText,
  FileCode,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Search,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { resourcesService } from '@/services/index';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await resourcesService.getResources();
      setResources(data);
    } catch {
      toast.error('Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter((r) =>
    (r.title || r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Resources"
        description="Curated lecture slides, lab writeups, starter code repositories, and reference documents"
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
          title="No Resources Found"
          description={
            searchQuery
              ? `No resources match "${searchQuery}".`
              : 'Instructors have not posted any reference materials yet.'
          }
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
                {res.url ? (
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <a href={res.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Open Resource
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="text-xs" disabled>
                    Unavailable
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
