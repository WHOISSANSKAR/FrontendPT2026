import React, { useEffect, useRef, useState } from 'react';
import {
  getAccountAvatar,
  uploadAccountAvatar,
  deleteAccountAvatar,
} from "../../services/account.service";
import { Camera, Trash2, Check } from 'lucide-react';

interface ProfileTabProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  jobTitle: string;
  setJobTitle: (val: string) => void;
  department: string;
  setDepartment: (val: string) => void;
  organization?: string;
  setOrganization?: (val: string) => void;
  timezone: string;
  setTimezone: (val: string) => void;
  avatarUrl: string | null;
  setAvatarUrl: (val: string | null) => void;
  onSave: (e: React.FormEvent) => void;
  onShowToast: (msg: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  jobTitle,
  setJobTitle,
  department,
  setDepartment,
  // organization,
  // setOrganization,
  timezone,
  setTimezone,
  avatarUrl,
  setAvatarUrl,
  onSave,
  onShowToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const managedAvatarUrlRef = useRef<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (managedAvatarUrlRef.current) {
        URL.revokeObjectURL(managedAvatarUrlRef.current);
      }
    };
  }, []);

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    // Allow selecting the same file again after an upload attempt.
    e.target.value = '';

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      onShowToast('Please select a JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Image size must not exceed 5 MB.');
      return;
    }

    setIsAvatarLoading(true);

    try {
      await uploadAccountAvatar(file);

      try {
        const newAvatarUrl = await getAccountAvatar();

        if (managedAvatarUrlRef.current) {
          URL.revokeObjectURL(managedAvatarUrlRef.current);
        }

        managedAvatarUrlRef.current = newAvatarUrl;
        setAvatarUrl(newAvatarUrl);
        onShowToast('Profile picture updated successfully.');
      } catch (refreshError) {
        // The upload has already succeeded; only the preview refresh failed.
        console.error('Profile picture preview refresh error:', refreshError);
        onShowToast('Picture uploaded, but the preview could not be refreshed. Please reload the page.');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      onShowToast(
        error instanceof Error
          ? error.message
          : 'Unable to upload profile picture.'
      );
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsAvatarLoading(true);

    try {
      await deleteAccountAvatar();

      if (managedAvatarUrlRef.current) {
        URL.revokeObjectURL(managedAvatarUrlRef.current);
        managedAvatarUrlRef.current = null;
      }

      setAvatarUrl(null);
      onShowToast('Profile picture removed. Default initials avatar restored.');
    } catch (error) {
      console.error('Profile picture deletion error:', error);
      onShowToast(
        error instanceof Error
          ? error.message
          : 'Unable to remove profile picture.'
      );
    } finally {
      setIsAvatarLoading(false);
    }
  };

  return (
    <div id="section-profile" className="h-full flex flex-col min-h-0">
      {/* Tab Header - Compact */}
      <div className="shrink-0 border-b border-slate-100 pb-2 mb-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
          Profile
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-500">
          Manage your personal profile information and operational role.
        </p>
      </div>

      {/* Main Form container taking full available height with action bar at bottom */}
      <form onSubmit={onSave} className="flex-1 min-h-0 flex flex-col justify-between gap-3">
        <div className="space-y-3 overflow-y-auto no-scrollbar pr-0.5">
          {/* Profile Picture Card - Compact Banner */}
          <div className="px-3.5 py-2.5 rounded-xl bg-blue-50/50 border border-blue-100/70 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={`${firstName} ${lastName}`.trim() || "Profile picture"}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs ring-1 ring-blue-500/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-sm flex items-center justify-center border-2 border-white shadow-xs ring-1 ring-blue-500/20">
                    {(firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U'}
                  </div>
                )}
                <button 
                  type="button"
                  disabled={isAvatarLoading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full border-2 border-white shadow-2xs transition-transform active:scale-95 cursor-pointer"
                  title="Change Avatar"
                >
                  <Camera className="w-3 h-3" />
                </button>
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isAvatarLoading}
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                    {firstName} {lastName}
                  </h3>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100/80 text-blue-800">
                    Customer Account
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {email}
                </p>
                <p className="text-[10px] text-slate-600 truncate mt-0.5 font-medium">
                  {jobTitle}
                </p>
              </div>
            </div>

            {/* Avatar Actions Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={isAvatarLoading}
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-200 text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-[0.99] flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload Profile Picture</span>
                <span className="sm:hidden">Upload</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  disabled={isAvatarLoading}
                  onClick={handleRemoveAvatar}
                  className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  title="Remove Picture"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              )}
            </div>
          </div>

          {/* Form Fields Grid - 2 columns, compact row height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* First Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                First Name
              </label>
              <input 
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                placeholder="First Name"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Last Name
              </label>
              <input 
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                placeholder="Last Name"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 pl-3 pr-16 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                  placeholder="name@company.com"
                  required
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                placeholder="+91 98100 23456"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Job Title / Designation
              </label>
              <input 
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                placeholder="Senior Project Director"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input 
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                placeholder="Operations"
              />
            </div>

            {/* Organization */}
            {/* <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Organization
              </label>
              <input 
                type="text"
                value={organization ?? ''}
                onChange={(e) => setOrganization?.(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                placeholder="PseudoTeam Technologies"
              />
            </div> */}

            {/* Timezone */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Timezone & Region
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="IST (UTC+05:30) - Asia/Kolkata (New Delhi)">IST (UTC+05:30) - Asia/Kolkata (New Delhi)</option>
                <option value="GST (UTC+04:00) - Asia/Dubai">GST (UTC+04:00) - Asia/Dubai</option>
                <option value="SGT (UTC+08:00) - Asia/Singapore">SGT (UTC+08:00) - Asia/Singapore</option>
                <option value="GMT (UTC+00:00) - Europe/London">GMT (UTC+00:00) - Europe/London</option>
                <option value="CET (UTC+01:00) - Europe/Berlin">CET (UTC+01:00) - Europe/Berlin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Bar - Pinned to bottom right */}
        <div className="shrink-0 pt-2 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            id="save-profile-btn"
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