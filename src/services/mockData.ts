import { DemoDataState } from '../demo/types';

const EMPTY_STATE: DemoDataState = {
    currentUser: null,
    users: [],
    products: [],
    battles: [],
    signals: [],
    reviews: [],
    stats: {
        totalUsers: 0,
        activeNow: 0,
        totalVotes: 0,
        totalReviews: 0,
        totalBattles: 0,
        totalSignals: 0,
        totalComments: 0,
        trendingTopics: [],
    },
};

export const mockDataService = {
    getInitialState: (): DemoDataState => {
        return EMPTY_STATE;
    }
};
