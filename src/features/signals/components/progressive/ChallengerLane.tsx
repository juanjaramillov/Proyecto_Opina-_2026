import { BrandLogo } from '../../../../components/ui/BrandLogo';

type Props = {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
};

export default function ChallengerLane({ title = "Desafiante", subtitle, imageUrl }: Props) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1">
                    <BrandLogo
                        name={title}
                        imageUrl={imageUrl}
                        className="h-full w-full object-contain mix-blend-multiply"
                        fallbackClassName="flex h-full w-full items-center justify-center text-xs text-slate-400 font-bold"
                    />
                </div>

                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
                </div>
            </div>
        </div>
    );
}
