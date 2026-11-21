import React, { useState, useEffect } from 'react';
import { X, FileText, Download, CheckCircle2, Clock } from 'lucide-react';
import { ProjectItem } from '../../types';

export type ReportMode = 'generic' | 'detailed';

export type DetailedReportType = 
  | 'Executive Summary & Delivery Metrics'
  | 'Full Lifecycle Milestone & Phase Audit'
  | 'Locations & Commissioning Status Deck'
  | 'Critical Spares Requisition & Budget Log';

export interface GeneratedReportData {
  project: ProjectItem | undefined;
  reportMode: ReportMode;
  detailedReportType: DetailedReportType | null;
  format: string;
}

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  defaultProject?: ProjectItem | null;
  onGenerate?: (data: GeneratedReportData) => void;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProject,
  onGenerate
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    defaultProject?.id || projects[0]?.id || ''
  );
  const [reportMode, setReportMode] = useState<ReportMode>('generic');
  const [detailedReportType, setDetailedReportType] = useState<DetailedReportType>(
    'Executive Summary & Delivery Metrics'
  );
  const [format, setFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultProject?.id) {
        setSelectedProjectId(defaultProject.id);
      } else if (projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projects[0].id);
      }
      setReportMode('generic');
      setDetailedReportType('Executive Summary & Delivery Metrics');
      setFormat('PDF');
      setIsGenerating(false);
      setGeneratedSuccess(false);
    }
  }, [isOpen, defaultProject]);

  if (!isOpen) return null;

  const handleReportModeChange = (mode: ReportMode) => {
    setReportMode(mode);
    if (mode === 'detailed') {
      // Default to "Executive Summary & Delivery Metrics" when switching to detailed
      setDetailedReportType(prev => prev || 'Executive Summary & Delivery Metrics');
    }
  };

  const selectedPrj = projects.find(p => p.id === selectedProjectId) || defaultProject || projects[0];

  const handleGenerate = () => {
    setIsGenerating(true);

    const reportPayload: GeneratedReportData = {
      project: selectedPrj,
      reportMode,
      detailedReportType: reportMode === 'detailed' ? detailedReportType : null,
      format
    };

    if (onGenerate) {
      onGenerate(reportPayload);
    }

    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSuccess(true);
      setTimeout(() => {
        setGeneratedSuccess(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  const detailedOptions: DetailedReportType[] = [
    'Executive Summary & Delivery Metrics',
    'Full Lifecycle Milestone & Phase Audit',
    'Locations & Commissioning Status Deck',
    'Critical Spares Requisition & Budget Log'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[calc(100%-24px)] sm:w-full max-w-md max-h-[calc(100dvh-24px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800 transition-all">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Generate Project Report</h3>
              <p className="text-[11px] text-slate-500">Enterprise governance and delivery audit</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto no-scrollbar flex-1">
          
          {generatedSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Report Generated Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Your {reportMode === 'detailed' ? detailedReportType : 'Generic Report'} for{' '}
                <span className="font-semibold text-slate-800">{selectedPrj?.name}</span> is ready and downloading.
              </p>
            </div>
          ) : (
            <>
              {/* 1. Target Project selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) — {p.customer}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Report Type: Generic vs Detailed */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Report Type
                </label>
                <div className="space-y-2">
                  {/* Generic Report */}
                  <label
                    onClick={() => handleReportModeChange('generic')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      reportMode === 'generic'
                        ? 'border-blue-500 bg-blue-50/40 text-blue-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportMode"
                      checked={reportMode === 'generic'}
                      onChange={() => handleReportModeChange('generic')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold ${reportMode === 'generic' ? 'text-blue-950' : 'text-slate-900'}`}>
                        Generic Report
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                        Generate a standard project report with key project information and overall status.
                      </div>
                    </div>
                  </label>

                  {/* Detailed Report */}
                  <label
                    onClick={() => handleReportModeChange('detailed')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      reportMode === 'detailed'
                        ? 'border-blue-500 bg-blue-50/40 text-blue-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportMode"
                      checked={reportMode === 'detailed'}
                      onChange={() => handleReportModeChange('detailed')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold ${reportMode === 'detailed' ? 'text-blue-950' : 'text-slate-900'}`}>
                        Detailed Report
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                        Choose a specific report scope and generate a focused project report.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Conditional: Report Scope & Type (Visible ONLY when Detailed Report is selected) */}
              {reportMode === 'detailed' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Report Scope & Type
                  </label>
                  <div className="space-y-1.5">
                    {detailedOptions.map((type) => (
                      <label 
                        key={type}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          detailedReportType === type 
                            ? 'border-blue-500 bg-blue-50/40 text-blue-900 font-semibold' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="detailedReportType"
                          checked={detailedReportType === type}
                          onChange={() => setDetailedReportType(type)}
                          className="text-blue-600 focus:ring-blue-500 shrink-0"
                        />
                        <span className="truncate">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Output Format selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['PDF', 'XLSX', 'CSV'].map((fmt) => (
                    <button
                      type="button"
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        format === fmt 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fmt} Format
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {format} Report</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
