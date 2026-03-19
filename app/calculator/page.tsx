"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function CalculatorPage() {
  const [fobPrice, setFobPrice] = useState<number | ''>('');
  const [shippingMethod, setShippingMethod] = useState<'RORO' | 'CONTAINER'>('RORO');

  const exchangeRate = 2600; 
  const estimatedFreightUSD = shippingMethod === 'RORO' ? 1200 : 2200; 
  const freightTZS = estimatedFreightUSD * exchangeRate;
  const fobTZS = typeof fobPrice === 'number' ? fobPrice * exchangeRate : 0;
  const cifTZS = fobTZS + freightTZS; 
  const estimatedTaxTZS = cifTZS * 0.45; 
  const totalCostTZS = cifTZS + estimatedTaxTZS;

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* NAVIGATION BAR YENYE RANGI NYEUPE */}
      <nav className="bg-white shadow-sm w-full z-40 sticky top-0 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">Gari<span className="text-gray-900">Hub</span></Link>
            </div>
            <div className="hidden lg:flex space-x-5 items-center">
              <Link href="/" className="text-gray-500 hover:text-blue-600 px-1 py-2 font-medium transition-colors text-sm">Rudi Mwanzo (Home)</Link>
            </div>
            <div className="flex items-center ml-2 border-l pl-3 border-gray-200 space-x-2">
              <Link href="/client" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md text-xs">Client Portal</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* CALCULATOR MAIN AREA */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          
          <div className="bg-gradient-to-br from-purple-700 to-indigo-900 p-8 md:p-12 md:w-5/12 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <span className="text-5xl mb-6 relative z-10">🧮</span>
            <h1 className="text-3xl font-extrabold mb-4 relative z-10">Kikokotozi cha Ushuru & Usafiri</h1>
            <p className="text-purple-200 text-sm mb-8 relative z-10">Pata makadirio ya haraka ya bei ya gari mpaka kufika mlangoni kwako. Hatuna gharama zilizofichwa!</p>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl"><span className="text-xl">🚢</span><span className="text-sm font-bold">Makadirio ya Meli (Freight)</span></div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl"><span className="text-xl">🏛️</span><span className="text-sm font-bold">Makadirio ya TRA (Customs)</span></div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl"><span className="text-xl">💼</span><span className="text-sm font-bold">Clearance & Port Charges</span></div>
            </div>
          </div>

          <div className="p-8 md:p-12 md:w-7/12 bg-gray-50">
            <div className="mb-6">
              <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-wider">Weka Bei ya Gari Japan/UK (FOB - USD $)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><span className="text-gray-400 font-bold text-xl">$</span></div>
                <input type="number" value={fobPrice} onChange={(e) => setFobPrice(e.target.value ? Number(e.target.value) : '')} className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none text-2xl font-black text-gray-800 bg-white shadow-sm transition-all" placeholder="Mfano: 3500" />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-wider">Chaguo la Usafiri</label>
              <div className="flex bg-gray-200 p-1.5 rounded-xl">
                <button onClick={() => setShippingMethod('RORO')} className={`flex-1 text-sm font-bold py-2.5 rounded-lg transition-all ${shippingMethod === 'RORO' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🚢 RoRo (Meli Wazi)</button>
                <button onClick={() => setShippingMethod('CONTAINER')} className={`flex-1 text-sm font-bold py-2.5 rounded-lg transition-all ${shippingMethod === 'CONTAINER' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>📦 Container</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-gray-400 font-black mb-5 text-xs uppercase tracking-widest border-b border-gray-100 pb-3">Mchanganuo Kamili (TZS)</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between items-center text-gray-600"><span className="font-medium">Bei ya Gari (FOB):</span><span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{(fobTZS).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-gray-600"><span className="font-medium">Usafiri (Freight - {shippingMethod}):</span><span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{(freightTZS).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-gray-600 border-b border-gray-100 pb-4"><span className="font-medium">Makadirio Ushuru (TRA):</span><span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg">+ {(estimatedTaxTZS).toLocaleString()}</span></div>
              </div>
              
              <div className="flex flex-col items-end mt-2 pt-2 border-t-2 border-dashed border-gray-200">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Jumla Kuu Mpaka Mlangoni</span>
                <span className="text-3xl sm:text-4xl font-black text-purple-700 tracking-tighter">
                  TZS {typeof fobPrice === 'number' && fobPrice > 0 ? (totalCostTZS).toLocaleString() : '0'}
                </span>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-5 text-center px-4 leading-relaxed">
              *Tafadhali zingatia: Makadirio haya ya TRA yanaweza kubadilika kulingana na uhalisia wa Engine CC na Mwaka wa Gari kwenye mfumo wa TANCIS wa forodha.
            </p>
          </div>

        </div>
      </div>

    </main>
  );
}