"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [company, setCompany] = useState("Acme Corp");
  const [fiscalYearStart, setFiscalYearStart] = useState("2025-01-01");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // For now this is local-only. Could be persisted later.
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[var(--light-green)] rounded-xl flex items-center justify-center">
              <span className="text-lg">🏢</span>
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">Company Profile</h3>
          </div>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Company Name</label>
              <input 
                value={company} 
                onChange={(e)=>setCompany(e.target.value)} 
                className="input w-full" 
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Fiscal Year Start</label>
              <input 
                type="date" 
                value={fiscalYearStart} 
                onChange={(e)=>setFiscalYearStart(e.target.value)} 
                className="input w-full" 
              />
            </div>
            <button disabled={saving} className="btn-primary w-full disabled:opacity-50">
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[var(--light-green)] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--foreground)]">Dark Mode</div>
                <div className="text-sm text-[var(--text-muted)]">Switch to dark theme</div>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--foreground)]">Email Notifications</div>
                <div className="text-sm text-[var(--text-muted)]">Receive email updates</div>
              </div>
              <div className="w-12 h-6 bg-[var(--primary-green)] rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--foreground)]">Auto-save</div>
                <div className="text-sm text-[var(--text-muted)]">Automatically save changes</div>
              </div>
              <div className="w-12 h-6 bg-[var(--primary-green)] rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[var(--light-green)] rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)]">Security</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-[var(--foreground)] mb-2">Change Password</h4>
            <div className="space-y-3">
              <input type="password" className="input w-full" placeholder="Current password" />
              <input type="password" className="input w-full" placeholder="New password" />
              <input type="password" className="input w-full" placeholder="Confirm new password" />
              <button className="btn-secondary">Update Password</button>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-[var(--foreground)] mb-2">Two-Factor Authentication</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[var(--sidebar-bg)] rounded-lg">
                <span className="text-sm">SMS Authentication</span>
                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--sidebar-bg)] rounded-lg">
                <span className="text-sm">Authenticator App</span>
                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


