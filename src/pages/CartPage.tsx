import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/providers/CartProvider';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart();
  const giftWrapFee = cartItems.reduce((sum, item) => sum + (item.isGiftWrap ? 50 * item.quantity : 0), 0);

  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping + giftWrapFee;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
            <ShoppingBag className="h-10 w-10" />
          </div>
        </div>
        <h2 className="mb-4 text-3xl font-light">Your cart is empty</h2>
        <p className="mb-8 text-brand-dark/60">Looks like you haven't added any jewelry to your cart yet.</p>
        <Link to="/products" className={cn(buttonVariants({ variant: "brand" }))}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-12">
      <h1 className="mb-12 font-serif text-4xl font-light">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-8">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-white sm:w-32">
                  <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/products/${item.id}`} className="font-serif text-xl font-medium hover:text-brand-gold">
                        {item.name}
                      </Link>
                      <p className="text-sm text-brand-dark/60 capitalize">{item.category}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-brand-dark/40 hover:text-red-500">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-brand-dark/10 bg-white px-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-lg font-semibold">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-xl font-medium">Order Summary</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-brand-dark/60">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-dark/60">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
              </div>
              {giftWrapFee > 0 && (
                <div className="flex justify-between text-brand-dark/60">
                  <span>Gift Wrap</span>
                  <span>${giftWrapFee.toLocaleString()}</span>
                </div>
              )}
              <Separator className="my-2 bg-brand-dark/10" />
              <div className="flex justify-between text-xl font-semibold">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
            <Link to="/checkout">
              <Button variant="brand" className="mt-8 w-full rounded-full py-6">
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-brand-dark/40">
              <ShieldCheck className="h-4 w-4" />
              Secure Checkout Powered by Aura
            </div>
          </div>
          
          {/* Loyalty Info */}
          <div className="mt-6 rounded-2xl bg-brand-gold/10 p-6">
            <h4 className="mb-2 font-medium text-brand-gold">Loyalty Points</h4>
            <p className="text-sm text-brand-dark/70">
              You'll earn <span className="font-bold">{Math.floor(subtotal / 10)}</span> points with this purchase!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
