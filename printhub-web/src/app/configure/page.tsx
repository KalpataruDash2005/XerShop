'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useCartStore, useAuthStore } from '@/store/authStore';
import { orderApi, paymentApi, userApi, Address } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, FileText, Loader2, CreditCard, Tag, ShoppingBag, MapPin, PlusCircle, Check, X } from 'lucide-react';

export default function ConfigurePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, updateItem, removeItem, clearCart } = useCartStore();
  
  const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY');
  const [couponCode, setCouponCode] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Addresses States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Address Form Fields
  const [addrLabel, setAddrLabel] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');

  // Parul University delivery fields
  const [deliveryLocationType, setDeliveryLocationType] = useState<'HOSTEL' | 'DEPARTMENT'>('HOSTEL');
  const [hostelName, setHostelName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  const PICKUP_ADDRESS = '637, Shyamal County, 390019';

  // Payment Modal States (Razorpay)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [razorpayDetails, setRazorpayDetails] = useState<{
    paymentId: number;
    razorpayOrderId: string;
    amount: number;
    keyId: string;
    deliveryNotes: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentResult, setPaymentResult] = useState<{ orderId?: number; orderNumber?: string; status: string } | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Terms & Conditions
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const [priceEstimate, setPriceEstimate] = useState<{
    subtotal: number;
    discount: number;
    tax: number;
    deliveryCharge: number;
    totalAmount: number;
  } | null>(null);

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [envelopePackaging, setEnvelopePackaging] = useState(false);

  // Calculate pricing whenever cart items or delivery type changes
  useEffect(() => {
    if (items.length === 0) {
      setPriceEstimate(null);
      return;
    }
    fetchPriceEstimate();
  }, [items, deliveryType, selectedAddressId, envelopePackaging]);

  // Fetch user addresses on load
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const response = await userApi.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
        if (response.data.length > 0) {
          const def = response.data.find(a => a.isDefault);
          setSelectedAddressId(def ? def.id : response.data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch addresses:', e);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLine1 || !addrCity || !addrState || !addrPincode) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setIsSavingAddress(true);
      const payload = {
        label: addrLabel || 'Home',
        line1: addrLine1,
        line2: addrLine2 || undefined,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        isDefault: addresses.length === 0,
      };

      const response = await userApi.addAddress(payload);
      if (response.success && response.data) {
        toast.success('Address saved successfully!');
        const newAddr = response.data;
        setAddresses(prev => [...prev, newAddr]);
        setSelectedAddressId(newAddr.id);
        setShowAddressForm(false);
        // Clear fields
        setAddrLabel('');
        setAddrLine1('');
        setAddrLine2('');
        setAddrCity('');
        setAddrState('');
        setAddrPincode('');
      } else {
        toast.error('Failed to save address');
      }
    } catch (err) {
      toast.error('Failed to save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const fetchPriceEstimate = async (): Promise<{ couponApplied: string | null } | null> => {
    try {
      setIsEstimating(true);
      const payload = {
        shopId: 1, // Default shop
        items: items.map(i => ({
          pageCount: i.pageCount,
          copies: i.copies,
          colorMode: i.colorMode,
          sides: i.sides,
          paperSize: i.paperSize,
          gsm: i.gsm,
          binding: i.binding,
          lamination: i.lamination,
        })),
        couponCode: couponCode || undefined,
        envelopePackaging,
      };

      const response = await orderApi.getPriceEstimate(payload);
      if (response.success && response.data) {
        setPriceEstimate({
          subtotal: response.data.subtotal,
          discount: response.data.discount,
          tax: response.data.tax,
          deliveryCharge: response.data.deliveryCharge,
          totalAmount: response.data.totalAmount,
        });
        const applied = response.data.couponApplied || null;
        setAppliedCoupon(applied);
        return { couponApplied: applied };
      }
      return null;
    } catch (e) {
      console.error('Failed to get price estimate:', e);
      return null;
    } finally {
      setIsEstimating(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    const result = await fetchPriceEstimate();
    if (result?.couponApplied) {
      toast.success(`Coupon "${result.couponApplied}" applied!`);
    } else {
      toast.error('Invalid or expired coupon code');
    }
  };

    const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to place an order');
      router.push('/login?redirect=/configure');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (deliveryType === 'DELIVERY' && (!roomNumber.trim() || !hostelName.trim())) {
      toast.error('Please enter your ' + (deliveryLocationType === 'HOSTEL' ? 'hostel name' : 'building name') + ' and room number');
      return;
    }

    try {
      setIsSubmitting(true);

      const locationLabel = deliveryLocationType === 'HOSTEL' ? 'Hostel' : 'Department';
      const deliveryNotes = deliveryType === 'PICKUP'
        ? `Self Pickup - ${PICKUP_ADDRESS}`
        : `Parul University (${locationLabel}) - ${roomNumber.trim()}, ${hostelName.trim()}`;

      const orderPayload = {
        shopId: 1,
        deliveryType: deliveryType,
        addressId: undefined,
        notes: deliveryNotes,
        items: items.map(i => ({
          fileName: i.fileName,
          fileUrl: i.fileUrl,
          fileType: i.fileType ? i.fileType.substring(0, Math.min(i.fileType.length, 50)) : '',
          pageCount: i.pageCount,
          copies: i.copies,
          colorMode: i.colorMode,
          sides: i.sides,
          paperSize: i.paperSize,
          gsm: i.gsm,
          binding: i.binding,
          lamination: i.lamination,
        })),
        couponCode: couponCode || undefined,
        envelopePackaging,
      };

      const paymentResponse = await paymentApi.createOrder(orderPayload);
      if (!paymentResponse.success || !paymentResponse.data) {
        toast.error(paymentResponse.message || 'Failed to initiate payment');
        return;
      }

      const { paymentId, razorpayOrderId, amount, keyId } = paymentResponse.data;
      setRazorpayDetails({ paymentId, razorpayOrderId, amount, keyId, deliveryNotes });
      setContactPhone('');
      setPaymentResult(null);

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        return;
      }

      setShowPaymentModal(true);
      setIsSubmitting(false);

      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'PrintHub',
        description: 'Printing Services',
        order_id: razorpayOrderId,
        handler: async function(response: any) {
          setIsVerifying(true);
          setPaymentStatusText('Verifying payment...');
          try {
            const verifyRes = await paymentApi.verify({
              paymentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.success && verifyRes.data) {
              setPaymentResult({ orderId: verifyRes.data.orderId, orderNumber: verifyRes.data.orderNumber, status: 'SUCCESS' });
              setPaymentStatusText('Payment successful! Creating your order...');
              clearCart();
              setTimeout(() => {
                setShowPaymentModal(false);
                router.push(`/orders/${verifyRes.data!.orderId}`);
              }, 1500);
            } else {
              setPaymentResult({ status: 'FAILED' });
              setPaymentStatusText(verifyRes.message || 'Payment verification failed');
              setIsVerifying(false);
            }
          } catch (err: any) {
            setPaymentResult({ status: 'FAILED' });
            setPaymentStatusText(err.message || 'Payment verification failed');
            setIsVerifying(false);
          }
        },
        modal: {
          ondismiss: function() {
            setShowPaymentModal(false);
            setRazorpayDetails(null);
            toast.error('Payment cancelled. You can try again.');
          },
        },
        prefill: {
          contact: contactPhone || undefined,
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function(response: any) {
        setPaymentResult({ status: 'FAILED' });
        setPaymentStatusText('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setIsVerifying(false);
      });
      rzp.open();

    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  const totalAmountValue = priceEstimate?.totalAmount || 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Header />

      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-secondary mb-2">
            Configure Printing Options
          </h1>
          <p className="text-slate-600">Customize print settings and finalize checkout</p>
        </div>

        {items.length === 0 ? (
          <Card className="max-w-xl mx-auto py-12 text-center">
            <CardBody>
              <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-secondary mb-2">No documents in cart</h2>
              <p className="text-slate-500 mb-6">Upload some documents to configure options.</p>
              <Button onClick={() => router.push('/upload')}>Upload Files</Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* List and Options */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden border border-slate-200">
                  <div className="bg-slate-100/50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-secondary truncate max-w-md">
                          {item.fileName}
                        </h3>
                        <p className="text-xs text-slate-500">{item.pageCount} pages</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <CardBody className="grid md:grid-cols-2 gap-6 py-6">
                    {/* Select options */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                          Color Mode
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateItem(item.id, { colorMode: 'BW' })}
                            className={`flex-1 py-2 px-3 border rounded-xl text-sm font-medium transition ${
                              item.colorMode === 'BW'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Black & White
                          </button>
                          <button
                            onClick={() => updateItem(item.id, { colorMode: 'COLOR' })}
                            className={`flex-1 py-2 px-3 border rounded-xl text-sm font-medium transition ${
                              item.colorMode === 'COLOR'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Color
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                          Sides
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateItem(item.id, { sides: 'SINGLE' })}
                            className={`flex-1 py-2 px-3 border rounded-xl text-sm font-medium transition ${
                              item.sides === 'SINGLE'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Single Sided
                          </button>
                          <button
                            onClick={() => updateItem(item.id, { sides: 'DOUBLE' })}
                            className={`flex-1 py-2 px-3 border rounded-xl text-sm font-medium transition ${
                              item.sides === 'DOUBLE'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Double Sided
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                            Paper Size
                          </label>
                          <select
                            value={item.paperSize}
                            onChange={(e) => updateItem(item.id, { paperSize: e.target.value })}
                            className="input text-sm py-2"
                          >
                            <option value="A4">A4</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                            Binding
                          </label>
                          <select
                            value={item.binding}
                            onChange={(e) => updateItem(item.id, { binding: e.target.value })}
                            className="input text-sm py-2"
                          >
                            <option value="NONE">None</option>
                            <option value="SPIRAL">Spiral</option>
                            <option value="SOFT_BINDING">Soft Binding</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.lamination}
                              onChange={(e) => updateItem(item.id, { lamination: e.target.checked })}
                              className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                            />
                            Lamination
                          </label>
                        </div>

                        {/* Copies Counter */}
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                          <button
                            onClick={() => updateItem(item.id, { copies: Math.max(1, item.copies - 1) })}
                            className="p-2 hover:bg-slate-50 text-slate-500"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.copies}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1) {
                                updateItem(item.id, { copies: val });
                              }
                            }}
                            className="w-16 px-2 py-1.5 text-center font-semibold text-sm text-slate-800 border-none outline-none focus:ring-0"
                          />
                          <button
                            onClick={() => updateItem(item.id, { copies: item.copies + 1 })}
                            className="p-2 hover:bg-slate-50 text-slate-500"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}

              {/* Delivery / Pickup Selection */}
              <Card className="border border-slate-200">
                <CardBody className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-bold text-lg text-secondary">
                      Fulfillment Method
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeliveryType('PICKUP')}
                      className={`flex-1 py-2 border rounded-xl text-sm font-medium transition ${
                        deliveryType === 'PICKUP'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Self Pickup
                    </button>
                    <button
                      onClick={() => setDeliveryType('DELIVERY')}
                      className={`flex-1 py-2 border rounded-xl text-sm font-medium transition ${
                        deliveryType === 'DELIVERY'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Delivery
                    </button>
                  </div>

                  {deliveryType === 'PICKUP' ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-green-800">Pickup Address</p>
                      <p className="text-sm text-green-700 mt-1">{PICKUP_ADDRESS}</p>
                      <p className="text-[11px] text-green-600 mt-1">
                        Visit the shop at the above address during business hours to collect your prints.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800 font-medium">
                          Order before 9:45 PM and get it delivered tomorrow at any time!
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Orders placed after 9:45 PM will be delivered the day after tomorrow.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                          Deliver To
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeliveryLocationType('HOSTEL')}
                            className={`flex-1 py-1.5 border rounded-lg text-xs font-medium transition ${
                              deliveryLocationType === 'HOSTEL'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Hostel
                          </button>
                          <button
                            onClick={() => setDeliveryLocationType('DEPARTMENT')}
                            className={`flex-1 py-1.5 border rounded-lg text-xs font-medium transition ${
                              deliveryLocationType === 'DEPARTMENT'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Department Building
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            {deliveryLocationType === 'HOSTEL' ? 'Hostel Name' : 'Building Name'} (Required)
                          </label>
                          <input
                            type="text"
                            placeholder={deliveryLocationType === 'HOSTEL' ? 'e.g. Hostel 5' : 'e.g. CS/IT Building'}
                            value={hostelName}
                            onChange={(e) => setHostelName(e.target.value)}
                            className="input text-sm py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            Room Number (Required)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Room 102"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            className="input text-sm py-2"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Sidebar Invoice & Payment */}
            <div className="space-y-6">
              <Card className="border border-slate-200">
                <CardBody className="space-y-6">
                  <div>
                    <h2 className="font-heading font-bold text-lg text-secondary mb-1">
                      Billing Summary
                    </h2>
                    <p className="text-xs text-slate-500">Fast Xerox & Printing Checkout</p>
                  </div>

                  {/* Delivery / Pickup Info */}
                  <div className={`rounded-xl p-3 ${deliveryType === 'PICKUP' ? 'bg-green-50 border border-green-100' : 'bg-blue-50 border border-blue-100'}`}>
                    <p className={`text-xs font-semibold ${deliveryType === 'PICKUP' ? 'text-green-800' : 'text-blue-800'}`}>
                      {deliveryType === 'PICKUP' ? 'Self Pickup' : 'Delivery to Parul University'}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${deliveryType === 'PICKUP' ? 'text-green-600' : 'text-blue-600'}`}>
                      {deliveryType === 'PICKUP'
                        ? PICKUP_ADDRESS
                        : hostelName && roomNumber
                          ? `${roomNumber}, ${hostelName} (${deliveryLocationType === 'HOSTEL' ? 'Hostel' : 'Dept'})`
                          : 'Enter location details above'}
                    </p>
                  </div>

                  {/* Envelope Packaging */}
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                    <input
                      type="checkbox"
                      checked={envelopePackaging}
                      onChange={(e) => setEnvelopePackaging(e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Pack in envelope <span className="text-slate-400">(+Γé╣8)</span></span>
                  </label>

                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="input text-xs pl-8 pr-2 py-2"
                      />
                    </div>
                    <Button type="submit" variant="outline" className="text-xs px-3">
                      Apply
                    </Button>
                  </form>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-medium text-green-700">{appliedCoupon}</span>
                      </div>
                      <button
                        onClick={() => { setCouponCode(''); setAppliedCoupon(null); fetchPriceEstimate(); }}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Price Lines */}
                  <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Printing Subtotal</span>
                      <span>{isEstimating ? '...' : formatCurrency(priceEstimate?.subtotal || 0)}</span>
                    </div>
                    {envelopePackaging && (
                      <div className="flex justify-between text-slate-600">
                        <span>Envelope Packaging</span>
                        <span>Γé╣8.00</span>
                      </div>
                    )}
                    {priceEstimate && priceEstimate.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Coupon Discount</span>
                        <span>-{formatCurrency(priceEstimate.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-secondary text-base border-t border-slate-100 pt-3">
                      <span>Total Amount</span>
                      <span>{isEstimating ? '...' : formatCurrency(priceEstimate?.totalAmount || 0)}</span>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary underline hover:text-primary-600"
                      >
                        Terms & Conditions
                      </button>
                    </span>
                  </label>

                  <Button
                    onClick={() => {
                      if (!acceptedTerms) {
                        toast.error('Please accept the Terms & Conditions');
                        return;
                      }
                      handleCheckout();
                    }}
                    disabled={isSubmitting || isEstimating || !acceptedTerms}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-600 hover:to-accent-600 shadow-md text-white font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Place Order & Pay
                      </>
                    )}
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h3 className="font-heading font-bold text-xl text-secondary mb-1">Terms & Conditions</h3>
              <p className="text-xs text-slate-400 mb-4">Please read carefully before placing your order</p>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-96 overflow-y-auto pr-2">
                <p><strong>1. Orders & Payments</strong> ΓÇö Orders are subject to acceptance. Prices are final at confirmation. Full payment required before processing.</p>
                <p><strong>2. Delivery</strong> ΓÇö All deliveries handled by PrintHub's own team. Estimates are approximate; delays may occur due to volume, staff, weather, or road conditions.</p>
                <p><strong>3. Force Majeure</strong> ΓÇö We are not liable for delays caused by events beyond our control: natural disasters (storms, floods, earthquakes), government restrictions, strikes, power outages, or network disruptions. We will resume delivery as soon as safe.</p>
                <p><strong>4. Cancellations & Refunds</strong> ΓÇö Orders may be cancelled before printing begins. Refunds for force majeure delays are not issued if order is eventually delivered. Lost/damaged orders due to force majeure will be handled in good faith (reprint or partial refund at our discretion).</p>
                <p><strong>5. Quality</strong> ΓÇö We match your submitted files. Not responsible for errors in customer content. Liability limited to amount paid for the order.</p>
                <p><strong>6. Your Responsibility</strong> ΓÇö Ensure uploaded files are accurate, complete, and free of copyright violations. Provide correct delivery address and contact info.</p>
                <p><strong>7. Contact</strong> ΓÇö For questions: kalpataru05aug@gmail.com | +91 9146922610</p>
              </div>

              <div className="mt-5 flex gap-3">
                <Button variant="outline" onClick={() => setShowTermsModal(false)} className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }}
                  className="flex-1 bg-primary text-white"
                >
                  I Accept
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Razorpay Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden relative">
            <div className="p-6 text-center space-y-5">
              <div>
                <h3 className="font-heading font-bold text-xl text-secondary">
                  Complete Your Payment
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  You will be redirected to Razorpay Checkout
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Delivery</span>
                  <span className="font-medium text-slate-800">{razorpayDetails?.deliveryNotes}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Amount</span>
                  <span className="font-heading font-bold text-xl text-primary">
                    {razorpayDetails ? formatCurrency(razorpayDetails.amount) : ''}
                  </span>
                </div>
              </div>

              {paymentResult?.status === 'SUCCESS' ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-semibold text-green-800">Payment Successful!</p>
                  <p className="text-xs text-green-600 mt-1">
                    Order #{paymentResult.orderNumber} has been placed.
                  </p>
                </div>
              ) : isVerifying ? (
                <div className="border border-slate-100 bg-slate-50 p-4 rounded-2xl flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm font-medium text-slate-700 animate-pulse">
                    {paymentStatusText}
                  </span>
                </div>
              ) : paymentResult?.status === 'FAILED' ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                  <p className="font-semibold text-red-700">{paymentStatusText}</p>
                  <Button
                    onClick={() => { setShowPaymentModal(false); setRazorpayDetails(null); setPaymentResult(null); }}
                    className="w-full py-2 bg-primary text-white rounded-2xl"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  {!contactPhone && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        Phone Number (Required)
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="input text-sm py-2 w-full"
                      />
                    </div>
                  )}
                  <p className="text-xs text-slate-400">
                    Clicking "Pay Now" will open Razorpay Checkout to complete the payment securely.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
