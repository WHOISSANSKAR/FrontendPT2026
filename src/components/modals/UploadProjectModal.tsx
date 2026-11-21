import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { ProjectItem } from '../../types';

interface UploadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (newProject: ProjectItem) => void;
}

export const UploadProjectModal: React.FC<UploadProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject
}) => {
  const [name, setName] = useState('');
  const [customer, setCustomer] = useState('');
  const [category, setCategory] = useState('Industrial Automation');
  const [manager, setManager] = useState('Vikramaditya Rao');
  const [budget, setBudget] = useState('₹45,00,000');
  const [startDate, setStartDate] = useState('15 Sep 2026');
  const [expectedCompletion, setExpectedCompletion] = useState('15 Dec 2026');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !customer.trim()) return;

    const newPrj: ProjectItem = {
      id: `prj-${Date.now()}`,
      code: `PRJ-00${Math.floor(Math.random() * 90) + 10}`,
      name: name.trim(),
      customer: customer.trim(),
      category,
      status: 'In Progress',
      progress: 10,
      currentPhase: 'Initiation & Scoping',
      velocity: 'Ahead of schedule',
      manager,
      startDate,
      expectedCompletion,
      budget,
      lastUpdated: 'Just now',
      milestonesCount: 5,
      completedMilestones: 0,
      locationsCount: 1,
      countriesCount: 1,
      locations: [
        {
          id: `loc-${Date.now()}`,
          country: 'India',
          countryCode: 'IN',
          state: 'Maharashtra',
          city: 'Mumbai',
          phase: 'Initiation',
          status: 'In Progress',
          progress: 10,
          assignedTeam: 'Mumbai Automation Hub',
          lastUpdated: 'Just now'
        }
      ]
    };

    onAddProject(newPrj);
    onClose();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0].name);
      if (!name) {
        setName(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[calc(100%-24px)] sm:w-full max-w-lg max-h-[calc(100dvh-24px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-open-sans">Upload / Create Project</h3>
            <p className="text-[11px] text-slate-500">Initiate new enterprise deployment or import specification</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          <div className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto no-scrollbar flex-1">
            {/* File Dropzone */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Project Specification / SOW File (Optional)
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'
                }`}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e: any) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFile(e.target.files[0].name);
                      if (!name) setName(e.target.files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                    }
                  };
                  input.click();
                }}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <Upload className="w-5 h-5 text-blue-600" />
                  {uploadedFile ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{uploadedFile}</span>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-slate-700 text-xs">
                        Drag & drop project file, or <span className="text-blue-600">browse</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Supports .pdf, .xlsx, .csv, .zip (Max 50MB)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Hyperion"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer / Client *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Motors Logistics"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Industrial Automation">Industrial Automation</option>
                  <option value="Supply Chain Optics">Supply Chain Optics</option>
                  <option value="Cleanroom Sensor Grid">Cleanroom Sensor Grid</option>
                  <option value="High-Speed Conveyance">High-Speed Conveyance</option>
                  <option value="Robotics & Telemetry">Robotics & Telemetry</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Project Manager</label>
                <input
                  type="text"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Budget Allocation</label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Completion</label>
                <input
                  type="text"
                  value={expectedCompletion}
                  onChange={(e) => setExpectedCompletion(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Upload & Create Project
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
