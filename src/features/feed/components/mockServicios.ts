export type TrendDirection = 'up' | 'down' | 'neutral';

export interface MockService {
    id: string;
    name: string;
    category: string;
    subcategory: string | null;
    rating: number;
    reviews: number;
    entityType?: string; // e.g. "Proveedor", "Empresa", "Institución"
    image: string;
    tags: string;
    trendDirection?: TrendDirection;
    trendValue?: string;
}

export const MOCK_SERVICIOS: MockService[] = [
    // 1. Telecomunicaciones
    { id: "s1", name: "WOM", category: "telecomunicaciones", subcategory: "plan_movil", rating: 4.2, reviews: 15400, entityType: "Operador", image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800", tags: "Móvil • Planes", trendDirection: "up", trendValue: "+0.3" },
    { id: "s2", name: "Entel", category: "telecomunicaciones", subcategory: "internet_movil", rating: 4.5, reviews: 21000, entityType: "Operador", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800", tags: "Red 5G • Cobertura", trendDirection: "down", trendValue: "-0.1" },
    { id: "s3", name: "VTR", category: "telecomunicaciones", subcategory: "internet_hogar", rating: 3.1, reviews: 34000, entityType: "Proveedor", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800", tags: "Banda Ancha • Hogar", trendDirection: "down", trendValue: "-0.5" },
    { id: "s4", name: "Mundo", category: "telecomunicaciones", subcategory: "fibra_optica", rating: 4.6, reviews: 8500, entityType: "Proveedor", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800", tags: "Fibra Óptica • Rápido", trendDirection: "up", trendValue: "+0.8" },

    // 2. Servicios financieros
    { id: "s5", name: "Banco de Chile", category: "financieros", subcategory: "banco", rating: 4.7, reviews: 45000, entityType: "Banco", image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&q=80&w=800", tags: "Tradicional • Cuenta C.", trendDirection: "neutral", trendValue: "=" },
    { id: "s6", name: "Tenpo", category: "financieros", subcategory: "fintech", rating: 4.8, reviews: 12000, entityType: "Fintech", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800", tags: "Digital • Prepago", trendDirection: "up", trendValue: "+0.4" },
    { id: "s7", name: "Mercado Pago", category: "financieros", subcategory: "billetera_digital", rating: 4.6, reviews: 18000, entityType: "Fintech", image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=800", tags: "Pagos • Transferencias", trendDirection: "up", trendValue: "+0.2" },

    // 3. Salud y previsión
    { id: "s8", name: "Consalud", category: "salud_prevision", subcategory: "isapre", rating: 3.5, reviews: 9200, entityType: "Isapre", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800", tags: "Planes • Cobertura", trendDirection: "down", trendValue: "-0.3" },
    { id: "s9", name: "Clínica Alemana", category: "salud_prevision", subcategory: "clinica", rating: 4.8, reviews: 14000, entityType: "Centro de Salud", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800", tags: "Atención Prime • Urgencias", trendDirection: "neutral", trendValue: "=" },
    { id: "s10", name: "Integramédica", category: "salud_prevision", subcategory: "centro_medico", rating: 4.0, reviews: 22000, entityType: "Centro Médico", image: "https://images.unsplash.com/photo-1538108149393-cebb47ac79db?auto=format&fit=crop&q=80&w=800", tags: "Consultas • Exámenes", trendDirection: "up", trendValue: "+0.1" },

    // 4. Seguros
    { id: "s11", name: "MetLife", category: "seguros", subcategory: "seguro_vida", rating: 4.3, reviews: 5600, entityType: "Aseguradora", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800", tags: "Vida • Protección", trendDirection: "neutral", trendValue: "=" },
    { id: "s12", name: "BCI Seguros", category: "seguros", subcategory: "seguro_automotriz", rating: 4.5, reviews: 8100, entityType: "Aseguradora", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800", tags: "Auto • Asistencia", trendDirection: "up", trendValue: "+0.2" },

    // 5. Servicios básicos del hogar
    { id: "s13", name: "Enel", category: "basicos", subcategory: "electricidad", rating: 2.8, reviews: 45000, entityType: "Distribuidora", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800", tags: "Luz • Suministro", trendDirection: "down", trendValue: "-0.6" },
    { id: "s14", name: "Aguas Andinas", category: "basicos", subcategory: "agua", rating: 3.2, reviews: 28000, entityType: "Sanitaria", image: "https://images.unsplash.com/photo-1541727687969-ce40493cd847?auto=format&fit=crop&q=80&w=800", tags: "Agua • Servicios", trendDirection: "neutral", trendValue: "=" },

    // 6. Transporte y movilidad
    { id: "s15", name: "Uber", category: "transporte", subcategory: "app_transporte", rating: 4.6, reviews: 150000, entityType: "Plataforma", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800", tags: "Movilidad • Viajes", trendDirection: "up", trendValue: "+0.1" },
    { id: "s16", name: "Sky Airline", category: "transporte", subcategory: "pasajes_aereos", rating: 4.2, reviews: 41000, entityType: "Aerolínea", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800", tags: "Low Cost • Vuelos", trendDirection: "down", trendValue: "-0.2" },

    // 7. Delivery y última milla
    { id: "s17", name: "PedidosYa", category: "delivery", subcategory: "delivery_comida", rating: 4.5, reviews: 120000, entityType: "App", image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=800", tags: "Comida • Rápido", trendDirection: "neutral", trendValue: "=" },
    { id: "s18", name: "Mercado Libre", category: "delivery", subcategory: "envios_express", rating: 4.8, reviews: 200000, entityType: "E-commerce", image: "https://images.unsplash.com/photo-1586528116311-ad8ed7c50a30?auto=format&fit=crop&q=80&w=800", tags: "Envíos • Compras", trendDirection: "up", trendValue: "+0.2" },

    // 8. Educación y formación
    { id: "s19", name: "Pontificia Universidad Católica", category: "educacion", subcategory: "universidad", rating: 4.9, reviews: 15000, entityType: "Institución", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800", tags: "Pregrado • Postgrado", trendDirection: "neutral", trendValue: "=" },
    { id: "s20", name: "Platzi", category: "educacion", subcategory: "cursos_online", rating: 4.7, reviews: 25000, entityType: "Plataforma", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800", tags: "Tecnología • Online", trendDirection: "up", trendValue: "+0.3" },

    // 9. Entretenimiento y suscripciones
    { id: "s21", name: "Netflix", category: "entretenimiento", subcategory: "streaming_video", rating: 4.6, reviews: 300000, entityType: "Plataforma", image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800", tags: "Películas • Series", trendDirection: "neutral", trendValue: "=" },
    { id: "s22", name: "Spotify", category: "entretenimiento", subcategory: "streaming_musica", rating: 4.8, reviews: 250000, entityType: "Plataforma", image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=800", tags: "Música • Podcasts", trendDirection: "up", trendValue: "+0.1" },

    // 10. Turismo y viajes
    { id: "s23", name: "Booking.com", category: "turismo", subcategory: "reserva_hoteles", rating: 4.5, reviews: 180000, entityType: "Plataforma", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800", tags: "Hoteles • Alojamientos", trendDirection: "neutral", trendValue: "=" },

    // 11. Servicios profesionales
    { id: "s24", name: "WeWork", category: "profesionales", subcategory: "cowork", rating: 4.3, reviews: 8500, entityType: "Empresa", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800", tags: "Oficinas • Coworking", trendDirection: "down", trendValue: "-0.2" },

    // 12. Servicios para el hogar
    { id: "s25", name: "Verisure", category: "hogar", subcategory: "seguridad_alarmas", rating: 3.8, reviews: 12000, entityType: "Empresa", image: "https://images.unsplash.com/photo-1557597774-9d273e3cdb4b?auto=format&fit=crop&q=80&w=800", tags: "Alarmas • Monitoreo", trendDirection: "down", trendValue: "-0.1" },

    // Más Telecomunicaciones
    { id: "s26", name: "Starlink", category: "telecomunicaciones", subcategory: "internet_satelital", rating: 4.8, reviews: 12000, entityType: "Proveedor", image: "https://images.unsplash.com/photo-1544391605-1a221415ebbf?auto=format&fit=crop&q=80&w=800", tags: "Satelital • Rural", trendDirection: "up", trendValue: "+0.5" },
    { id: "s27", name: "Claro Empresas", category: "telecomunicaciones", subcategory: "soluciones_empresa", rating: 3.9, reviews: 8400, entityType: "Proveedor B2B", image: "https://images.unsplash.com/photo-1558227092-159e13a0c5fc?auto=format&fit=crop&q=80&w=800", tags: "Cloud • Redes", trendDirection: "neutral", trendValue: "=" },

    // Más Financieros
    { id: "s28", name: "Banco Falabella", category: "financieros", subcategory: "tarjeta_credito", rating: 4.5, reviews: 85000, entityType: "Banco Retail", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800", tags: "CMR • Puntos", trendDirection: "up", trendValue: "+0.2" },
    { id: "s29", name: "Fintual", category: "financieros", subcategory: "inversion", rating: 4.9, reviews: 32000, entityType: "Administradora", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800", tags: "Fondos Mutuos • APV", trendDirection: "up", trendValue: "+0.6" },
    { id: "s30", name: "Global66", category: "financieros", subcategory: "casas_cambio", rating: 4.6, reviews: 15000, entityType: "Fintech", image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&q=80&w=800", tags: "Remesas • Divisas", trendDirection: "up", trendValue: "+0.4" },
    
    // Más Salud
    { id: "s31", name: "RedSalud", category: "salud_prevision", subcategory: "dental", rating: 4.1, reviews: 26000, entityType: "Clínica Dental", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800", tags: "Odontología • Brackets", trendDirection: "up", trendValue: "+0.1" },
    { id: "s32", name: "AFP Habitat", category: "salud_prevision", subcategory: "afp", rating: 3.4, reviews: 45000, entityType: "Previsión", image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800", tags: "Pensiones • Fondos", trendDirection: "neutral", trendValue: "=" },
    { id: "s33", name: "Bupa Laboratorio", category: "salud_prevision", subcategory: "laboratorio", rating: 4.5, reviews: 15000, entityType: "Red Médica", image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800", tags: "Toma de muestras", trendDirection: "up", trendValue: "+0.2" },

    // Más Seguros
    { id: "s34", name: "BICE Vida", category: "seguros", subcategory: "seguro_complementario", rating: 4.4, reviews: 11000, entityType: "Aseguradora", image: "https://images.unsplash.com/photo-1573167582108-14af67ecb279?auto=format&fit=crop&q=80&w=800", tags: "Salud • Dental", trendDirection: "neutral", trendValue: "=" },
    { id: "s35", name: "Seguro SOAP Falabella", category: "seguros", subcategory: "soap", rating: 4.7, reviews: 60000, entityType: "Corredora", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800", tags: "Obligatorio • Auto", trendDirection: "up", trendValue: "+0.1" },

    // Más Transporte
    { id: "s36", name: "Turbus", category: "transporte", subcategory: "buses_interurbanos", rating: 3.6, reviews: 85000, entityType: "Operador", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800", tags: "Interurbano • Pasajes", trendDirection: "down", trendValue: "-0.2" },
    { id: "s37", name: "LATAM", category: "transporte", subcategory: "pasajes_aereos", rating: 4.1, reviews: 180000, entityType: "Aerolínea", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800", tags: "Vuelos • Internacional", trendDirection: "neutral", trendValue: "=" },

    // Más Delivery
    { id: "s38", name: "Chilexpress", category: "delivery", subcategory: "courier", rating: 4.2, reviews: 45000, entityType: "Courier", image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800", tags: "Encomiendas • Nacional", trendDirection: "up", trendValue: "+0.1" },
    { id: "s39", name: "AeroPost", category: "delivery", subcategory: "casillas_miami", rating: 4.4, reviews: 12000, entityType: "Casilla", image: "https://images.unsplash.com/photo-1586528116311-ad8ed7c50a30?auto=format&fit=crop&q=80&w=800", tags: "Miami • Importación", trendDirection: "up", trendValue: "+0.3" },

    // Más Educación
    { id: "s40", name: "Políglota", category: "educacion", subcategory: "idiomas", rating: 4.7, reviews: 18000, entityType: "Plataforma", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800", tags: "Inglés • Grupos", trendDirection: "up", trendValue: "+0.4" },
    { id: "s41", name: "Duoc UC", category: "educacion", subcategory: "instituto", rating: 4.6, reviews: 32000, entityType: "Instituto", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800", tags: "Profesional • Técnico", trendDirection: "up", trendValue: "+0.1" },

    // Más Hogar
    { id: "s42", name: "Sodimac Servicios", category: "hogar", subcategory: "remodelaciones", rating: 4.0, reviews: 15000, entityType: "Empresa", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800", tags: "Instalaciones • Armado", trendDirection: "neutral", trendValue: "=" }
];
