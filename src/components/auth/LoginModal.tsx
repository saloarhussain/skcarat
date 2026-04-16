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
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, MessageCircle, X, Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    googleEnabled: true,
    whatsappEnabled: false,
    privacyPolicyUrl: '/privacy-policy',
    termsUrl: '/terms',
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
          const data = docSnap.data();
          setSettings({
            ...settings,
            ...data,
            emailEnabled: data.emailEnabled ?? true // Fallback to true if not set
          } as any);
        }
      } catch (error) {
        console.error('Error fetching auth settings:', error);
      }
    };
    if (isOpen) fetchSettings();
  }, [isOpen]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        // Sign out immediately to force them to login after verification
        await signOut(auth);
        toast.success("Account created! Please check your email for verification.");
        setMode('login');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          toast.warning("Please verify your email address.", {
            description: "A verification link was sent to your inbox.",
            action: {
              label: "Resend Email",
              onClick: () => sendEmailVerification(userCredential.user).then(() => toast.success("Verification email resent!"))
            }
          });
        } else {
          toast.success("Logged in successfully");
          onClose();
        }
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      let message = "Authentication failed";
      
      if (error.code === 'auth/unauthorized-domain') {
        message = "This domain is not authorized in Firebase. Please add this URL to 'Authorized domains' in Firebase Console.";
      } else if (error.code === 'auth/user-not-found') {
        message = "No account found with this email";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Please login instead.";
        setMode('login');
      } else if (error.code === 'auth/weak-password') {
        message = "Password should be at least 6 characters";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later.";
      } else {
        message = error.message || "Authentication failed";
      }
      
      toast.error(message, {
        duration: 5000,
        action: error.code === 'auth/unauthorized-domain' ? {
          label: "How to fix?",
          onClick: () => window.open('https://firebase.google.com/docs/auth/web/redirect-best-practices#add-domain', '_blank')
        } : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      console.error("Reset Error:", error);
      toast.error("Failed to send reset link. Please check the email address.");
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
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      
      let message = 'Failed to sign in with Google';
      if (error.code === 'auth/unauthorized-domain') {
        message = "This domain is not authorized. Please add this URL to 'Authorized domains' in Firebase Console.";
      } else if (error.code === 'auth/popup-blocked') {
        message = "Popup was blocked by your browser. Please allow popups for this site.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "Google sign-in is not enabled in Firebase. Please enable it in the Firebase Console.";
      }
      
      toast.error(message, {
        duration: 5000,
        action: error.code === 'auth/unauthorized-domain' ? {
          label: "How to fix?",
          onClick: () => window.open('https://firebase.google.com/docs/auth/web/redirect-best-practices#add-domain', '_blank')
        } : undefined
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-white rounded-3xl"
      >
        <div className="relative p-8 pt-12">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>

          <div id="recaptcha-container"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-gray-500">
                  {mode === 'login' 
                    ? 'Login to access your account' 
                    : 'Sign up to start shopping with Aura'}
                </p>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-1 focus-within:border-pink-400 transition-colors bg-gray-50/50">
                    <div className="pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-transparent py-3 px-2 outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-1 focus-within:border-pink-400 transition-colors bg-gray-50/50">
                    <div className="pl-3">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent py-3 px-2 outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {mode === 'login' && (
                    <div className="flex justify-end px-1">
                      <button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-medium text-pink-500 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#EC7B8F] hover:bg-[#E56A80] text-white rounded-xl text-lg font-medium transition-all group"
                >
                  {loading ? "Processing..." : (mode === 'login' ? "Login" : "Create Account")}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm font-medium text-pink-500 hover:text-pink-600 flex items-center justify-center gap-2 mx-auto"
                >
                  {mode === 'login' ? (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Don't have an account? Sign Up
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Already have an account? Login
                    </>
                  )}
                </button>
              </div>

              {(settings.googleEnabled || settings.whatsappEnabled) && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-gray-400 font-medium">Or Continue With</span>
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
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  By continuing, you accept our <br />
                  <a href={settings.privacyPolicyUrl} className="underline">Privacy Policy</a> and <a href={settings.termsUrl} className="underline">T&Cs</a>.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
