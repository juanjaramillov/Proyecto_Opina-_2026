import React, { useState } from 'react';
import { resolveEntitySlug } from '../../lib/entities/resolveEntitySlug';

const guessBrandDomain = (name: string) => {
    const known: Record<string, string> = {
        "falabella": "falabella.com", "paris": "paris.cl", "ripley": "ripley.com",
        "mercado libre": "mercadolibre.com", "lider": "lider.cl", "jumbo": "jumbo.cl",
        "santa isabel": "santaisabel.cl", "tottus": "tottus.cl",
        "mcdonalds": "mcdonalds.com", "mcdonald's": "mcdonalds.com", "burger king": "burgerking.com",
        "latam": "latamairlines.com", "sky": "skyairline.com", "jetsmart": "jetsmart.com",
        "coca cola": "coca-cola.com", "pepsi": "pepsi.com", "sprite": "sprite.com",
        "spotify": "spotify.com", "apple": "apple.com", "apple music": "apple.com",
        "netflix": "netflix.com", "hbo": "hbo.com", "hbo max": "max.com", "disney": "disney.com", "prime video": "primevideo.com",
        "uber": "uber.com", "didi": "didiglobal.com", "cabify": "cabify.com"
    };
    const clean = name.toLowerCase().trim();
    if (known[clean]) return known[clean];
    // Guess fallback mapping appending .com
    return `${clean.replace(/[^a-z0-9]/g, "")}.com`;
};

interface BrandLogoProps {
    name: string;
    imageUrl?: string | null;
    brandDomain?: string | null;
    className?: string;
    fallbackClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
    name,
    imageUrl,
    brandDomain,
    className = "w-full h-full object-contain mix-blend-multiply",
    fallbackClassName = "text-xs font-black text-slate-800"
}) => {
    const [logoIndex, setLogoIndex] = useState(0);

    const cleanBrandDomain = (brandDomain || "").replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase().trim();
    const domainToTry = cleanBrandDomain || guessBrandDomain(name);
    
    const slug = resolveEntitySlug(name);
    const localSvgUrl = slug ? `/logos/entities/${slug}.svg` : null;
    const localPngUrl = slug ? `/logos/entities/${slug}.png` : null;
    const localJpgUrl = slug ? `/logos/entities/${slug}.jpg` : null;
    const localWebpUrl = slug ? `/logos/entities/${slug}.webp` : null;

    const brandfetchUrl = `https://cdn.brandfetch.io/${domainToTry}/logo`;
    const unavatarUrl = `https://unavatar.io/${domainToTry}?fallback=false`;
    const iconHorseUrl = `https://icon.horse/icon/${domainToTry}`;
    const upleadUrl = `https://logo.uplead.com/${domainToTry}`;
    const duckduckgoUrl = `https://external-content.duckduckgo.com/ip3/${domainToTry}.ico`;
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domainToTry}&sz=256`;

    const urlsToTry = [
        imageUrl,
        localSvgUrl,
        localPngUrl,
        localJpgUrl,
        localWebpUrl,
        brandfetchUrl,
        unavatarUrl,
        iconHorseUrl,
        upleadUrl,
        googleFaviconUrl,
        duckduckgoUrl
    ].filter(Boolean) as string[]; // Remove undefined/nulls if any

    const currentUrl = logoIndex < urlsToTry.length ? urlsToTry[logoIndex] : null;

    if (!currentUrl) {
        return (
            <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-800 font-extrabold shadow-inner w-16 h-16 text-2xl ${fallbackClassName}`}>
                {name ? name.trim().charAt(0).toUpperCase() : '?'}
            </div>
        );
    }

    return (
        <img
            key={currentUrl}
            src={currentUrl}
            alt={name}
            loading="lazy"
            draggable={false}
            onError={() => {
                setLogoIndex(prev => prev + 1);
            }}
            className={className}
        />
    );
};
