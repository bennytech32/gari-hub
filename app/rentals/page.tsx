"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function CarRentalsPage() {
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    carType: 'Toyota Land Cruiser Prado',
    startDate: '',
    endDate: '',
    location: 'Dar es Salaam'
  });
  const [sending, setSending] = useState(false);

  const submitRentalBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const messagePayload = `RENTAL BOOKING\nName: ${bookingData.name}\nCar: ${bookingData.carType}\nFrom: ${bookingData.startDate}\nTo: ${bookingData.endDate}\nLocation: ${bookingData.location}`;
      await supabase.from('inquiries').insert([
        { contact_phone: bookingData.phone, customer_message: messagePayload }
      ]);
      alert("Booking Request Sent Successfully! Our team will contact you shortly to confirm availability.");
      setBookingData({ name: '', phone: '', carType: 'Toyota Land Cruiser Prado', startDate: '', endDate: '', location: 'Dar es Salaam' });
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const rentalCars = [
    { id: 1, name: "Toyota Land Cruiser Prado", type: "Luxury SUV", price: "$120 / Day", img: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80", desc: "Perfect for corporate travel, upcountry safaris, and executive airport transfers. Chauffeur included." },
    { id: 2, name: "Mercedes Benz E-Class", type: "Executive Sedan", price: "$150 / Day", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80", desc: "The ultimate luxury for weddings, VIP escorts, and high-end business meetings." },
    { id: 3, name: "Toyota Alphard", type: "Premium Van", price: "$100 / Day", img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80", desc: "Spacious VIP transport for families, tour groups, and corporate delegations. Highly comfortable." }
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* NAVIGATION BAR */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm w-full z-40 sticky top-0 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-3xl font-black text-slate-900 tracking-tighter">Gari<span className="text-red-600">Hub</span></Link>
              <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-md uppercase tracking-widest hidden sm:block">Rentals</span>
            </div>
            <div className="hidden lg:flex space-x-6 items-center">
              <Link href="/" className="text-slate-600 hover:text-blue-600 px-1 py-2 font-semibold transition-colors text-sm">Home</Link>
              <Link href="/#magari" className="text-slate-600 hover:text-blue-600 px-1 py-2 font-semibold transition-colors text-sm">Buy a Car</Link>
              <span className="text-slate-900 border-b-2 border-red-600 px-1 py-2 font-bold text-sm">Car Rental</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/client" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md text-sm">Client Portal</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
           <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=2000&q=80" alt="Rental Background" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <span className="bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 inline-block">Premium Chauffeur & Self-Drive</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">Drive Excellence. <br/><span className="text-red-500">Rent Premium.</span></h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">Whether it's a corporate event, a dream wedding, or a cross-country safari, Gari Hub Rentals provides top-tier vehicles to match your lifestyle.</p>
            <div className="flex gap-4">
              <a href="#book-now" className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-black transition-all shadow-lg shadow-red-600/30 text-sm uppercase tracking-wider">Book a Ride Now</a>
            </div>
          </div>
          <div className="md:w-1/2 hidden md:block">
             {/* Empty space to let background show */}
          </div>
        </div>
      </div>

      {/* FEATURED RENTAL FLEET */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Our Premium Fleet</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-base">Select from our meticulously maintained fleet of luxury SUVs, sedans, and VIP vans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rentalCars.map((car) => (
              <div key={car.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group flex flex-col">
                <div className="h-56 overflow-hidden relative">
                  <img src={car.img} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm text-white font-black px-4 py-2 rounded-xl text-sm shadow-lg">{car.price}</div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 font-bold px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest">{car.type}</div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-black text-slate-900 mb-2">{car.name}</h3>
                  <p className="text-slate-500 text-sm flex-grow mb-6 leading-relaxed">{car.desc}</p>
                  <a href="#book-now" className="w-full py-3 bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl text-center border-2 border-gray-100 hover:border-red-600 hover:text-red-600 transition-colors">Select Vehicle</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOOKING FORM SECTION */}
      <div id="book-now" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-800">
            <div className="p-10 md:w-2/5 bg-gradient-to-b from-red-600 to-red-900 text-white flex flex-col justify-center">
              <span className="text-5xl mb-6">📅</span>
              <h2 className="text-3xl font-black mb-4 tracking-tight">Reserve Your Car</h2>
              <p className="text-red-100 text-sm leading-relaxed mb-8">Fill in your details and travel dates. Our reservation team will get back to you in minutes to confirm your booking and arrange pickup.</p>
              <ul className="space-y-4 text-sm font-medium text-red-50">
                <li className="flex items-center gap-3"><span className="w-6 h-6 bg-red-500/50 rounded-full flex items-center justify-center text-xs">✓</span> Free Airport Pickup</li>
                <li className="flex items-center gap-3"><span className="w-6 h-6 bg-red-500/50 rounded-full flex items-center justify-center text-xs">✓</span> Chauffeur Available</li>
                <li className="flex items-center gap-3"><span className="w-6 h-6 bg-red-500/50 rounded-full flex items-center justify-center text-xs">✓</span> 24/7 Road Assistance</li>
              </ul>
            </div>
            
            <div className="p-10 md:w-3/5 bg-white">
              <form onSubmit={submitRentalBooking} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Select Vehicle</label>
                  <select value={bookingData.carType} onChange={(e) => setBookingData({...bookingData, carType: e.target.value})} className="w-full border-2 border-gray-100 p-3.5 rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 text-sm font-bold text-slate-700 outline-none">
                    <option>Toyota Land Cruiser Prado</option>
                    <option>Mercedes Benz E-Class</option>
                    <option>Toyota Alphard</option>
                    <option>Other (Please call me)</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Full Name</label><input type="text" required value={bookingData.name} onChange={(e) => setBookingData({...bookingData, name: e.target.value})} className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-red-500 bg-gray-50 text-sm" placeholder="John Doe" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Phone / WhatsApp</label><input type="text" required value={bookingData.phone} onChange={(e) => setBookingData({...bookingData, phone: e.target.value})} className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-red-500 bg-gray-50 text-sm" placeholder="+255 7..." /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Pick-up Date</label><input type="date" required value={bookingData.startDate} onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})} className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-red-500 bg-gray-50 text-sm" /></div>
                  <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Return Date</label><input type="date" required value={bookingData.endDate} onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})} className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-red-500 bg-gray-50 text-sm" /></div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">City / Location</label>
                  <input type="text" required value={bookingData.location} onChange={(e) => setBookingData({...bookingData, location: e.target.value})} className="w-full border-2 border-gray-100 p-3.5 rounded-xl outline-none focus:border-red-500 bg-gray-50 text-sm" placeholder="Dar es Salaam" />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={sending} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-xs">
                    {sending ? 'Sending Request...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}        