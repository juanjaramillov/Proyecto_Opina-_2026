/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode } from 'react';
import { DemoDataState, DemoBattle, DemoReview, DemoUser } from './types';
import { mockDataService } from '../services/mockData';

interface DemoContextType extends DemoDataState {
    voteBattle: (battleId: string, option: 'A' | 'B') => void;
    voteSignal: (signalId: string, optionIndex: number) => void;
    addReview: (review: Omit<DemoReview, 'id' | 'userId' | 'createdAt' | 'helpfulCount'>) => void;
    addProduct: (product: Omit<import('./types').DemoProduct, 'id' | 'image' | 'votesCount' | 'signal'>) => string; // Returns new ID
    rateProduct: (productId: string, voteType: 'up' | 'neutral' | 'down', comment?: string) => void;
    // Helpers
    getUser: (id: string) => DemoUser | undefined;
    getBattle: (id: string) => DemoBattle | undefined;
    getReviewsForTarget: (targetId: string) => DemoReview[];
    getProductByBarcode: (barcode: string) => import('./types').DemoProduct | undefined;
    // Demo Mode
    demoMode: boolean;
    toggleDemoMode: () => void;
    resetDemoData: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<DemoDataState>(mockDataService.getInitialState());
    const [demoMode, setDemoMode] = useState(() => {
        return localStorage.getItem('opina_demo_mode') !== 'false'; // Default true
    });

    const toggleDemoMode = () => {
        setDemoMode(prev => {
            const newValue = !prev;
            localStorage.setItem('opina_demo_mode', String(newValue));
            return newValue;
        });
    };

    const resetDemoData = () => {
        // Selective clear: Remove only keys starting with "opina_"
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('opina_')) {
                // Preserve demo mode preference if desired, or let it reset
                // In previous logic we preserved it manually. Let's do the same.
                if (key !== 'opina_demo_mode') {
                    keysToRemove.push(key);
                }
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));

        // Ensure demo mode is set to current state
        localStorage.setItem('opina_demo_mode', String(demoMode));

        // Reload to apply changes cleanly
        window.location.reload();
    };

    const voteBattle = (battleId: string, option: 'A' | 'B') => {
        setState(prev => {
            const battles = prev.battles.map(b => {
                if (b.id !== battleId) return b;
                // Simulate vote
                return {
                    ...b,
                    votesA: option === 'A' ? b.votesA + 1 : b.votesA,
                    votesB: option === 'B' ? b.votesB + 1 : b.votesB,
                    totalVotes: b.totalVotes + 1,
                    participants: [...b.participants, prev.currentUser?.id || 'guest']
                };
            });
            return { ...prev, battles };
        });
    };

    const voteSignal = (signalId: string, optionIndex: number) => {
        setState(prev => {
            const signals = prev.signals.map(s => {
                if (s.id !== signalId) return s;
                const newOptions = [...s.options];
                newOptions[optionIndex].votes++;
                return {
                    ...s,
                    options: newOptions,
                    totalVotes: s.totalVotes + 1,
                    participants: [...s.participants, prev.currentUser?.id || 'guest']
                };
            });
            return { ...prev, signals };
        });
    };

    const addReview = (reviewData: Omit<DemoReview, 'id' | 'userId' | 'createdAt' | 'helpfulCount'>) => {
        if (!state.currentUser) return;

        const newReview: DemoReview = {
            ...reviewData,
            id: `rev-new-${Date.now()}`,
            userId: state.currentUser.id,
            createdAt: new Date().toISOString(),
            helpfulCount: 0
        };

        setState(prev => ({
            ...prev,
            reviews: [newReview, ...prev.reviews]
        }));
    };

    const addProduct = (productData: Omit<import('./types').DemoProduct, 'id' | 'image' | 'votesCount' | 'signal'>) => {
        const newId = `p-new-${Date.now()}`;
        const newProduct: import('./types').DemoProduct = {
            ...productData,
            id: newId,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', // Default placeholder
            signal: 50, // "Señal en formación"
            votesCount: 0
        };

        setState(prev => ({
            ...prev,
            products: [...prev.products, newProduct]
        }));

        return newId;
    };

    const rateProduct = (productId: string, voteType: 'up' | 'neutral' | 'down', comment?: string) => {
        if (!state.currentUser) return;

        // 1. Create Review
        const ratingMap = { up: 5, neutral: 3, down: 1 };
        const newReview: DemoReview = {
            id: `rev-${Date.now()}`,
            targetId: productId,
            targetName: state.products.find(p => p.id === productId)?.name || 'Producto',
            targetImage: state.products.find(p => p.id === productId)?.image || '',
            targetType: 'product',
            userId: state.currentUser.id,
            rating: ratingMap[voteType],
            text: comment || (voteType === 'up' ? 'Lo recomiendo.' : voteType === 'neutral' ? 'Es regular.' : 'No lo recomiendo.'),
            createdAt: new Date().toISOString(),
            helpfulCount: 0
        };

        setState(prev => {
            const productIndex = prev.products.findIndex(p => p.id === productId);
            if (productIndex === -1) return prev;

            const product = prev.products[productIndex];
            const newVotesCount = (product.votesCount || 0) + 1;

            // 2. Simple Signal Recalculation (Weighted Average approximation)
            // Current Total Score = Signal * Votes
            // New Score = Current Total + New Vote Value (100 | 50 | 0)
            // New Signal = New Total / (Votes + 1)

            const voteValue = voteType === 'up' ? 100 : voteType === 'neutral' ? 50 : 0;
            const currentTotalScore = (product.signal || 50) * (product.votesCount || 0);
            const newSignal = Math.round((currentTotalScore + voteValue) / newVotesCount);

            const updatedProducts = [...prev.products];
            updatedProducts[productIndex] = {
                ...product,
                votesCount: newVotesCount,
                signal: newSignal
            };

            return {
                ...prev,
                products: updatedProducts,
                reviews: [newReview, ...prev.reviews]
            };
        });
    };

    const getUser = (id: string) => state.users.find(u => u.id === id);
    const getBattle = (id: string) => state.battles.find(b => b.id === id);
    const getReviewsForTarget = (targetId: string) => state.reviews.filter(r => r.targetId === targetId);
    const getProductByBarcode = (barcode: string) => state.products.find(p => p.barcode === barcode);

    return (
        <DemoContext.Provider value={{ ...state, voteBattle, voteSignal, addReview, addProduct, rateProduct, getUser, getBattle, getReviewsForTarget, getProductByBarcode, demoMode, toggleDemoMode, resetDemoData }}>
            {children}
        </DemoContext.Provider>
    );
};
export const useDemoData = () => {
    const context = useContext(DemoContext);
    if (!context) {
        throw new Error('useDemoData must be used within a DemoProvider');
    }
    return context;
};

export const useDemoValue = (realValue: number, multiplier = 10) => {
    const { demoMode } = useDemoData();
    if (!demoMode) return realValue;
    return realValue === 0 ? 0 : Math.floor(realValue * multiplier);
};
