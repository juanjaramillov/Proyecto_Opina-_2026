import { useMemo, useState } from 'react';

/**
 * TimeFilterDatePicker — selector de fecha puntual para usuarios B2B/Admin.
 *
 * Permite al usuario elegir CUALQUIER fecha del pasado (o presente) para
 * ver el estado acumulado de los datos a ese momento.
 *
 * Diferencia con TimeFilterPresets (B2C):
 *   - B2C tiene 6 botones fijos limitados a 1 año atrás.
 *   - B2B (este componente) permite cualquier fecha sin tope.
 *
 * MVP: fecha única. El rango custom (from + to para comparativos)
 * se maneja en otro componente cuando se implemente fase B.7.
 */

export interface TimeFilterDatePickerProps {
    /**
     * Fecha actualmente seleccionada. null/undefined = "ahora".
     */
    value: Date | null;
    /**
     * Callback cuando cambia la fecha.
     *   - Date → as_of puntual en el pasado
     *   - null → "ahora" (consumidor debe interpretar como now())
     */
    onChange: (asOf: Date | null) => void;
    /**
     * Clase CSS opcional para estilos custom del contenedor.
     */
    className?: string;
    /**
     * Texto de ayuda opcional que explica al usuario qué está eligiendo.
     */
    helperText?: string;
}

function dateToInputValue(d: Date | null): string {
    if (!d) return '';
    // <input type="date"> espera formato YYYY-MM-DD en la zona local.
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function inputValueToDate(v: string): Date | null {
    if (!v) return null;
    // El usuario escribe una fecha sin hora; interpretamos como fin de ese día
    // para capturar todos los eventos del día.
    const parts = v.split('-');
    if (parts.length !== 3) return null;
    const [y, m, d] = parts.map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    const date = new Date(y, m - 1, d, 23, 59, 59, 999);
    return date;
}

export default function TimeFilterDatePicker({
    value,
    onChange,
    className = '',
    helperText,
}: TimeFilterDatePickerProps) {
    const [localValue, setLocalValue] = useState<string>(dateToInputValue(value));

    // Fecha máxima = hoy (no permite elegir futuro).
    const maxDate = useMemo(() => dateToInputValue(new Date()), []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setLocalValue(v);
        onChange(inputValueToDate(v));
    };

    const handleReset = () => {
        setLocalValue('');
        onChange(null);
    };

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <div className="flex items-center gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ver datos al
                </label>
                <input
                    type="date"
                    value={localValue}
                    max={maxDate}
                    onChange={handleInputChange}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-black text-slate-400 hover:text-brand transition-colors uppercase tracking-widest"
                        title="Volver a 'ahora'"
                    >
                        Ahora
                    </button>
                )}
            </div>
            {helperText && (
                <p className="text-[11px] text-slate-400 font-medium">{helperText}</p>
            )}
        </div>
    );
}
