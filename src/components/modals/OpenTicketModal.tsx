
import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import type { ProjectItem, SupportTicketItem } from '../../types';
import {
  createCustomerTicket
} from '../../services/tickets.service';

interface OpenTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTicket: (ticket: SupportTicketItem) => void;
  projects: ProjectItem[];
  defaultProjectId?: string;
}

export const OpenTicketModal: React.FC<OpenTicketModalProps> = ({
  isOpen,
  onClose,
  onAddTicket,
  projects,
  defaultProjectId
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep the selected project synchronized with the parent.
  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    } else if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [defaultProjectId, projects]);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorMessage('');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setErrorMessage('');
    setIsDragging(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!projectId) {
      setErrorMessage('Please select a project.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please enter a ticket title.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const response = await createCustomerTicket({
        projectId,
        title: title.trim(),
        description: description.trim(),
        attachment: selectedFile
      });

      if (!response.success || !response.ticket) {
        throw new Error(response.message || 'Unable to create ticket.');
      }

      const apiTicket = response.ticket;

      const selectedProject = projects.find(
        project => String(project.id) === String(apiTicket.projectId ?? projectId)
      );

      const createdTicket: SupportTicketItem = {
        id: String(apiTicket.id),
        ticketNumber: apiTicket.ticketNumber,
        title: apiTicket.title,
        description: apiTicket.description || '',
        project: selectedProject?.name || apiTicket.project || 'General',
        projectId: String(apiTicket.projectId ?? projectId),

        // The current backend does not save or return priority.
        priority: 'Not specified',

        status: apiTicket.status as SupportTicketItem['status'],
        assignee: apiTicket.assignee || '',
        manager: '',
        managerEmail: '',
        createdDate: apiTicket.createdDate || 'Date not available',

        attachmentAvailable: apiTicket.attachmentAvailable,
        conversationId: apiTicket.conversationId,
        assignedToPtId: apiTicket.assignedToPtId,
        assignedToSpId: apiTicket.assignedToSpId,
        createdAt: apiTicket.createdAt,
        updatedAt: apiTicket.updatedAt
      };

      onAddTicket(createdTicket);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Create ticket error:', error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to create ticket. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileSize = selectedFile
    ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
    : '';

  const fileType = selectedFile
    ? selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE'
    : '';

  return (
    <div
      id="open-ticket-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        id="open-ticket-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[calc(100%-24px)] sm:w-full max-w-[640px] max-h-[calc(100dvh-24px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: '#EEF6FF' }}
          className="px-5 sm:px-6 py-3.5 border-b border-[#BFDBFE] flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-[#2161F5] border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-4 h-4 stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#1E3A8A] tracking-tight">
                Open a Support Ticket
              </h2>
              <p className="text-[11px] text-slate-500">
                Describe your issue and our support team will review it.
              </p>
            </div>
          </div>

          <button
            id="btn-close-ticket-modal"
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors border border-transparent hover:border-blue-200 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-3 text-xs bg-white flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col justify-between"
        >
          <div className="space-y-3">
            {errorMessage && (
              <div className="py-2 px-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Title <span className="text-rose-500">*</span>
              </label>

              <input
                id="input-ticket-title"
                type="text"
                required
                value={title}
                disabled={isSubmitting}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter your ticket title"
                className="w-full px-3 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#2161F5] focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Project <span className="text-rose-500">*</span>
              </label>

              <select
                id="select-ticket-project"
                required
                value={projectId}
                disabled={isSubmitting || projects.length === 0}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFF] border border-[#BFDBFE]/80 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:border-[#2161F5] focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
              >
                <option value="">Select a project</option>

                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {projects.length === 0 && (
                <p className="text-[11px] text-rose-600 mt-1">
                  No projects are available. Please load your projects first.
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Description
              </label>

              <textarea
                id="textarea-ticket-description"
                rows={4}
                value={description}
                disabled={isSubmitting}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide details about the issue, conditions observed, equipment telemetry, and any error codes..."
                className="w-full px-3 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#2161F5] focus:ring-2 focus:ring-blue-100 transition-all resize-none shadow-2xs"
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Add Attachment
              </label>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                disabled={isSubmitting}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {!selectedFile ? (
                <div
                  id="dropzone-ticket-attachment"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-2xs ${
                    isDragging
                      ? 'border-[#2161F5] bg-[#EEF6FF]'
                      : 'border-[#BFDBFE] bg-[#F8FAFF] hover:border-[#2161F5] hover:bg-[#EEF6FF]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-white text-[#2161F5] border border-blue-200 flex items-center justify-center shadow-2xs">
                    <Upload className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  <span className="text-xs font-bold text-slate-800">
                    Upload Attachment
                  </span>

                  <span className="text-[11px] text-slate-500">
                    Drag and drop your file here or browse
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-[#EEF6FF] border border-[#BFDBFE] rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white text-[#2161F5] border border-blue-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {fileType} • {fileSize}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 mt-3 border-t border-[#E5EAF2] flex items-center justify-end gap-2.5 shrink-0">
            <button
              id="btn-cancel-ticket"
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              id="btn-submit-ticket"
              type="submit"
              disabled={isSubmitting || projects.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-[#2161F5] hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Open Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};