import React, { useRef, useState } from 'react';
import { 
  Building, 
  User, 
  CheckCircle2, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Check 
} from 'lucide-react';

interface IdentityTabProps {
  entityType: 'Organization' | 'Individual';
  setEntityType: (val: 'Organization' | 'Individual') => void;
  orgName: string;
  setOrgName: (val: string) => void;
  about: string;
  setAbout: (val: string) => void;
  cin: string;
  setCin: (val: string) => void;
  gstNumber: string;
  setGstNumber: (val: string) => void;
  idFileName: string | null;
  setIdFileName: (val: string | null) => void;
  onSave: (e: React.FormEvent) => void;
  onShowToast: (msg: string) => void;
}

export const IdentityTab: React.FC<IdentityTabProps> = ({
  entityType,
  setEntityType,
  orgName,
  setOrgName,
  about,
  setAbout,
  cin,
  setCin,
  gstNumber,
  setGstNumber,
  idFileName,
  setIdFileName,
  onSave,
  onShowToast
}) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const idFileInputRef = useRef<HTMLInputElement>(null);

  const handleIdFileUpload = (file: File) => {
    setIdFileName(file.name);
    onShowToast(`Uploaded Government ID: ${file.name}`);
  };

  return (
    <div id="section-identity" className="h-full flex flex-col min-h-0">
      {/* Tab Header - Compact */}
      <div className="shrink-0 border-b border-slate-100 pb-2 mb-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Identity & Verification
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Manage your organization or individual verification details and statutory credentials.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Verified Entity
          </span>
        </div>
      </div>

      {/* Main Form container taking full available height with action bar at bottom */}
      <form onSubmit={onSave} className="flex-1 min-h-0 flex flex-col justify-between gap-2.5">
        <div className="space-y-2.5 overflow-y-auto no-scrollbar pr-0.5">
          {/* Segmented Toggle: "You are an" */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-bold text-slate-700">
              You are an:
            </span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => setEntityType('Organization')}
                id="toggle-entity-organization"
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  entityType === 'Organization'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Organization</span>
              </button>
              <button
                type="button"
                onClick={() => setEntityType('Individual')}
                id="toggle-entity-individual"
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  entityType === 'Individual'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Individual</span>
              </button>
            </div>
          </div>

          {/* Conditional Sub-forms */}
          {entityType === 'Organization' ? (
            <div className="space-y-2.5">
              {/* Organization Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Organization Name
                </label>
                <input 
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-medium"
                  placeholder="PseudoTeam Technologies India Pvt Ltd"
                  required
                />
              </div>

              {/* About Organization */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  About Organization
                </label>
                <textarea 
                  rows={2}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all resize-none h-14"
                  placeholder="Describe your enterprise operations and logistic scope"
                  required
                />
              </div>

              {/* Statutory Numbers Grid: CIN & GSTIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Corporate Identification Number (CIN)
                    </label>
                    <span className="text-[9px] text-slate-400 font-mono">21 chars</span>
                  </div>
                  <input 
                    type="text"
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-mono uppercase"
                    placeholder="U72900DL2021PTC384920"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      GST Number (GSTIN)
                    </label>
                    <span className="text-[9px] text-slate-400 font-mono">15 chars</span>
                  </div>
                  <input 
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-mono uppercase"
                    placeholder="07AAAAA0000A1Z5"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* About You */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  About You
                </label>
                <textarea 
                  rows={2}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all resize-none h-14"
                  placeholder="Tell us about your professional background or project operations"
                  required
                />
              </div>

              {/* Upload ID Section */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Government ID Verification
                </label>
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleIdFileUpload(file);
                  }}
                  onClick={() => idFileInputRef.current?.click()}
                  className={`p-3 rounded-lg border-2 border-dashed transition-all cursor-pointer text-center flex items-center justify-center gap-3 ${
                    isDraggingFile 
                      ? 'border-blue-600 bg-blue-50/60' 
                      : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30'
                  }`}
                >
                  <UploadCloud className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800">
                      Upload Government ID (Aadhaar, Passport, or PAN)
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Drag & drop your document or click to browse (PDF, JPG, PNG up to 10MB)
                    </p>
                  </div>
                  <input 
                    ref={idFileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleIdFileUpload(file);
                    }}
                  />
                </div>

                {idFileName && (
                  <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 truncate max-w-[200px]">{idFileName}</span>
                      <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified Document
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIdFileName(null);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar - Pinned to bottom right */}
        <div className="shrink-0 pt-2 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            id="save-identity-btn"
            className="px-5 h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-[0.99] flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
