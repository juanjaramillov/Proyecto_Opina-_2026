-- Seed Entities File

INSERT INTO entities (name, slug, type, category) VALUES
-- Bancos
('Banco de Chile', 'banco-de-chile', 'brand', 'bancos'),
('Banco Santander', 'banco-santander', 'brand', 'bancos'),
('BCI', 'bci', 'brand', 'bancos'),
('BancoEstado', 'bancoestado', 'brand', 'bancos'),
('Scotiabank', 'scotiabank', 'brand', 'bancos'),
('Itaú', 'itau', 'brand', 'bancos'),

-- Fintech / Wallets
('Mercado Pago', 'mercado-pago', 'brand', 'fintech-wallets'),
('Tenpo', 'tenpo', 'brand', 'fintech-wallets'),
('Mach', 'mach', 'brand', 'fintech-wallets'),
('Fintual', 'fintual', 'brand', 'fintech-wallets'),
('Tapp', 'tapp', 'brand', 'fintech-wallets'),
('Chek', 'chek', 'brand', 'fintech-wallets'),

-- Tarjetas / Medios de pago
('Visa', 'visa', 'brand', 'tarjetas-medios-de-pago'),
('Mastercard', 'mastercard', 'brand', 'tarjetas-medios-de-pago'),
('American Express', 'american-express', 'brand', 'tarjetas-medios-de-pago'),
('CMR Falabella', 'cmr-falabella', 'brand', 'tarjetas-medios-de-pago'),
('Tarjeta Cencosud', 'tarjeta-cencosud', 'brand', 'tarjetas-medios-de-pago'),
('Tarjeta Lider BCI', 'tarjeta-lider-bci', 'brand', 'tarjetas-medios-de-pago'),

-- Clínicas
('Clínica Alemana', 'clinica-alemana', 'brand', 'clinicas'),
('Clínica Las Condes', 'clinica-las-condes', 'brand', 'clinicas'),
('Clínica Santa María', 'clinica-santa-maria', 'brand', 'clinicas'),
('Clínica Indisa', 'clinica-indisa', 'brand', 'clinicas'),
('RedSalud', 'redsalud', 'brand', 'clinicas'),
('Clínica MEDS', 'clinica-meds', 'brand', 'clinicas'),

-- Centros de Salud
('IntegraMédica', 'integramedica', 'brand', 'centros-de-salud'),
('RedSalud Centro Médico', 'redsalud-centro-medico', 'brand', 'centros-de-salud'),
('Megasalud', 'megasalud', 'brand', 'centros-de-salud'),
('Vidaintegra', 'vidaintegra', 'brand', 'centros-de-salud'),
('Centro Médico UC Christus', 'centro-medico-uc-christus', 'brand', 'centros-de-salud'),
('Bupa', 'bupa', 'brand', 'centros-de-salud'),

-- Farmacias
('Cruz Verde', 'cruz-verde', 'brand', 'farmacias'),
('Salcobrand', 'salcobrand', 'brand', 'farmacias'),
('Farmacias Ahumada', 'farmacias-ahumada', 'brand', 'farmacias'),
('Dr. Simi', 'dr-simi', 'brand', 'farmacias'),
('Liga Chilena contra la Epilepsia', 'liga-chilena-contra-la-epilepsia', 'brand', 'farmacias'),
('Fracción', 'fraccion', 'brand', 'farmacias'),

-- Isapres
('Colmena', 'colmena', 'brand', 'isapres'),
('Banmédica', 'banmedica', 'brand', 'isapres'),
('Consalud', 'consalud', 'brand', 'isapres'),
('Vida Tres', 'vida-tres', 'brand', 'isapres'),
('Nueva Masvida', 'nueva-masvida', 'brand', 'isapres'),
('Cruz Blanca', 'cruz-blanca', 'brand', 'isapres'),

-- Seguros
('MetLife', 'metlife', 'brand', 'seguros'),
('BCI Seguros', 'bci-seguros', 'brand', 'seguros'),
('Consorcio', 'consorcio', 'brand', 'seguros'),
('Chilena Consolidada', 'chilena-consolidada', 'brand', 'seguros'),
('Mapfre', 'mapfre', 'brand', 'seguros'),
('HDI Seguros', 'hdi-seguros', 'brand', 'seguros'),

-- Línea móvil
('Entel', 'entel', 'brand', 'linea-movil'),
('Movistar', 'movistar', 'brand', 'linea-movil'),
('WOM', 'wom', 'brand', 'linea-movil'),
('Claro', 'claro', 'brand', 'linea-movil'),
('VTR Móvil', 'vtr-movil', 'brand', 'linea-movil'),
('Virgin Mobile', 'virgin-mobile', 'brand', 'linea-movil'),

