/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Artwork Proof Viewer
 * Secure, accessible viewer for card design proofs (BAT) with zoom and approval flow.
 */

import React, { useState } from 'react';
import { NfcCardOrder, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { isValidExternalUrl } from '../../utils/pricingAndAccess';
import { ProofRevisionModal } from './ProofRevisionModal';
import {
  FileCheck,
  Maximize2,
  Download,
  AlertTriangle,
  X,
  FileText,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';

interface ArtworkProofViewerProps {
  order: NfcCardOrder;
  currentLanguage: Language;
  onApproveProof: (orderId: string) => Promise<void> | void;
  onRequestProofChange: (orderId: string, reason: string) => Promise<void> | void;
}

export const ArtworkProofViewer: React.FC<ArtworkProofViewerProps> = ({
  order,
  currentLanguage,
  onApproveProof,
  onRequestProofChange,
}) => {
  const t = translations[currentLanguage];

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isConfirmApprovalOpen, setIsConfirmApprovalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const proofUrl = order.proofUrl?.trim();
  const hasProof = Boolean(proofUrl);
  const isUrlValid = hasProof && isValidExternalUrl(proofUrl!);
  const isPdf = isUrlValid && proofUrl!.toLowerCase().includes('.pdf');

  const handleApprove = async () => {
    if (!hasProof || !isUrlValid || isApproving) return;
    setIsApproving(true);
    setApprovalError(null);
    try {
      await onApproveProof(order.id);
      setIsConfirmApprovalOpen(false);
    } catch (err: any) {
      console.error('[TAGTOP ArtworkProofViewer] Approval error:', err);
      setApprovalError(err?.message || 'Error approving artwork proof');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="p-5 bg-white rounded-2xl border border-amber-300 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
          <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t.customerDashboard.artworkProofTitle}</span>
        </div>
        <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
          {order.cardColor === 'black' ? t.configurator.matteBlack : t.configurator.matteWhite} · {order.cardBranding === 'branded' ? t.configurator.brandedOption : t.configurator.unbrandedOption}
        </span>
      </div>

      <p className="text-xs text-slate-600">
        {t.customerDashboard.proofReadyDesc}
      </p>

      {/* Proof Content Viewer */}
      {!hasProof ? (
        /* Empty State: No proof uploaded yet - NEVER fabricate a preview */
        <div className="p-4 rounded-xl bg-amber-50/70 border border-dashed border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{t.customerDashboard.artworkProofEmpty}</p>
            <p className="text-[11px] text-amber-800/80">
              {t.customerDashboard.proofApprovalDisabledNoProof}
            </p>
          </div>
        </div>
      ) : !isUrlValid ? (
        /* Invalid URL State: Blocks malicious protocols */
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{t.customerDashboard.artworkProofInvalidUrl}</p>
            <p className="text-[11px] text-red-700/80 font-mono mt-0.5 break-all">{proofUrl}</p>
          </div>
        </div>
      ) : isPdf ? (
        /* PDF Document Proof */
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">BAT_Maquette_{order.id}.pdf</p>
              <p className="text-[11px] text-slate-500">{t.customerDashboard.artworkProofPdfNotice}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t.customerDashboard.artworkProofOpen}</span>
            </a>
            <a
              href={proofUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.customerDashboard.artworkProofDownload}</span>
            </a>
          </div>
        </div>
      ) : (
        /* Image Proof with zoom inspection */
        <div className="space-y-2">
          <div className="relative group bg-neutral-900 rounded-xl overflow-hidden border border-slate-200 aspect-16/10 flex items-center justify-center max-h-72">
            {imageLoadError ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                <p>Impossible d’afficher l'aperçu de l'image.</p>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-amber-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Ouvrir le fichier directement</span>
                </a>
              </div>
            ) : (
              <>
                <img
                  src={proofUrl}
                  alt={`BAT ${order.id}`}
                  loading="lazy"
                  onError={() => setImageLoadError(true)}
                  className="max-h-full max-w-full object-contain cursor-zoom-in"
                  onClick={() => setIsZoomOpen(true)}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  <span className="bg-white/90 text-black text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{t.customerDashboard.artworkProofZoom}</span>
                  </span>
                </div>
              </>
            )}
          </div>

          {!imageLoadError && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Cliquer sur l'image pour agrandir et vérifier les détails.</span>
              <a
                href={proofUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold"
              >
                <Download className="w-3 h-3" />
                <span>{t.customerDashboard.artworkProofDownload}</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-amber-200 flex-wrap">
        <button
          type="button"
          disabled={!hasProof || !isUrlValid}
          onClick={() => setIsConfirmApprovalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.customerDashboard.approveProofBtn}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsRevisionModalOpen(true)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          {t.customerDashboard.requestProofChangeBtn}
        </button>
      </div>

      {/* Approval Confirmation Dialog */}
      {isConfirmApprovalOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-approval-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 id="confirm-approval-title" className="font-bold text-slate-900 text-sm mb-1">
              {t.customerDashboard.confirmProofApprovalTitle}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto mb-4">
              {t.customerDashboard.confirmProofApprovalDesc}
            </p>

            {approvalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs text-left flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{approvalError}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={isApproving}
                onClick={() => setIsConfirmApprovalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {t.customerDashboard.cancelBtn}
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isApproving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.common.loading}</span>
                  </>
                ) : (
                  <span>{t.customerDashboard.confirmProofApprovalBtn}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {isZoomOpen && isUrlValid && !isPdf && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              aria-label={t.customerDashboard.artworkProofCloseZoom}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={proofUrl}
              alt={`BAT Fullscreen ${order.id}`}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10 bg-neutral-950"
            />
            <div className="mt-3 flex items-center gap-3">
              <a
                href={proofUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg hover:bg-neutral-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.customerDashboard.artworkProofDownload}</span>
              </a>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="px-4 py-2 bg-neutral-800 text-white font-semibold text-xs rounded-xl hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {t.customerDashboard.artworkProofCloseZoom}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Structured Proof Revision Modal */}
      <ProofRevisionModal
        isOpen={isRevisionModalOpen}
        orderId={order.id}
        currentLanguage={currentLanguage}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmit={onRequestProofChange}
      />
    </div>
  );
};
