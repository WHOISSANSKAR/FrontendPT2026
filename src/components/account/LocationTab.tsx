
import React from 'react';
import { Check } from 'lucide-react'; // changes done by vb

interface LocationTabProps {
  country: string;
  setCountry: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  state: string;
  pincode: string;
  setPincode: (val: string) => void;
  mailingAddress: string;
  setMailingAddress: (val: string) => void;
  indianCities: string[];
  onSave: (e: React.FormEvent) => void;
}

export const LocationTab: React.FC<LocationTabProps> = ({
  country,
  setCountry,
  city,
  setCity,
  state,
  pincode,
  setPincode,
  mailingAddress,
  setMailingAddress,
  indianCities,
  onSave
}) => {
  return (
    <div id="section-location" className="h-full flex flex-col min-h-0">
      {/* Tab Header */}
      <div className="shrink-0 border-b border-slate-100 pb-2 mb-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
          Location
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-500">
          Manage your location, regional branch and critical spare delivery address.
        </p>
      </div>

      {/* Main Form */}
      <form
        onSubmit={onSave}
        className="flex-1 min-h-0 flex flex-col justify-between gap-3"
      >
        <div className="space-y-3 overflow-y-auto no-scrollbar pr-0.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">

            {/* Country */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
                required
              >
                <option value="India">India</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Singapore">Singapore</option>
                <option value="Germany">Germany</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
                required
              >
                {indianCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-mono"
                placeholder="110001"
                pattern="[0-9]{6}"
                title="6-digit Indian PIN code"
                required
              />
            </div>

            {/* State / Territory */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                State / Territory
              </label>
              <input
                type="text"
                value={state}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none cursor-not-allowed"
                readOnly
              />
            </div>

            {/* Mailing Address */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mailing Address
              </label>
              <textarea
                rows={2}
                value={mailingAddress}
                onChange={(e) => setMailingAddress(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all resize-none h-16"
                placeholder="Plot / Building, Street, Area, City, Pin Code"
                required
              />
            </div>
          </div>

          {/* changes done by vb */}
        </div>

        {/* Action Bar */}
        <div className="shrink-0 pt-2 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            id="save-location-btn"
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