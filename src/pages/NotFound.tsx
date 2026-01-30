import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="container-ws section-y">
            <div className="mx-auto max-w-2xl">
                <div className="card card-pad">
                    <div className="flex items-center justify-between gap-3">
                        <span className="badge">404</span>
                        <span className="badge-primary">Te perdiste (tranquilo)</span>
                    </div>

                    <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">
                        Esta página no existe.
                        <br />
                        <span className="grad-text">Pero tu señal sí.</span>
                    </h1>

                    <p className="mt-3 text-text-secondary">
                        Si llegaste acá, fue porque alguien puso un link raro… o porque tú estás explorando como
                        corresponde 😄
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <Link to="/" className="btn-primary">
                            Volver al inicio
                        </Link>
                        <Link to="/versus" className="btn-secondary">
                            Ir a batallas
                        </Link>
                        <Link to="/profile" className="btn-ghost">
                            Ver mi señal
                        </Link>
                    </div>

                    <div className="mt-6 rounded-2xl border border-stroke bg-white p-4">
                        <div className="text-xs font-semibold text-text-secondary">Dato útil</div>
                        <div className="mt-1 text-sm text-text-muted">
                            Si esto te pasó desde un link compartido, lo más probable es que la ruta haya cambiado.
                            (Sí, a veces la gente “innova” en producción).
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
