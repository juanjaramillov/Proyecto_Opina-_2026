import { motion, AnimatePresence } from 'framer-motion';

interface VersusHeaderProps {
    title: string;
    subtitle?: string;
}

export function VersusHeader({ title, subtitle }: VersusHeaderProps) {
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
                <div className="text-center pt-0 pb-1 md:pb-2 px-4 md:px-0">
                    {/* Título Principal (Native Hero Headline) */}
                    <h2 className="text-xl sm:text-2xl md:text-[28px] font-black tracking-tight text-slate-800 leading-tight drop-shadow-sm max-w-3xl mx-auto">
                        {beforeHighlight && <>{beforeHighlight} </>}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">{highlightWord}</span>
                        {afterHighlight && <> {afterHighlight}</>}
                    </h2>
                    
                    <p className="mt-1 md:mt-2 text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                        {subtitle || "Solo elige una opción"}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default VersusHeader;
