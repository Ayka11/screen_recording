import { PlantedTree } from '@/hooks/use-forest';
import { calculateGrowthStage, getDaysUntilStratificationOver } from '@/lib/growth';
import treesData from '@/data/trees.json';
import { Sprout, TreePine, TreeDeciduous, CircleDot, BellRing } from 'lucide-react';

export default function MyForest({ plantedTrees }: { plantedTrees: PlantedTree[] }) {
  if (plantedTrees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center mt-20">
        <div className="w-24 h-24 bg-[#E8F0EA] rounded-full flex items-center justify-center mb-6">
          <Sprout size={48} className="text-[#8FBC8F]" />
        </div>
        <h2 className="text-2xl font-serif font-semibold text-[#1A3622] mb-2">Your forest is empty</h2>
        <p className="text-[#5A6D60] max-w-[250px]">
          Head over to the Library to learn about trees and plant your first seed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-semibold text-[#1A3622]">My Forest</h2>
      <div className="grid grid-cols-2 gap-4">
        {plantedTrees.map((plantedTree) => {
          const treeInfo = treesData.find((t) => t.id === plantedTree.treeId);
          if (!treeInfo) return null;

          const stage = calculateGrowthStage(plantedTree.plantedAt, treeInfo.germinationDays);
          const stratDaysLeft = getDaysUntilStratificationOver(plantedTree.plantedAt);
          
          let Icon = CircleDot; // Seed
          if (stage === 'Sprout') Icon = Sprout;
          if (stage === 'Sapling') Icon = TreePine;
          if (stage === 'Mature Tree') Icon = TreeDeciduous;

          return (
            <div key={plantedTree.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E0D8] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#8FBC8F]" />
              <div className="w-16 h-16 bg-[#F9F6F0] rounded-full flex items-center justify-center mb-3 mt-2">
                <Icon size={32} className="text-[#2C5535]" />
              </div>
              <h3 className="font-serif font-semibold text-[#1A3622] text-sm">{treeInfo.name}</h3>
              <p className="text-xs text-[#8FBC8F] font-medium uppercase tracking-wider mt-1">{stage}</p>
              
              {stratDaysLeft > 0 && stratDaysLeft <= 90 && (
                <div className="mt-3 bg-[#FFF3CD] text-[#856404] text-[10px] px-2 py-1 rounded-md font-medium w-full flex items-center justify-center gap-1">
                  <BellRing size={12} />
                  Stratification: {stratDaysLeft}d
                </div>
              )}
              {stratDaysLeft === 0 && stage === 'Seed' && (
                <div className="mt-3 bg-[#E8F0EA] text-[#2C5535] text-[10px] px-2 py-1 rounded-md font-medium w-full flex items-center justify-center gap-1">
                  <BellRing size={12} />
                  Ready to sprout!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
