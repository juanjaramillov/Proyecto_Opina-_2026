import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  // ... state ...
  // Full component body without PageShell
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    // Simulating API call
    setTimeout(() => {

      setLoading(false);
      // For now, just redirect to login or home
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">
            Únete a <span className="text-primary">Opina+</span>
          </h1>
          <p className="mt-2 text-text-muted text-sm">
            Crea tu cuenta para empezar a influir con tus decisiones.
          </p>
        </div>

        <div className="card card-pad fade-up border-stroke shadow-home-2 bg-card-gradient">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary"
              >
                Nombre Completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Ej. Juan Pérez"
                className="w-full bg-surface/50 border border-stroke rounded-xl px-4 py-3 text-sm text-ink placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="hola@ejemplo.com"
                className="w-full bg-surface/50 border border-stroke rounded-xl px-4 py-3 text-sm text-ink placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface/50 border border-stroke rounded-xl px-4 py-3 text-sm text-ink placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary"
              >
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface/50 border border-stroke rounded-xl px-4 py-3 text-sm text-ink placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base rounded-xl font-bold shadow-lg hover:shadow-primary/25 transition-transform active:scale-[0.98]"
            >
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-primary hover:text-primary-light font-bold transition-colors">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4 text-xs text-text-muted opacity-60">
          <Link to="/terms" className="hover:text-ink transition-colors">Términos</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-ink transition-colors">Privacidad</Link>
          <span>•</span>
          <Link to="/help" className="hover:text-ink transition-colors">Ayuda</Link>
        </div>
      </div>
    </div>
  );
}
