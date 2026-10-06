import { create } from 'zustand';

export interface CartItem {
  id: string;
  title: string;
  price?: number;
  image: string;
  category: 'Clothing' | 'Jewelry';
  quantity: number;
}

export interface User {
  email: string;
  name: string;
}

interface AppState {
  // Theme & Navigation
  isJewelry: boolean;
  activeClothingCategory: string;
  activeJewelryCategory: string;
  isTransitioning: boolean;
  
  // Auth
  user: User | null;
  isAuthModalOpen: boolean;
  
  // Search
  isSearchModalOpen: boolean;
  
  // Cart & Wishlist
  isCartOpen: boolean;
  cartItems: CartItem[];
  wishlistItems: CartItem[];
  
  // Actions
  toggleTheme: () => void;
  setJewelryMode: (val: boolean) => void;
  setIsTransitioning: (val: boolean) => void;
  setActiveClothingCategory: (val: string) => void;
  setActiveJewelryCategory: (val: string) => void;
  
  // Auth Actions
  login: (email: string, name?: string) => void;
  logout: () => void;
  setAuthModalOpen: (val: boolean) => void;
  
  // Search Actions
  setSearchModalOpen: (val: boolean) => void;
  
  // Cart Actions
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  
  // Wishlist Actions
  toggleWishlist: (item: Omit<CartItem, 'quantity'>) => void;
}

export const useStore = create<AppState>((set) => ({
  isJewelry: false,
  activeClothingCategory: 'All',
  activeJewelryCategory: 'All',
  isTransitioning: false,
  
  user: null,
  isAuthModalOpen: false,
  
  isSearchModalOpen: false,
  
  isCartOpen: false,
  cartItems: [],
  wishlistItems: [],
  
  toggleTheme: () => set((state) => ({ isJewelry: !state.isJewelry })),
  setJewelryMode: (val: boolean) => set({ isJewelry: val }),
  setIsTransitioning: (val: boolean) => set({ isTransitioning: val }),
  setActiveClothingCategory: (val: string) => set({ activeClothingCategory: val }),
  setActiveJewelryCategory: (val: string) => set({ activeJewelryCategory: val }),
  
  login: (email, name = 'Guest') => set({ user: { email, name }, isAuthModalOpen: false }),
  logout: () => set({ user: null }),
  setAuthModalOpen: (val: boolean) => set({ isAuthModalOpen: val }),
  
  setSearchModalOpen: (val: boolean) => set({ isSearchModalOpen: val }),
  
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  addToCart: (item) => set((state) => {
    const existing = state.cartItems.find(i => i.id === item.id);
    if (existing) {
      return { cartItems: state.cartItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
    }
    return { cartItems: [...state.cartItems, { ...item, quantity: 1 }], isCartOpen: true };
  }),
  removeFromCart: (id) => set((state) => ({
    cartItems: state.cartItems.filter(i => i.id !== id)
  })),
  toggleWishlist: (item) => set((state) => {
    // Requires auth check on UI level before calling this
    const exists = state.wishlistItems.find(i => i.id === item.id);
    if (exists) {
      return { wishlistItems: state.wishlistItems.filter(i => i.id !== item.id) };
    }
    return { wishlistItems: [...state.wishlistItems, { ...item, quantity: 1 }] };
  }),
}));