-- Internet hogar
('Mundo Pacífico', 'mundo-pacifico', 'brand', 'internet-hogar'),
('Entel Fibra', 'entel-fibra', 'brand', 'internet-hogar'),
('Movistar Fibra', 'movistar-fibra', 'brand', 'internet-hogar'),
('VTR', 'vtr', 'brand', 'internet-hogar'),
('Claro Hogar', 'claro-hogar', 'brand', 'internet-hogar'),
('GTD', 'gtd', 'brand', 'internet-hogar'),

-- Supermercados
('Líder', 'lider', 'brand', 'supermercados'),
('Jumbo', 'jumbo', 'brand', 'supermercados'),
('Santa Isabel', 'santa-isabel', 'brand', 'supermercados'),
('Tottus', 'tottus', 'brand', 'supermercados'),
('Unimarc', 'unimarc', 'brand', 'supermercados'),
('aCuenta', 'acuenta', 'brand', 'supermercados'),

-- Marketplaces
('Mercado Libre', 'mercado-libre', 'brand', 'marketplaces'),
('Falabella.com', 'falabella-com', 'brand', 'marketplaces'),
('Ripley.com', 'ripley-com', 'brand', 'marketplaces'),
('Paris.cl', 'paris-cl', 'brand', 'marketplaces'),
('Amazon', 'amazon', 'brand', 'marketplaces'),
('AliExpress', 'aliexpress', 'brand', 'marketplaces'),

-- Multitiendas
('Falabella', 'falabella', 'brand', 'multitiendas'),
('Ripley', 'ripley', 'brand', 'multitiendas'),
('Paris', 'paris', 'brand', 'multitiendas'),
('La Polar', 'la-polar', 'brand', 'multitiendas'),
('Hites', 'hites', 'brand', 'multitiendas'),
('Tricot', 'tricot', 'brand', 'multitiendas'),

-- Ropa básica
('H&M', 'h-m', 'brand', 'ropa-basica'),
('Zara', 'zara', 'brand', 'ropa-basica'),
('Corona', 'corona', 'brand', 'ropa-basica'),
('Fashion''s Park', 'fashions-park', 'brand', 'ropa-basica'),
('Tricot', 'tricot', 'brand', 'ropa-basica'),
('Family Shop', 'family-shop', 'brand', 'ropa-basica'),

-- Calzado
('BATA', 'bata', 'brand', 'calzado'),
('Guante', 'guante', 'brand', 'calzado'),
('16 Horas', '16-horas', 'brand', 'calzado'),
('Skechers', 'skechers', 'brand', 'calzado'),
('Hush Puppies', 'hush-puppies', 'brand', 'calzado'),
('Aldo', 'aldo', 'brand', 'calzado'),

-- Deportivo
('Nike', 'nike', 'brand', 'deportivo'),
('adidas', 'adidas', 'brand', 'deportivo'),
('Puma', 'puma', 'brand', 'deportivo'),
('Under Armour', 'under-armour', 'brand', 'deportivo'),
('Reebok', 'reebok', 'brand', 'deportivo'),
('Sparta', 'sparta', 'brand', 'deportivo'),

-- Outdoor
('The North Face', 'the-north-face', 'brand', 'outdoor'),
('Columbia', 'columbia', 'brand', 'outdoor'),
('Patagonia', 'patagonia', 'brand', 'outdoor'),
('Lippi', 'lippi', 'brand', 'outdoor'),
('Doite', 'doite', 'brand', 'outdoor'),
('Marmot', 'marmot', 'brand', 'outdoor'),

-- Fast Food / Comida rápida
('McDonald''s', 'mcdonalds', 'brand', 'fast-food-comida-rapida'),
('Burger King', 'burger-king', 'brand', 'fast-food-comida-rapida'),
('Wendy''s', 'wendys', 'brand', 'fast-food-comida-rapida'),
('KFC', 'kfc', 'brand', 'fast-food-comida-rapida'),
('Doggis', 'doggis', 'brand', 'fast-food-comida-rapida'),
('Tarragona', 'tarragona', 'brand', 'fast-food-comida-rapida'),

-- Delivery (apps)
('PedidosYa', 'pedidosya', 'brand', 'delivery-apps'),
('Uber Eats', 'uber-eats', 'brand', 'delivery-apps'),
('Rappi', 'rappi', 'brand', 'delivery-apps'),
('Justo', 'justo', 'brand', 'delivery-apps'),
('Spid', 'spid', 'brand', 'delivery-apps'),
('Kig', 'kig', 'brand', 'delivery-apps'),

