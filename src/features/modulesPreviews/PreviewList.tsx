import { Skeleton } from '../../components/ui/Skeleton';

interface PreviewListProps {
    items?: Record<string, any>[];
    renderItem?: (item: any, index: number) => React.ReactNode;
}

const PreviewList: React.FC<PreviewListProps> = ({ items = [], renderItem }) => {
    return (
        <div className="space-y-4">
            {items.length > 0 && renderItem ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item, i) => renderItem(item, i))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm opacity-60">
                            <Skeleton variant="card" className="w-full h-32 rounded-2xl mb-4" />
                            <Skeleton variant="text" className="w-2/3 h-4 mb-2" />
                            <Skeleton variant="text" className="w-1/2 h-4" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PreviewList;
