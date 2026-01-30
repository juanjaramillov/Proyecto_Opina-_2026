import React from 'react';

type WindowFilter = '24h' | '7d' | '30d';
type SegmentFilter = 'all' | 'rm' | 'valpo' | 'biobio';
type CompareFilter = 'total' | 'age' | 'gender' | 'comuna';

type Props = {
  windowFilter: WindowFilter;
  segmentFilter: SegmentFilter;
  compareFilter: CompareFilter;

  onWindowChange: (val: WindowFilter) => void;
  onSegmentChange: (val: SegmentFilter) => void;
  onCompareChange: (val: CompareFilter) => void;
};

const LiveSignalFilters: React.FC<Props> = ({
  windowFilter,
  segmentFilter,
  compareFilter,
  onWindowChange,
  onSegmentChange,
  onCompareChange,
}) => {

  // Helper to generate classes based on active state
  const pillClass = (active: boolean) => `
    appearance-none
    px-3 py-2 rounded-full
    text-xs font-bold
    cursor-pointer transition-all
    ${active
      ? 'bg-slate-900 text-white border border-slate-900 shadow-md'
      : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-sm'
    }
  `;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Ventana */}
      <div className="lg:col-span-3">
        <label className="block text-xs font-bold text-slate-500 mb-2">Ventana</label>
        <div className="flex gap-2 flex-wrap">
          {(['24h', '7d', '30d'] as const).map((val) => (
            <button
              key={val}
              className={pillClass(windowFilter === val)}
              onClick={() => onWindowChange(val)}
              type="button"
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Segmento */}
      <div className="lg:col-span-5">
        <label className="block text-xs font-bold text-slate-500 mb-2">Segmento (demo)</label>
        <div className="flex gap-2 flex-wrap">
          <button className={pillClass(segmentFilter === 'all')} onClick={() => onSegmentChange('all')} type="button">
            Total Chile
          </button>
          <button className={pillClass(segmentFilter === 'rm')} onClick={() => onSegmentChange('rm')} type="button">
            RM
          </button>
          <button className={pillClass(segmentFilter === 'valpo')} onClick={() => onSegmentChange('valpo')} type="button">
            Valparaíso
          </button>
          <button className={pillClass(segmentFilter === 'biobio')} onClick={() => onSegmentChange('biobio')} type="button">
            Biobío
          </button>
        </div>
      </div>

      {/* Comparar */}
      <div className="lg:col-span-4">
        <label className="block text-xs font-bold text-slate-500 mb-2">Comparar vs</label>
        <div className="flex gap-2 flex-wrap">
          <button className={pillClass(compareFilter === 'total')} onClick={() => onCompareChange('total')} type="button">
            Total
          </button>
          <button className={pillClass(compareFilter === 'age')} onClick={() => onCompareChange('age')} type="button">
            Mi edad
          </button>
          <button className={pillClass(compareFilter === 'gender')} onClick={() => onCompareChange('gender')} type="button">
            Mi género
          </button>
          <button className={pillClass(compareFilter === 'comuna')} onClick={() => onCompareChange('comuna')} type="button">
            Mi comuna
          </button>
        </div>

        <div className="mt-2 text-xs text-slate-400 font-medium">
          Si no hay sesión, “Mi edad/género” usa valores demo.
        </div>
      </div>
    </div>
  );
};

export default LiveSignalFilters;
