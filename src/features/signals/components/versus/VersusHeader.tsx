import { motion, AnimatePresence } from 'framer-motion';

interface VersusHeaderProps {
    title: string;
}

export function VersusHeader({ title }: VersusHeaderProps) {
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
                <div className="text-center md:text-left pt-2 pb-6 px-4 md:px-0">
                    {/* Badge Sutil Premium */}
                    <div className="flex items-center justify-center md:justify-start w-full mb-6">
                        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            Señal Activa
                        </div>
                    </div>

                    {/* Título Principal (Native Hero Headline) */}
                    <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-black tracking-tight text-slate-800 leading-[1.1] md:leading-[1.1] drop-shadow-sm max-w-2xl mx-auto md:mx-0">
                        {beforeHighlight && <>{beforeHighlight} </>}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">{highlightWord}</span>
                        {afterHighlight && <> {afterHighlight}</>}
                    </h2>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default VersusHeader;
