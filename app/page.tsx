'use client';

import { useState } from 'react';
import { Leaf, BookOpen, BrainCircuit, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MyForest from '@/components/MyForest';
import Encyclopedia from '@/components/Encyclopedia';
import Quiz from '@/components/Quiz';
import ProUnlock from '@/components/ProUnlock';
import { useForest } from '@/hooks/use-forest';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'forest' | 'encyclopedia' | 'quiz' | 'pro'>('forest');
  const { plantedTrees, plantTree, isPro, unlockPro } = useForest();

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#F9F6F0] shadow-xl min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 bg-[#2C5535] text-[#F9F6F0] rounded-b-[2rem] shadow-md z-10">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-center">Lignum</h1>
        <p className="text-center text-[#8FBC8F] text-sm mt-1 font-medium tracking-wide uppercase">
          Cultivate Knowledge
        </p>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'forest' && (
            <motion.div
              key="forest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MyForest plantedTrees={plantedTrees} />
            </motion.div>
          )}
          {activeTab === 'encyclopedia' && (
            <motion.div
              key="encyclopedia"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Encyclopedia plantTree={plantTree} isPro={isPro} />
            </motion.div>
          )}
          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Quiz />
            </motion.div>
          )}
          {activeTab === 'pro' && (
            <motion.div
              key="pro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ProUnlock isPro={isPro} unlockPro={unlockPro} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E5E0D8] px-6 py-4 flex justify-between items-center z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavItem
          icon={<Leaf size={24} />}
          label="Forest"
          isActive={activeTab === 'forest'}
          onClick={() => setActiveTab('forest')}
        />
        <NavItem
          icon={<BookOpen size={24} />}
          label="Library"
          isActive={activeTab === 'encyclopedia'}
          onClick={() => setActiveTab('encyclopedia')}
        />
        <NavItem
          icon={<BrainCircuit size={24} />}
          label="Quiz"
          isActive={activeTab === 'quiz'}
          onClick={() => setActiveTab('quiz')}
        />
        <NavItem
          icon={<Crown size={24} />}
          label="Pro"
          isActive={activeTab === 'pro'}
          onClick={() => setActiveTab('pro')}
        />
      </nav>
    </main>
  );
}

function NavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${
        isActive ? 'text-[#2C5535]' : 'text-[#A0AAB2] hover:text-[#2C5535]'
      }`}
    >
      <div
        className={`p-2 rounded-xl transition-all ${
          isActive ? 'bg-[#E8F0EA]' : 'bg-transparent'
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-semibold tracking-wider uppercase">
        {label}
      </span>
    </button>
  );
}
