import { useState, useEffect } from 'react';

export interface PlantedTree {
  id: string;
  treeId: string;
  plantedAt: number; // timestamp
}

export function useForest() {
  const [plantedTrees, setPlantedTrees] = useState<PlantedTree[]>([]);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const storedTrees = localStorage.getItem('lignum_forest');
    if (storedTrees) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlantedTrees(JSON.parse(storedTrees));
    }
    const proStatus = localStorage.getItem('lignum_pro');
    if (proStatus === 'true') {
      setIsPro(true);
    }
  }, []);

  const plantTree = (treeId: string) => {
    const newTree: PlantedTree = {
      id: Math.random().toString(36).substring(7),
      treeId,
      plantedAt: Date.now(),
    };
    const updatedTrees = [...plantedTrees, newTree];
    setPlantedTrees(updatedTrees);
    localStorage.setItem('lignum_forest', JSON.stringify(updatedTrees));
  };

  const unlockPro = () => {
    setIsPro(true);
    localStorage.setItem('lignum_pro', 'true');
  };

  return { plantedTrees, plantTree, isPro, unlockPro };
}
