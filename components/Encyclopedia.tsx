import { useState } from 'react';
import treesData from '@/data/trees.json';
import { Lock, Unlock, Sprout, Info, Calendar, Droplets, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Encyclopedia({ plantTree, isPro }: { plantTree: (id: string) => void, isPro: boolean }) {
  const [selectedTree, setSelectedTree] = useState<typeof treesData[0] | null>(null);

  if (selectedTree) {
    return (
      <TreeDetail 
        tree={selectedTree} 
        onBack={() => setSelectedTree(null)} 
        onPlant={() => {
          plantTree(selectedTree.id);
          setSelectedTree(null);
        }}
        isPro={isPro}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-semibold text-[#1A3622]">Library</h2>
      <div className="space-y-4">
        {treesData.map((tree) => {
          const isLocked = tree.isLocked && !isPro;
          return (
            <button
              key={tree.id}
              onClick={() => !isLocked && setSelectedTree(tree)}
              className={`w-full text-left bg-white p-5 rounded-2xl shadow-sm border border-[#E5E0D8] flex items-center justify-between transition-all ${
                isLocked ? 'opacity-60 cursor-not-allowed grayscale-[50%]' : 'hover:shadow-md hover:border-[#8FBC8F]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isLocked ? 'bg-gray-100' : 'bg-[#E8F0EA]'}`}>
                  <Leaf size={24} className={isLocked ? 'text-gray-400' : 'text-[#2C5535]'} />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-[#1A3622] text-lg">{tree.name}</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#8FBC8F] mt-1">{tree.type}</p>
                </div>
              </div>
              <div>
                {isLocked ? <Lock size={20} className="text-[#A0AAB2]" /> : <Unlock size={20} className="text-[#8FBC8F] opacity-0 group-hover:opacity-100" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TreeDetail({ tree, onBack, onPlant, isPro }: { tree: typeof treesData[0], onBack: () => void, onPlant: () => void, isPro: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-10"
    >
      <button onClick={onBack} className="text-[#8FBC8F] font-medium text-sm flex items-center gap-1 hover:text-[#2C5535] transition-colors">
        &larr; Back to Library
      </button>

      <div>
        <h2 className="text-3xl font-serif font-bold text-[#1A3622]">{tree.name}</h2>
        <p className="text-sm font-medium uppercase tracking-wider text-[#8FBC8F] mt-1">{tree.type}</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5E0D8] space-y-6">
        <section>
          <h3 className="flex items-center gap-2 font-serif font-semibold text-lg text-[#2C5535] mb-3">
            <Info size={20} /> Identification
          </h3>
          <ul className="list-disc list-inside text-sm text-[#5A6D60] space-y-1">
            {tree.identification.map((trait, i) => (
              <li key={i}>{trait}</li>
            ))}
          </ul>
        </section>

        <div className="h-px bg-[#E5E0D8] w-full" />

        <section>
          <h3 className="flex items-center gap-2 font-serif font-semibold text-lg text-[#2C5535] mb-3">
            <Calendar size={20} /> Harvesting
          </h3>
          <p className="text-sm text-[#5A6D60]"><strong className="text-[#1A3622]">Month:</strong> {tree.harvesting.month}</p>
          <p className="text-sm text-[#5A6D60] mt-1"><strong className="text-[#1A3622]">Viability:</strong> {tree.harvesting.viabilityTest}</p>
        </section>

        <div className="h-px bg-[#E5E0D8] w-full" />

        <section>
          <h3 className="flex items-center gap-2 font-serif font-semibold text-lg text-[#2C5535] mb-3">
            <Droplets size={20} /> Dormancy Secret
          </h3>
          <p className="text-sm text-[#5A6D60]"><strong className="text-[#1A3622]">Method:</strong> {tree.dormancySecret.method}</p>
          <p className="text-sm text-[#5A6D60] mt-1"><strong className="text-[#1A3622]">Details:</strong> {tree.dormancySecret.details}</p>
        </section>

        <div className="h-px bg-[#E5E0D8] w-full" />

        <section>
          <h3 className="flex items-center gap-2 font-serif font-semibold text-lg text-[#2C5535] mb-3">
            <Sprout size={20} /> Care & Growth
          </h3>
          <p className="text-sm text-[#5A6D60]"><strong className="text-[#1A3622]">Germination:</strong> ~{tree.germinationDays} days</p>
          <p className="text-sm text-[#5A6D60] mt-2"><strong className="text-[#1A3622]">Year 1:</strong> {tree.longTermCare.year1}</p>
          <p className="text-sm text-[#5A6D60] mt-1"><strong className="text-[#1A3622]">Year 5:</strong> {tree.longTermCare.year5}</p>
        </section>

        <div className="bg-[#E8F0EA] p-4 rounded-xl">
          <p className="text-sm text-[#2C5535] italic font-serif">&quot;{tree.funFact}&quot;</p>
        </div>
      </div>

      <button
        onClick={onPlant}
        className="w-full bg-[#2C5535] text-[#F9F6F0] py-4 rounded-2xl font-semibold tracking-wide shadow-md hover:bg-[#1A3622] transition-colors flex items-center justify-center gap-2"
      >
        <Sprout size={20} /> Plant this Seed
      </button>
    </motion.div>
  );
}
