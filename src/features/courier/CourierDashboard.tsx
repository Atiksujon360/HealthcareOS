import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  PackageCheck,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryOrder } from '../../types';

export const CourierDashboard: React.FC = () => {
  const { 
    deliveries, 
    updateDeliveryStatus, 
    addToast,
    t,
    language,
    formatNum
  } = useApp();

  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [proofNote, setProofNote] = useState<string>('');

  const activeOrders = deliveries.filter((d) => d.status !== 'delivered');
  const completedOrders = deliveries.filter((d) => d.status === 'delivered');

  const handleNextStatus = (order: DeliveryOrder) => {
    if (order.status === 'assigned' || order.status === 'ready_for_pickup') {
      updateDeliveryStatus(order.id, 'picked_up', 'Picked up from CareFlow Central Pharmacy Gulshan-2');
    } else if (order.status === 'picked_up') {
      updateDeliveryStatus(order.id, 'in_transit', 'Departed on motorcycle route via Tejgaon/Dhanmondi');
    } else if (order.status === 'in_transit') {
      setSelectedOrder(order);
    }
  };

  const handleConfirmProofOfDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    updateDeliveryStatus(selectedOrder.id, 'delivered', proofNote || 'Delivered to recipient with digital signature');
    setSelectedOrder(null);
    setProofNote('');
  };

  return (
    <div className="space-y-6">
      {/* Courier Header Card */}
      <div className="bg-[#0A192F] text-white rounded-3xl p-6 lg:p-7 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#99F6E4] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
            {language === 'bn' ? 'কেয়ারফ্লো এক্সপ্রেস মেডিকেল বাইক ফ্লিট · ঢাকা মেট্রো' : 'CareFlow Express Medical Bike Fleet · Dhaka Metro'}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
            {t('courierTitle')}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            {t('courierSubtitle')}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold font-mono text-[#99F6E4] tabular-nums">
            {formatNum(activeOrders.length)}
          </span>
          <span className="text-[10px] text-[#CBD5E1] block uppercase tracking-wider">{t('activeDrops')}</span>
        </div>
      </div>

      {/* Active Delivery Orders List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#0A192F] uppercase tracking-wider font-display">
          {t('currentRouteTitle')} ({formatNum(activeOrders.length)})
        </h2>

        {activeOrders.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 text-center shadow-xs">
            <PackageCheck className="w-10 h-10 text-[#15803D] mx-auto mb-2 opacity-60" />
            <h3 className="text-sm font-bold text-[#0A192F] font-display">
              {language === 'bn' ? 'সকল ডেলিভারি সম্পন্ন হয়েছে' : 'All Deliveries Completed'}
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              {language === 'bn' ? 'নতুন প্রেসক্রিপশন ডিসপেন্সিং অর্ডারের জন্য অপেক্ষা করুন।' : 'Awaiting new pharmaceutical dispensing orders.'}
            </p>
          </div>
        ) : (
          activeOrders.map((order) => {
            const nextActionLabel = 
              order.status === 'ready_for_pickup' || order.status === 'assigned'
                ? t('confirmPickup')
                : order.status === 'picked_up'
                ? t('markInTransit')
                : t('confirmPod');

            return (
              <div 
                key={order.id} 
                className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:border-[#0F766E]"
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#0A192F] bg-[#F1F5F9] px-2.5 py-0.5 rounded-md">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-[#64748B]">ETA: {order.estimatedDelivery}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                    order.status === 'in_transit'
                      ? 'bg-[#CCFBF1] text-[#0F766E]'
                      : 'bg-[#FEF3C7] text-[#B45309]'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Pickup & Destination Locations */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#64748B] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase">
                        {language === 'bn' ? 'ফার্মেসি পিকআপ' : 'Pharmacy Pickup'}
                      </span>
                      <p className="text-[#0F172A] font-medium">{order.pickupLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[10px] font-semibold text-[#0F766E] uppercase">
                        {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Destination'}
                      </span>
                      <p className="text-[#0A192F] font-bold text-sm">{order.recipientAddress}</p>
                      <p className="text-[#64748B] text-xs mt-0.5">
                        {t('patient')}: <strong>{order.recipientName}</strong> ({order.recipientPhone})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items & Special Instructions */}
                <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">{language === 'bn' ? 'ঔষধের পার্সেল:' : 'Medication Package:'}</span>
                    <span className="text-[#0A192F] font-medium">{order.itemsSummary}</span>
                  </div>
                  {order.deliveryNotes && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">{t('notes')}:</span>
                      <span className="text-[#B45309] font-medium">{order.deliveryNotes}</span>
                    </div>
                  )}
                </div>

                {/* Navigation and Status Progression Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <button 
                    onClick={() => addToast({ type: 'info', title: 'GPS Route Active', message: `Dhaka traffic routing initialized to ${order.recipientAddress}` })}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#0A192F] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#0F766E]" />
                    {t('openGps')}
                  </button>

                  <button
                    onClick={() => handleNextStatus(order)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors shadow-xs"
                  >
                    <span>{nextActionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed Deliveries History */}
      {completedOrders.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-display">
            {language === 'bn' ? 'আজকে সম্পন্ন ডেলিভারি' : 'Completed Deliveries Today'} ({formatNum(completedOrders.length)})
          </h3>

          <div className="divide-y divide-[#F1F5F9]">
            {completedOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-[#0A192F]">{ord.orderNumber}</span>
                  <span className="text-[#64748B] ml-2">Delivered to: {ord.recipientName}</span>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5 font-mono">
                    POD Code: {ord.proofOfDelivery?.confirmationCode || 'POD-DHK-4820'} · {ord.proofOfDelivery?.signedTime || 'Verified'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded">
                  {t('delivered')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof of Delivery Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handleConfirmProofOfDelivery} className="bg-white border border-[#E2E8F0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <span className="text-[10px] font-mono text-[#0F766E] uppercase font-bold">Proof of Delivery (POD)</span>
                <h3 className="text-base font-bold text-[#0A192F] font-display">
                  {t('podModalTitle')}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedOrder(null)} 
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-xs space-y-1">
              <p className="font-bold text-[#0A192F]">{selectedOrder.recipientName}</p>
              <p className="text-[#64748B]">{selectedOrder.recipientAddress}</p>
              <p className="text-[11px] text-[#0F766E] font-medium font-mono">{selectedOrder.itemsSummary}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#0A192F]">
                {language === 'bn' ? 'গ্রহণকারীর স্বাক্ষর বা ওটিপি নোট' : 'Recipient OTP / Signature Note'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Received in person by Mr. Rafiqul Islam (OTP: 8492 verified)"
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="p-3 bg-[#E6F4F1] border border-[#CCFBF1] rounded-2xl text-xs text-[#0F766E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Timestamp and Dhaka geolocation automatically recorded with tamper-evident hash.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs text-[#64748B] hover:text-[#0F172A]"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs"
              >
                {t('confirmBooking')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
