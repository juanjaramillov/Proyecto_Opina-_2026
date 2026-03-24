import { motion, AnimatePresence } from 'framer-motion';

interface VersusHeaderProps {
    title: string;
    onResetGame: () => void;
    onExploreCategories?: () => void;
}

export function VersusHeader({ title, onResetGame, onExploreCategories }: VersusHeaderProps) {
    const formatTitle = (str: string) => {
        const match = str.match(/^([¿¡\s]*)(.*)/);
        if (!match) return str;
        const p1 = match[1];
        const body = match[2];
        if (body.length > 0) {
            return p1 + body.charAt(0).toUpperCase() + body.slice(1);
        }
        return str;
    };
    
    const titleStr = formatTitle(title.replace(/[-_]/g, ' '));
    const words = titleStr.split(' ');

    const stopWords = new Set([
        'del', 'de', 'la', 'el', 'los', 'las', 'y', 'o', 'en', 'a', 'un', 'una', 
        'por', 'con', 'para', 'sin', 'sobre', 'entre', 'pero', 'si', 'no', 'mas', 'más', 
        'ya', 'que', 'cual', 'cuál', 'cuales', 'quien', 'quienes', 'como', 'cuando', 
        'donde', 'dónde', 'porque', 'te', 'me', 'se', 'le', 'les', 'nos', 'es', 'son', 
        'al', 'lo', 'tu', 'tus', 'su', 'sus', 'mi', 'mis', 'nuestro', 'nuestra', 
        'nuestros', 'nuestras', 'menos', 'aqui', 'aquí', 'alli', 'allí', 'este', 'esta',
        'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella', 'aquellos', 
        'aquellas', 'todo', 'toda', 'todos', 'todas', 'nada', 'algo', 'mucho', 'mucha',
        'muchos', 'muchas', 'poco', 'poca', 'pocos', 'pocas', 'muy', 'tan', 'hasta',
        'desde', 'hacia', 'ni'
    ]);

    let bestStartIndex = words.length - 1;
    let bestLength = 1;
    let maxScore = -1;

    for (let size = 1; size <= Math.min(3, words.length); size++) {
        for (let i = 0; i <= words.length - size; i++) {
            const windowWords = words.slice(i, i + size);
            let score = 0;
            let isValid = true;
            
            windowWords.forEach((word, idx) => {
                const cleanWord = word.replace(/^[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+|[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/g, '').toLowerCase();
                const isStop = stopWords.has(cleanWord) || cleanWord.length === 0;
                
                if ((idx === 0 || idx === size - 1) && isStop) {
                    isValid = false;
                }
                if (!isStop) {
                    score += cleanWord.length;
                }
            });

            if (isValid && score > maxScore) {
                maxScore = score;
                bestStartIndex = i;
                bestLength = size;
            }
        }
    }

    if (maxScore === -1) {
        bestStartIndex = words.length > 0 ? words.length - 1 : 0;
        bestLength = 1;
    }

    const highlightWord = words.slice(bestStartIndex, bestStartIndex + bestLength).join(' ');
    const beforeHighlight = words.slice(0, bestStartIndex).join(' ');
    const afterHighlight = words.slice(bestStartIndex + bestLength).join(' ');

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={title}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
            >
                <div className="text-center">
                    <div className="flex items-center justify-between w-full mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                            <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-primary to-emerald-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                            Comparación Corta
                        </div>

                        <button
                            onClick={() => onExploreCategories ? onExploreCategories() : onResetGame()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 hover:bg-primary-100 border border-primary-100 hover:border-primary-200 text-primary-600 hover:text-primary-700 transition-all group shadow-sm"
                            title="Explorar otras categorías o ver mis resultados"
                        >
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Explorar Categorías</span>
                            <span className="material-symbols-outlined text-sm font-bold transition-transform group-hover:scale-110">explore</span>
                        </button>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 leading-[1.2] drop-shadow-sm px-4">
                        {beforeHighlight && <>{beforeHighlight} </>}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500 pb-1">{highlightWord}</span>
                        {afterHighlight && <> {afterHighlight}</>}
                    </h2>

                    <p className="mt-3 text-base md:text-lg font-bold text-slate-600">
                        Dos opciones. Una decisión rápida.
                    </p>

                    <div className="mt-2 text-sm font-medium text-slate-500">
                        Toca una carta para señalar tu preferencia.
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default VersusHeader;