-- Aerolíneas
('LATAM', 'latam', 'brand', 'aerolineas'),
('Sky Airline', 'sky-airline', 'brand', 'aerolineas'),
('JetSMART', 'jetsmart', 'brand', 'aerolineas'),
('Copa Airlines', 'copa-airlines', 'brand', 'aerolineas'),
('American Airlines', 'american-airlines', 'brand', 'aerolineas'),
('Iberia', 'iberia', 'brand', 'aerolineas'),

-- Automotoras (concesionarias)
('Salazar Israel', 'salazar-israel', 'brand', 'automotoras'),
('Bruno Fritsch', 'bruno-fritsch', 'brand', 'automotoras'),
('DercoCenter', 'dercocenter', 'brand', 'automotoras'),
('Kaufmann', 'kaufmann', 'brand', 'automotoras'),
('Gildemeister', 'gildemeister', 'brand', 'automotoras'),
('Pomar', 'pomar', 'brand', 'automotoras'),

-- Autos (marcas)
('Chevrolet', 'chevrolet', 'brand', 'autos-marcas'),
('Toyota', 'toyota', 'brand', 'autos-marcas'),
('Suzuki', 'suzuki', 'brand', 'autos-marcas'),
('Hyundai', 'hyundai', 'brand', 'autos-marcas'),
('Kia', 'kia', 'brand', 'autos-marcas'),
('Peugeot', 'peugeot', 'brand', 'autos-marcas'),

-- Streaming video
('Netflix', 'netflix', 'brand', 'streaming-video'),
('Max', 'max', 'brand', 'streaming-video'),
('Disney+', 'disney', 'brand', 'streaming-video'),
('Prime Video', 'prime-video', 'brand', 'streaming-video'),
('Apple TV+', 'apple-tv', 'brand', 'streaming-video'),
('Paramount+', 'paramount', 'brand', 'streaming-video'),

-- Cosméticos / Maquillaje
('MAC', 'mac', 'brand', 'cosmeticos'),
('Maybelline', 'maybelline', 'brand', 'cosmeticos'),
('L''Oréal', 'loreal', 'brand', 'cosmeticos'),
('Petrizzio', 'petrizzio', 'brand', 'cosmeticos'),
('NYX', 'nyx', 'brand', 'cosmeticos'),
('Natura', 'natura', 'brand', 'cosmeticos'),

-- Universidades
('U. de Chile', 'u-de-chile', 'brand', 'universidades'),
('PUC (U. Católica)', 'puc-u-catolica', 'brand', 'universidades'),
('U. de Concepción', 'u-de-concepcion', 'brand', 'universidades'),
('USACH', 'usach', 'brand', 'universidades'),
('U. Adolfo Ibáñez (UAI)', 'u-adolfo-ibanez-uai', 'brand', 'universidades'),
('U. Diego Portales (UDP)', 'u-diego-portales-udp', 'brand', 'universidades'),

-- Institutos / CFT
('INACAP', 'inacap', 'brand', 'institutos'),
('Duoc UC', 'duoc-uc', 'brand', 'institutos'),
('AIEP', 'aiep', 'brand', 'institutos'),
('Santo Tomás', 'santo-tomas', 'brand', 'institutos'),
('IPChile', 'ipchile', 'brand', 'institutos'),
('ENAC', 'enac', 'brand', 'institutos'),

-- Fútbol (Chile)
('Colo-Colo', 'colo-colo', 'brand', 'futbol-chile'),
('U. de Chile', 'u-de-chile', 'brand', 'futbol-chile'),
('U. Católica', 'u-catolica', 'brand', 'futbol-chile'),
('Cobreloa', 'cobreloa', 'brand', 'futbol-chile'),
('Wanderers', 'wanderers', 'brand', 'futbol-chile'),
('Unión Española', 'union-espanola', 'brand', 'futbol-chile'),

-- Destinos urbanos
('Santiago', 'santiago', 'brand', 'destinos-urbanos'),
('Concepción', 'concepcion', 'brand', 'destinos-urbanos'),
('Valparaíso', 'valparaiso', 'brand', 'destinos-urbanos'),
('Antofagasta', 'antofagasta', 'brand', 'destinos-urbanos'),
('Temuco', 'temuco', 'brand', 'destinos-urbanos'),
('Puerto Montt', 'puerto-montt', 'brand', 'destinos-urbanos'),

-- Destinos playa
('Viña del Mar', 'vina-del-mar', 'brand', 'destinos-playa'),
('La Serena', 'la-serena', 'brand', 'destinos-playa'),
('Reñaca', 'renaca', 'brand', 'destinos-playa'),
('Maitencillo', 'maitencillo', 'brand', 'destinos-playa'),
('Pichilemu', 'pichilemu', 'brand', 'destinos-playa'),
('Iquique (Cavancha)', 'iquique-cavancha', 'brand', 'destinos-playa')
ON CONFLICT (slug) DO NOTHING;
;
