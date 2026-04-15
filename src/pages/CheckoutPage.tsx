import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Truck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/providers/FirebaseProvider';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleCODPayment = async () => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user?.uid || 'anonymous',
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        phone: formData.phone,
        amount: 1250,
        status: 'pending',
        paymentMethod: 'cod',
        createdAt: serverTimestamp(),
        items: [
          { name: 'Eternal Rose Gold Ring', price: 1250, quantity: 1 }
        ]
      });

      toast.success('Order placed successfully! Please keep ₹1,250 ready for delivery.');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setIsSubmitting(true);
    
    // Check if Razorpay keys are configured
    const razorpayKey = (import.meta as any).env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKey) {
      // Demo Mode: Simulate successful payment
      toast.info('Demo Mode: Simulating successful payment...');
      setTimeout(async () => {
        try {
          await addDoc(collection(db, 'orders'), {
            userId: user?.uid || 'anonymous',
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            phone: formData.phone,
            amount: 1250,
            status: 'paid',
            paymentMethod: 'online',
            paymentId: 'demo_' + Math.random().toString(36).substring(7),
            orderId: 'order_demo_' + Math.random().toString(36).substring(7),
            createdAt: serverTimestamp(),
            items: [
              { name: 'Eternal Rose Gold Ring', price: 1250, quantity: 1 }
            ]
          });

          toast.success('Order placed successfully (Demo Mode)!');
          setTimeout(() => navigate('/'), 2000);
        } catch (error) {
          console.error('Error saving order:', error);
          toast.error('Failed to save order details.');
        } finally {
          setIsSubmitting(false);
        }
      }, 1500);
      return;
    }

    try {
      // 1. Create order on the server
      const response = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1250, // Amount in INR
          currency: 'INR',
        }),
      });

      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || 'Failed to create payment order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Aura Jewelry",
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response: any) {
          // This callback runs after successful payment
          try {
            // Save order to Firestore
            await addDoc(collection(db, 'orders'), {
              userId: user?.uid || 'anonymous',
              customerName: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              pincode: formData.pincode,
              phone: formData.phone,
              amount: 1250,
              status: 'paid',
              paymentMethod: 'online',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              createdAt: serverTimestamp(),
              items: [
                { name: 'Eternal Rose Gold Ring', price: 1250, quantity: 1 }
              ]
            });

            toast.success('Payment successful! Order placed.');
            setTimeout(() => navigate('/'), 2000);
          } catch (error) {
            console.error('Error saving order:', error);
            toast.error('Payment successful, but failed to save order details. Please contact support.');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#D4AF37", // Brand gold
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Razorpay Error:', error);
      toast.error(error.message || 'Failed to initialize payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      nextStep();
    } else if (step === 2) {
      if (paymentMethod === 'online') {
        handleRazorpayPayment();
      } else {
        handleCODPayment();
      }
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/cart" className="flex items-center text-sm font-medium text-brand-dark/60 hover:text-brand-gold">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Cart
          </Link>
          <div className="flex items-center gap-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? 'bg-brand-gold text-white' : 'bg-brand-dark/10 text-brand-dark/40'}`}>1</div>
            <div className={`h-px w-8 ${step >= 2 ? 'bg-brand-gold' : 'bg-brand-dark/10'}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? 'bg-brand-gold text-white' : 'bg-brand-dark/10 text-brand-dark/40'}`}>2</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Truck className="h-5 w-5 text-brand-gold" />
                    <h2 className="text-2xl font-serif">Shipping Information</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input name="firstName" required value={formData.firstName} onChange={handleInputChange} placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input name="lastName" required value={formData.lastName} onChange={handleInputChange} placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input name="address" required value={formData.address} onChange={handleInputChange} placeholder="123 Jewelry Lane" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input name="city" required value={formData.city} onChange={handleInputChange} placeholder="Mumbai" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pincode</label>
                      <Input name="pincode" required value={formData.pincode} onChange={handleInputChange} placeholder="400001" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" />
                  </div>
                  <Button type="submit" className="w-full bg-brand-dark text-white rounded-full py-6 mt-4">
                    Continue to Payment
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="h-5 w-5 text-brand-gold" />
                    <h2 className="text-2xl font-serif">Payment Method</h2>
                  </div>
                  
                  <div className="flex flex-col gap-4 mb-8">
                    <div 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                        paymentMethod === 'online' ? "border-brand-gold bg-brand-gold/5" : "border-brand-dark/5 hover:border-brand-dark/20"
                      )}
                      onClick={() => setPaymentMethod('online')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                          paymentMethod === 'online' ? "border-brand-gold" : "border-brand-dark/20"
                        )}>
                          {paymentMethod === 'online' && <div className="h-2.5 w-2.5 rounded-full bg-brand-gold" />}
                        </div>
                        <div>
                          <p className="font-medium">Online Payment</p>
                          <p className="text-xs text-brand-dark/60">UPI, Cards, Netbanking</p>
                        </div>
                      </div>
                      <CreditCard className={cn("h-6 w-6", paymentMethod === 'online' ? "text-brand-gold" : "text-brand-dark/20")} />
                    </div>

                    <div 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                        paymentMethod === 'cod' ? "border-brand-gold bg-brand-gold/5" : "border-brand-dark/5 hover:border-brand-dark/20"
                      )}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                          paymentMethod === 'cod' ? "border-brand-gold" : "border-brand-dark/20"
                        )}>
                          {paymentMethod === 'cod' && <div className="h-2.5 w-2.5 rounded-full bg-brand-gold" />}
                        </div>
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-xs text-brand-dark/60">Pay when you receive</p>
                        </div>
                      </div>
                      <Truck className={cn("h-6 w-6", paymentMethod === 'cod' ? "text-brand-gold" : "text-brand-dark/20")} />
                    </div>
                  </div>

                  {paymentMethod === 'online' && (
                    <div className="bg-brand-paper p-6 rounded-xl border border-brand-dark/5 space-y-4 mb-8">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {!(import.meta as any).env.VITE_RAZORPAY_KEY_ID ? "Demo Mode: Simulated Payment" : "Secure Payment via Razorpay"}
                        </span>
                        { (import.meta as any).env.VITE_RAZORPAY_KEY_ID ? (
                          <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6" referrerPolicy="no-referrer" />
                        ) : (
                          <ShieldCheck className="h-6 w-6 text-brand-gold" />
                        )}
                      </div>
                      <p className="text-xs text-brand-dark/60">
                        {!(import.meta as any).env.VITE_RAZORPAY_KEY_ID 
                          ? "Razorpay is not configured. Clicking 'Pay' will simulate a successful transaction for testing purposes."
                          : "You will be redirected to Razorpay's secure payment portal to complete your transaction using UPI, Cards, or Netbanking."}
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="bg-brand-paper p-6 rounded-xl border border-brand-dark/5 space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <span className="text-sm font-medium">Cash on Delivery Selected</span>
                      </div>
                      <p className="text-xs text-brand-dark/60">
                        Please have the exact amount of ₹1,250 ready when our delivery partner arrives at your doorstep.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-brand-gold text-white rounded-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? 'Processing...' : paymentMethod === 'online' ? 'Pay ₹1,250 Now' : 'Place Order (COD)'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={prevStep} className="text-brand-dark/60">
                      Back to Shipping
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-xl font-medium">Order Summary</h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-brand-dark/60">
                  <span>Subtotal</span>
                  <span>$1,250</span>
                </div>
                <div className="flex justify-between text-brand-dark/60">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <Separator className="my-2 bg-brand-dark/10" />
                <div className="flex justify-between text-xl font-semibold">
                  <span>Total</span>
                  <span>$1,250</span>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-brand-dark/40">
                <ShieldCheck className="h-4 w-4" />
                Secure Checkout Powered by Aura
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
