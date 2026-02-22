interface Props {
    onClose: () => void;
    onCompleteProfile: () => void;
}

export function ProfileRequiredModal({ onClose, onCompleteProfile }: Props) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    Completa tu perfil
                </h2>

                <p className="text-gray-600 mb-8 text-center leading-relaxed">
                    Para garantizar la calidad de la data y una segmentación real, necesitamos conocer algunos datos básicos antes de que emitas señales.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={onCompleteProfile}
                        className="w-full bg-primary text-white px-6 py-4 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Completar perfil ahora
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full text-gray-500 py-2 font-medium hover:text-gray-700 transition-colors"
                    >
                        Más tarde
                    </button>
                </div>
            </div>
        </div>
    );
}
