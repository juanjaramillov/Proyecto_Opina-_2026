import React, { useState } from 'react';

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

    const cleanBrandDomain = (brandDomain || "").trim();

    const domainToTry = cleanBrandDomain || guessBrandDomain(name);

    const clearbitUrl = `https://logo.clearbit.com/${domainToTry}?size=512`;
    const brandfetchUrl = `https://cdn.brandfetch.io/${domainToTry}`;
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domainToTry}&sz=256`;

    const urlsToTry = [
        imageUrl,
        clearbitUrl,
        brandfetchUrl,
        googleFaviconUrl
    ].filter(Boolean) as string[];

    const currentUrl = logoIndex < urlsToTry.length ? urlsToTry[logoIndex] : null;

    if (!currentUrl) {
        return (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-100 shadow-sm ${fallbackClassName}`}>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" />
                <span>{name}</span>
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
