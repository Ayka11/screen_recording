import { Crown, CheckCircle2, LockOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProUnlock({ isPro, unlockPro }: { isPro: boolean, unlockPro: () => void }) {
  const handleUnlock = () => {
    // Simulate PayPal redirect and unlock
    window.open('https://paypal.me/yourpaypalurl/2.99', '_blank');
    // In a real app, we'd wait for a webhook or callback. Here we just unlock it.
    setTimeout(() => {
      unlockPro();
    }, 2000);
  };

  if (isPro) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center mt-20">
        <div className="w-24 h-24 bg-[#E8F0EA] rounded-full flex items-center justify-center mb-6">
          <Crown size={48} className="text-[#2C5535]" />
        </div>
        <h2 className="text-2xl font-serif font-semibold text-[#1A3622] mb-2">Pro Unlocked</h2>
        <p className="text-[#5A6D60] max-w-[250px]">
          Thank you for supporting Lignum! You now have access to all rare and ancient trees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-semibold text-[#1A3622]">Unlock Pro</h2>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-[#E5E0D8] space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9F6F0] rounded-bl-full -z-10" />
        
        <div className="w-16 h-16 bg-[#E8F0EA] rounded-2xl flex items-center justify-center mb-6">
          <Crown size={32} className="text-[#2C5535]" />
        </div>
        
        <h3 className="text-3xl font-serif font-bold text-[#1A3622] leading-tight">
          Discover Ancient Giants
        </h3>
        
        <p className="text-[#5A6D60] leading-relaxed">
          Support the development of Lignum and unlock access to 5 rare and ancient trees, including the 5,000-year-old Bristlecone Pine.
        </p>

        <ul className="space-y-3 mt-6">
          {['Giant Sequoia', 'Bristlecone Pine', 'Ginkgo Biloba', 'Baobab', 'Dragon Blood Tree'].map((tree, i) => (
            <li key={i} className="flex items-center gap-3 text-[#1A3622] font-medium">
              <CheckCircle2 size={18} className="text-[#8FBC8F]" />
              {tree}
            </li>
          ))}
        </ul>

        <button
          onClick={handleUnlock}
          className="w-full bg-[#2C5535] text-[#F9F6F0] py-4 rounded-2xl font-semibold tracking-wide shadow-md hover:bg-[#1A3622] transition-colors flex items-center justify-center gap-2 mt-8"
        >
          <LockOpen size={20} /> Unlock for $2.99
        </button>
        
        <p className="text-xs text-center text-[#A0AAB2] mt-4">
          Secure payment via PayPal. One-time purchase.
        </p>
      </motion.div>
    </div>
  );
}
