import React, { useState } from 'react';
import {
  Briefcase,
  IndianRupee,
  Users,
  Bell,
  Tag,
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  ArrowLeft,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface UploadProjectViewProps {
  onCancel: () => void;
  onAddProject: (formData: FormData) => Promise<void>;
}

export const UploadProjectView: React.FC<UploadProjectViewProps> = ({
  onCancel,
  onAddProject
}) => {
  // Form State - Project Details (Matched to Laravel Dropdowns)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectIs, setProjectIs] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectCategory, setProjectCategory] = useState('');

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Budget & Timeline State (Currency dropdown kept as-is)
  const [budgetCurrency, setBudgetCurrency] = useState('INR (₹)');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [defineInterval, setDefineInterval] = useState('Monthly Milestones');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Contact Details State
  const [authPersonName, setAuthPersonName] = useState('');
  const [authPersonEmail, setAuthPersonEmail] = useState('');
  const [pseudoContactName, setPseudoContactName] = useState('Kavita Nair');
  const [pseudoContactEmail, setPseudoContactEmail] = useState('kavita.nair@pseudoteam.in');
  const [contactNumber, setContactNumber] = useState('');

  // Notifications State
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const [additionalEmail, setAdditionalEmail] = useState('');

  // Promotion State
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Form Validation & Errors
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // File Upload Handler
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      setUploadedFile({ name: file.name, size: sizeStr });
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      setUploadedFile({ name: file.name, size: sizeStr });
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a valid coupon or promo code.');
      setPromoApplied(false);
      return;
    }
    setPromoError('');
    setPromoApplied(true);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) errors.title = 'Project Title is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (!projectIs.trim()) errors.projectIs = 'Please select whether the project is New or On Going.';
    if (!projectType.trim()) errors.projectType = 'Please select the project type.';
    if (!projectCategory.trim()) errors.projectCategory = 'Please select a project category.';
    if (!budgetCurrency.trim()) errors.budgetCurrency = 'Budget Currency is required.';
    if (!budgetAmount.trim() || Number(budgetAmount.replace(/,/g, '')) <= 0) {
      errors.budgetAmount = 'Valid Budget Amount is required.';
    }
    if (!startDate.trim()) errors.startDate = 'Start Date is required.';
    if (!endDate.trim()) errors.endDate = 'End Date is required.';
    if (!authPersonName.trim()) errors.authPersonName = 'Authorised Person Name is required.';
    if (!authPersonEmail.trim()) {
      errors.authPersonEmail = 'Authorised Person Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(authPersonEmail)) {
      errors.authPersonEmail = 'Please provide a valid email format.';
    }
    if (!pseudoContactName.trim()) errors.pseudoContactName = 'PseudoTeam Contact Name is required.';
    if (!pseudoContactEmail.trim()) {
      errors.pseudoContactEmail = 'PseudoTeam Contact Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(pseudoContactEmail)) {
      errors.pseudoContactEmail = 'Please provide a valid email format.';
    }
    if (!contactNumber.trim()) errors.contactNumber = 'Contact Number is required.';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    const formData = new FormData();

    // Note: project_id is intentionally omitted so the backend generates `Pseudo-YYYY-MMDDHHMMSS`
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('project_is', projectIs.trim());
    formData.append('project_type', projectType.trim());
    formData.append('category', projectCategory.trim());
    formData.append('currency', budgetCurrency);
    formData.append('budget', budgetAmount.replace(/,/g, '').trim());
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('auth_person_name', authPersonName.trim());
    formData.append('auth_person_email', authPersonEmail.trim());
    formData.append('contact_number', contactNumber.trim());
    formData.append('receive_notifications', receiveNotifications ? 'true' : 'false');

    if (receiveNotifications && additionalEmail.trim()) {
      formData.append('additional_email', additionalEmail.trim());
    }

    if (promoCode.trim()) {
      formData.append('promo_code', promoCode.trim());
    }

    if (selectedFile) {
      formData.append('sow_file', selectedFile);
    }

    try {
      await onAddProject(formData);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to upload project. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F4F6F9] overflow-y-auto min-h-0 flex flex-col">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex-1 flex flex-col">

        {/* Top Breadcrumb & Page Header */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 mb-1">
              <button
                onClick={onCancel}
                className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <span>/</span>
              <span className="text-slate-800 font-open-sans">Upload Project</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-open-sans">
              Upload New Project
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Define project specifications, scope of work, budget baseline, and governance contacts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>PseudoTeam Standard SLA</span>
            </span>
          </div>
        </div>

        {/* Validation Error Banner */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 animate-in fade-in duration-200 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold">Please complete all required fields:</div>
              <div className="text-xs sm:text-sm text-rose-700 mt-0.5 list-disc list-inside">
                {Object.values(validationErrors).slice(0, 3).map((err, i) => (
                  <span key={i} className="inline-block mr-3">• {err}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API Submission Error */}
        {submitError && (
          <div
            className="mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700"
            role="alert"
          >
            {submitError}
          </div>
        )}

        {/* Master Form Card */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col w-full">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs w-full flex-1 flex flex-col overflow-hidden mb-4">

            {/* Scrollable Form Content */}
            <div className="p-6 sm:p-8 lg:p-9 space-y-8 flex-1">

              {/* 1. PROJECT DETAILS SECTION */}
              <div id="card-project-details">
                <div className="flex items-center gap-2.5 pb-3.5 mb-5 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Briefcase className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Project Details</h2>
                    <p className="text-xs sm:text-[13px] text-slate-500">Core identification, operational scope, and taxonomy classification</p>
                  </div>
                </div>

                <div className="space-y-4.5">
                  {/* Project Title * */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Project Title <span className="text-blue-600 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (validationErrors.title) {
                          setValidationErrors(prev => ({ ...prev, title: '' }));
                        }
                      }}
                      placeholder="e.g. Project Hyperion NextGen Automation"
                      className={`w-full h-10 px-3.5 py-2 text-sm placeholder:text-sm placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border transition-all ${validationErrors.title
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                        }`}
                    />
                    {validationErrors.title && (
                      <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.title}</p>
                    )}
                  </div>

                  {/* Description * */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Description <span className="text-blue-600 font-bold ml-0.5">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (validationErrors.description) {
                          setValidationErrors(prev => ({ ...prev, description: '' }));
                        }
                      }}
                      placeholder="Provide an overview of the deployment objectives, facility requirements, and functional milestones..."
                      className={`w-full px-3.5 py-2.5 text-sm placeholder:text-sm placeholder:text-slate-400 leading-relaxed bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border transition-all ${validationErrors.description
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                        }`}
                    />
                    {validationErrors.description && (
                      <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.description}</p>
                    )}
                  </div>

                  {/* Scope of Work / File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Scope of Work / File Upload
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center transition-all ${isDragging
                        ? 'border-blue-500 bg-blue-50/70'
                        : 'border-blue-200/80 hover:border-blue-400 bg-[#F8FAFC] hover:bg-[#F0F7FF]/50'
                        }`}
                    >
                      <input
                        type="file"
                        id="file-upload-input"
                        className="hidden"
                        onChange={handleManualFileSelect}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xlsx,.xls,.csv,.zip"
                      />

                      {uploadedFile ? (
                        <div className="flex items-center justify-between p-3.5 bg-white border border-blue-200 rounded-lg max-w-xl mx-auto shadow-2xs">
                          <div className="flex items-center gap-3 text-left overflow-hidden">
                            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="text-sm font-bold text-slate-800 truncate">{uploadedFile.name}</div>
                              <div className="text-xs text-slate-500">{uploadedFile.size} · Uploaded specification</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                              setSelectedFile(null);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors ml-2 cursor-pointer"
                            title="Remove uploaded file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="file-upload-input"
                          className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs mb-0.5">
                            <UploadCloud className="w-4 h-4 stroke-[2]" />
                          </div>
                          <span className="text-sm font-semibold text-slate-800">
                            Drag & drop your SOW specification, or <span className="text-blue-600 hover:underline">browse files</span>
                          </span>
                          <span className="text-xs sm:text-[13px] text-slate-400">
                            Supports PDF, XLSX, CSV, DOCX, JPG, PNG, or ZIP archive
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Three-Column Dropdown Row Matched to Legacy Laravel Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                    {/* Project Is (plist_ongnew) */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Project is <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        value={projectIs}
                        onChange={(e) => {
                          setProjectIs(e.target.value);
                          if (validationErrors.projectIs) {
                            setValidationErrors(prev => ({ ...prev, projectIs: '' }));
                          }
                        }}
                        className={`w-full h-10 px-3.5 py-2 text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border cursor-pointer transition-all ${validationErrors.projectIs
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      >
                        <option value="">-- Select type --</option>
                        <option value="New">New</option>
                        <option value="On Going">On Going</option>
                      </select>
                      {validationErrors.projectIs && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.projectIs}</p>
                      )}
                    </div>

                    {/* Project Type (plist_type) */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Project Type <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        value={projectType}
                        onChange={(e) => {
                          setProjectType(e.target.value);
                          if (validationErrors.projectType) {
                            setValidationErrors(prev => ({ ...prev, projectType: '' }));
                          }
                        }}
                        className={`w-full h-10 px-3.5 py-2 text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border cursor-pointer transition-all ${validationErrors.projectType
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      >
                        <option value="">-- Select type --</option>
                        <option value="On Site">On Site</option>
                        <option value="On Remote">On Remote</option>
                      </select>
                      {validationErrors.projectType && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.projectType}</p>
                      )}
                    </div>

                    {/* Project Category (plist_category) */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Project Category <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        value={projectCategory}
                        onChange={(e) => {
                          setProjectCategory(e.target.value);
                          if (validationErrors.projectCategory) {
                            setValidationErrors(prev => ({ ...prev, projectCategory: '' }));
                          }
                        }}
                        className={`w-full h-10 px-3.5 py-2 text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border cursor-pointer transition-all ${validationErrors.projectCategory
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      >
                        <option value="">-- Select category --</option>
                        <option value="Pre Sales Support">Pre Sales Support</option>
                        <option value="Implementation">Implementation</option>
                        <option value="Post Sales Support">Post Sales Support</option>
                        <option value="Software/Web Development">Software/Web Development</option>
                        <option value="Resource">Resource</option>
                      </select>
                      {validationErrors.projectCategory && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.projectCategory}</p>
                      )}
                    </div>
                  </div>

                  {/* changes done by vb */}

                </div>
              </div>

              {/* 2. BUDGET & TIMELINE SECTION */}
              <div id="card-budget-timeline" className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2.5 pb-3.5 mb-5 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <IndianRupee className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Budget & Timeline</h2>
                    <p className="text-xs sm:text-[13px] text-slate-500">Financial allocation, milestone payout intervals, and delivery window</p>
                  </div>
                </div>

                <div className="space-y-4.5">
                  {/* Budget Currency (Excluded from Laravel changes — kept as-is) | Budget Amount */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Budget Currency <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        value={budgetCurrency}
                        onChange={(e) => setBudgetCurrency(e.target.value)}
                        className="w-full h-10 px-3.5 py-2 text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                        <option value="USD ($)">USD ($) - United States Dollar</option>
                        <option value="EUR (€)">EUR (€) - Eurozone</option>
                        <option value="GBP (£)">GBP (£) - British Pound</option>
                        <option value="SGD (S$)">SGD (S$) - Singapore Dollar</option>
                        <option value="CAD (C$)">CAD (C$) - Canadian Dollar</option>
                        <option value="AUD (A$)">AUD (A$) - Australian Dollar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Budget Amount <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-sm font-semibold text-slate-400">
                          {budgetCurrency.includes('INR') || budgetCurrency.includes('₹') ? '₹' : budgetCurrency.includes('EUR') ? '€' : budgetCurrency.includes('GBP') ? '£' : '$'}
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={budgetAmount}
                          onChange={(e) => {
                            setBudgetAmount(e.target.value);
                            if (validationErrors.budgetAmount) {
                              setValidationErrors(prev => ({ ...prev, budgetAmount: '' }));
                            }
                          }}
                          placeholder="4500000"
                          className={`w-full h-10 pl-8 pr-3.5 py-2 text-sm placeholder:text-sm placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border font-mono transition-all ${validationErrors.budgetAmount
                            ? 'border-rose-400'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                            }`}
                        />
                      </div>
                      {validationErrors.budgetAmount && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.budgetAmount}</p>
                      )}
                    </div>
                  </div>

                  {/* Start Date | End Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Start Date <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (validationErrors.startDate) {
                            setValidationErrors(prev => ({ ...prev, startDate: '' }));
                          }
                        }}
                        className={`w-full h-10 px-3.5 py-2 text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border cursor-pointer transition-all ${validationErrors.startDate
                          ? 'border-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      />
                      {validationErrors.startDate && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        End Date <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          if (validationErrors.endDate) {
                            setValidationErrors(prev => ({ ...prev, endDate: '' }));
                          }
                        }}
                        className={`w-full h-10 px-3.5 py-2 text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border cursor-pointer transition-all ${validationErrors.endDate
                          ? 'border-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      />
                      {validationErrors.endDate && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.endDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Define Interval | Payout Cadence note */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Define Interval
                      </label>
                      <select
                        value={defineInterval}
                        onChange={(e) => setDefineInterval(e.target.value)}
                        className="w-full h-10 px-3.5 py-2 text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="Monthly Milestones">Monthly Milestones (Standard Review)</option>
                        <option value="Quarterly Tranches">Quarterly Tranches</option>
                        <option value="Bi-Weekly Sprints">Bi-Weekly Sprints</option>
                        <option value="Phase-Gated Deliverables">Phase-Gated Deliverables</option>
                        <option value="Lump-Sum upon Acceptance">Lump-Sum upon Acceptance</option>
                      </select>
                    </div>

                    {/* changes done by vb */}
                  </div>

                </div>
              </div>

              {/* 3. CONTACT DETAILS SECTION */}
              <div id="card-contact-details" className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2.5 pb-3.5 mb-5 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Users className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Contact Details</h2>
                    <p className="text-xs sm:text-[13px] text-slate-500">Authorised enterprise lead, assigned PseudoTeam coordinator, and dispatch contact</p>
                  </div>
                </div>

                <div className="space-y-4.5">
                  {/* Authorised Person Name | Authorised Person Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Authorised Person Name <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={authPersonName}
                        onChange={(e) => {
                          setAuthPersonName(e.target.value);
                          if (validationErrors.authPersonName) {
                            setValidationErrors(prev => ({ ...prev, authPersonName: '' }));
                          }
                        }}
                        placeholder="Name of the authorised person"
                        className={`w-full h-10 px-3.5 py-2 text-sm placeholder:text-sm placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border transition-all ${validationErrors.authPersonName
                          ? 'border-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      />
                      {validationErrors.authPersonName && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.authPersonName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Authorised Person Email <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="email"
                        value={authPersonEmail}
                        onChange={(e) => {
                          setAuthPersonEmail(e.target.value);
                          if (validationErrors.authPersonEmail) {
                            setValidationErrors(prev => ({ ...prev, authPersonEmail: '' }));
                          }
                        }}
                        placeholder="Email of the authorised person"
                        className={`w-full h-10 px-3.5 py-2 text-sm placeholder:text-sm placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border transition-all ${validationErrors.authPersonEmail
                          ? 'border-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      />
                      {validationErrors.authPersonEmail && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.authPersonEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* PseudoTeam Contact Name | PseudoTeam Contact Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        PseudoTeam Contact Name <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={pseudoContactName}
                        onChange={(e) => {
                          setPseudoContactName(e.target.value);
                          if (validationErrors.pseudoContactName) {
                            setValidationErrors(prev => ({ ...prev, pseudoContactName: '' }));
                          }
                        }}
                        placeholder="e.g. Kavita Nair"
                        className={`w-full h-10 px-3.5 py-2 text-sm placeholder:text-sm placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border transition-all ${validationErrors.pseudoContactName
                          ? 'border-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      />
                      {validationErrors.pseudoContactName && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.pseudoContactName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        PseudoTeam Contact Email <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="email"
                        value={pseudoContactEmail}
                        onChange={(e) => {
                          setPseudoContactEmail(e.target.value);
                          if (validationErrors.pseudoContactEmail) {
                            setValidationErrors(prev => ({ ...prev, pseudoContactEmail: '' }));
                          }
                        }}
                        placeholder="kavita.nair@pseudoteam.in"
                        className={`w-full h-10 px-3.5 py-2 text-sm placeholder:text-sm placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border transition-all ${validationErrors.pseudoContactEmail
                          ? 'border-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      />
                      {validationErrors.pseudoContactEmail && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.pseudoContactEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Contact Number <span className="text-blue-600 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactNumber}
                        onChange={(e) => {
                          setContactNumber(e.target.value);
                          if (validationErrors.contactNumber) {
                            setValidationErrors(prev => ({ ...prev, contactNumber: '' }));
                          }
                        }}
                        placeholder="Contact no. of authorised person"
                        className={`w-full h-10 px-3.5 py-2 text-sm placeholder:text-sm placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-lg border transition-all ${validationErrors.contactNumber
                          ? 'border-rose-400'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                          }`}
                      />
                      {validationErrors.contactNumber && (
                        <p className="text-xs sm:text-[13px] text-rose-600 mt-1.5 font-medium">{validationErrors.contactNumber}</p>
                      )}
                    </div>

                    {/* changes done by vb */}
                  </div>

                </div>
              </div>

              {/* 4 & 5. NOTIFICATIONS & PROMOTION SECTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-100">

                {/* 4. NOTIFICATIONS */}
                <div id="card-notifications" className="p-5 rounded-xl bg-slate-50/50 border border-slate-200/70 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70">
                    <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                      <Bell className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h2 className="text-[15px] sm:text-base font-bold text-slate-900 tracking-tight">Notifications</h2>
                      <p className="text-xs text-slate-500">Milestone completion alerts and priority escalation</p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200/80">
                    <div className="pr-3">
                      <div className="text-sm font-semibold text-slate-900">Receive notification emails</div>
                      <p className="text-xs text-slate-500 mt-0.5">Auto-send milestone status & sign-off alerts.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !receiveNotifications;
                        setReceiveNotifications(next);
                        if (!next) setAdditionalEmail('');
                      }}
                      className={`relative inline-flex h-5.5 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${receiveNotifications ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${receiveNotifications ? 'translate-x-5.5' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Additional Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Additional Email <span className="text-slate-400 font-normal text-xs sm:text-[13px]">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={additionalEmail}
                      readOnly={!receiveNotifications}
                      onChange={(e) => setAdditionalEmail(e.target.value)}
                      placeholder="Additional email"
                      className={`w-full h-10 px-3.5 py-2 text-sm placeholder:text-sm placeholder:text-slate-400 rounded-lg border transition-all ${!receiveNotifications
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-900 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none'
                        }`}
                    />
                  </div>
                </div>

                {/* 5. PROMOTION */}
                <div id="card-promotion" className="p-5 rounded-xl bg-slate-50/50 border border-slate-200/70 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70">
                    <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Tag className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h2 className="text-[15px] sm:text-base font-bold text-slate-900 tracking-tight">Promotion</h2>
                      <p className="text-xs text-slate-500">Enterprise partnership discount voucher & referral code</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Coupon/Promo Code <span className="text-slate-400 font-normal text-xs sm:text-[13px]">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError('');
                          setPromoApplied(false);
                        }}
                        placeholder="Add your coupon or promocode here"
                        className="flex-1 h-10 px-3.5 py-2 text-sm placeholder:text-sm placeholder:text-slate-400 bg-white text-slate-900 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none uppercase font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="h-10 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shrink-0 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {promoApplied && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs sm:text-[13px] font-semibold text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Promo code applied! 10% partner credit recorded.</span>
                      </div>
                    )}
                    {promoError && (
                      <p className="mt-1.5 text-xs sm:text-[13px] text-rose-600 font-medium">
                        {promoError}
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* 6. FIXED BOTTOM ACTION AREA */}
            <div
              id="upload-actions-bar"
              className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-xs border-t border-slate-200/90 px-6 sm:px-8 py-3.5 shadow-md flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">All enterprise project data encrypted under ISO 27001 SLA</span>
                <span className="sm:hidden">ISO 27001 Encrypted</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  id="btn-upload-cancel"
                  className="h-10 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="btn-upload-submit"
                  disabled={isSubmitting}
                  className="h-10 px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer font-open-sans"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isSubmitting ? 'Uploading...' : 'Upload Project'}</span>
                </button>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};