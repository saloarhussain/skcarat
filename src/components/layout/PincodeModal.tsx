import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, X } from 'lucide-react';
import { toast } from 'sonner';

interface PincodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pincode: string) => void;
}

export default function PincodeModal({ isOpen, onClose, onSelect }: PincodeModalProps) {
  const [pincode, setPincode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    onSelect(pincode);
    onClose();
    toast.success(`Delivery location set to ${pincode}`);
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

          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
              <MapPin className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-medium text-brand-dark">Select Delivery Location</h2>
              <p className="text-sm text-brand-dark/60">
                Enter your pincode to check delivery availability and estimated delivery dates.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4 mt-4">
              <Input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="h-12 text-center text-lg tracking-[0.2em] font-bold border-brand-dark/10 focus-visible:ring-brand-gold"
              />
              <Button type="submit" className="w-full h-12 bg-brand-gold text-white rounded-full text-base font-medium">
                Check Availability
              </Button>
            </form>

            <div className="mt-4 w-full">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-brand-dark/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-brand-dark/40">Popular Cities</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'].map((city) => (
                  <Button 
                    key={city} 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full text-xs border-brand-dark/5 hover:border-brand-gold hover:text-brand-gold"
                    onClick={() => {
                      const mockPincodes: Record<string, string> = {
                        'Mumbai': '400001',
                        'Delhi': '110001',
                        'Bangalore': '560001',
                        'Hyderabad': '500001',
                        'Chennai': '600001',
                        'Kolkata': '700001'
                      };
                      onSelect(mockPincodes[city]);
                      onClose();
                      toast.success(`Delivery location set to ${city}`);
                    }}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
