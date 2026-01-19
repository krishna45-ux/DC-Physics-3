import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, CheckCircle, Smartphone, QrCode, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  itemName: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, amount, itemName }) => {
  const [step, setStep] = useState<'DETAILS' | 'PROCESSING' | 'SUCCESS'>('DETAILS');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'QR'>('CARD');

  useEffect(() => {
    if (isOpen) {
        setStep('DETAILS');
        setPaymentMethod('CARD');
    }
  }, [isOpen]);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('PROCESSING');

    // Simulate processing time
    setTimeout(() => {
        setStep('SUCCESS');
        // We confirm the purchase immediately in the background so the app state updates,
        // but we keep the modal open for the user to see the confirmation.
        onConfirm();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity duration-300" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">

          {step === 'DETAILS' && (
             <form onSubmit={handlePay}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-start mb-5">
                        <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                            Secure Payment
                        </h3>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-500 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-indigo-100">
                        <div>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide">Total Amount</p>
                            <p className="text-2xl font-bold text-indigo-900">₹{amount}</p>
                        </div>
                        <div className="text-right max-w-[50%]">
                             <p className="text-xs text-indigo-600 font-medium truncate">{itemName}</p>
                        </div>
                    </div>

                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div
                            onClick={() => setPaymentMethod('CARD')}
                            className={`cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                paymentMethod === 'CARD'
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm'
                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {paymentMethod === 'CARD' && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                                </div>
                            )}
                            <CreditCard className={`h-8 w-8 mb-2 ${paymentMethod === 'CARD' ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="font-bold text-sm">Credit / Debit</span>
                        </div>

                        <div
                            onClick={() => setPaymentMethod('QR')}
                            className={`cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                paymentMethod === 'QR'
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm'
                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {paymentMethod === 'QR' && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                                </div>
                            )}
                            <QrCode className={`h-8 w-8 mb-2 ${paymentMethod === 'QR' ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="font-bold text-sm">UPI QR Code</span>
                        </div>
                    </div>

                    <div className="min-h-[220px]">
                        {paymentMethod === 'CARD' ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry</label>
                                        <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CVC</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <input type="password" placeholder="123" className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cardholder Name</label>
                                    <input type="text" placeholder="John Doe" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-2 animate-fade-in h-full flex flex-col justify-center items-center">
                                <p className="text-sm text-slate-600 mb-4 font-medium">Scan QR to pay securely</p>
                                <div className="bg-white p-3 border border-slate-200 rounded-xl inline-block mb-4 shadow-sm">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=dcphysics@upi&pn=DCPhysics&am=${amount}&cu=INR`} alt="Payment QR" className="h-40 w-40" />
                                </div>
                                <div className="flex items-center justify-center text-xs text-slate-500 bg-slate-100 py-2 px-4 rounded-full mx-auto w-max">
                                    <Smartphone className="h-4 w-4 mr-2" />
                                    <span>Support for GPay, PhonePe, Paytm</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-slate-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-lg shadow-indigo-200 px-4 py-3 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-all transform active:scale-95">
                        {paymentMethod === 'CARD' ? `Pay ₹${amount}` : 'I have Completed Payment'}
                    </button>
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                        Cancel
                    </button>
                </div>
             </form>
          )}

          {step === 'PROCESSING' && (
              <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-b-indigo-600 mx-auto mb-6"></div>
                  <h3 className="text-lg font-bold text-slate-900">Processing Transaction...</h3>
                  <p className="text-slate-500 text-sm mt-2">Securely communicating with your bank.</p>
              </div>
          )}

          {step === 'SUCCESS' && (
              <div className="p-8 text-center bg-white animate-fade-in-up">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                  <p className="text-slate-500 mb-8">Access has been granted to your account.</p>

                  <div className="bg-slate-50 rounded-xl p-5 mb-8 text-left border border-slate-100 shadow-sm">
                      <div className="flex justify-between mb-3 border-b border-slate-200 pb-2">
                          <span className="text-xs text-slate-500 uppercase font-bold tracking-wide">Purchase Details</span>
                      </div>
                      <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-600">Item</span>
                          <span className="text-sm font-bold text-slate-900 text-right">{itemName}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-600">Amount Paid</span>
                          <span className="text-sm font-bold text-indigo-700">₹{amount}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Reference ID</span>
                          <span className="text-sm font-mono text-slate-400">TXN{Date.now().toString().slice(-8)}</span>
                      </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full inline-flex items-center justify-center rounded-xl border border-transparent shadow-lg shadow-indigo-200 px-6 py-4 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition transform hover:-translate-y-1"
                  >
                      Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};