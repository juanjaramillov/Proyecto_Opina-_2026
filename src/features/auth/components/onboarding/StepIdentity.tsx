import { motion } from 'framer-motion';

interface StepIdentityProps {
    mode: 'register' | 'login';
    setMode: (mode: 'register' | 'login') => void;
    nickname: string;
    setNickname: (nickname: string) => void;
    inviteCode: string;
    setInviteCode: (code: string) => void;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    errorMsg: string;
    setErrorMsg: (msg: string) => void;
    loading: boolean;
    onOAuth: (provider: 'google' | 'apple') => void;
    onEmailAuth: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: any;
}

export function StepIdentity({
    mode, setMode,
    nickname, setNickname,
    inviteCode, setInviteCode,
    email, setEmail,
    password, setPassword,
    errorMsg, setErrorMsg,
    loading,
    onOAuth,
    onEmailAuth,
    variants
}: StepIdentityProps) {
    return (
        <motion.div
            key="identity"
            custom={1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="p-8 flex-1 flex flex-col"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                    <span className="material-symbols-rounded text-3xl">badge</span>
                </div>
                <h2 id="onboarding-title" className="text-2xl font-black text-slate-900 tracking-tight">Elige tu Alias</h2>
                <p className="text-sm text-slate-500 font-medium mt-2">
                    Tu identidad real siempre será privada. Elige tu alias público.
                </p>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => onOAuth('google')}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3.5 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                    Continuar con Google
                </button>
                <button
                    onClick={() => onOAuth('apple')}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-black py-3.5 rounded-2xl font-bold text-white hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.69-.74 2.4.29 4.1.84 4.87 2.21-.19.04-2.82 1.54-2.79 5.86.06 4.38 3.86 5.84 4.07 5.92-.02.04-.6 1.99-1.39 3.03-.78 1.04-1.61 2.08-3.53 1.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.25-2.05 4.19-3.74 4.25z" /></svg>
                    Continuar con Apple
                </button>
            </div>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">O usa tu email e ID</span>
                <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => { setMode('register'); setErrorMsg(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500 ${mode === 'register' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    Crear cuenta
                </button>
                <button
                    onClick={() => { setMode('login'); setErrorMsg(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500 ${mode === 'login' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    Ingresar
                </button>
            </div>

            <div className="space-y-3">
                {mode === 'register' && (
                    <>
                        <div>
                            <label htmlFor="nickname" className="sr-only">Alias</label>
                            <input
                                id="nickname"
                                type="text"
                                placeholder="Alias"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                            <p className="mt-1 ml-2 text-[10px] text-slate-400 font-medium">Tu identidad real siempre será privada.</p>
                        </div>
                        <div>
                            <label htmlFor="inviteCode" className="sr-only">Código de invitación</label>
                            <input
                                id="inviteCode"
                                type="text"
                                placeholder="Código de invitación"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                    </>
                )}
                <div>
                    <label htmlFor="email" className="sr-only">Correo electrónico (tu@email.com)</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">Crea una contraseña segura</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Crea una contraseña segura"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>

                {errorMsg && (
                    <div role="alert" aria-live="polite">
                        <p className="text-xs text-red-500 font-bold mb-2 text-center">{errorMsg}</p>
                    </div>
                )}

                <button
                    onClick={onEmailAuth}
                    disabled={!email || !password || (mode === 'register' && (!nickname || !inviteCode)) || loading}
                    className="w-full bg-primary-600 py-3.5 rounded-2xl font-black text-white shadow-lg shadow-primary-200 transition-all active:scale-[0.98] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                >
                    {loading ? 'Cargando...' : (mode === 'register' ? 'Registrarme' : 'Entrar')}
                </button>
            </div>
        </motion.div>
    );
}

export default StepIdentity;
