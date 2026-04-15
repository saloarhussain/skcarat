import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/firebase";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [settings, setSettings] = useState({
    phoneEnabled: true,
    googleEnabled: true,
    whatsappEnabled: false,
    privacyPolicyUrl: '/privacy-policy',
    termsUrl: '/terms',
    otpTimer: 30,
    supportEmail: 'support@aurajewelry.com',
    whatsappNumber: '+919876543210'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/firebase');
        const docRef = doc(db, 'settings', 'auth_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      } catch (error) {
        console.error('Error fetching auth settings:', error);
      }
    };
    if (isOpen) fetchSettings();
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      try {
        const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(result);
        setStep('otp');
        setTimer(settings.otpTimer);
        toast.success("OTP sent successfully");
      } catch (firebaseError: any) {
        console.error("Firebase Phone Auth Error:", firebaseError);
        
        // Fallback to Demo Mode if Phone Auth is not enabled or domain not allowlisted
        if (
          firebaseError.code === 'auth/operation-not-allowed' || 
          firebaseError.code === 'auth/unauthorized-domain' ||
          firebaseError.message?.includes('not-allowed')
        ) {
          toast.info("Demo Mode: Phone Auth is not enabled in Firebase. Using simulated OTP for testing.");
          setStep('otp');
          setTimer(settings.otpTimer);
          // We'll use a dummy confirmation result for demo mode
          setConfirmationResult({
            confirm: async (code: string) => {
              if (code === '123456') {
                return { user: { uid: 'demo-user', phoneNumber: formattedPhone } } as any;
              }
              throw new Error('Invalid OTP');
            }
          } as any);
        } else {
          throw firebaseError;
        }
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send OTP");
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        toast.success("Logged in successfully");
        onClose();
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppLogin = () => {
    if (settings.whatsappEnabled) {
      const message = encodeURIComponent("I want to login to Aura Jewelry");
      window.open(`https://wa.me/${settings.whatsappNumber.replace(/\+/g, '')}?text=${message}`, '_blank');
    } else {
      toast.info("WhatsApp login is coming soon!");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google');
      onClose();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to sign in with Google');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-white rounded-3xl">
        <div className="relative p-8 pt-12">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>

          <div id="recaptcha-container"></div>

          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Enter Mobile Number</h2>
                  <p className="text-sm text-gray-500">
                    We will send you an OTP to verify your number
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-1 focus-within:border-pink-400 transition-colors">
                    <div className="flex items-center gap-1 px-3 border-r border-gray-100">
                      <img 
                        src="https://flagcdn.com/w20/in.png" 
                        alt="India" 
                        className="w-5 h-auto rounded-sm"
                      />
                      <span className="text-sm font-medium text-gray-600">+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 bg-transparent py-3 px-2 outline-none text-gray-900 placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading || phoneNumber.length < 10}
                    className="w-full h-14 bg-[#EC7B8F] hover:bg-[#E56A80] text-white rounded-xl text-lg font-medium transition-all group"
                  >
                    {loading ? "Sending..." : "Request OTP"}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>

                {(settings.googleEnabled || settings.whatsappEnabled) && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 text-gray-400 font-medium">Or Login Using</span>
                      </div>
                    </div>

                    <div className={cn(
                      "grid gap-3",
                      settings.googleEnabled && settings.whatsappEnabled ? "grid-cols-2" : "grid-cols-1"
                    )}>
                      {settings.whatsappEnabled && (
                        <Button
                          variant="outline"
                          onClick={handleWhatsAppLogin}
                          className="h-12 rounded-xl border-gray-200 hover:bg-gray-50 gap-2 font-medium"
                        >
                          <MessageCircle className="h-5 w-5 text-[#25D366]" />
                          WhatsApp
                        </Button>
                      )}
                      {settings.googleEnabled && (
                        <Button
                          variant="outline"
                          onClick={handleGoogleLogin}
                          className="h-12 rounded-xl border-gray-200 hover:bg-gray-50 gap-2 font-medium"
                        >
                          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                          Google
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <div className="text-center space-y-4">
                  <button className="text-sm font-semibold text-gray-900 underline underline-offset-4">
                    Having trouble logging in?
                  </button>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    I accept that I have read & understood <br />
                    <a href={settings.privacyPolicyUrl} className="underline">Privacy Policy</a> and <a href={settings.termsUrl} className="underline">T&Cs</a>.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
                  <p className="text-sm text-gray-500">
                    Sent to +91 {phoneNumber}
                  </p>
                  {confirmationResult && (confirmationResult as any).confirm.toString().includes('demo-user') && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 font-medium">
                        Demo Mode Active: Use OTP <span className="font-bold">123456</span> to log in.
                      </p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex justify-center gap-2">
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border-gray-200 focus:border-pink-400"
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full h-14 bg-[#EC7B8F] hover:bg-[#E56A80] text-white rounded-xl text-lg font-medium transition-all"
                  >
                    {loading ? "Verifying..." : "Verify & Login"}
                  </Button>
                </form>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in <span className="font-bold text-pink-500">{timer}s</span>
                    </p>
                  ) : (
                    <button 
                      onClick={handleSendOtp}
                      className="text-sm font-bold text-pink-500 hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setStep('phone')}
                  className="w-full text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Change Phone Number
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
