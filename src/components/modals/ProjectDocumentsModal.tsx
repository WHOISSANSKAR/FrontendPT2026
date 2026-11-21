// changes done by vb: new "View Documents" modal — lists the documents uploaded for a project
// and lets the customer open them. Keeps an "Upload document" button (old Upload Documents action).
import React, { useEffect, useState } from 'react';
import {
  X,
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  ExternalLink,
  UploadCloud,
  FolderOpen,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ProjectItem } from '../../types';
import {
  getProjectDocuments,
  resolveDocumentUrl,
  DocumentsUnavailableError,
  ProjectDocument,
} from '../../services/projectDocuments.service';

interface ProjectDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
  onUpload: () => void;
}

const iconFor = (doc: ProjectDocument) => {
  const ext = (doc.file_type || doc.name.split('.').pop() || '').toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return { Icon: FileImage, tone: 'bg-pink-50 text-pink-600' };
  if (['xls', 'xlsx', 'csv'].includes(ext)) return { Icon: FileSpreadsheet, tone: 'bg-emerald-50 text-emerald-600' };
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return { Icon: FileText, tone: 'bg-rose-50 text-rose-600' };
  return { Icon: FileIcon, tone: 'bg-slate-100 text-slate-600' };
};

const formatSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ProjectDocumentsModal: React.FC<ProjectDocumentsModalProps> = ({ isOpen, onClose, project, onUpload }) => {
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading');
  const [docs, setDocs] = useState<ProjectDocument[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setState('loading');
    getProjectDocuments(project.id)
      .then((list) => {
        if (cancelled) return;
        setDocs(list);
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof DocumentsUnavailableError) {
          setState('unavailable');
        } else {
          setError(err instanceof Error ? err.message : 'Unable to load documents.');
          setState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, project.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Project documents"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FolderOpen className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">Project Documents</h3>
              <p className="truncate text-[11px] text-slate-500">{project.name} · uploaded files</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="mt-2 text-sm">Loading documents…</p>
            </div>
          )}

          {state === 'unavailable' && (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-9 text-center">
              <FolderOpen className="h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">Document viewing isn’t available yet</p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Files you upload are saved with the project, but they can’t be opened here until document access is enabled.
              </p>
            </div>
          )}

          {state === 'error' && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {state === 'ready' && docs.length === 0 && (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-9 text-center">
              <FolderOpen className="h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No documents uploaded yet</p>
              <p className="mt-1 text-xs text-slate-500">Upload a SOW, drawing or report to see it here.</p>
            </div>
          )}

          {state === 'ready' && docs.length > 0 && (
            <ul className="space-y-2">
              {docs.map((doc) => {
                const { Icon, tone } = iconFor(doc);
                const href = resolveDocumentUrl(doc.url);
                const meta = [
                  (doc.file_type || doc.name.split('.').pop() || '').toUpperCase(),
                  formatSize(doc.size_bytes),
                  doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
                ].filter(Boolean).join(' · ');
                return (
                  <li key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{doc.name}</span>
                      {meta && <span className="text-[11px] text-slate-500">{meta}</span>}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-100"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </a>
                    ) : (
                      <span className="shrink-0 text-[11px] text-slate-400">No preview</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <span className="text-[11px] text-slate-500">
            {state === 'ready' ? `${docs.length} document${docs.length === 1 ? '' : 's'}` : ''}
          </span>
          <button
            type="button"
            onClick={onUpload}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 cursor-pointer"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload document
          </button>
        </div>
      </div>
    </div>
  );
};
