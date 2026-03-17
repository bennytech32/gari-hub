"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function VehicleDetailPage() {
  const params = useParams();
  const carId = params?.id; 

  const [carData, setCarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<'RORO' | 'CONTAINER'>('RORO');

  // INQUIRY FORM STATES (Kawaida)
  const [inquiryData, setInquiryData] = useState({ name: '', phone: '', message: '' });
  const [sendingInquiry, setSendingInquiry] = useState(false);

  // TRADE-IN FORM STATES (KIPENGELE KIPYA)
  const [showTradeInModal, setShowTradeInModal] = useState(false);
  const [tradeInData, setTradeInData] = useState({ name: '', phone: '', currentCar: '', year: '', issue: '' });
  const [tradeInFile, setTradeInFile] = useState<File | null>(null);
  const [sendingTradeIn, setSendingTradeIn] = useState(false);

  useEffect(() => {
    if (carId) fetchCarDetails();
  }, [carId]);

  const fetchCarDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', carId).single();
      if (error) throw error;
      setCarData(data);
    } catch (error) {
      console.error("Fetch Details Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSafeImage = (imgUrl: string) => {
    if (!imgUrl || imgUrl.trim() === '') return 'https://placehold.co/1200x800/e2e8f0/64748b?text=Picha+Haikupatikana';
    return imgUrl;
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInquiry(true);
    try {
      const messagePayload = `Jina: ${inquiryData.name}\nUjumbe: ${inquiryData.message}\nGari Maalum: ${carData?.make} ${carData?.model} (${carData?.stock_id})\nUsafiri: ${shippingMethod}\nURL: ${window.location.href}`;
      const { error } = await supabase.from('inquiries').insert([{ vehicle_id: carData?.id, contact_phone: inquiryData.phone, customer_message: messagePayload }]);
      if (error) throw error;
      alert("Ombi lako limepokelewa kikamilifu! Wakala wetu atawasiliana nawe hivi punde.");
      setInquiryData({ name: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      alert("Inquiry imepokelewa kikamilifu.");
    } finally {
      setSendingInquiry(false);
    }
  };

  // UCHAWI WA TRADE-IN SUBMIT
  const handleTradeInPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setTradeInFile(e.target.files[0]);
  };

  const submitTradeIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeInFile) return alert("Tafadhali weka picha ya gari lako la sasa!");
    setSendingTradeIn(true);
    try {
      const fileExt = tradeInFile.name.split('.').pop();
      const uniqueFileName = `tradein-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('car-images').upload(`public/${uniqueFileName}`, tradeInFile);
      
      let imageUrl = '';
      if (!uploadError && uploadData) {
        imageUrl = supabase.storage.from('car-images').getPublicUrl(`public/${uniqueFileName}`).data.publicUrl;
      }

      const messagePayload = `TRADE-IN REQUEST\nJina: ${tradeInData.name}\nAnataka Gari Hili: ${carData?.make} ${carData?.model} (${carData?.stock_id})\n\nGari Lake la Sasa:\nAina: ${tradeInData.currentCar}\nMwaka: ${tradeInData.year}\nHali/Shida: ${tradeInData.issue}\nPicha Yake: ${imageUrl}`;
      
      const { error } = await supabase.from('inquiries').insert([{ contact_phone: tradeInData.phone, customer_message: messagePayload }]);
      if (error) throw error;
      
      alert("Ombi la Trade-In limetumwa! Tutalifanyia tathmini gari lako na kukupa bei ya kuongezea.");
      setShowTradeInModal(false);
      setTradeInData({ name: '', phone: '', currentCar: '', year: '', issue: '' });
      setTradeInFile(null);
    } catch (err) {
      console.error(err);
      alert("Kuna shida kidogo, jaribu tena.");
    } finally {
      setSendingTradeIn(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">Inapakia maelezo ya gari...</div>;
  if (!carData) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-red-500">Gari halijapatikana.</div>;

  const exchangeRate = 2600;
  const fobTZS = (carData.fob_price || 0) * exchangeRate;
  const freightUSD = shippingMethod === 'RORO' ? 1200 : 2200; 
  const freightTZS = freightUSD * exchangeRate;
  const cifTZS = fobTZS + freightTZS;
  const estimatedTaxTZS = cifTZS * 0.45; 
  const totalCostTZS = cifTZS + estimatedTaxTZS;
  const etaText = shippingMethod === 'RORO' ? 'Wiki 4 - 6 (Siku 30-45)' : 'Wiki 6 - 8 (Siku 45-60)';

  // MILESTONE PAYMENTS LOGIC (LIPA MDOGO MDOGO)
  const milestone1 = fobTZS; // Pesa ya kununua gari Japan
  const milestone2 = freightTZS; // Pesa ya Meli (Baadaye)
  const milestone3 = estimatedTaxTZS; // Kodi (Gari likifika)

  let currentGallery = [carData.location];
  if (carData.gallery && carData.gallery.length > 0) currentGallery = [carData.location, ...carData.gallery];

  let featuresList: string[] = [];
  if (carData.features) featuresList = carData.features.split(',').map((f: string) => f.trim()).filter((f: string) => f !== '');

  return (
    <main className="min-h-screen bg-gray-50 pb-0 font-sans text-gray-800 relative">
      
      {/* TRADE-IN MODAL */}
      {showTradeInModal && (
        <div className="fixed inset-0 bg-black/70 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all">
            <div className="p-4 bg-orange-500 border-b flex justify-between items-center text-white">
              <h3 className="font-extrabold">🔄 Trade-In: Badilisha Gari Lako</h3>
              <button onClick={() => setShowTradeInModal(false)} className="text-white hover:text-orange-200 font-black text-xl">&times;</button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <p className="text-sm text-gray-600 mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                Tunaithamini gari yako ya sasa! Weka taarifa zake hapa chini, tutaikagua na kukuambia kiasi gani uongeze ili uondoke na <strong className="text-gray-900">{carData.make} {carData.model}</strong>.
              </p>
              
              <form onSubmit={submitTradeIn} className="space-y-4">
                <div className="flex items-center gap-4 border-b pb-4 mb-2">
                  <label className="flex-1 border-2 border-dashed border-orange-200 rounded-xl p-4 flex flex-col items-center justify-center bg-orange-50 cursor-pointer text-center">
                    <span className="text-2xl mb-1">📷</span><span className="text-orange-800 font-bold text-xs">Picha ya Gari Lako</span>
                    <input type="file" accept="image/*" onChange={handleTradeInPhotoUpload} className="hidden" />
                  </label>
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border">
                    {tradeInFile ? <img src={URL.createObjectURL(tradeInFile)} className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-400 font-bold">Preview</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Aina ya Gari Lako</label>
                    <input type="text" required value={tradeInData.currentCar} onChange={(e) => setTradeInData({...tradeInData, currentCar: e.target.value})} placeholder="Mf. Toyota IST" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Mwaka</label>
                    <input type="number" required value={tradeInData.year} onChange={(e) => setTradeInData({...tradeInData, year: e.target.value})} placeholder="Mf. 2008" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Hali ya Gari / Shida Zilizopo</label>
                  <textarea required value={tradeInData.issue} onChange={(e) => setTradeInData({...tradeInData, issue: e.target.value})} placeholder="Mf. Gari inatembea vizuri ila ina mchubuko kidogo kwenye mlango..." className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm resize-none" rows={2}></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Jina Lako</label>
                    <input type="text" required value={tradeInData.name} onChange={(e) => setTradeInData({...tradeInData, name: e.target.value})} placeholder="Jina Kamili" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">WhatsApp Namba</label>
                    <input type="text" required value={tradeInData.phone} onChange={(e) => setTradeInData({...tradeInData, phone: e.target.value})} placeholder="07XX XXX XXX" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm font-bold text-green-700" />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={sendingTradeIn} className="w-full bg-orange-500 text-white font-black py-4 rounded-xl shadow-md hover:bg-orange-600 transition-colors">
                    {sendingTradeIn ? 'Inatuma Ombi...' : 'Tuma Ombi la Trade-In 🚀'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="bg-gray-900 text-white text-xs py-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center z-50 relative border-b border-gray-800">
        <div className="flex gap-4"><span>📧 info@garihub.co.tz</span></div>
        <div className="flex items-center gap-1.5 bg-gray-800 rounded px-2.5 py-1">
           <span className="text-gray-400">Ref No:</span><span className="text-emerald-400 font-bold tracking-wider">{carData.stock_id}</span>
        </div>
      </div>

      <nav className="bg-white shadow-sm w-full z-40 sticky top-0 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">Gari<span className="text-gray-900">Hub</span></Link>
          <div className="flex space-x-5 items-center">
            <Link href="/" className="text-gray-500 hover:text-blue-600 font-medium text-sm">Homepage</Link>
            <Link href="/#magari" className="text-gray-500 hover:text-blue-600 font-medium text-sm">Inventory</Link>
            <Link href="/spares" className="text-gray-500 hover:text-blue-600 font-medium text-sm">Spares & Tools</Link>
          </div>
          <Link href="/client" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 text-xs">Client Portal</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-3">
          <div>
            <h1 className="text-3xl font-black text-gray-950 tracking-tighter uppercase">{carData.make} {carData.model} {carData.year}</h1>
            <p className="text-xs text-gray-500 mt-1 font-mono">Stock ID: {carData.stock_id}</p>
          </div>
          <div className="flex gap-2.5">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{carData.location_from || 'JAPAN STOCK'}</span>
            {carData.tag && carData.tag !== 'NONE' && (
              <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-100 uppercase">{carData.tag}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          <div className="lg:w-[65%]">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 aspect-[4/3] flex items-center justify-center relative mb-4 p-2">
              <img src={getSafeImage(currentGallery[selectedImageIndex])} alt={carData.make} className="w-full h-full object-cover rounded-xl" />
              <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">📷 {selectedImageIndex + 1} / {currentGallery.length}</div>
            </div>

            <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 custom-scrollbar">
              {currentGallery.map((imgUrl, index) => (
                <div key={index} onClick={() => setSelectedImageIndex(index)} className={`relative w-24 h-16 shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:border-blue-400 ${selectedImageIndex === index ? 'border-blue-600 ring-2 ring-blue-100 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={getSafeImage(imgUrl)} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* FUNDI MKONONI / BONUS BANNER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8 shadow-md flex items-center gap-4">
              <span className="text-4xl">🛠️</span>
              <div>
                <h3 className="font-black text-lg mb-1">🎁 Gari Hub Bonus</h3>
                <p className="text-sm text-blue-100">Gari hili litafanyiwa <strong className="text-white">Service ya Kwanza Bure (Oil & Filters)</strong> na kukaguliwa na Mashine za OBD2 kabla hujakabidhiwa funguo!</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <h3 className="font-black text-gray-900 text-lg mb-5 pb-3 border-b border-gray-100">Vigezo vya Gari (Specifications)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-6">
                {[
                  { icon: "📅", label: "Mwaka", value: carData.year },
                  { icon: "🏎️", label: "Engine CC", value: carData.engine_cc ? `${carData.engine_cc} CC` : '-' },
                  { icon: "⚙️", label: "Transmission", value: carData.transmission },
                  { icon: "🛣️", label: "Mileage (Km)", value: carData.mileage ? `${parseInt(carData.mileage).toLocaleString()} km` : '-' },
                  { icon: "🎨", label: "Rangi", value: carData.color || '-' },
                  { icon: "🪑", label: "Viti (Seats)", value: carData.seats || '-' },
                  { icon: "🚙", label: "Drive System", value: carData.drive_system || '-' },
                ].map((spec, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">{spec.icon}</span>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{spec.label}</p><p className="font-black text-gray-800 text-sm uppercase">{spec.value}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {featuresList.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="font-black text-gray-900 text-lg mb-5 pb-3 border-b border-gray-100">Sifa za Ziada (Features)</h3>
                <div className="flex flex-wrap gap-3">
                  {featuresList.map((feat, index) => (
                    <div key={index} className="bg-emerald-50 text-emerald-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-emerald-100 shadow-sm">
                      <span className="text-emerald-500 text-lg leading-none">✓</span> {feat}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          <div className="lg:w-[35%] flex flex-col gap-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-5 pb-3">
                <h3 className="font-black text-gray-900 text-lg">Mchanganuo wa Bei</h3>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Njia ya Usafiri (Shipping)</p>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button onClick={() => setShippingMethod('RORO')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${shippingMethod === 'RORO' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🚢 RoRo Ship</button>
                  <button onClick={() => setShippingMethod('CONTAINER')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${shippingMethod === 'CONTAINER' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>📦 Container</button>
                </div>
                <p className="text-[10px] text-center mt-2 text-emerald-600 font-bold bg-emerald-50 py-1 rounded">Muda wa Kufika: {etaText}</p>
              </div>
              
              {/* MILESTONES PAYMENT UI (LIPA MDOGO MDOGO) */}
              <div className="space-y-3 text-sm mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-wider border-b border-blue-200 pb-2 mb-3">Lipa Kwa Awamu (Milestones)</p>
                <div className="flex justify-between text-gray-700"><span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[9px] font-bold">1</span> Gari Kuanza Safari:</span><span className="font-bold text-gray-900">TZS {milestone1.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-700"><span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[9px] font-bold">2</span> Pesa ya Meli (Freight):</span><span className="font-bold text-gray-900">TZS {milestone2.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-700"><span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-[9px] font-bold">3</span> Ushuru TRA (Likifika):</span><span className="font-bold text-red-600">+ TZS {milestone3.toLocaleString()}</span></div>
              </div>
              
              <div className="border-t-2 border-dashed border-gray-300 pt-5 mt-2">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider mb-1">JUMLA KUU BARABARANI</p>
                <p className="text-3xl font-black text-blue-600 tracking-tighter">TZS {totalCostTZS.toLocaleString()}</p>
                <p className="text-[9px] text-gray-400 mt-2 leading-relaxed">*Gharama za TRA zinaweza kubadilika kulingana na mfumo wa forodha wa wakati huo.</p>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
              <h3 className="font-black text-white text-lg mb-2">Pata Hili Gari Leo</h3>
              <p className="text-gray-400 text-xs mb-6">Malipo yote yanafanyika kwa uwazi kupitia akaunti rasmi za kampuni yetu.</p>
              
              <form onSubmit={submitInquiry} className="space-y-3 mb-4">
                <input type="text" required value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} placeholder="Jina Lako" className="w-full border border-gray-700 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white text-sm" />
                <input type="text" required value={inquiryData.phone} onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})} placeholder="07XX XXX XXX (WhatsApp)" className="w-full border border-gray-700 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white text-sm" />
                <button type="submit" disabled={sendingInquiry} className="w-full bg-blue-600 text-white font-black py-3.5 rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                  {sendingInquiry ? 'Inatuma...' : 'Nipe Utaratibu wa Kulipa 🚀'}
                </button>
              </form>

              {/* TRADE IN BUTTON */}
              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-gray-700 w-full"></div>
                <span className="bg-gray-900 px-3 text-xs text-gray-500 absolute">AU</span>
              </div>
              <button onClick={() => setShowTradeInModal(true)} className="w-full bg-orange-500 text-white font-black py-3.5 rounded-xl shadow-lg hover:bg-orange-600 transition-all mt-2">
                🔄 Trade-In (Badilisha Gari)
              </button>
            </div>
            
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-blue-600 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-xl p-6 mb-12 flex flex-col md:flex-row justify-around items-center gap-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏦</span>
              <div><p className="font-bold text-sm text-green-400">Malipo Salama ya Kibenki</p><p className="text-xs text-gray-400">Company Bank Accounts</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📍</span>
              <div><p className="font-bold text-sm text-blue-400">Live Clearance Tracker</p><p className="text-xs text-gray-400">Fuatilia mzigo wako bandarini</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div><p className="font-bold text-sm text-yellow-400">Verified Condition</p><p className="text-xs text-gray-400">Auction Sheet Provided</p></div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Gari Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}