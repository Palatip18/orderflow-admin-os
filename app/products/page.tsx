"use client";

import React, { useState } from "react";
import { mockProducts, mockVariants } from "@/lib/mockData";
import { Product } from "@/types/orderflow";

export default function ProductsPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(mockProducts[0]?.id || null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedVariants = selectedProduct
    ? mockVariants.filter((v) => v.productId === selectedProduct.id)
    : [];

  const formatTHB = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Products & Inventory</h1>
        <p className="text-sm text-slate-400">Track SKUs, colors, sizes, and reserved buffer stocks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Products List Grid */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 font-semibold text-slate-200">
            Catalog Products ({products.length})
          </div>

          <div className="divide-y divide-slate-800">
            {products.map((product) => {
              const isSelected = selectedProductId === product.id;
              const hasLowStock = product.availableStock <= 10;
              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className={`p-4 hover:bg-slate-900/40 cursor-pointer flex justify-between items-center transition ${
                    isSelected ? "bg-slate-900/60" : ""
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex-shrink-0 border border-slate-800 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-xs uppercase font-mono">
                      {product.sku.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm leading-snug">{product.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        SKU: <span className="font-mono font-semibold">{product.sku}</span> | Price:{" "}
                        <span className="font-semibold text-slate-400">{formatTHB(product.price)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block">Available</span>
                      <span
                        className={`text-sm font-bold px-2 py-0.5 rounded ${
                          hasLowStock
                            ? "bg-rose-950/40 text-rose-400 border border-rose-900/30"
                            : "bg-slate-900 text-emerald-450 text-emerald-400"
                        }`}
                      >
                        {product.availableStock} pcs
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Product Variants Matrix details */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6 shadow-lg">
          {selectedProduct ? (
            <div className="space-y-6">
              <div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Product Detail</span>
                <h3 className="text-md font-bold text-white mt-1 leading-snug">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedProduct.description}</p>
              </div>

              {/* Total Summary Stock */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-850 p-3 rounded-lg text-center text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase">Available</span>
                  <p className="text-sm font-bold text-white mt-1">{selectedProduct.availableStock}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase">Reserved</span>
                  <p className="text-sm font-bold text-yellow-400 mt-1">{selectedProduct.reservedStock}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase">Sold</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">{selectedProduct.soldStock}</p>
                </div>
              </div>

              {/* Variants Breakdown */}
              <div className="space-y-3">
                <h4 className="text-[11px] text-slate-450 font-bold uppercase tracking-wider text-slate-400">Variants Matrix</h4>
                <div className="space-y-2">
                  {selectedProduct.hasVariants && selectedVariants.length > 0 ? (
                    selectedVariants.map((v) => (
                      <div key={v.id} className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-200">{v.name}</p>
                          <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">SKU: {v.sku}</p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="font-semibold text-slate-300">{formatTHB(v.price)}</p>
                          <p className="text-[10px] text-slate-500">
                            Stock: <span className="font-bold text-slate-200">{v.availableStock}</span> | Res: <span className="text-yellow-500 font-medium">{v.reservedStock}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-500 text-center">
                      This is a single-variant product.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Select a product from the catalog list to view stock matrix.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
