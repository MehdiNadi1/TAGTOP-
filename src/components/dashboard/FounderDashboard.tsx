import React, { useState } from 'react';
import {
  Language,
  FounderTab,
  BusinessProfile,
  NfcCardOrder,
  NfcCardRegistryItem,
  BankTransferRenewal,
  SystemSettings,
  AppView,
} from '../../types';
import { translations } from '../../i18n/translations';
import {
  Shield,
  Users,
  CreditCard,
  FileCheck,
  AlertTriangle,
  Settings,
  Cpu,
} from 'lucide-react';

interface FounderDashboardProps {
  currentLanguage: Language;
  profiles: BusinessProfile[];
  orders: NfcCardOrder[];
  registry: NfcCardRegistryItem[];
  transfers: BankTransferRenewal[];
  settings: SystemSettings;
  onUpdateOrderStatus: (orderId: string, status: any) => void;
  onUpdatePaymentStatus: (orderId: string, status: any) => void;
  onApproveTransfer: (transferId: string, founderNotes: string) => void;
  onRejectTransfer: (transferId: string, reason: string) => void;
  onUpdateProfileAccess: (profileId: string, newState: any) => void;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onViewChange: (view: AppView) => void;
}

export const FounderDashboard: React.FC<FounderDashboardProps> = ({
  currentLanguage,
  profiles,
  orders,
  registry,
  transfers,
  settings,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onApproveTransfer,
  onRejectTransfer,
  onUpdateProfileAccess,
  onUpdateSettings,
  onViewChange,
}) => {
  const t = translations[currentLanguage];
  const [activeTab, setActiveTab] = useState<FounderTab>('overview');

  // Transfer action modal state
  const [_transferNotes, setTransferNotes] = useState<string>('');
  const [_selectedTransferId, setSelectedTransferId] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const pendingProofsCount = orders.filter((o) => o.orderStatus === 'artwork_review').length;
  const pendingTransfersCount = transfers.filter((t) => t.status === 'pending').length;
  const graceProfilesCount = profiles.filter((p) => p.accessState === 'grace_period').length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">

        {/* Top Header */}
        <div className="bg-neutral-950 rounded-3xl p-6 border border-neutral-800 shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                  {t.founderDashboard.adminBadge}
                </span>
                <span className="text-xs text-neutral-400">{t.founderDashboard.founderTitle}</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-0.5">
                {t.dashboard.founderTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewChange('marketing')}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              {t.common.viewSite}
            </button>
            <button
              type="button"
              onClick={() => onViewChange('customer-dashboard')}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-black text-xs font-bold rounded-xl transition-colors"
            >
              {t.founderDashboard.viewCustomerPortal}
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* SIDEBAR TABS (3 cols) */}
          <aside className="lg:col-span-3 bg-neutral-950 rounded-3xl p-4 border border-neutral-800">
            <nav className="space-y-1.5 text-xs font-semibold">
              {[
                { id: 'overview', label: t.founderDashboard.tabOverview, icon: Shield },
                { id: 'customers', label: t.founderDashboard.tabCustomers, icon: Users, badge: profiles.length },
                { id: 'orders', label: t.founderDashboard.tabOrders, icon: CreditCard, badge: pendingProofsCount },
                { id: 'nfc-registry', label: t.founderDashboard.tabNfcRegistry, icon: Cpu, badge: registry.length },
                { id: 'transfers', label: t.founderDashboard.tabTransfers, icon: FileCheck, badge: pendingTransfersCount },
                { id: 'grace-suspension', label: t.founderDashboard.tabGrace, icon: AlertTriangle, badge: graceProfilesCount },
                { id: 'configuration', label: t.founderDashboard.tabConfiguration, icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as FounderTab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${isActive
                        ? 'bg-amber-400 text-black font-bold'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black text-amber-400 font-bold' : 'bg-neutral-800 text-neutral-300'
                        }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* MAIN TAB CONTENT (9 cols) */}
          <main className="lg:col-span-9 space-y-6">

            {/* 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <p className="text-xs text-neutral-400 font-medium">{t.founderDashboard.ordersToProcess}</p>
                    <p className="text-3xl font-black text-white tabular-nums mt-1">{orders.length}</p>
                    <p className="text-[11px] text-amber-400 mt-1">{pendingProofsCount} {t.founderDashboard.pendingProofs}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <p className="text-xs text-neutral-400 font-medium">{t.founderDashboard.activeNfcCards}</p>
                    <p className="text-3xl font-black text-white tabular-nums mt-1">{registry.length}</p>
                    <p className="text-[11px] text-emerald-400 mt-1">{t.founderDashboard.encoded100}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <p className="text-xs text-neutral-400 font-medium">{t.founderDashboard.transfersToVerify}</p>
                    <p className="text-3xl font-black text-amber-400 tabular-nums mt-1">{pendingTransfersCount}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">{t.founderDashboard.whatsAppReceipts}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <p className="text-xs text-neutral-400 font-medium">{t.founderDashboard.inGracePeriod}</p>
                    <p className="text-3xl font-black text-red-400 tabular-nums mt-1">{graceProfilesCount}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">{t.founderDashboard.max14Days}</p>
                  </div>
                </div>

                {/* Direct Action Notices */}
                <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <h3 className="text-base font-bold text-white">
                    {t.founderDashboard.prioritiesTitle}
                  </h3>
                  <div className="space-y-3 text-xs">
                    {pendingProofsCount > 0 && (
                      <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-between text-amber-200">
                        <span>{pendingProofsCount} {t.founderDashboard.proofsWaitingDesc}</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          className="px-2.5 py-1 bg-amber-400 text-black font-bold rounded-lg"
                        >
                          {t.founderDashboard.reviewProofsBtn}
                        </button>
                      </div>
                    )}

                    {pendingTransfersCount > 0 && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-200">
                        <span>{pendingTransfersCount} {t.founderDashboard.transfersWaitingDesc}</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('transfers')}
                          className="px-2.5 py-1 bg-emerald-400 text-black font-bold rounded-lg"
                        >
                          {t.founderDashboard.verifyTransfersBtn}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. CUSTOMERS & PROFILES */}
            {activeTab === 'customers' && (
              <div className="bg-neutral-950 rounded-3xl p-6 border border-neutral-800 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{t.founderDashboard.customersTitle}</h3>
                  <span className="text-xs text-neutral-400">{profiles.length} {t.founderDashboard.profilesManaged}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                        <th className="py-2.5 px-3">{t.founderDashboard.colHolder}</th>
                        <th className="py-2.5 px-3">{t.founderDashboard.colCity}</th>
                        <th className="py-2.5 px-3">{t.founderDashboard.colAccessStatus}</th>
                        <th className="py-2.5 px-3">{t.founderDashboard.colExpiry}</th>
                        <th className="py-2.5 px-3">{t.founderDashboard.colLinkedCards}</th>
                        <th className="py-2.5 px-3 text-right rtl:text-left">{t.founderDashboard.colChangeStatus}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {profiles.map((p) => {
                        const statusLabel =
                          p.accessState === 'active'
                            ? t.common.active
                            : p.accessState === 'grace_period'
                              ? t.common.gracePeriod
                              : p.accessState === 'private_preview'
                                ? t.common.privatePreview
                                : t.common.suspended;
                        return (
                          <tr key={p.id} className="hover:bg-neutral-900/60">
                            <td className="py-3 px-3">
                              <div className="font-bold text-white">{p.displayName}</div>
                              <div className="text-[11px] text-neutral-400">{p.company}</div>
                            </td>
                            <td className="py-3 px-3 text-neutral-300">{p.city}</td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${p.accessState === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : p.accessState === 'grace_period'
                                    ? 'bg-amber-400/20 text-amber-300'
                                    : p.accessState === 'private_preview'
                                      ? 'bg-neutral-800 text-neutral-400'
                                      : 'bg-red-500/20 text-red-300'
                                }`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-400">{p.expiryDate}</td>
                            <td className="py-3 px-3 font-mono text-neutral-300">{p.linkedCardCount}</td>
                            <td className="py-3 px-3 text-right rtl:text-left">
                              <select
                                value={p.accessState}
                                onChange={(e) => onUpdateProfileAccess(p.id, e.target.value)}
                                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-2 py-1 text-xs"
                              >
                                <option value="private_preview">{t.common.privatePreview}</option>
                                <option value="active">{t.common.active}</option>
                                <option value="grace_period">{t.common.gracePeriod}</option>
                                <option value="expired_suspended">{t.common.suspended}</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. ORDERS & ARTWORK PROOFS */}
            {activeTab === 'orders' && (
              <div className="bg-neutral-950 rounded-3xl p-6 border border-neutral-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">{t.founderDashboard.ordersTitle}</h3>
                  <p className="text-xs text-neutral-400">
                    {t.founderDashboard.ordersSubtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div>
                          <span className="font-mono font-bold text-amber-400 text-sm">{ord.id}</span>
                          <span className="text-neutral-300 ml-2">
                            {ord.customerName} ({ord.customerPhone}) · {ord.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{ord.priceMAD} MAD</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ord.paymentStatus === 'cod_collected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300'
                            }`}>
                            {ord.paymentStatus === 'cod_collected' ? t.founderDashboard.codCollected : t.founderDashboard.codPending}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                        <div>
                          <p className="text-neutral-400">{t.founderDashboard.cardFinish}</p>
                          <p className="font-semibold text-white">
                            {ord.cardColor === 'black' ? t.founderDashboard.finishBlack : t.founderDashboard.finishWhite} ({ord.cardBranding === 'branded' ? t.founderDashboard.withLogo : t.founderDashboard.withoutLogo})
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-400">{t.founderDashboard.linkedProfile}</p>
                          <p className="font-semibold text-white">{ord.profileName}</p>
                        </div>
                      </div>

                      {/* Controls to update fulfillment & COD status */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800 flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">{t.founderDashboard.orderStage}</span>
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-2.5 py-1 text-xs"
                          >
                            <option value="received">{t.founderDashboard.orderStep1}</option>
                            <option value="artwork_review">{t.founderDashboard.orderStep2}</option>
                            <option value="customer_approved">{t.founderDashboard.orderStep3}</option>
                            <option value="production">{t.founderDashboard.orderStep4}</option>
                            <option value="linked">{t.founderDashboard.orderStep5}</option>
                            <option value="shipped">{t.founderDashboard.orderStep6}</option>
                            <option value="delivered">{t.founderDashboard.orderStep7}</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">{t.founderDashboard.codPayment}</span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdatePaymentStatus(
                                ord.id,
                                ord.paymentStatus === 'cod_collected' ? 'cod_pending' : 'cod_collected'
                              )
                            }
                            className={`px-3 py-1 rounded-lg font-bold text-xs ${ord.paymentStatus === 'cod_collected'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-neutral-800 text-neutral-300 hover:text-white'
                              }`}
                          >
                            {ord.paymentStatus === 'cod_collected' ? t.founderDashboard.paymentConfirmed : t.founderDashboard.markCollected}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. NFC CARD REGISTRY */}
            {activeTab === 'nfc-registry' && (
              <div className="bg-neutral-950 rounded-3xl p-6 border border-neutral-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">{t.founderDashboard.registryTitle}</h3>
                  <p className="text-xs text-neutral-400">
                    {t.founderDashboard.registrySubtitle}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                        <th className="py-2.5 px-3">{t.founderDashboard.colHardwareUid}</th>
                        <th className="py-2.5 px-3">{t.founderDashboard.colSerialNumber}</th>
                        <th className="py-2.5 px-3">{t.founderDashboard.colFinish}</th>
                        <th className="py-2.5 px-3">{t.founderDashboard.colProfile}</th>
                        <th className="py-2.5 px-3">{t.founderDashboard.colChipStatus}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {registry.map((card) => {
                        const statusLabel = card.status === 'active' ? t.founderDashboard.statusActive : t.founderDashboard.statusInTransit;
                        return (
                          <tr key={card.uid} className="hover:bg-neutral-900/60">
                            <td className="py-3 px-3 font-mono font-bold text-amber-400">{card.uid}</td>
                            <td className="py-3 px-3 font-mono text-neutral-300">{card.serialNumber}</td>
                            <td className="py-3 px-3 text-neutral-300">
                              {card.cardColor === 'black' ? t.founderDashboard.finishBlack : t.founderDashboard.finishWhite} ({card.cardBranding === 'branded' ? t.founderDashboard.withLogo : t.founderDashboard.withoutLogo})
                            </td>
                            <td className="py-3 px-3 text-white font-medium">{card.linkedProfileName}</td>
                            <td className="py-3 px-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                {statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. BANK TRANSFERS VERIFICATION */}
            {activeTab === 'transfers' && (
              <div className="bg-neutral-950 rounded-3xl p-6 border border-neutral-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">{t.founderDashboard.transfersTitle}</h3>
                  <p className="text-xs text-neutral-400">
                    {t.founderDashboard.transfersSubtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  {transfers.map((trn) => {
                    const statusLabel =
                      trn.status === 'approved'
                        ? t.founderDashboard.statusApproved
                        : trn.status === 'rejected'
                          ? t.founderDashboard.statusRejected
                          : t.founderDashboard.statusPending;
                    return (
                      <div
                        key={trn.id}
                        className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div>
                            <span className="font-mono font-bold text-white">{trn.receiptNumber}</span>
                            <span className="text-neutral-400 ml-2">
                              {trn.customerName} ({trn.customerPhone})
                            </span>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${trn.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : trn.status === 'rejected'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-amber-400/20 text-amber-300'
                            }`}>
                            {statusLabel}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                          <div>
                            <p className="text-neutral-400">{t.founderDashboard.amountReceived}</p>
                            <p className="font-bold text-white text-sm">{trn.amountMAD} MAD</p>
                            <p className="text-[11px] text-neutral-400">{trn.periodDescription}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">{t.founderDashboard.concernedProfile}</p>
                            <p className="font-semibold text-white">{trn.profileName}</p>
                          </div>
                        </div>

                        {trn.status === 'pending' && (
                          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
                            <button
                              type="button"
                              onClick={() => onApproveTransfer(trn.id, t.founderDashboard.approvedNotes)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs px-4 py-2 rounded-xl"
                            >
                              {t.founderDashboard.approveAndExtend}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt(t.founderDashboard.rejectPrompt);
                                if (reason) onRejectTransfer(trn.id, reason);
                              }}
                              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs px-3.5 py-2 rounded-xl"
                            >
                              {t.founderDashboard.reject}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. GRACE PERIOD & SUSPENSION */}
            {activeTab === 'grace-suspension' && (
              <div className="bg-neutral-950 rounded-3xl p-6 border border-neutral-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">{t.founderDashboard.graceTitle}</h3>
                  <p className="text-xs text-neutral-400">
                    {t.founderDashboard.graceSubtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  {profiles.map((p) => {
                    const statusLabel =
                      p.accessState === 'active'
                        ? t.common.active
                        : p.accessState === 'grace_period'
                          ? t.common.gracePeriod
                          : p.accessState === 'private_preview'
                            ? t.common.privatePreview
                            : t.common.suspended;
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between flex-wrap gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{p.displayName}</p>
                          <p className="text-neutral-400">{p.company} · {t.founderDashboard.colExpiry} : {p.expiryDate}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${p.accessState === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : p.accessState === 'grace_period'
                                ? 'bg-amber-400/20 text-amber-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                            {statusLabel}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProfileAccess(
                                p.id,
                                p.accessState === 'expired_suspended' ? 'active' : 'expired_suspended'
                              )
                            }
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg"
                          >
                            {p.accessState === 'expired_suspended' ? t.founderDashboard.restoreAccess : t.founderDashboard.discreetlySuspend}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. CONFIGURATION & SETTINGS */}
            {activeTab === 'configuration' && (
              <div className="bg-neutral-950 rounded-3xl p-6 border border-neutral-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">{t.founderDashboard.settingsTitle}</h3>
                  <p className="text-xs text-neutral-400">
                    {t.founderDashboard.settingsSubtitle}
                  </p>
                </div>

                {settingsSavedToast && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold">
                    {t.founderDashboard.savedToast}
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-400 font-semibold mb-1">
                        {t.founderDashboard.starterBrandedLabel}
                      </label>
                      <input
                        type="number"
                        disabled
                        value={settingsForm.starterBrandedPriceMAD}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white opacity-80"
                      />
                      <span className="text-[10px] text-neutral-500">{t.founderDashboard.fixedAt249}</span>
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-semibold mb-1">
                        {t.founderDashboard.starterUnbrandedLabel}
                      </label>
                      <input
                        type="number"
                        disabled
                        value={settingsForm.starterUnbrandedPriceMAD}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white opacity-80"
                      />
                      <span className="text-[10px] text-neutral-500">{t.founderDashboard.fixedAt349}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-400 font-semibold mb-1">
                        {t.founderDashboard.renewal6MonthsLabel}
                      </label>
                      <input
                        type="number"
                        disabled
                        value={settingsForm.renewalSixMonthsMAD}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white opacity-80"
                      />
                      <span className="text-[10px] text-neutral-500">{t.founderDashboard.fixedAt99}</span>
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-semibold mb-1">
                        {t.founderDashboard.renewalAnnualLabel}
                      </label>
                      <input
                        type="number"
                        disabled
                        value={settingsForm.renewalAnnualMAD}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white opacity-80"
                      />
                      <span className="text-[10px] text-neutral-500">{t.founderDashboard.fixedAt199}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-white font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsForm.woodenStandEnabled}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, woodenStandEnabled: e.target.checked })
                        }
                        className="rounded border-neutral-700 text-amber-500 focus:ring-amber-400"
                      />
                      <span>{t.founderDashboard.woodenStandCheckbox}</span>
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      {t.founderDashboard.woodenStandHelp}
                    </p>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">
                      {t.founderDashboard.supportWhatsAppLabel}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.supportWhatsAppNumber}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, supportWhatsAppNumber: e.target.value })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white font-mono dir-ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-black font-extrabold px-6 py-2.5 rounded-xl transition-all"
                  >
                    {t.founderDashboard.updateSettingsBtn}
                  </button>
                </form>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};

        </div >

      </div >
    </div >
  );
};
