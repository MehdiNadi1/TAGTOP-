/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Products & Services Editor
 * Accessible, responsive catalog editor for customer profiles.
 */

import React, { useState } from 'react';
import { ProductServiceItem, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { isValidExternalUrl, sanitizeExternalUrl } from '../../utils/pricingAndAccess';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  X,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

interface ProductsServicesEditorProps {
  products: ProductServiceItem[];
  currentLanguage: Language;
  onChange: (updatedProducts: ProductServiceItem[]) => void;
  disabled?: boolean;
}

interface ProductFormData {
  id?: string;
  name: string;
  category: string;
  priceMAD: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

const emptyFormData: ProductFormData = {
  name: '',
  category: '',
  priceMAD: '',
  description: '',
  imageUrl: '',
  isAvailable: true,
};

export const ProductsServicesEditor: React.FC<ProductsServicesEditorProps> = ({
  products = [],
  currentLanguage,
  onChange,
  disabled = false,
}) => {
  const t = translations[currentLanguage];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion confirmation state
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setFormData(emptyFormData);
    setEditingIndex(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    const item = products[index];
    if (!item) return;
    setFormData({
      id: item.id,
      name: item.name || '',
      category: item.category || '',
      priceMAD: item.priceMAD !== undefined && item.priceMAD > 0 ? String(item.priceMAD) : '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable !== false,
    });
    setEditingIndex(index);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(emptyFormData);
    setEditingIndex(null);
    setFormError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setFormError(t.customerDashboard.productValidationNameRequired);
      return;
    }

    let parsedPrice = 0;
    if (formData.priceMAD.trim() !== '') {
      const num = Number(formData.priceMAD.trim());
      if (isNaN(num) || num < 0 || !isFinite(num)) {
        setFormError(t.customerDashboard.productValidationPriceInvalid);
        return;
      }
      parsedPrice = Math.round(num * 100) / 100;
    }

    let cleanImageUrl: string | undefined = undefined;
    if (formData.imageUrl.trim() !== '') {
      const rawUrl = formData.imageUrl.trim();
      if (!isValidExternalUrl(rawUrl)) {
        setFormError(t.customerDashboard.productValidationUrlInvalid);
        return;
      }
      cleanImageUrl = sanitizeExternalUrl(rawUrl);
    }

    const updatedItem: ProductServiceItem = {
      id: formData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      category: formData.category.trim() || 'General',
      priceMAD: parsedPrice,
      description: formData.description.trim().slice(0, 500),
      imageUrl: cleanImageUrl,
      isAvailable: formData.isAvailable,
    };

    let nextProducts: ProductServiceItem[];
    if (editingIndex !== null && editingIndex >= 0 && editingIndex < products.length) {
      nextProducts = products.map((item, idx) => (idx === editingIndex ? updatedItem : item));
    } else {
      nextProducts = [...products, updatedItem];
    }

    onChange(nextProducts);
    handleCloseModal();
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0 || index >= products.length) return;
    const next = [...products];
    const [moved] = next.splice(index, 1);
    next.splice(index - 1, 0, moved);
    onChange(next);
  };

  const handleMoveDown = (index: number) => {
    if (index < 0 || index >= products.length - 1) return;
    const next = [...products];
    const [moved] = next.splice(index, 1);
    next.splice(index + 1, 0, moved);
    onChange(next);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidateId) return;
    const next = products.filter((p) => p.id !== deleteCandidateId);
    onChange(next);
    setDeleteCandidateId(null);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.customerDashboard.catalogTitle}</span>
            <span className="text-[10px] font-mono bg-neutral-100 text-slate-600 px-1.5 py-0.5 rounded-full">
              {products.length}
            </span>
          </h4>
          <p className="text-[11px] text-slate-500">
            {t.customerDashboard.catalogSubtitle}
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.customerDashboard.addProductBtn}</span>
        </button>
      </div>

      {/* Catalog items list */}
      {products.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-neutral-50/60 text-center text-xs text-slate-500">
          <p>{t.customerDashboard.emptyCatalogMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((item, index) => (
            <div
              key={item.id}
              className="p-3 bg-white rounded-xl border border-neutral-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    title={t.customerDashboard.moveUp}
                    aria-label={`${t.customerDashboard.moveUp} ${item.name}`}
                    disabled={disabled || index === 0}
                    onClick={() => handleMoveUp(index)}
                    className="p-1 rounded text-slate-400 hover:text-black hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title={t.customerDashboard.moveDown}
                    aria-label={`${t.customerDashboard.moveDown} ${item.name}`}
                    disabled={disabled || index === products.length - 1}
                    onClick={() => handleMoveDown(index)}
                    className="p-1 rounded text-slate-400 hover:text-black hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Thumbnail Image */}
                {item.imageUrl && isValidExternalUrl(item.imageUrl) ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0 bg-neutral-50"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 opacity-70" />
                  </div>
                )}

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-bold text-slate-900 text-xs truncate max-w-[200px] sm:max-w-xs">
                      {item.name}
                    </h5>
                    {item.category && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Price Display */}
                <div className="text-right shrink-0">
                  {item.priceMAD !== undefined && item.priceMAD > 0 ? (
                    <span className="text-xs font-extrabold text-black tabular-nums">
                      {item.priceMAD} {t.common.currency}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500">
                      {t.configurator.onQuote}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons (Edit & Delete) */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleOpenEdit(index)}
                  className="p-1.5 text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title={t.customerDashboard.editProductBtn}
                  aria-label={`${t.customerDashboard.editProductBtn} ${item.name}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setDeleteCandidateId(item.id)}
                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title={t.customerDashboard.deleteProductBtn}
                  aria-label={`${t.customerDashboard.deleteProductBtn} ${item.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 id="product-modal-title" className="font-bold text-slate-900 text-sm">
                {editingIndex !== null
                  ? `${t.customerDashboard.editProductBtn} — ${formData.name || ''}`
                  : t.customerDashboard.addProductBtn}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label={t.customerDashboard.cancelBtn}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t.customerDashboard.productNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Consultation stratégique 1h"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black focus:ring-2 focus:ring-amber-400 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.customerDashboard.productCategoryLabel}
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="ex: Conseil, Design, Prestation..."
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black focus:ring-2 focus:ring-amber-400 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.customerDashboard.productPriceLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.priceMAD}
                    onChange={(e) => setFormData({ ...formData, priceMAD: e.target.value })}
                    placeholder={t.customerDashboard.productPricePlaceholder}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black focus:ring-2 focus:ring-amber-400 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.customerDashboard.productImageUrlLabel}</span>
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder={t.customerDashboard.productImageUrlPlaceholder}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs dir-ltr text-black focus:ring-2 focus:ring-amber-400 outline-hidden"
                />
                {formData.imageUrl && isValidExternalUrl(formData.imageUrl) && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formData.imageUrl}
                      alt="Product preview"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[10px] text-slate-400">Aperçu visuel</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t.customerDashboard.productDescLabel}
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez les livrables, l'offre ou la spécificité..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black focus:ring-2 focus:ring-amber-400 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t.customerDashboard.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.customerDashboard.saveProductBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCandidateId && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 id="delete-confirm-title" className="font-bold text-slate-900 text-sm mb-2">
              {t.customerDashboard.deleteProductConfirm}
            </h4>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteCandidateId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t.customerDashboard.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {t.customerDashboard.deleteProductBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
