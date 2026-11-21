import React, { useEffect, useState } from 'react';
import {
  User,
  MapPin,
  ShieldCheck,
  KeyRound,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

import { UserProfileData } from './LoginPage';
import { ProfileTab } from './account/ProfileTab';
import { LocationTab } from './account/LocationTab';
import { IdentityTab } from './account/IdentityTab';
import { SecurityTab } from './account/SecurityTab';

import {
  getAccountProfile,
  getAccountAvatar,
  updateAccountProfile,
  updateAccountLocation,
  updateAccountIdentity,
  updateAccountPassword
} from '../services/account.service';

// ==================================================
// PROPS
// ==================================================

interface AccountProfileViewProps {
  initialProfileData?: UserProfileData;
  onBackToDashboard: () => void;
  onShowToast: (message: string) => void;
}

type AccountNavTab = 'profile' | 'location' | 'identity' | 'security';

// ==================================================
// CITY LIST
// ==================================================

const INDIAN_CITIES = [
  'Delhi',
  'New Delhi',
  'Gurugram',
  'Noida',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Chandigarh',
  'Jaipur',
  'Kochi'
];

// ==================================================
// ACCOUNT PROFILE VIEW
// ==================================================

export const AccountProfileView: React.FC<AccountProfileViewProps> = ({
  initialProfileData,
  onBackToDashboard,
  onShowToast
}) => {

  // ==================================================
  // NAVIGATION
  // ==================================================

  const [activeTab, setActiveTab] = useState<AccountNavTab>('profile');

  // ==================================================
  // PROFILE INFORMATION
  // ==================================================

  const [firstName, setFirstName] = useState('Vaniya');
  const [lastName, setLastName] = useState('Batra');
  const [email, setEmail] = useState('vaniya.batra@pseudoteam.io');
  const [phone, setPhone] = useState('+91 98100 23456');

  const [jobTitle, setJobTitle] = useState(
    'Senior Project Director, Global Operations'
  );

  const [department, setDepartment] = useState(
    'Industrial Delivery & Logistics'
  );

  const [organization, setOrganization] = useState(
    'PseudoTeam Technologies India Pvt Ltd'
  );

  const [timezone, setTimezone] = useState(
    'IST (UTC+05:30) - Asia/Kolkata (New Delhi)'
  );

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // ==================================================
  // LOCATION INFORMATION
  // ==================================================

  const [country, setCountry] = useState(
    initialProfileData?.country || 'India'
  );

  const [city, setCity] = useState(
    initialProfileData?.city || 'Delhi'
  );

  const [state, setState] = useState('');

  const [pincode, setPincode] = useState(
    initialProfileData?.pincode || '110001'
  );

  const [mailingAddress, setMailingAddress] = useState(
    initialProfileData?.mailingAddress ||
    'Plot 42, DLF Cyber City, Sector 24, Gurugram, Delhi NCR'
  );

  // ==================================================
  // IDENTITY & VERIFICATION
  // ==================================================

  const [entityType, setEntityType] = useState<
    'Organization' | 'Individual'
  >(
    initialProfileData?.entityType || 'Organization'
  );

  const [about, setAbout] = useState(
    initialProfileData?.aboutWork ||
    'Enterprise Cloud Infrastructure, Automation & Logistics Services'
  );

  const [orgName, setOrgName] = useState(
    'PseudoTeam Technologies India Pvt Ltd'
  );

  const [cin, setCin] = useState(
    initialProfileData?.cin || 'U72900DL2021PTC384920'
  );

  const [gstNumber, setGstNumber] = useState(
    initialProfileData?.gstNumber || '07AAAAA0000A1Z5'
  );

  const [idFileName, setIdFileName] = useState<string | null>(
    initialProfileData?.idFileName || 'Aadhaar_National_ID_Vaniya.pdf'
  );

  // ==================================================
  // PASSWORD & SECURITY
  // ==================================================

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);

  // ==================================================
  // FETCH ACCOUNT PROFILE FROM FASTAPI
  // ==================================================

  useEffect(() => {
    let isMounted = true;
    let avatarObjectUrl: string | null = null;

    const loadAccountProfile = async () => {
      try {
        const response = await getAccountProfile();

        if (!response.success || !response.profile) {
          throw new Error('Unable to load account profile.');
        }

        if (!isMounted) return;

        const profile = response.profile;

        // Load the authenticated customer's profile picture from pown_dp.
        if (profile.hasAvatar) {
          try {
            const imageUrl = await getAccountAvatar();

            if (!isMounted) {
              URL.revokeObjectURL(imageUrl);
              return;
            }

            avatarObjectUrl = imageUrl;
            setAvatarUrl(imageUrl);
          } catch (avatarError) {
            console.error('Profile picture loading error:', avatarError);
            if (isMounted) setAvatarUrl(null);
          }
        } else {
          setAvatarUrl(null);
        }

        // Profile Information
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setOrganization(profile.organization || '');

        // Location Information
        setCountry(profile.country || 'India');
        setState(profile.state || '');
        setPincode(profile.pincode || '');
        setMailingAddress(profile.address || '');

        // Identity Information
        setAbout(profile.about || '');
        setOrgName(profile.organization || '');
        setCin(profile.cin || '');
        setGstNumber(profile.gstNumber || '');
        setIdFileName(profile.aadhaarFileName || null);

      } catch (error) {
        console.error('Account profile loading error:', error);

        if (isMounted) {
          onShowToast(
            error instanceof Error
              ? error.message
              : 'Unable to load account information.'
          );
        }
      }
    };

    loadAccountProfile();

    return () => {
      isMounted = false;

      if (avatarObjectUrl) {
        URL.revokeObjectURL(avatarObjectUrl);
      }
    };
  }, [onShowToast]);

  // ==================================================
  // SAVE HANDLERS
  // These will be connected to PATCH APIs next.
  // ==================================================

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await updateAccountProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organization: organization.trim()
      });

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to save profile changes.'
        );
      }

      // Keep the displayed values in sync with the saved backend profile.
      if (response.profile) {
        setFirstName(response.profile.firstName || '');
        setLastName(response.profile.lastName || '');
        setEmail(response.profile.email || '');
        setPhone(response.profile.phone || '');
        setOrganization(response.profile.organization || '');
      }

      onShowToast(
        response.message || 'Profile changes saved successfully.'
      );
    } catch (error) {
      console.error('Profile update error:', error);

      onShowToast(
        error instanceof Error
          ? error.message
          : 'Unable to update profile. Please try again.'
      );
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await updateAccountLocation({
        country: country.trim(),
        state: state.trim(),
        address: mailingAddress.trim(),
        pincode: pincode.trim()
      });

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to save location details.'
        );
      }

      // Keep the form synchronized with the saved backend profile.
      if (response.profile) {
        setCountry(response.profile.country || '');
        setState(response.profile.state || '');
        setPincode(response.profile.pincode || '');
        setMailingAddress(response.profile.address || '');
      }

      onShowToast(
        response.message || 'Location details updated successfully.'
      );
    } catch (error) {
      console.error('Location update error:', error);

      onShowToast(
        error instanceof Error
          ? error.message
          : 'Unable to update location details. Please try again.'
      );
    }
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await updateAccountIdentity({
        about: about.trim(),
        organization_name: orgName.trim(),
        cin: cin.trim(),
        gst_number: gstNumber.trim(),
        aadhaar_file_name: idFileName || undefined
      });

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to save identity information.'
        );
      }

      // Keep the form synchronized with the saved backend profile.
      if (response.profile) {
        setAbout(response.profile.about || '');
        setOrgName(response.profile.organization || '');
        setCin(response.profile.cin || '');
        setGstNumber(response.profile.gstNumber || '');
        setIdFileName(response.profile.aadhaarFileName || null);
      }

      onShowToast(
        response.message || 'Identity and verification records saved successfully.'
      );
    } catch (error) {
      console.error('Identity update error:', error);

      onShowToast(
        error instanceof Error
          ? error.message
          : 'Unable to update identity information. Please try again.'
      );
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setPwError(null);

    if (!currentPassword) {
      setPwError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirm password do not match.');
      return;
    }

    try {
      const response = await updateAccountPassword({
        current_password: currentPassword,
        new_password: newPassword
      });

      if (!response.success) {
        throw new Error(response.message || 'Unable to update password.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      onShowToast(response.message || 'Password updated successfully.');
    } catch (error) {
      console.error('Password update error:', error);

      setPwError(
        error instanceof Error
          ? error.message
          : 'Unable to update password. Please try again.'
      );
    }
  };

  // ==================================================

  const navMenuItems = [
    {
      id: 'profile' as AccountNavTab,
      label: 'Profile',
      icon: User
    },
    {
      id: 'location' as AccountNavTab,
      label: 'Location',
      icon: MapPin
    },
    {
      id: 'identity' as AccountNavTab,
      label: 'Identity & Verification',
      icon: ShieldCheck
    },
    {
      id: 'security' as AccountNavTab,
      label: 'Password & Security',
      icon: KeyRound
    }
  ];

  const fullName = `${firstName} ${lastName}`.trim();

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div
      id="account-profile-view"
      className="flex-1 w-full min-h-[calc(100dvh-56px)] md:h-[calc(100dvh-56px)] bg-[#F8FAFC] flex flex-col overflow-y-auto md:overflow-hidden text-slate-800"
    >

      {/* ==================================================
          ACCOUNT HEADER
      ================================================== */}

      <div
        id="account-header"
        className="shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">

          {/* Back Button & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              id="account-back-dashboard-btn"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Account & Profile
                </h1>

                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                  Enterprise Portal
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-500">
                Manage your profile, account information and security settings.
              </p>
            </div>
          </div>

          {/* Dynamic Profile Summary */}
          <div
            id="account-header-profile-summary"
            className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1 shadow-2xs"
          >
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || 'Customer'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
                  {initials || 'C'}
                </div>
              )}

              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {fullName || 'Customer'}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span>Customer Account</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-emerald-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          MAIN TWO-COLUMN LAYOUT
      ================================================== */}

      <div className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-3 sm:p-4 lg:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 overflow-visible md:overflow-hidden">

        {/* ==================================================
            LEFT NAVIGATION
        ================================================== */}

        <aside
          id="account-left-navigation"
          className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col h-auto md:h-full overflow-hidden"
        >

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-col bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-xs h-full min-h-0 overflow-hidden">

            <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Account Settings
            </div>

            <nav className="space-y-1 shrink-0">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    id={`account-nav-${item.id}`}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1 rounded-md transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <span className="truncate">{item.label}</span>
                    </div>

                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0 ml-1.5" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Security Information */}
            <div className="mt-auto pt-2.5 border-t border-slate-100 px-2.5 py-2 bg-slate-50/70 rounded-lg shrink-0">
              <div className="flex items-center gap-1.5 text-slate-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Enterprise Security</span>
              </div>

              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                256-bit encryption active. Compliant with Indian DPDP & ISO 27001 standards.
              </p>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden overflow-x-auto no-scrollbar gap-1 p-1 bg-white border border-slate-200/90 rounded-lg shadow-xs">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  id={`mobile-account-nav-${item.id}`}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ==================================================
            RIGHT CONTENT PANEL
        ================================================== */}

        <main
          id="account-main-content-card"
          className="flex-1 min-h-0 h-full bg-white border border-slate-200/90 rounded-xl shadow-xs p-3.5 sm:p-4 lg:p-5 flex flex-col overflow-hidden"
        >

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <ProfileTab
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              jobTitle={jobTitle}
              setJobTitle={setJobTitle}
              department={department}
              setDepartment={setDepartment}
              organization={organization}
              setOrganization={setOrganization}
              timezone={timezone}
              setTimezone={setTimezone}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              onSave={handleSaveProfile}
              onShowToast={onShowToast}
            />
          )}

          {/* LOCATION TAB */}
          {activeTab === 'location' && (
            <LocationTab
              country={country}
              setCountry={setCountry}
              city={city}
              setCity={setCity}
              state={state}
              pincode={pincode}
              setPincode={setPincode}
              mailingAddress={mailingAddress}
              setMailingAddress={setMailingAddress}
              indianCities={INDIAN_CITIES}
              onSave={handleSaveLocation}
            />
          )}

          {/* IDENTITY TAB */}
          {activeTab === 'identity' && (
            <IdentityTab
              entityType={entityType}
              setEntityType={setEntityType}
              orgName={orgName}
              setOrgName={setOrgName}
              about={about}
              setAbout={setAbout}
              cin={cin}
              setCin={setCin}
              gstNumber={gstNumber}
              setGstNumber={setGstNumber}
              idFileName={idFileName}
              setIdFileName={setIdFileName}
              onSave={handleSaveIdentity}
              onShowToast={onShowToast}
            />
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <SecurityTab
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              onUpdatePassword={handleUpdatePassword}
              pwError={pwError}
            />
          )}
        </main>
      </div>
    </div>
  );
};