import { create } from "zustand";

interface BearStore {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

const useBears = create<BearStore>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}));

export default useBears;

/**
 * Sử dụng store trong component
 * const {bears, increasePopulation, removeAllBears, updateBears} = useBears();
 */
