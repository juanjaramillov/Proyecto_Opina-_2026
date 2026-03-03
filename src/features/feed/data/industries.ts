

export const PARENT_INDUSTRIES: Record<string, any> = {
    "salud": {
        "id": "cat-salud",
        "title": "Salud",
        "subtitle": "Donde te atienden… y ojalá no te “reagenden”.",
        "theme": {
            "primary": "#be185d",
            "accent": "#be185d",
            "bgGradient": "from-[#be185d]/10 to-white",
            "icon": "health_and_safety"
        },
        "subcategories": [
            {
                "id": "clinicas",
                "label": "Clínicas",
                "slug": "clinicas",
                "icon": "emergency"
            },
            {
                "id": "centros_de_salud",
                "label": "Centros de Salud",
                "slug": "centros-de-salud",
                "icon": "medical_services"
            },
            {
                "id": "farmacias",
                "label": "Farmacias",
                "slug": "farmacias",
                "icon": "local_pharmacy"
            },
            {
                "id": "isapres",
                "label": "Isapres",
                "slug": "isapres",
                "icon": "policy"
            },
            {
                "id": "seguros",
                "label": "Seguros",
                "slug": "seguros",
                "icon": "verified_user"
            }
        ]
    },
    "finanzas": {
        "id": "cat-finanzas",
        "title": "Finanzas",
        "subtitle": "Plata en calma… o modo ‘recalculando’.",
        "theme": {
            "primary": "#0f766e",
            "accent": "#0f766e",
            "bgGradient": "from-[#0f766e]/10 to-white",
            "icon": "account_balance"
        },
        "subcategories": [
            {
                "id": "bancos",
                "label": "Bancos",
                "slug": "bancos",
                "icon": "account_balance"
            },
            {
                "id": "fintech_wallets",
                "label": "Fintech / Wallets",
                "slug": "fintech-wallets",
                "icon": "payments"
            },
            {
                "id": "tarjetas_medios_de_pago",
                "label": "Tarjetas / Medios de pago",
                "slug": "tarjetas-medios-de-pago",
                "icon": "credit_card"
            },
            {
                "id": "inversiones_brokers",
                "label": "Inversiones / Brokers",
                "slug": "inversiones-brokers",
                "icon": "trending_up"
            }
        ]
    },
    "telecom": {
        "id": "cat-telecom",
        "title": "Telecom",
        "subtitle": "Señal, internet… y un poquito de fe.",
        "theme": {
            "primary": "#2563eb",
            "accent": "#2563eb",
            "bgGradient": "from-[#2563eb]/10 to-white",
            "icon": "settings_input_antenna"
        },
        "subcategories": [
            {
                "id": "linea_movil",
                "label": "Línea móvil",
                "slug": "linea-movil",
                "icon": "smartphone"
            },
            {
                "id": "internet_hogar",
                "label": "Internet hogar",
                "slug": "internet-hogar",
                "icon": "router"
            },
            {
                "id": "tv_paga",
                "label": "TV paga",
                "slug": "tv-paga",
                "icon": "live_tv"
            },
            {
                "id": "tv_online",
                "label": "TV online",
                "slug": "tv-online",
                "icon": "ondemand_video"
            }
        ]
    },
    "retail": {
        "id": "cat-retail",
        "title": "Retail",
        "subtitle": "Entras por ‘una cosita’… sales con bolsa y culpa.",
        "theme": {
            "primary": "#f59e0b",
            "accent": "#f59e0b",
            "bgGradient": "from-[#f59e0b]/10 to-white",
            "icon": "shopping_bag"
        },
        "subcategories": [
            {
                "id": "supermercados",
                "label": "Supermercados",
                "slug": "supermercados",
                "icon": "shopping_cart"
            },
            {
                "id": "marketplaces",
                "label": "Marketplaces",
                "slug": "marketplaces",
                "icon": "storefront"
            },
            {
                "id": "multitiendas",
                "label": "Multitiendas",
                "slug": "multitiendas",
                "icon": "local_mall"
            },
            {
                "id": "mejoramiento_del_hogar",
                "label": "Mejoramiento del hogar",
                "slug": "mejoramiento-del-hogar",
                "icon": "home_repair_service"
            },
            {
                "id": "electronica_tecnologia_tiendas",
                "label": "Electrónica / Tecnología (tiendas)",
                "slug": "electronica-tecnologia-tiendas",
                "icon": "devices"
            }
        ]
    },
    "moda": {
        "id": "cat-moda",
        "title": "Moda",
        "subtitle": "Outfit con criterio… y presupuesto con dolor.",
        "theme": {
            "primary": "#ec4899",
            "accent": "#ec4899",
            "bgGradient": "from-[#ec4899]/10 to-white",
            "icon": "checkroom"
        },
        "subcategories": [
            {
                "id": "marcas",
                "label": "Marcas",
                "slug": "marcas",
                "icon": "checkroom"
            }
        ]
    },
    "comida": {
        "id": "cat-comida",
        "title": "Comida",
        "subtitle": "Antojos serios. Decisiones cuestionables.",
        "theme": {
            "primary": "#ef4444",
            "accent": "#ef4444",
            "bgGradient": "from-[#ef4444]/10 to-white",
            "icon": "restaurant"
        },
        "subcategories": [
            {
                "id": "fast_food_comida_rapida",
                "label": "Fast Food / Comida rápida",
                "slug": "fast-food-comida-rapida",
                "icon": "fastfood"
            },
            {
                "id": "cafeterias",
                "label": "Cafeterías",
                "slug": "cafeterias",
                "icon": "coffee"
            },
            {
                "id": "pizza",
                "label": "Pizza",
                "slug": "pizza",
                "icon": "local_pizza"
            },
            {
                "id": "delivery_apps",
                "label": "Delivery (apps)",
                "slug": "delivery-apps",
                "icon": "delivery_dining"
            }
        ]
    },
    "transporte": {
        "id": "cat-transporte",
        "title": "Transporte",
        "subtitle": "Llegar… idealmente sin drama.",
        "theme": {
            "primary": "#64748b",
            "accent": "#64748b",
            "bgGradient": "from-[#64748b]/10 to-white",
            "icon": "commute"
        },
        "subcategories": [
            {
                "id": "aerolineas",
                "label": "Aerolíneas",
                "slug": "aerolineas",
                "icon": "flight"
            },
            {
                "id": "movilidad_apps_transporte",
                "label": "Movilidad (apps transporte)",
                "slug": "movilidad-apps-transporte",
                "icon": "local_taxi"
            },
            {
                "id": "autos_marcas",
                "label": "Autos (marcas)",
                "slug": "autos-marcas",
                "icon": "directions_car"
            }
        ]
    },
    "entretenimiento": {
        "id": "cat-entretenimiento",
        "title": "Entretenimiento",
        "subtitle": "Era ‘5 minutos’… y se fue la noche.",
        "theme": {
            "primary": "#a855f7",
            "accent": "#a855f7",
            "bgGradient": "from-[#a855f7]/10 to-white",
            "icon": "movie"
        },
        "subcategories": [
            {
                "id": "streaming_video",
                "label": "Streaming video",
                "slug": "streaming-video",
                "icon": "movie"
            },
            {
                "id": "streaming_musica",
                "label": "Streaming música",
                "slug": "streaming-musica",
                "icon": "music_note"
            }
        ]
    },
    "bebidas": {
        "id": "cat-bebidas",
        "title": "Bebidas",
        "subtitle": "Sed seria. Opiniones aún más serias.",
        "theme": {
            "primary": "#1d4ed8",
            "accent": "#1d4ed8",
            "bgGradient": "from-[#1d4ed8]/10 to-white",
            "icon": "local_bar"
        },
        "subcategories": [
            {
                "id": "gaseosas",
                "label": "Gaseosas",
                "slug": "gaseosas",
                "icon": "local_drink"
            },
            {
                "id": "energeticas",
                "label": "Energéticas",
                "slug": "energeticas",
                "icon": "bolt"
            },
            {
                "id": "cervezas",
                "label": "Cervezas",
                "slug": "cervezas",
                "icon": "sports_bar"
            }
        ]
    },
    "medios": {
        "id": "cat-medios",
        "title": "Medios",
        "subtitle": "Lo que ves, lo que escuchas… y lo que comentas igual.",
        "theme": {
            "primary": "#8b5cf6",
            "accent": "#8b5cf6",
            "bgGradient": "from-[#8b5cf6]/10 to-white",
            "icon": "campaign"
        },
        "subcategories": [
            {
                "id": "radio",
                "label": "Radio",
                "slug": "radio",
                "icon": "radio"
            },
            {
                "id": "tv_abierta",
                "label": "TV abierta",
                "slug": "tv-abierta",
                "icon": "tv"
            },
            {
                "id": "prensa_digital_portales",
                "label": "Prensa digital / portales",
                "slug": "prensa-digital-portales",
                "icon": "public"
            }
        ]
    },
    "social": {
        "id": "cat-social",
        "title": "Social",
        "subtitle": "Vas a entrar ‘un segundo’. Ajá.",
        "theme": {
            "primary": "#06b6d4",
            "accent": "#06b6d4",
            "bgGradient": "from-[#06b6d4]/10 to-white",
            "icon": "share"
        },
        "subcategories": [
            {
                "id": "redes_sociales",
                "label": "Redes sociales",
                "slug": "redes-sociales",
                "icon": "public"
            },
            {
                "id": "mensajeria",
                "label": "Mensajería",
                "slug": "mensajeria",
                "icon": "chat"
            },
            {
                "id": "comunidades_foros",
                "label": "Comunidades / foros",
                "slug": "comunidades-foros",
                "icon": "forum"
            }
        ]
    },
    "turismo": {
        "id": "cat-turismo",
        "title": "Turismo",
        "subtitle": "Salir de la rutina… para volver con historias.",
        "theme": {
            "primary": "#10b981",
            "accent": "#10b981",
            "bgGradient": "from-[#10b981]/10 to-white",
            "icon": "travel_explore"
        },
        "subcategories": [
            {
                "id": "hoteles",
                "label": "Hoteles",
                "slug": "hoteles",
                "icon": "hotel"
            },
            {
                "id": "balnearios",
                "label": "Balnearios",
                "slug": "balnearios",
                "icon": "hot_tub"
            },
            {
                "id": "playas",
                "label": "Playas",
                "slug": "playas",
                "icon": "beach_access"
            },
            {
                "id": "destinos_urbanos",
                "label": "Destinos urbanos",
                "slug": "destinos-urbanos",
                "icon": "location_city"
            },
            {
                "id": "lagos_y_montana",
                "label": "Lagos y montaña",
                "slug": "lagos-y-montana",
                "icon": "landscape"
            }
        ]
    },
    "deportes": {
        "id": "cat-deportes",
        "title": "Deportes",
        "subtitle": "Pasión, sufrimiento… y fe para la próxima fecha.",
        "theme": {
            "primary": "#f97316",
            "accent": "#f97316",
            "bgGradient": "from-[#f97316]/10 to-white",
            "icon": "sports_soccer"
        },
        "subcategories": [
            {
                "id": "futbol_chile",
                "label": "Fútbol (Chile)",
                "slug": "futbol-chile",
                "icon": "sports_soccer"
            }
        ]
    },
    "vino": {
        "id": "cat-vino",
        "title": "Vino",
        "subtitle": "Copa en mano, criterio en pausa.",
        "theme": {
            "primary": "#7f1d1d",
            "accent": "#7f1d1d",
            "bgGradient": "from-[#7f1d1d]/10 to-white",
            "icon": "wine_bar"
        },
        "subcategories": [
            {
                "id": "vinas_de_chile",
                "label": "Viñas de Chile",
                "slug": "vinas-de-chile",
                "icon": "wine_bar"
            },
            {
                "id": "tiendas_e_commerce_de_vino",
                "label": "Tiendas / e-commerce de vino",
                "slug": "tiendas-e-commerce-de-vino",
                "icon": "shopping_bag"
            }
        ]
    },
    "vida_diaria": {
        "id": "cat-vida-diaria",
        "title": "Vida diaria",
        "subtitle": "Termómetro humano, sin chamullo.",
        "theme": {
            "primary": "#334155",
            "accent": "#334155",
            "bgGradient": "from-[#334155]/10 to-white",
            "icon": "person"
        },
        "subcategories": [
            {
                "id": "presupuesto_del_hogar",
                "label": "Presupuesto del hogar",
                "slug": "presupuesto-del-hogar",
                "icon": "savings"
            },
            {
                "id": "costo_de_vida_percibido",
                "label": "Costo de vida percibido",
                "slug": "costo-de-vida-percibido",
                "icon": "price_check"
            },
            {
                "id": "deuda_y_carga_financiera",
                "label": "Deuda y carga financiera",
                "slug": "deuda-y-carga-financiera",
                "icon": "request_quote"
            },
            {
                "id": "estres_semanal",
                "label": "Estrés semanal",
                "slug": "estres-semanal",
                "icon": "psychology"
            },
            {
                "id": "energia_diaria",
                "label": "Energía diaria",
                "slug": "energia-diaria",
                "icon": "battery_full"
            },
            {
                "id": "sueno",
                "label": "Sueño",
                "slug": "sueno",
                "icon": "bed"
            },
            {
                "id": "optimismo_futuro",
                "label": "Optimismo / futuro",
                "slug": "optimismo-futuro",
                "icon": "emoji_objects"
            },
            {
                "id": "carga_laboral",
                "label": "Carga laboral",
                "slug": "carga-laboral",
                "icon": "work"
            },
            {
                "id": "tiempo_libre_real",
                "label": "Tiempo libre real",
                "slug": "tiempo-libre-real",
                "icon": "schedule"
            },
            {
                "id": "salud_mental_autopercepcion",
                "label": "Salud mental (autopercepción)",
                "slug": "salud-mental-autopercepcion",
                "icon": "psychology"
            },
            {
                "id": "vida_en_tu_ciudad",
                "label": "Vida en tu ciudad",
                "slug": "vida-en-tu-ciudad",
                "icon": "location_on"
            },
            {
                "id": "seguridad_percibida",
                "label": "Seguridad percibida",
                "slug": "seguridad-percibida",
                "icon": "shield"
            }
        ]
    }
};
