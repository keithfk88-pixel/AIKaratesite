import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  UploadCloud,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

export function SupabaseStatusModal({
  open,
  statusData,
  onClose,
  onStatusUpdated,
  onStudentsSynced,
}) {
  const [urlInput, setUrlInput] = useState(statusData?.projectUrlMasked || '');
  const [keyInput, setKeyInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!open) return null;

  const isLiveSupabase = Boolean(statusData?.connected && statusData?.tableReady);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(statusData?.schemaSql || '');
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      setCopiedSql(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!urlInput.trim() || !keyInput.trim()) {
      setErrorMsg('Please provide both your Supabase Project URL and API Key.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API}/api/supabase/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlInput.trim(),
          key: keyInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || data.error || 'Could not connect to Supabase.');
        return;
      }
      onStatusUpdated(data);
      setKeyInput('');
      setSuccessMsg(data.message || 'Supabase configuration updated!');
      onStudentsSynced();
    } catch {
      setErrorMsg('Network error communicating with FastAPI backend.');
    } finally {
      setBusy(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/supabase/sync`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || 'Unable to sync records to Supabase.');
        return;
      }
      setSuccessMsg(data.message);
      onStudentsSynced();
    } catch {
      setErrorMsg('Network error during sync.');
    } finally {
      setBusy(false);
    }
  };

  const handleRefreshStatus = async () => {
    setErrorMsg('');
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/supabase/status`);
      if (res.ok) {
        const data = await res.json();
        onStatusUpdated(data);
        onStudentsSynced();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl border border-washi-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#181615] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-[#E5C17B]" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E5C17B]">
                Backend Architecture
              </p>
              <h3 className="font-dojo text-lg font-bold">FastAPI + Supabase PostgreSQL</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`${API}/docs`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              <span>OpenAPI /docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Live Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
              isLiveSupabase
                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                : 'bg-washi-warm border-washi-border text-sumi'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    isLiveSupabase ? 'text-[#059669]' : 'text-kiniro'
                  }`}
                />
                <span>
                  {isLiveSupabase
                    ? 'Connected to Live Supabase PostgreSQL'
                    : 'FastAPI Active · Ready for Supabase Project Credentials'}
                </span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {statusData?.message ||
                  'Connect your Supabase project via Arena Connected Apps or paste your project URL and API key below.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={busy}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-washi-border text-xs font-semibold text-sumi hover:bg-washi"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
              <span>Re-check</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-crimson-soft border border-crimson/30 flex items-start gap-2.5 text-xs font-medium text-crimson">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-start gap-2.5 text-xs font-medium text-[#065F46]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#059669]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleConnect} className="space-y-4">
            <h4 className="font-semibold text-sumi">
              1. Connect Supabase Project Credentials (or set in <code className="text-crimson">.env</code>)
            </h4>

            <div className="grid grid-cols-1 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-sumi-muted mb-1">
                  SUPABASE_URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full rounded-lg border border-washi-border px-3.5 py-2 text-sm text-sumi focus:outline-none focus:ring-2 focus:ring-crimson/25"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sumi-muted mb-1">
                  SUPABASE_KEY (Anon Public Key or Service Role Key)
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full rounded-lg border border-washi-border px-3.5 py-2 text-sm text-sumi focus:outline-none focus:ring-2 focus:ring-crimson/25"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2.5 rounded-lg bg-crimson hover:bg-crimson-dark disabled:opacity-60 text-white text-xs font-semibold transition-colors"
              >
                {busy ? 'Testing Connection...' : 'Save & Connect Supabase'}
              </button>

              {statusData?.connected && (
                <button
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={busy || !statusData?.tableReady}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-washi-border hover:bg-washi disabled:opacity-50 text-xs font-semibold text-sumi transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-crimson" />
                  <span>Sync Local Records to Supabase</span>
                </button>
              )}
            </div>
          </form>

          {/* SQL Migration Preview */}
          <div className="space-y-2.5 pt-2 border-t border-washi-border">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sumi">
                2. PostgreSQL Table Schema (<code className="text-crimson">supabase/schema.sql</code>)
              </h4>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-washi-warm hover:bg-washi-border/60 text-xs font-semibold text-sumi transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Copied SQL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-[#181615] text-[#E6E0D8] text-xs font-mono overflow-x-auto max-h-48 leading-relaxed">
              {statusData?.schemaSql || '-- Schema located at supabase/schema.sql'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}