import React, { useState } from 'react';
import { resolveEntitySlug } from '../../lib/entities/resolveEntitySlug';

const guessBrandDomain = (name: string) => {
    const known: Record<string, string> = {
        "falabella": "falabella.com", "paris": "paris.cl", "ripley": "ripley.com",
        "mercado libre": "mercadolibre.com", "lider": "lider.cl", "jumbo": "jumbo.cl",
        "santa isabel": "santaisabel.cl", "tottus": "tottus.cl", "sodimac": "sodimac.cl",
        "mcdonalds": "mcdonalds.com", "mcdonald's": "mcdonalds.com", "burger king": "burgerking.com",
        "latam": "latamairlines.com", "sky": "skyairline.com", "jetsmart": "jetsmart.com",
        "coca cola": "coca-cola.com", "pepsi": "pepsi.com", "sprite": "sprite.com",
        "spotify": "spotify.com", "apple": "apple.com", "apple music": "apple.com",
        "netflix": "netflix.com", "hbo": "hbo.com", "hbo max": "max.com", "disney": "disney.com", "prime video": "primevideo.com",
        "uber": "uber.com", "didi": "didiglobal.com", "cabify": "cabify.com",
        "banco de chile": "bancodechile.cl", "bci": "bci.cl", "santander": "santander.cl", "banco estado": "bancoestado.cl"
    };
    const clean = name.toLowerCase().trim();
    if (known[clean]) return known[clean];
    // Basic heuristic: remove spaces and non-alphanumeric, default to .com
    const slug = clean.replace(/[^a-z0-9]/g, "");
    if (!slug) return "example.com";
    return slug.includes('.') ? slug : `${slug}.com`;
};

interface BrandLogoProps {
    name: string;
    imageUrl?: string | null;
    brandDomain?: string | null;
    className?: string; // Container classes
    fallbackClassName?: string; // Text classes for fallback
}

const LogoContainer: React.FC<{ children: React.ReactNode; isFallback?: boolean; className?: string }> = ({ 
    children, 
    isFallback = false, 
    className = "" 
}) => (
    <div className={`relative flex items-center justify-center bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm aspect-square ${className}`}>
        {children}
        {!isFallback && <div className="absolute inset-0 border border-black/5 rounded-xl pointer-events-none" />}
    </div>
);

export const BrandLogo: React.FC<BrandLogoProps> = ({
    name,
    imageUrl,
    brandDomain,
    className = "",
    fallbackClassName = ""
}) => {
    const [logoIndex, setLogoIndex] = useState(0);

    const cleanBrandDomain = (brandDomain || "").replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase().trim();
    const domainToTry = cleanBrandDomain || guessBrandDomain(name);
    
    const slug = resolveEntitySlug(name);
    const urlsToTry = [
        imageUrl,
        slug ? `/logos/entities/${slug}.svg` : null,
        slug ? `/logos/entities/${slug}.png` : null,
        slug ? `/logos/entities/${slug}.jpg` : null,
        slug ? `/logos/entities/${slug}.webp` : null,
        `https://cdn.brandfetch.io/${domainToTry}/logo`,
        `https://unavatar.io/${domainToTry}?fallback=false`,
        `https://icon.horse/icon/${domainToTry}`,
        `https://logo.uplead.com/${domainToTry}`,
        `https://www.google.com/s2/favicons?domain=${domainToTry}&sz=256`,
        `https://external-content.duckduckgo.com/ip3/${domainToTry}.ico`
    ].filter(Boolean) as string[];

    const currentUrl = logoIndex < urlsToTry.length ? urlsToTry[logoIndex] : null;

    if (!currentUrl) {
        return (
            <LogoContainer isFallback className={className}>
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 font-black uppercase text-xl ${fallbackClassName}`}>
                    {name ? name.trim().charAt(0).toUpperCase() : '?'}
                </div>
            </LogoContainer>
        );
    }

    return (
        <LogoContainer className={className}>
            <img
                key={currentUrl}
                src={currentUrl}
                alt={name}
                loading="lazy"
                draggable={false}
                onError={() => setLogoIndex(prev => prev + 1)}
                className="w-full h-full object-contain p-1.5"
            />
        </LogoContainer>
    );
};
