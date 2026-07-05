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
import { Trash2, Plus, Minus, FileText, Loader2, CreditCard, Tag, ShoppingBag, MapPin, PlusCircle, Check, X, ShieldCheck } from 'lucide-react';

export default function ConfigurePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, updateItem, removeItem, clearCart } = useCartStore();
  
  const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
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

  // QR Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [createdPayment, setCreatedPayment] = useState<any>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [priceEstimate, setPriceEstimate] = useState<{
    subtotal: number;
    discount: number;
    tax: number;
    deliveryCharge: number;
    totalAmount: number;
  } | null>(null);

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Calculate pricing whenever cart items or delivery type changes
  useEffect(() => {
    if (items.length === 0) {
      setPriceEstimate(null);
      return;
    }
    fetchPriceEstimate();
  }, [items, deliveryType, selectedAddressId]);

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

    if (deliveryType === 'DELIVERY' && !selectedAddressId) {
      toast.error('Please select or add a delivery address');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create the order on the backend
      const orderPayload = {
        shopId: 1, // Seeded Shop ID
        deliveryType: deliveryType,
        addressId: deliveryType === 'DELIVERY' ? (selectedAddressId || undefined) : undefined,
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
      };

      const orderResponse = await orderApi.create(orderPayload);
      if (!orderResponse.success || !orderResponse.data) {
        toast.error(orderResponse.message || 'Failed to place order');
        return;
      }

      // Show the manual UPI QR code payment modal!
      setCreatedOrder(orderResponse.data);
      setUtrNumber('');
      setScreenshotUrl('');
      setShowQrModal(true);
      setIsCheckingPayment(false);
      setPaymentStatusText('');

    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPaid = async () => {
    try {
      setIsCheckingPayment(true);
      setPaymentStatusText('Submitting order details...');

      const mockUtr = 'UPI-' + Math.floor(100000000000 + Math.random() * 900000000000).toString();

      const submitPayload = {
        orderId: createdOrder.id,
        utr: mockUtr,
        screenshotPath: '',
        contactPhone: contactPhone.trim() || undefined,
      };

      const submitResponse = await paymentApi.submit(submitPayload);
      if (submitResponse.success) {
        toast.success('Order placed successfully! Waiting for Admin verification.');
        clearCart();
        setShowQrModal(false);
        router.push(`/orders/${createdOrder.id}`);
      } else {
        toast.error(submitResponse.message || 'Failed to place order.');
        setIsCheckingPayment(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit order.');
      setIsCheckingPayment(false);
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
                          <span className="px-3 font-semibold text-sm text-slate-800">
                            {item.copies}
                          </span>
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

              {/* Delivery Address Management Block */}
              {deliveryType === 'DELIVERY' && (
                <Card className="border border-slate-200">
                  <CardBody className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="font-heading font-bold text-lg text-secondary">
                          Delivery Address
                        </h3>
                      </div>
                      {!showAddressForm && (
                        <button
                          onClick={() => setShowAddressForm(true)}
                          className="text-primary hover:text-primary-600 text-sm font-semibold flex items-center gap-1"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Address
                        </button>
                      )}
                    </div>

                    {showAddressForm ? (
                      <form onSubmit={handleSaveAddress} className="bg-slate-100/50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              Address Label
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Home, Office"
                              value={addrLabel}
                              onChange={(e) => setAddrLabel(e.target.value)}
                              className="input text-sm py-2"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              Flat/House No. (Required)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Room 102"
                              value={addrLine1}
                              onChange={(e) => setAddrLine1(e.target.value)}
                              className="input text-sm py-2"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            Street/Locality
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Linking Road"
                            value={addrLine2}
                            onChange={(e) => setAddrLine2(e.target.value)}
                            className="input text-sm py-2"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              City (Required)
                            </label>
                            <input
                              type="text"
                              value={addrCity}
                              onChange={(e) => setAddrCity(e.target.value)}
                              className="input text-sm py-2"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              State (Required)
                            </label>
                            <input
                              type="text"
                              value={addrState}
                              onChange={(e) => setAddrState(e.target.value)}
                              className="input text-sm py-2"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              Pincode (Required)
                            </label>
                            <input
                              type="text"
                              value={addrPincode}
                              onChange={(e) => setAddrPincode(e.target.value)}
                              className="input text-sm py-2"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowAddressForm(false)}
                            className="text-xs py-1.5"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSavingAddress}
                            className="text-xs py-1.5"
                          >
                            {isSavingAddress ? 'Saving...' : 'Save Address'}
                          </Button>
                        </div>
                      </form>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                        <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 mb-4">No addresses saved yet</p>
                        <Button onClick={() => setShowAddressForm(true)} className="text-xs py-1.5">
                          Add First Address
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 border rounded-xl cursor-pointer transition flex items-start justify-between ${
                              selectedAddressId === addr.id
                                ? 'border-primary bg-primary/5 text-slate-900'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded uppercase mb-1">
                                {addr.label}
                              </span>
                              <p className="text-sm font-medium">{addr.line1}</p>
                              {addr.line2 && <p className="text-xs text-slate-500">{addr.line2}</p>}
                              <p className="text-xs text-slate-500">
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </div>
                            {selectedAddressId === addr.id && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
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

                  {/* Delivery method selection */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Fulfillment Method
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeliveryType('PICKUP')}
                        className={`flex-1 py-1.5 border rounded-lg text-xs font-medium transition ${
                          deliveryType === 'PICKUP'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Self Pickup
                      </button>
                      <button
                        onClick={() => setDeliveryType('DELIVERY')}
                        className={`flex-1 py-1.5 border rounded-lg text-xs font-medium transition ${
                          deliveryType === 'DELIVERY'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Delivery
                      </button>
                    </div>
                  </div>

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
                    <div className="flex justify-between text-slate-600">
                      <span>Fulfillment / Tax</span>
                      <span>{isEstimating ? '...' : formatCurrency((priceEstimate?.tax || 0) + (priceEstimate?.deliveryCharge || 0))}</span>
                    </div>
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

                  <Button
                    onClick={handleCheckout}
                    disabled={isSubmitting || isEstimating}
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

      {/* QR Code Scan Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              disabled={isCheckingPayment}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 text-center space-y-5">
              <div>
                <h3 className="font-heading font-bold text-xl text-secondary">
                  Scan UPI QR to Pay
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Scan using GPay, PhonePe, Paytm, or any UPI app
                </p>
              </div>

              {/* QR Image Box */}
              <div className="mx-auto w-[240px] h-[380px] bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src="/qr_code.jpg"
                  alt="UPI QR Code"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Amount Label */}
              <div className="bg-primary-50/50 border border-primary-100 py-2.5 rounded-2xl">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Amount to Pay
                </p>
                <p className="font-heading font-black text-2xl text-primary mt-0.5">
                  {formatCurrency(totalAmountValue)}
                </p>
              </div>

              {!isCheckingPayment && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Phone for Verification Call
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number for admin to call"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="input text-sm py-2 w-full"
                  />
                  <p className="text-[10px] text-slate-400">
                    Admin will call this number to verify your payment
                  </p>
                </div>
              )}

              {isCheckingPayment ? (
                <div className="border border-slate-100 bg-slate-50 p-4 rounded-2xl flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm font-medium text-slate-700 animate-pulse">
                    {paymentStatusText}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={handleConfirmPaid}
                    disabled={!contactPhone.trim()}
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-600 hover:to-accent-600 text-white font-medium text-center flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    I Have Paid (Verify Payment)
                  </Button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Scan the QR code and pay from any UPI app, then click verify to complete.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
