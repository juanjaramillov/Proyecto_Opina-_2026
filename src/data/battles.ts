import { Battle } from "../features/signals/types";

export const EXISTING_BATTLES: Battle[] = [
    // 1. SUPERMERCADOS
    {
        id: "supermarkets",
        title: "Supermercados",
        subtitle: "Pensando en tu compra mensual, ¿cuál prefieres?",
        options: [
            { id: "lider", label: "Lider", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/lider-logo.png" },
            { id: "jumbo", label: "Jumbo", type: "brand", bgColor: "bg-white", imageUrl: "/logos/jumbo-logo.png" },
            { id: "unimarc", label: "Unimarc", type: "brand", bgColor: "bg-white", imageUrl: "/logos/unimarc-logo.png" },
            { id: "tottus", label: "Tottus", type: "brand", bgColor: "bg-white", imageUrl: "/logos/tottus-logo.png" },
            { id: "santaisabel", label: "Santa Isabel", type: "brand", bgColor: "bg-white", imageUrl: "/logos/santaisabel-logo.png" },
        ]
    },

    // 2. STREAMING
    {
        id: "streaming",
        title: "Streaming",
        subtitle: "Pensando en tu uso diario, ¿cuál prefieres?",
        options: [
            { id: "netflix", label: "Netflix", type: "brand", bgColor: "bg-black", imageClassName: "p-4", imageUrl: "/logos/netflix-logo.png" },
            { id: "disney", label: "Disney+", type: "brand", bgColor: "bg-white", imageClassName: "p-6", imageUrl: "/logos/disneyplus.svg" },
            { id: "prime", label: "Prime Video", type: "brand", bgColor: "bg-white", imageClassName: "p-6", imageUrl: "/logos/primevideo.svg" },
            { id: "hbo", label: "HBO Max", type: "brand", bgColor: "bg-black", imageClassName: "p-6", imageUrl: "/logos/hbomax-logo.png" },
            { id: "youtube", label: "YouTube Premium", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/youtube-logo.png" },
        ]
    },

    // 3. GAMING
    {
        id: "gaming",
        title: "Gaming",
        subtitle: "Pensando en tu forma de jugar, ¿dónde prefieres jugar?",
        options: [
            { id: "playstation", label: "PlayStation", type: "brand", bgColor: "bg-white", imageUrl: "/logos/playstation-logo.png", imageClassName: "brightness-0" },
            { id: "xbox", label: "Xbox", type: "brand", bgColor: "bg-white", imageUrl: "/logos/xbox-logo.png" },
            { id: "nintendo", label: "Nintendo", type: "brand", bgColor: "bg-white", imageUrl: "/logos/nintendo-logo.png" },
            { id: "pc", label: "PC Gamer", type: "image", imageUrl: "/images/pcgamer.png", bgColor: "bg-white" },
            { id: "mobile", label: "Mobile", type: "image", },
        ]
    },

    // 4. FAST FOOD
    {
        id: "fast_food",
        title: "Fast Food",
        subtitle: "Pensando en comer algo rápido, ¿qué cadena prefieres?",
        options: [
            { id: "mcdonalds", label: "McDonald's", type: "brand", imageClassName: "p-4", bgColor: "bg-white", imageUrl: "/logos/mcdonalds-logo.png" },
            { id: "burgerking", label: "Burger King", type: "brand", bgColor: "bg-white", imageUrl: "/logos/burgerking-logo.png" },
            { id: "kfc", label: "KFC", type: "brand", bgColor: "bg-white", imageUrl: "/logos/kfc-logo.png" },
            { id: "dominos", label: "Domino's", type: "brand", bgColor: "bg-white", imageUrl: "/logos/dominos-logo.png" },
            { id: "subway", label: "Subway", type: "brand", bgColor: "bg-white", imageUrl: "/logos/subway-logo.png" },
        ]
    },

    // 5. BEBIDAS
    {
        id: "beverages",
        title: "Bebidas",
        subtitle: "Pensando en tu consumo diario, ¿qué marca de bebidas prefieres?",
        options: [
            { id: "cocacola", label: "Coca-Cola", type: "brand", imageUrl: "/logos/cocacola-logo.svg", bgColor: "bg-white", imageClassName: "p-6" },
            { id: "pepsi", label: "Pepsi", type: "brand", imageClassName: "p-6" },
            { id: "ccu", label: "CCU", type: "brand", bgColor: "bg-white", imageUrl: "/logos/ccu-logo.png", imageClassName: "p-8" },
            { id: "redbull", label: "Red Bull", type: "brand", imageUrl: "/logos/redbull-logo.png" },
        ]
    },

    // 6. BANCOS
    {
        id: "banks",
        title: "Bancos",
        subtitle: "Pensando en tu uso diario, ¿con qué banco te quedas?",
        options: [
            { id: "bancochile", label: "Banco de Chile", type: "brand", bgColor: "bg-white", imageUrl: "/logos/bancochile-logo.png" },
            { id: "santander", label: "Santander", type: "brand", bgColor: "bg-white", imageUrl: "/logos/santander-logo.png" },
            { id: "bancoestado", label: "BancoEstado", type: "brand", bgColor: "bg-white", imageUrl: "/logos/bancoestado-logo.png", imageClassName: "p-2" },
            { id: "bci", label: "BCI", type: "brand", bgColor: "bg-white", imageUrl: "/logos/bci-logo.png" },
            { id: "scotiabank", label: "Scotiabank", type: "brand", bgColor: "bg-white", imageUrl: "/logos/scotiabank-logo.png" },
        ]
    },

    // 7. MÚSICA
    {
        id: "music",
        title: "Música",
        subtitle: "Pensando en escuchar música, ¿qué plataforma prefieres?",
        options: [
            { id: "spotify", label: "Spotify", type: "brand", bgColor: "bg-white", imageUrl: "/logos/spotify-logo.png" },
            { id: "applemusic", label: "Apple Music", type: "brand", bgColor: "bg-white", imageUrl: "/logos/applemusic-logo.png", imageClassName: "p-6" },
            { id: "youtube", label: "YouTube Music", type: "brand", imageUrl: "/logos/youtube-logo.png" }, // Reusing YouTube logo
            { id: "amazonmusic", label: "Amazon Music", type: "brand", bgColor: "bg-white", imageUrl: "/logos/amazonmusic-logo.png" },
            { id: "soundcloud", label: "SoundCloud", type: "brand", imageUrl: "/logos/soundcloud-logo.png" },
        ]
    },

    // 8. ZAPATILLAS
    {
        id: "sneakers",
        title: "Zapatillas",
        subtitle: "Pensando en tu uso diario, ¿qué marca de zapatillas prefieres?",
        options: [
            { id: "nike", label: "Nike", type: "brand", imageUrl: "/logos/nike-logo.png" },
            { id: "adidas", label: "Adidas", type: "brand", imageUrl: "/logos/adidas-logo.png" },
            { id: "puma", label: "Puma", type: "brand", imageUrl: "/logos/puma-logo.png", imageClassName: "p-8" },
            { id: "newbalance", label: "New Balance", type: "brand", imageUrl: "/logos/newbalance-logo.png" },
            { id: "skechers", label: "Skechers", type: "brand", imageUrl: "/logos/skechers-logo.png" },
        ]
    },

    // 9. PAGOS / BILLETERAS
    {
        id: "payments",
        title: "Pagos / Billeteras",
        subtitle: "Pensando en tu uso diario, ¿cómo prefieres pagar?",
        options: [
            { id: "debit", label: "Débito", type: "image", },
            { id: "credit", label: "Crédito", type: "image", },
            { id: "transfer", label: "Transferencia", type: "image", bgColor: "bg-amber-600" },
            { id: "mercadopago", label: "Mercado Pago", type: "brand", bgColor: "bg-white", imageUrl: "/logos/mercadopago-logo.png", imageClassName: "p-2" },
            { id: "mach", label: "MACH", type: "brand", bgColor: "bg-white", imageUrl: "/logos/mach-logo.png", imageClassName: "p-4" },
            { id: "tenpo", label: "Tenpo", type: "brand", bgColor: "bg-white", imageUrl: "/logos/tenpo-logo.png", imageClassName: "p-4" },
        ]
    },

    // 10. DESTINOS (Vacaciones)
    {
        id: "destinations",
        title: "Destino",
        subtitle: "Pensando en tus vacaciones ideales, ¿qué destino prefieres?",
        options: [
            { id: "beach", label: "Playa", type: "image", bgColor: "bg-sky-500" },
            { id: "mountain", label: "Montaña", type: "image", bgColor: "bg-stone-500" },
            { id: "city", label: "Ciudad", type: "image", bgColor: "bg-indigo-600" },
            { id: "forest", label: "Bosque", type: "image", bgColor: "bg-emerald-600" },
        ]
    },

    // 11. CINES (Preferencia)
    {
        id: "cinema",
        title: "Cines",
        subtitle: "Pensando en ver una película estreno, ¿qué prefieres hacer?",
        options: [
            { id: "go_cinema", label: "Sala de Cine", type: "image", bgColor: "bg-red-600" },
            { id: "streaming_premiere", label: "Streaming", type: "image", bgColor: "bg-sky-600" },
            { id: "wait_home", label: "Ver en Casa", type: "image", bgColor: "bg-amber-600" },
            { id: "no_cinema", label: "No ver", type: "image", },
        ]
    },

    // 16. AEROLÍNEAS
    // 16.1 LATAM vs American (Legacy Regional/Inter)
    {
        id: "airlines_legacy_01",
        title: "Aerolíneas",
        subtitle: "Pensando en tu próximo viaje, ¿cuál prefieres?",
        options: [
            { id: "latam", label: "LATAM Airlines", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/latam-logo.png" },
            { id: "american", label: "American Airlines", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/american-logo.png" },
        ]
    },
    // 16.2 Delta vs United (Legacy US)
    {
        id: "airlines_legacy_02",
        title: "Aerolíneas",
        subtitle: "Pensando en viajar a EEUU, ¿cuál prefieres?",
        options: [
            { id: "delta", label: "Delta Air Lines", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/delta-logo.png" },
            { id: "united", label: "United Airlines", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/united-logo.png" },
        ]
    },
    // 16.3 GOL vs Azul (Brasil)
    {
        id: "airlines_brazil",
        title: "Aerolíneas",
        subtitle: "Pensando en viajar a Brasil, ¿cuál prefieres?",
        options: [
            { id: "gol", label: "GOL", type: "brand", bgColor: "bg-white", imageClassName: "p-6", imageUrl: "/logos/gol-logo.png" },
            { id: "azul", label: "Azul", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/azul-logo.png" },
        ]
    },
    // 16.4 Avianca vs Copa (Centro/Norte de Sudamérica)
    {
        id: "airlines_central",
        title: "Aerolíneas",
        subtitle: "Pensando en conectar por las Américas, ¿cuál prefieres?",
        options: [
            { id: "avianca", label: "Avianca", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/avianca-logo.png" },
            { id: "copa", label: "Copa Airlines", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/copa-logo.png" },
        ]
    },
    // 16.5 Sky vs JetSMART (Low Cost)
    {
        id: "airlines_lowcost",
        title: "Aerolíneas",
        subtitle: "Pensando en volar barato (Low Cost), ¿cuál prefieres?",
        options: [
            { id: "sky", label: "Sky Airline", type: "brand", bgColor: "bg-white", imageClassName: "p-6", imageUrl: "/logos/sky-logo.png" },
            { id: "jetsmart", label: "JetSMART", type: "brand", bgColor: "bg-white", imageClassName: "p-4", imageUrl: "/logos/jetsmart-logo.png" },
        ]
    }
];

export const BATTLES_DATA = EXISTING_BATTLES;
