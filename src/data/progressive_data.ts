import { ProgressiveBattle } from "../features/signals/types";

export const VP_DATA: ProgressiveBattle[] = [
    // Progresivo 1 — Plataformas
    {
        id: "vp-streaming-01",
        title: "Plataformas",
        industry: "Streaming",
        subtitle: "Pensando en tu uso diario, ¿qué plataforma prefieres para ver series y películas?",
        candidates: [
            { id: "netflix", label: "Netflix", type: "brand", imageUrl: "/logos/netflix-logo.svg", bgColor: "bg-white" },
            { id: "disney", label: "Disney+", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg", bgColor: "bg-white", imageClassName: "brightness-0" },
            { id: "prime", label: "Prime Video", type: "brand", imageUrl: "/logos/prime-video-transparent.png", bgColor: "bg-white" },
            { id: "hbo", label: "HBO Max", type: "brand", imageUrl: "/logos/hbo-logo.svg", bgColor: "bg-white", imageClassName: "brightness-0" },
            { id: "youtube", label: "YouTube Premium", type: "brand", imageUrl: "/logos/youtube-logo.svg" },
        ]
    },

    // Progresivo 2 — Series
    {
        id: "vp-streaming-02",
        title: "Series (Maratón)",
        industry: "Streaming",
        subtitle: "Pensando en ver series (maratón), ¿cuál prefieres?",
        candidates: [
            { id: "netflix", label: "Netflix", type: "brand", imageUrl: "/logos/netflix-logo.svg", bgColor: "bg-white" },
            { id: "prime", label: "Prime Video", type: "brand", imageUrl: "/logos/prime-video-logo.svg", bgColor: "bg-white" },
            { id: "hbo", label: "HBO Max", type: "brand", imageUrl: "/logos/hbo-logo.svg", bgColor: "bg-white", imageClassName: "brightness-0" },
            { id: "disney", label: "Disney+", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg", imageClassName: "brightness-0", bgColor: "bg-white" }
        ]
    },

    // Progresivo 3 — Películas
    {
        id: "vp-streaming-03",
        title: "Películas",
        industry: "Streaming",
        subtitle: "Pensando en elegir una película rápido, ¿cuál prefieres?",
        candidates: [
            { id: "netflix", label: "Netflix", type: "brand", imageUrl: "/logos/netflix-logo.svg", bgColor: "bg-white" },
            { id: "prime", label: "Prime Video", type: "brand", imageUrl: "/logos/prime-video-logo.svg", bgColor: "bg-white" },
            { id: "hbo", label: "HBO Max", type: "brand", imageUrl: "/logos/hbo-logo.svg", bgColor: "bg-white", imageClassName: "brightness-0" },
            { id: "youtube", label: "YouTube Premium", type: "brand", imageUrl: "/logos/youtube-logo.svg" }
        ]
    },

    // Progresivo 4 — Familiar / niños
    {
        id: "vp-streaming-04",
        title: "Familiar / Niños",
        industry: "Streaming",
        subtitle: "Pensando en ver algo en familia (o con niños), ¿cuál prefieres?",
        candidates: [
            { id: "disney", label: "Disney+", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg", bgColor: "bg-white", imageClassName: "brightness-0" },
            { id: "netflix", label: "Netflix", type: "brand", imageUrl: "/logos/netflix-logo.svg", bgColor: "bg-white" },
            { id: "prime", label: "Prime Video", type: "brand", imageUrl: "/logos/prime-video-logo.svg", bgColor: "bg-white" },
            { id: "youtube", label: "YouTube Premium", type: "brand", imageUrl: "/logos/youtube-logo.svg" }
        ]
    },

    // Progresivo 5 — Valor
    {
        id: "vp-streaming-05",
        title: "Valor Suscripción",
        industry: "Streaming",
        subtitle: "Si tuvieras que quedarte pagando solo una, ¿cuál mantendrías?",
        candidates: [
            { id: "netflix", label: "Netflix", type: "brand", imageUrl: "/logos/netflix-logo.svg", bgColor: "bg-white" },
            { id: "disney", label: "Disney+", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg", bgColor: "bg-white", imageClassName: "brightness-0" },
            { id: "prime", label: "Prime Video", type: "brand", imageUrl: "/logos/prime-video-transparent.png", bgColor: "bg-white" },
            { id: "hbo", label: "HBO Max", type: "brand", imageUrl: "/logos/hbo-logo.svg", bgColor: "bg-white", imageClassName: "brightness-0" },
            { id: "youtube", label: "YouTube Premium", type: "brand", imageUrl: "/logos/youtube-logo.svg" },
        ]
    },

    // SUPERMERCADOS 1 — Preferencia General
    {
        id: "vp-super-01",
        title: "Preferencias",
        industry: "Supermercados",
        subtitle: "Pensando en tu compra habitual, ¿qué supermercado prefieres?",
        candidates: [
            { id: "lider", label: "Líder", type: "brand", imageUrl: "/logos/lider.svg", bgColor: "bg-white", imageClassName: "p-4" },
            { id: "jumbo", label: "Jumbo", type: "brand", imageUrl: "/logos/jumbo.png" },
            { id: "unimarc", label: "Unimarc", type: "brand", imageUrl: "/logos/unimarc-logo.svg" },
            { id: "santaisabel", label: "Santa Isabel", type: "brand", imageUrl: "/logos/santaisabel-logo.svg" },
            { id: "tottus", label: "Tottus", type: "brand", imageUrl: "/logos/tottus.png" }
        ]
    },

    // SUPERMERCADOS 2 — Precio y Ahorro
    {
        id: "vp-super-02",
        title: "Precio y Ahorro",
        industry: "Supermercados",
        subtitle: "Pensando en precios y ofertas, ¿cuál prefieres?",
        candidates: [
            { id: "lider", label: "Líder", type: "brand", imageUrl: "/logos/lider.svg", bgColor: "bg-white" },
            { id: "unimarc", label: "Unimarc", type: "brand", imageUrl: "/logos/unimarc-logo.svg" },
            { id: "santaisabel", label: "Santa Isabel", type: "brand", imageUrl: "/logos/santaisabel-logo.svg" },
            { id: "tottus", label: "Tottus", type: "brand", imageUrl: "/logos/tottus.png" }
        ]
    },

    // SUPERMERCADOS 3 — Calidad y Variedad
    {
        id: "vp-super-03",
        title: "Calidad y Variedad",
        industry: "Supermercados",
        subtitle: "Pensando en calidad y variedad de productos, ¿cuál prefieres?",
        candidates: [
            { id: "jumbo", label: "Jumbo", type: "brand", imageUrl: "/logos/jumbo.png" },
            { id: "lider", label: "Líder", type: "brand", imageUrl: "/logos/lider.svg", bgColor: "bg-white" },
            { id: "tottus", label: "Tottus", type: "brand", imageUrl: "/logos/tottus.png" },
            { id: "unimarc", label: "Unimarc", type: "brand", imageUrl: "/logos/unimarc-logo.svg" }
        ]
    },

    // SUPERMERCADOS 4 — Cercanía y Conveniencia
    {
        id: "vp-super-04",
        title: "Cercanía",
        industry: "Supermercados",
        subtitle: "Pensando en cercanía y rapidez, ¿cuál prefieres?",
        candidates: [
            { id: "unimarc", label: "Unimarc", type: "brand", imageUrl: "/logos/unimarc-logo.svg" },
            { id: "santaisabel", label: "Santa Isabel", type: "brand", imageUrl: "/logos/santaisabel-logo.svg" },
            { id: "lider", label: "Líder", type: "brand", imageUrl: "/logos/lider.svg", bgColor: "bg-white" },
            { id: "tottus", label: "Tottus", type: "brand", imageUrl: "/logos/tottus.png" }
        ]
    },

    // SUPERMERCADOS 5 — Dónde voy siempre
    {
        id: "vp-super-05",
        title: "Hábito",
        industry: "Supermercados",
        subtitle: "Si tuvieras que elegir solo uno para ir siempre, ¿cuál sería?",
        candidates: [
            { id: "lider", label: "Líder", type: "brand", imageUrl: "/logos/lider.svg", bgColor: "bg-white" },
            { id: "jumbo", label: "Jumbo", type: "brand", imageUrl: "/logos/jumbo.png" },
            { id: "unimarc", label: "Unimarc", type: "brand", imageUrl: "/logos/unimarc-logo.svg" },
            { id: "santaisabel", label: "Santa Isabel", type: "brand", imageUrl: "/logos/santaisabel-logo.svg" },
            { id: "tottus", label: "Tottus", type: "brand", imageUrl: "/logos/tottus.png" }
        ]
    },

    // BANCOS 1 — Preferencia General
    {
        id: "vp-banks-01",
        title: "Preferencia",
        industry: "Banca",
        subtitle: "Pensando en tu uso diario, ¿qué banco prefieres?",
        candidates: [
            { id: "bancochile", label: "Banco de Chile", type: "brand", imageUrl: "/logos/bancochile-logo.svg", bgColor: "bg-white" },
            { id: "santander", label: "Santander", type: "brand", imageUrl: "/logos/santander-logo.svg", bgColor: "bg-white" },
            { id: "bancoestado", label: "BancoEstado", type: "brand", imageUrl: "/logos/bancoestado.svg", bgColor: "bg-white" },
            { id: "bci", label: "BCI", type: "brand", imageUrl: "/logos/bci-logo.svg", bgColor: "bg-white" },
            { id: "scotia", label: "Scotiabank", type: "brand", imageUrl: "/logos/scotiabank-logo.svg", bgColor: "bg-white" }
        ]
    },

    // BANCOS 2 — App y Banca Digital
    {
        id: "vp-banks-02",
        title: "App y Digital",
        industry: "Banca",
        subtitle: "Pensando en la app y la banca digital, ¿cuál prefieres?",
        candidates: [
            { id: "santander", label: "Santander", type: "brand", imageUrl: "/logos/santander-logo.svg", bgColor: "bg-white" },
            { id: "bci", label: "BCI", type: "brand", imageUrl: "/logos/bci-logo.svg", bgColor: "bg-white" },
            { id: "bancochile", label: "Banco de Chile", type: "brand", imageUrl: "/logos/bancochile-logo.svg", bgColor: "bg-white" },
            { id: "scotia", label: "Scotiabank", type: "brand", imageUrl: "/logos/scotiabank-logo.svg", bgColor: "bg-white" },
            { id: "bancoestado", label: "BancoEstado", type: "brand", imageUrl: "/logos/bancoestado.svg", bgColor: "bg-white", imageClassName: "brightness-0 invert" }
        ]
    },

    // BANCOS 3 — Uso cotidiano
    {
        id: "vp-banks-03",
        title: "Uso Cotidiano",
        industry: "Banca",
        subtitle: "Pensando en el uso cotidiano (cuenta, transferencias, pagos), ¿cuál prefieres?",
        candidates: [
            { id: "bancoestado", label: "BancoEstado", type: "brand", imageUrl: "/logos/bancoestado.svg", bgColor: "bg-white" },
            { id: "santander", label: "Santander", type: "brand", imageUrl: "/logos/santander-logo.svg", bgColor: "bg-white" },
            { id: "bancochile", label: "Banco de Chile", type: "brand", imageUrl: "/logos/bancochile-logo.svg", bgColor: "bg-white" },
            { id: "bci", label: "BCI", type: "brand", imageUrl: "/logos/bci-logo.svg", bgColor: "bg-white" },
            { id: "scotia", label: "Scotiabank", type: "brand", imageUrl: "/logos/scotiabank-logo.svg", bgColor: "bg-white" }
        ]
    },

    // BANCOS 4 — Crédito y Productos
    {
        id: "vp-banks-04",
        title: "Crédito",
        industry: "Banca",
        subtitle: "Pensando en crédito y productos financieros, ¿cuál prefieres?",
        candidates: [
            { id: "santander", label: "Santander", type: "brand", imageUrl: "/logos/santander-logo.svg", bgColor: "bg-white" },
            { id: "bancochile", label: "Banco de Chile", type: "brand", imageUrl: "/logos/bancochile-logo.svg", bgColor: "bg-white" },
            { id: "bci", label: "BCI", type: "brand", imageUrl: "/logos/bci-logo.svg", bgColor: "bg-white" },
            { id: "scotia", label: "Scotiabank", type: "brand", imageUrl: "/logos/scotiabank-logo.svg", bgColor: "bg-white" }
        ]
    },

    // BANCOS 5 — Fidelidad
    {
        id: "vp-banks-05",
        title: "Fidelidad",
        industry: "Banca",
        subtitle: "Si tuvieras que quedarte con un solo banco, ¿cuál elegirías?",
        candidates: [
            { id: "bancochile", label: "Banco de Chile", type: "brand", imageUrl: "/logos/bancochile-logo.svg", bgColor: "bg-white" },
            { id: "santander", label: "Santander", type: "brand", imageUrl: "/logos/santander-logo.svg", bgColor: "bg-white" },
            { id: "bancoestado", label: "BancoEstado", type: "brand", imageUrl: "/logos/bancoestado.svg", bgColor: "bg-white" },
            { id: "bci", label: "BCI", type: "brand", imageUrl: "/logos/bci-logo.svg", bgColor: "bg-white" },
            { id: "scotia", label: "Scotiabank", type: "brand", imageUrl: "/logos/scotiabank-logo.svg", bgColor: "bg-white" }
        ]
    },

    // PAGOS 1 — Medio Principal
    {
        id: "vp-pay-01",
        title: "Medio Principal",
        industry: "Pagos",
        subtitle: "Pensando en tu día a día, ¿cuál es tu medio de pago principal?",
        candidates: [
            { id: "debit", label: "Débito", type: "image", imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1740" },
            { id: "credit", label: "Crédito", type: "image", imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=1740" },
            { id: "transfer", label: "Transferencia", type: "image", imageUrl: "/logos/transfer-illustration-new.png" },
            { id: "mercadopago", label: "Mercado Pago", type: "brand", imageUrl: "/logos/mercadopago-logo.svg", bgColor: "bg-white" },
            { id: "mach", label: "MACH", type: "brand", imageUrl: "/logos/mach-logo-new.png", bgColor: "bg-white" },
            { id: "tenpo", label: "Tenpo", type: "brand", imageUrl: "/logos/tenpo-logo.png", bgColor: "bg-white" },
            { id: "fpay", label: "Fpay", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Fpay_logo.png", bgColor: "bg-white" },
        ]
    },

    // PAGOS 2 — Digitales
    {
        id: "vp-pay-02",
        title: "Billeteras",
        industry: "Pagos",
        subtitle: "Pensando solo en pagos digitales, ¿cuál prefieres?",
        candidates: [
            { id: "mercadopago", label: "Mercado Pago", type: "brand", imageUrl: "/logos/mercadopago-logo.svg" },
            { id: "mach", label: "MACH", type: "brand", imageUrl: "/logos/mach-logo-new.png", bgColor: "bg-white" },
            { id: "tenpo", label: "Tenpo", type: "brand", imageUrl: "/logos/tenpo-logo.png" },
            { id: "fpay", label: "Fpay", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Fpay_logo.png" },
        ]
    },

    // PAGOS 3 — Rapidez
    {
        id: "vp-pay-03",
        title: "Rapidez",
        industry: "Pagos",
        subtitle: "Pensando en rapidez y comodidad al pagar, ¿cuál prefieres?",
        candidates: [
            { id: "debit", label: "Débito", type: "image", imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1740" },
            { id: "mercadopago", label: "Mercado Pago", type: "brand", imageUrl: "/logos/mercadopago-logo.svg", bgColor: "bg-white" },
            { id: "mach", label: "MACH", type: "brand", imageUrl: "/logos/mach-logo-new.png", bgColor: "bg-white" },
            { id: "transfer", label: "Transferencia", type: "image", imageUrl: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=1740&auto=format&fit=crop" }
        ]
    },

    // PAGOS 4 — Control
    {
        id: "vp-pay-04",
        title: "Control Gastos",
        industry: "Pagos",
        subtitle: "Pensando en controlar mejor tus gastos, ¿cuál prefieres?",
        candidates: [
            { id: "debit", label: "Débito", type: "image", imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1740" },
            { id: "transfer", label: "Transferencia", type: "image", imageUrl: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=1740&auto=format&fit=crop" },
            { id: "credit", label: "Crédito", type: "image", imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=1740" },
            { id: "tenpo", label: "Tenpo", type: "brand", imageUrl: "/logos/tenpo-logo.png", bgColor: "bg-white" },
        ]
    },

    // PAGOS 5 — Elección Única
    {
        id: "vp-pay-05",
        title: "Elección Única",
        industry: "Pagos",
        subtitle: "Si tuvieras que quedarte con una sola forma de pago, ¿cuál elegirías?",
        candidates: [
            { id: "debit", label: "Débito", type: "image", imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1740" },
            { id: "credit", label: "Crédito", type: "image", imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=1740" },
            { id: "transfer", label: "Transferencia", type: "image", imageUrl: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=1740&auto=format&fit=crop" },
            { id: "mercadopago", label: "Mercado Pago", type: "brand", imageUrl: "/logos/mercadopago-logo.svg", bgColor: "bg-white" },
            { id: "mach", label: "MACH", type: "brand", imageUrl: "/logos/mach-logo-new.png", bgColor: "bg-white" },
            { id: "tenpo", label: "Tenpo", type: "brand", imageUrl: "/logos/tenpo-logo.png", bgColor: "bg-white" },
            { id: "fpay", label: "Fpay", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Fpay_logo.png", bgColor: "bg-white" },
        ]
    },

    // MÚSICA 1 — Preferencia General
    {
        id: "vp-music-01",
        title: "Plataforma",
        industry: "Música",
        subtitle: "Pensando en tu día a día, ¿qué plataforma de música prefieres?",
        candidates: [
            { id: "spotify", label: "Spotify", type: "brand", imageUrl: "/logos/spotify.png", bgColor: "bg-white" },
            { id: "applemusic", label: "Apple Music", type: "brand", imageUrl: "/logos/applemusic-logo.svg", bgColor: "bg-white", imageClassName: "p-6" },
            { id: "youtubemusic", label: "YouTube Music", type: "brand", imageUrl: "/logos/youtube-logo.svg" },
            { id: "amazonmusic", label: "Amazon Music", type: "brand", imageUrl: "/logos/amazon-music-cyan.png", bgColor: "bg-white" },
            { id: "soundcloud", label: "SoundCloud", type: "brand", imageUrl: "/logos/soundcloud-logo.svg" }
        ]
    },

    // MÚSICA 2 — Descubrimiento
    {
        id: "vp-music-02",
        title: "Descubrimiento",
        industry: "Música",
        subtitle: "Pensando en descubrir música nueva, ¿cuál prefieres?",
        candidates: [
            { id: "spotify", label: "Spotify", type: "brand", imageUrl: "/logos/spotify.png", bgColor: "bg-white" },
            { id: "youtubemusic", label: "YouTube Music", type: "brand", imageUrl: "/logos/youtube-logo.svg" },
            { id: "soundcloud", label: "SoundCloud", type: "brand", imageUrl: "/logos/soundcloud-logo.svg" },
            { id: "applemusic", label: "Apple Music", type: "brand", imageUrl: "/logos/applemusic-logo.svg", bgColor: "bg-white", imageClassName: "p-6" },
        ]
    },

    // MÚSICA 3 — Listas y Orden
    {
        id: "vp-music-03",
        title: "Listas",
        industry: "Música",
        subtitle: "Pensando en listas, orden y biblioteca musical, ¿cuál prefieres?",
        candidates: [
            { id: "spotify", label: "Spotify", type: "brand", imageUrl: "/logos/spotify.png", bgColor: "bg-white" },
            { id: "applemusic", label: "Apple Music", type: "brand", imageUrl: "/logos/applemusic-logo.svg", bgColor: "bg-white", imageClassName: "p-6" },
            { id: "amazonmusic", label: "Amazon Music", type: "brand", imageUrl: "/logos/amazon-music.svg", bgColor: "bg-white" },
            { id: "youtubemusic", label: "YouTube Music", type: "brand", imageUrl: "/logos/youtube-logo.svg" },
        ]
    },

    // MÚSICA 4 — Uso Gratis vs Pagado
    {
        id: "vp-music-04",
        title: "Modelo",
        industry: "Música",
        subtitle: "Pensando en escuchar música sin pagar (o con menos restricciones), ¿cuál prefieres?",
        candidates: [
            { id: "youtubemusic", label: "YouTube Music", type: "brand", imageUrl: "/logos/youtube-logo.svg" },
            { id: "spotify", label: "Spotify", type: "brand", imageUrl: "/logos/spotify.png", bgColor: "bg-white" },
            { id: "soundcloud", label: "SoundCloud", type: "brand", imageUrl: "/logos/soundcloud-logo.svg" },
            { id: "amazonmusic", label: "Amazon Music", type: "brand", imageUrl: "/logos/amazon-music.svg", bgColor: "bg-white" },
        ]
    },

    // MÚSICA 5 — Elección Única
    {
        id: "vp-music-05",
        title: "Fidelidad",
        industry: "Música",
        subtitle: "Si tuvieras que quedarte solo con una plataforma de música, ¿cuál elegirías?",
        candidates: [
            { id: "spotify", label: "Spotify", type: "brand", imageUrl: "/logos/spotify.png", bgColor: "bg-white" },
            { id: "applemusic", label: "Apple Music", type: "brand", imageUrl: "/logos/applemusic-logo.svg", bgColor: "bg-white", imageClassName: "p-6" },
            { id: "youtubemusic", label: "YouTube Music", type: "brand", imageUrl: "/logos/youtube-logo.svg" },
            { id: "amazonmusic", label: "Amazon Music", type: "brand", imageUrl: "/logos/amazon-music.svg", bgColor: "bg-white" },
            { id: "soundcloud", label: "SoundCloud", type: "brand", imageUrl: "/logos/soundcloud-logo.svg" }
        ]
    },

    // FAST FOOD 1 — Preferencia General
    {
        id: "vp-food-01",
        title: "Preferencia",
        industry: "Fast Food",
        subtitle: "Pensando en comer algo rápido, ¿qué cadena prefieres?",
        candidates: [
            { id: "mcdonalds", label: "McDonald's", type: "brand", imageUrl: "/logos/mcdonalds-logo.png", imageClassName: "p-4" },
            { id: "burgerking", label: "Burger King", type: "brand", imageUrl: "/logos/burgerking-logo.png" },
            { id: "kfc", label: "KFC", type: "brand", imageUrl: "/logos/kfc-logo.png" },
            { id: "dominos", label: "Domino's", type: "brand", imageUrl: "/logos/dominos-logo.png", imageClassName: "p-4" },
            { id: "subway", label: "Subway", type: "brand", imageUrl: "/logos/subway-logo.png", imageClassName: "p-4" },
        ]
    },

    // FAST FOOD 2 — Hamburguesas
    {
        id: "vp-food-02",
        title: "Hamburguesas",
        industry: "Fast Food",
        subtitle: "Pensando específicamente en hamburguesas, ¿cuál prefieres?",
        candidates: [
            { id: "mcdonalds", label: "McDonald's", type: "brand", imageUrl: "/logos/mcdonalds-logo.png", imageClassName: "p-4" },
            { id: "burgerking", label: "Burger King", type: "brand", imageUrl: "/logos/burgerking-logo.png" },
            { id: "subway", label: "Subway", type: "brand", imageUrl: "/logos/subway-logo.png", imageClassName: "p-4" },
        ]
    },

    // FAST FOOD 3 — Pollo
    {
        id: "vp-food-03",
        title: "Pollo",
        industry: "Fast Food",
        subtitle: "Pensando en pollo, ¿cuál prefieres?",
        candidates: [
            { id: "kfc", label: "KFC", type: "brand", imageUrl: "/logos/kfc-logo.png" },
            { id: "mcdonalds", label: "McDonald's", type: "brand", imageUrl: "/logos/mcdonalds-logo.png", imageClassName: "p-4" },
            { id: "burgerking", label: "Burger King", type: "brand", imageUrl: "/logos/burgerking-logo.png" },
        ]
    },

    // FAST FOOD 4 — Rapidez
    {
        id: "vp-food-04",
        title: "Rapidez",
        industry: "Fast Food",
        subtitle: "Pensando en rapidez y conveniencia, ¿cuál prefieres?",
        candidates: [
            { id: "mcdonalds", label: "McDonald's", type: "brand", imageUrl: "/logos/mcdonalds-logo.png", imageClassName: "p-4" },
            { id: "subway", label: "Subway", type: "brand", imageUrl: "/logos/subway-logo.png", imageClassName: "p-4" },
            { id: "burgerking", label: "Burger King", type: "brand", imageUrl: "/logos/burgerking-logo.png" },
            { id: "kfc", label: "KFC", type: "brand", imageUrl: "/logos/kfc-logo.png" },
        ]
    },

    // FAST FOOD 5 — Elección Única
    {
        id: "vp-food-05",
        title: "Fidelidad",
        industry: "Fast Food",
        subtitle: "Si tuvieras que quedarte solo con una cadena de comida rápida, ¿cuál elegirías?",
        candidates: [
            { id: "mcdonalds", label: "McDonald's", type: "brand", imageUrl: "/logos/mcdonalds-logo.png", imageClassName: "p-4" },
            { id: "burgerking", label: "Burger King", type: "brand", imageUrl: "/logos/burgerking-logo.svg" },
            { id: "kfc", label: "KFC", type: "brand", imageUrl: "/logos/kfc-logo.svg" },
            { id: "dominos", label: "Domino's", type: "brand", imageUrl: "/logos/dominos-logo.svg", imageClassName: "p-8" },
            { id: "subway", label: "Subway", type: "brand", imageUrl: "/logos/subway-logo.svg", imageClassName: "p-8" },
        ]
    },

    // GAMING 1 — Preferencia General
    {
        id: "vp-game-01",
        title: "Preferencia",
        industry: "Gaming",
        subtitle: "Pensando en tu forma de jugar, ¿qué plataforma prefieres?",
        candidates: [
            { id: "playstation", label: "PlayStation", type: "brand", imageUrl: "/logos/playstation-logo.svg" },
            { id: "xbox", label: "Xbox", type: "brand", imageUrl: "/logos/xbox-logo.svg" },
            { id: "nintendo", label: "Nintendo", type: "brand", imageUrl: "/logos/nintendo-red.svg", bgColor: "bg-white" },
            { id: "pc", label: "PC Gamer", type: "image", imageUrl: "/logos/pc-gamer-clean.jpg" },
            { id: "mobile", label: "Mobile", type: "image", imageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // GAMING 2 — Casual
    {
        id: "vp-game-02",
        title: "Casual",
        industry: "Gaming",
        subtitle: "Pensando en juegos casuales o ratos cortos, ¿cuál prefieres?",
        candidates: [
            { id: "mobile", label: "Mobile", type: "image", imageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=1740" },
            { id: "nintendo", label: "Nintendo", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg", bgColor: "bg-white" },
            { id: "playstation", label: "PlayStation", type: "brand", imageUrl: "/logos/playstation-logo.svg" },
            { id: "pc", label: "PC Gamer", type: "image", imageUrl: "/logos/pc-gamer-clean.jpg" },
        ]
    },

    // GAMING 3 — Competitivo
    {
        id: "vp-game-03",
        title: "Competitivo",
        industry: "Gaming",
        subtitle: "Pensando en juegos competitivos, ¿cuál prefieres?",
        candidates: [
            { id: "pc", label: "PC Gamer", type: "image", imageUrl: "/logos/pc-gamer-clean.jpg", bgColor: "bg-fuchsia-600" },
            { id: "playstation", label: "PlayStation", type: "brand", imageUrl: "/logos/playstation-logo.svg" },
            { id: "xbox", label: "Xbox", type: "brand", imageUrl: "/logos/xbox-logo.svg" },
        ]
    },

    // GAMING 4 — Estilo de Juego
    {
        id: "vp-game-04",
        title: "Estilo",
        industry: "Gaming",
        subtitle: "Pensando en jugar solo o con otros, ¿cuál prefieres?",
        candidates: [
            { id: "playstation", label: "PlayStation", type: "brand", imageUrl: "/logos/playstation-logo.svg" },
            { id: "xbox", label: "Xbox", type: "brand", imageUrl: "/logos/xbox-logo.svg" },
            { id: "pc", label: "PC Gamer", type: "image", imageUrl: "/logos/pc-gamer-clean.jpg", bgColor: "bg-fuchsia-600" },
            { id: "nintendo", label: "Nintendo", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg", bgColor: "bg-white" },
        ]
    },

    // GAMING 5 — Fidelidad
    {
        id: "vp-game-05",
        title: "Fidelidad",
        industry: "Gaming",
        subtitle: "Si tuvieras que quedarte solo con una forma de jugar, ¿cuál elegirías?",
        candidates: [
            { id: "playstation", label: "PlayStation", type: "brand", imageUrl: "/logos/playstation-logo.svg", bgColor: "bg-white", imageClassName: "brightness-0" },
            { id: "xbox", label: "Xbox", type: "brand", imageUrl: "/logos/xbox-logo.svg", bgColor: "bg-white" },
            { id: "nintendo", label: "Nintendo", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg", bgColor: "bg-white" },
            { id: "pc", label: "PC Gamer", type: "image", imageUrl: "/logos/pc-gamer-clean.jpg" },
            { id: "mobile", label: "Mobile", type: "image", imageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // SNEAKERS 1 — Preferencia General
    {
        id: "vp-sneaker-01",
        title: "Preferencia",
        industry: "Zapatillas",
        subtitle: "Pensando en tu día a día, ¿qué marca de zapatillas prefieres?",
        candidates: [
            { id: "nike", label: "Nike", type: "brand", imageUrl: "/logos/nike-logo.svg" },
            { id: "adidas", label: "Adidas", type: "brand", imageUrl: "/logos/adidas-logo.svg" },
            { id: "puma", label: "Puma", type: "brand", imageUrl: "/logos/puma-logo.svg", imageClassName: "p-8" },
            { id: "newbalance", label: "New Balance", type: "brand", imageUrl: "/logos/newbalance-logo.svg" },
            { id: "skechers", label: "Skechers", type: "brand", imageUrl: "/logos/skechers-logo.svg" },
        ]
    },

    // SNEAKERS 2 — Comodidad
    {
        id: "vp-sneaker-02",
        title: "Comodidad",
        industry: "Zapatillas",
        subtitle: "Pensando en comodidad para usar todo el día, ¿cuál prefieres?",
        candidates: [
            { id: "skechers", label: "Skechers", type: "brand", imageUrl: "/logos/skechers-logo.svg" },
            { id: "newbalance", label: "New Balance", type: "brand", imageUrl: "/logos/newbalance-logo.svg" },
            { id: "adidas", label: "Adidas", type: "brand", imageUrl: "/logos/adidas-logo.svg" },
            { id: "nike", label: "Nike", type: "brand", imageUrl: "/logos/nike-logo.svg" },
        ]
    },

    // SNEAKERS 3 — Deporte
    {
        id: "vp-sneaker-03",
        title: "Deporte",
        industry: "Zapatillas",
        subtitle: "Pensando en deporte o entrenamiento, ¿cuál prefieres?",
        candidates: [
            { id: "nike", label: "Nike", type: "brand", imageUrl: "/logos/nike-logo.svg" },
            { id: "adidas", label: "Adidas", type: "brand", imageUrl: "/logos/adidas-logo.svg" },
            { id: "puma", label: "Puma", type: "brand", imageUrl: "/logos/puma-logo.svg", imageClassName: "p-8" },
            { id: "newbalance", label: "New Balance", type: "brand", imageUrl: "/logos/newbalance-logo.svg" },
        ]
    },

    // SNEAKERS 4 — Casual / Urbano
    {
        id: "vp-sneaker-04",
        title: "Urbano",
        industry: "Zapatillas",
        subtitle: "Pensando en uso casual o urbano, ¿cuál prefieres?",
        candidates: [
            { id: "adidas", label: "Adidas", type: "brand", imageUrl: "/logos/adidas-logo.svg" },
            { id: "nike", label: "Nike", type: "brand", imageUrl: "/logos/nike-logo.svg" },
            { id: "newbalance", label: "New Balance", type: "brand", imageUrl: "/logos/newbalance-logo.svg" },
            { id: "puma", label: "Puma", type: "brand", imageUrl: "/logos/puma-logo.svg", imageClassName: "p-8" },
        ]
    },

    // SNEAKERS 5 — Elección Única
    {
        id: "vp-sneaker-05",
        title: "Fidelidad",
        industry: "Zapatillas",
        subtitle: "Si tuvieras que quedarte solo con una marca de zapatillas, ¿cuál elegirías?",
        candidates: [
            { id: "nike", label: "Nike", type: "brand", imageUrl: "/logos/nike-logo.svg" },
            { id: "adidas", label: "Adidas", type: "brand", imageUrl: "/logos/adidas-logo.svg" },
            { id: "puma", label: "Puma", type: "brand", imageUrl: "/logos/puma-logo.svg", imageClassName: "p-8" },
            { id: "newbalance", label: "New Balance", type: "brand", imageUrl: "/logos/newbalance-logo.svg" },
            { id: "skechers", label: "Skechers", type: "brand", imageUrl: "/logos/skechers-logo.svg" },
        ]
    },

    // TRABAJO 1 — Preferencia General
    {
        id: "vp-work-01",
        title: "Preferencia",
        industry: "Trabajo",
        subtitle: "Pensando en tu vida laboral ideal, ¿qué modalidad prefieres?",
        candidates: [
            { id: "remote", label: "Remoto", type: "image", imageUrl: "https://images.unsplash.com/photo-1593642532744-9f77063d04d9?auto=format&fit=crop&q=80&w=1740" },
            { id: "office", label: "Oficina", type: "image", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1740" },
            { id: "hybrid", label: "Híbrido", type: "image", imageUrl: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=1740" },
            { id: "freelance", label: "Freelance", type: "image", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // TRABAJO 2 — Flexibilidad
    {
        id: "vp-work-02",
        title: "Flexibilidad",
        industry: "Trabajo",
        subtitle: "Pensando en flexibilidad y autonomía, ¿cuál prefieres?",
        candidates: [
            { id: "remote", label: "Remoto", type: "image", imageUrl: "https://images.unsplash.com/photo-1593642532744-9f77063d04d9?auto=format&fit=crop&q=80&w=1740" },
            { id: "freelance", label: "Freelance", type: "image", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1740" },
            { id: "hybrid", label: "Híbrido", type: "image", imageUrl: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=1740" },
            { id: "office", label: "Oficina", type: "image", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // TRABAJO 3 — Estructura
    {
        id: "vp-work-03",
        title: "Estructura",
        industry: "Trabajo",
        subtitle: "Pensando en rutina y estructura, ¿cuál prefieres?",
        candidates: [
            { id: "office", label: "Oficina", type: "image", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1740" },
            { id: "hybrid", label: "Híbrido", type: "image", imageUrl: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=1740" },
            { id: "remote", label: "Remoto", type: "image", imageUrl: "https://images.unsplash.com/photo-1593642532744-9f77063d04d9?auto=format&fit=crop&q=80&w=1740" },
            { id: "freelance", label: "Freelance", type: "image", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // TRABAJO 4 — Equilibrio
    {
        id: "vp-work-04",
        title: "Equilibrio",
        industry: "Trabajo",
        subtitle: "Pensando en equilibrio entre vida personal y trabajo, ¿cuál prefieres?",
        candidates: [
            { id: "hybrid", label: "Híbrido", type: "image", imageUrl: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=1740" },
            { id: "remote", label: "Remoto", type: "image", imageUrl: "https://images.unsplash.com/photo-1593642532744-9f77063d04d9?auto=format&fit=crop&q=80&w=1740" },
            { id: "freelance", label: "Freelance", type: "image", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1740" },
            { id: "office", label: "Oficina", type: "image", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // TRABAJO 5 — Elección Única
    {
        id: "vp-work-05",
        title: "Definitivo",
        industry: "Trabajo",
        subtitle: "Si tuvieras que elegir una sola modalidad para siempre, ¿cuál elegirías?",
        candidates: [
            { id: "remote", label: "Remoto", type: "image", imageUrl: "https://images.unsplash.com/photo-1593642532744-9f77063d04d9?auto=format&fit=crop&q=80&w=1740" },
            { id: "office", label: "Oficina", type: "image", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1740" },
            { id: "hybrid", label: "Híbrido", type: "image", imageUrl: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=1740" },
            { id: "freelance", label: "Freelance", type: "image", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // VACACIONES 1 — Preferencia General
    {
        id: "vp-vac-01",
        title: "Preferencia",
        industry: "Vacaciones",
        subtitle: "Pensando en tus vacaciones ideales, ¿qué tipo de destino prefieres?",
        candidates: [
            { id: "beach", label: "Playa", type: "image", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1746" },
            { id: "mountain", label: "Montaña", type: "image", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1740" },
            { id: "city", label: "Ciudad", type: "image", imageUrl: "https://images.unsplash.com/photo-1449824913929-2b3a64103d68?auto=format&fit=crop&q=80&w=1740" },
            { id: "forest", label: "Bosque", type: "image", imageUrl: "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // VACACIONES 2 — Descanso
    {
        id: "vp-vac-02",
        title: "Descanso",
        industry: "Vacaciones",
        subtitle: "Pensando en descansar y desconectarte, ¿qué destino prefieres?",
        candidates: [
            { id: "beach", label: "Playa", type: "image", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1746" },
            { id: "forest", label: "Bosque", type: "image", imageUrl: "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?auto=format&fit=crop&q=80&w=1740" },
            { id: "mountain", label: "Montaña", type: "image", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1740" },
            { id: "city", label: "Ciudad", type: "image", imageUrl: "https://images.unsplash.com/photo-1449824913929-2b3a64103d68?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // VACACIONES 3 — Actividad
    {
        id: "vp-vac-03",
        title: "Actividad",
        industry: "Vacaciones",
        subtitle: "Pensando en actividades y movimiento, ¿qué destino prefieres?",
        candidates: [
            { id: "city", label: "Ciudad", type: "image", imageUrl: "https://images.unsplash.com/photo-1449824913929-2b3a64103d68?auto=format&fit=crop&q=80&w=1740" },
            { id: "mountain", label: "Montaña", type: "image", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1740" },
            { id: "beach", label: "Playa", type: "image", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1746" },
            { id: "forest", label: "Bosque", type: "image", imageUrl: "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // VACACIONES 4 — Viaje Corto
    {
        id: "vp-vac-04",
        title: "Viaje Corto",
        industry: "Vacaciones",
        subtitle: "Pensando en una escapada corta, ¿qué destino prefieres?",
        candidates: [
            { id: "city", label: "Ciudad", type: "image", imageUrl: "https://images.unsplash.com/photo-1449824913929-2b3a64103d68?auto=format&fit=crop&q=80&w=1740" },
            { id: "beach", label: "Playa", type: "image", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1746" },
            { id: "forest", label: "Bosque", type: "image", imageUrl: "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?auto=format&fit=crop&q=80&w=1740" },
            { id: "mountain", label: "Montaña", type: "image", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // VACACIONES 5 — Elección Única
    {
        id: "vp-vac-05",
        title: "Definitivo",
        industry: "Vacaciones",
        subtitle: "Si tuvieras que elegir un solo tipo de destino para vacacionar siempre, ¿cuál elegirías?",
        candidates: [
            { id: "beach", label: "Playa", type: "image", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1746" },
            { id: "mountain", label: "Montaña", type: "image", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1740" },
            { id: "city", label: "Ciudad", type: "image", imageUrl: "https://images.unsplash.com/photo-1449824913929-2b3a64103d68?auto=format&fit=crop&q=80&w=1740" },
            { id: "forest", label: "Bosque", type: "image", imageUrl: "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // CINES 1 — Preferencia General
    {
        id: "vp-cine-01",
        title: "Preferencia",
        industry: "Cines",
        subtitle: "Pensando en estrenos de cine, ¿qué prefieres hacer?",
        candidates: [
            { id: "go_cinema", label: "Ir al cine", type: "image", imageUrl: "/logos/cinema-hall.jpg" },
            { id: "streaming_premiere", label: "Streaming", type: "image", imageUrl: "/logos/home-streaming.jpg" },
            { id: "wait_home", label: "Ver en casa", type: "image", imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=1740" },
            { id: "no_cinema", label: "No ver", type: "image", imageUrl: "https://images.unsplash.com/photo-1520032525096-7bd04a94b5a4?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // CINES 2 — Comodidad
    {
        id: "vp-cine-02",
        title: "Comodidad",
        industry: "Cines",
        subtitle: "Pensando en comodidad, ¿qué prefieres?",
        candidates: [
            { id: "streaming_premiere", label: "Streaming", type: "image", imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=1738" },
            { id: "wait_home", label: "Ver en casa", type: "image", imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=1740" },
            { id: "no_cinema", label: "No ver", type: "image", imageUrl: "https://images.unsplash.com/photo-1520032525096-7bd04a94b5a4?auto=format&fit=crop&q=80&w=1740" },
            { id: "go_cinema", label: "Ir al cine", type: "image", imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // CINES 3 — Experiencia
    {
        id: "vp-cine-03",
        title: "Experiencia",
        industry: "Cines",
        subtitle: "Pensando en la experiencia completa, ¿qué prefieres?",
        candidates: [
            { id: "go_cinema", label: "Ir al cine", type: "image", imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1740" },
            { id: "streaming_premiere", label: "Streaming", type: "image", imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=1738" },
            { id: "wait_home", label: "Ver en casa", type: "image", imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // CINES 4 — Costo
    {
        id: "vp-cine-04",
        title: "Costo",
        industry: "Cines",
        subtitle: "Pensando en el costo, ¿qué prefieres?",
        candidates: [
            { id: "wait_home", label: "Ver en casa", type: "image", imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=1740" },
            { id: "streaming_premiere", label: "Streaming", type: "image", imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=1738" },
            { id: "no_cinema", label: "No ver", type: "image", imageUrl: "https://images.unsplash.com/photo-1520032525096-7bd04a94b5a4?auto=format&fit=crop&q=80&w=1740" },
            { id: "go_cinema", label: "Ir al cine", type: "image", imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // CINES 5 — Elección Única
    {
        id: "vp-cine-05",
        title: "Definitivo",
        industry: "Cines",
        subtitle: "Si tuvieras que elegir una sola forma de ver películas estreno, ¿cuál elegirías?",
        candidates: [
            { id: "go_cinema", label: "Ir al cine", type: "image", imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1740" },
            { id: "streaming_premiere", label: "Streaming", type: "image", imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=1738" },
            { id: "wait_home", label: "Ver en casa", type: "image", imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=1740" },
            { id: "no_cinema", label: "No ver", type: "image", imageUrl: "https://images.unsplash.com/photo-1520032525096-7bd04a94b5a4?auto=format&fit=crop&q=80&w=1740" },
        ]
    },

    // BEBIDAS 1 — Preferencia General
    {
        id: "vp-drink-01",
        title: "Preferencia",
        industry: "Bebidas",
        subtitle: "Pensando en tu consumo diario, ¿qué marca de bebidas prefieres?",
        candidates: [
            { id: "cocacola", label: "Coca-Cola", type: "brand", imageUrl: "/logos/cocacola-logo.svg" },
            { id: "pepsi", label: "Pepsi", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Pepsi_2023.svg", imageClassName: "p-6" },
            { id: "ccu", label: "CCU", type: "brand", imageUrl: "/logos/ccu-logo.svg" },
            { id: "redbull", label: "Red Bull", type: "brand", imageUrl: "/logos/redbull-logo.svg" },
        ]
    },

    // BEBIDAS 2 — Uso Cotidiano
    {
        id: "vp-drink-02",
        title: "Cotidiano",
        industry: "Bebidas",
        subtitle: "Pensando en bebidas para el día a día (almuerzo, casa, trabajo), ¿cuál prefieres?",
        candidates: [
            { id: "cocacola", label: "Coca-Cola", type: "brand", imageUrl: "/logos/cocacola-logo.svg" },
            { id: "ccu", label: "CCU", type: "brand", imageUrl: "/logos/ccu-logo.svg" },
            { id: "pepsi", label: "Pepsi", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Pepsi_2023.svg", imageClassName: "p-6" },
        ]
    },

    // BEBIDAS 3 — Energía
    {
        id: "vp-drink-03",
        title: "Energía",
        industry: "Bebidas",
        subtitle: "Pensando en energía o activarte, ¿cuál prefieres?",
        candidates: [
            { id: "redbull", label: "Red Bull", type: "brand", imageUrl: "/logos/redbull-logo.svg" },
            { id: "cocacola", label: "Coca-Cola", type: "brand", imageUrl: "/logos/cocacola-logo.svg" },
            { id: "pepsi", label: "Pepsi", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Pepsi_2023.svg", imageClassName: "p-6" },
        ]
    },

    // BEBIDAS 4 — Social
    {
        id: "vp-drink-04",
        title: "Social",
        industry: "Bebidas",
        subtitle: "Pensando en reuniones o compartir con otros, ¿cuál prefieres?",
        candidates: [
            { id: "cocacola", label: "Coca-Cola", type: "brand", imageUrl: "/logos/cocacola-logo.svg" },
            { id: "ccu", label: "CCU", type: "brand", imageUrl: "/logos/ccu-logo.svg" },
            { id: "pepsi", label: "Pepsi", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Pepsi_2023.svg", imageClassName: "p-6" },
        ]
    },

    // BEBIDAS 5 — Elección Única
    {
        id: "vp-drink-05",
        title: "Fidelidad",
        industry: "Bebidas",
        subtitle: "Si tuvieras que quedarte solo con una marca de bebidas, ¿cuál elegirías?",
        candidates: [
            { id: "cocacola", label: "Coca-Cola", type: "brand", imageUrl: "/logos/cocacola-logo.svg" },
            { id: "pepsi", label: "Pepsi", type: "brand", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Pepsi_2023.svg", imageClassName: "p-6" },
            { id: "ccu", label: "CCU", type: "brand", imageUrl: "/logos/ccu-logo.svg" },
            { id: "redbull", label: "Red Bull", type: "brand", imageUrl: "/logos/redbull-logo.svg" },
        ]
    }
];
