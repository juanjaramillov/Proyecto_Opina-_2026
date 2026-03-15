SET session_replication_role = 'replica';

      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Colo-Colo', 'colo-colo', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.colocolo.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Universidad de Chile', 'universidad-de-chile-futbol', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.udechile.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Universidad Católica', 'universidad-catolica-futbol', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.lacatolica.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Unión Española', 'union-espanola', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.unionespanola.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Cobreloa', 'cobreloa', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.cobreloa.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Santiago Wanderers', 'santiago-wanderers', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.santiagowanderers.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Palestino', 'palestino', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.palestino.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Audax Italiano', 'audax-italiano', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.audaxitaliano.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Huachipato', 'huachipato', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.cdhuachipato.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('O''Higgins', 'ohiggins', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.ohigginsfc.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Everton', 'everton', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.everton.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Ñublense', 'nublense', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.nublense.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Coquimbo Unido', 'coquimbo-unido', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.coquimbounido.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Deportes Iquique', 'deportes-iquique', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.clubdeportesiquique.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Unión La Calera', 'union-la-calera', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.ulc.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Cobresal', 'cobresal', 'brand', 'Clubes de fútbol', '{"industry":"Deportes","category":"Fútbol","subcategory":"Clubes de fútbol","domain":"https://www.cdcobresal.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Smart Fit', 'smart-fit', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://www.smartfit.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Energy', 'energy-fitness', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://www.energy.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Pacific Fitness', 'pacific-fitness', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://www.pacificfitness.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Sportlife', 'sportlife', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://www.sportlife.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('B-Day Fitness', 'b-day-fitness', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://www.b-day.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Youtopia', 'youtopia', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://www.youtopia.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('OrangeTheory', 'orangetheory', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://www.orangetheory.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('F45', 'f45', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://f45training.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('CrossFit', 'crossfit', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://www.crossfit.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Bodytech', 'bodytech', 'brand', 'Gimnasios', '{"industry":"Deportes","category":"Gimnasios","subcategory":"Gimnasios","domain":"https://www.bodytech.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Strava', 'strava', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://www.strava.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Nike Run Club', 'nike-run-club', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://www.nike.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Adidas Running', 'adidas-running', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://www.adidas.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Garmin Connect', 'garmin-connect', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://connect.garmin.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Fitbit App', 'fitbit-app', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://www.fitbit.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Freeletics', 'freeletics', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://www.freeletics.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('MyFitnessPal', 'myfitnesspal', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://www.myfitnesspal.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Seven', 'seven-app', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://seven.app"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Centr', 'centr', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://centr.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Asana Rebel', 'asana-rebel', 'brand', 'Apps fitness', '{"industry":"Deportes","category":"Fitness digital","subcategory":"Apps fitness","domain":"https://www.asanarebel.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Canal 13', 'canal-13', 'brand', 'TV abierta', '{"industry":"Medios","category":"Información","subcategory":"TV abierta","domain":"https://www.13.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Chilevisión', 'chilevision', 'brand', 'TV abierta', '{"industry":"Medios","category":"Información","subcategory":"TV abierta","domain":"https://www.chilevision.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Mega', 'mega', 'brand', 'TV abierta', '{"industry":"Medios","category":"Información","subcategory":"TV abierta","domain":"https://www.mega.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('TVN', 'tvn', 'brand', 'TV abierta', '{"industry":"Medios","category":"Información","subcategory":"TV abierta","domain":"https://www.tvn.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('TV+', 'tv-plus', 'brand', 'TV abierta', '{"industry":"Medios","category":"Información","subcategory":"TV abierta","domain":"https://www.tvmas.tv"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('La Red', 'la-red', 'brand', 'TV abierta', '{"industry":"Medios","category":"Información","subcategory":"TV abierta","domain":"https://www.lared.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Cine Hoyts Premium', 'cine-hoyts-premium', 'brand', 'Cines', '{"industry":"Entretenimiento","category":"Cine","subcategory":"Cines","domain":"https://www.cinehoyts.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Cinemark XD', 'cinemark-xd', 'brand', 'Cines', '{"industry":"Entretenimiento","category":"Cine","subcategory":"Cines","domain":"https://www.cinemark.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Cineplanet Prime', 'cineplanet-prime', 'brand', 'Cines', '{"industry":"Entretenimiento","category":"Cine","subcategory":"Cines","domain":"https://www.cineplanet.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Cinépolis VIP', 'cinepolis-vip', 'brand', 'Cines', '{"industry":"Entretenimiento","category":"Cine","subcategory":"Cines","domain":"https://www.cinepolis.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Juan Maestro', 'juan-maestro', 'brand', 'Fast food', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Fast food","domain":"https://www.juanmaestro.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Doggis', 'doggis', 'brand', 'Fast food', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Fast food","domain":"https://www.doggis.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Pedro Juan y Diego', 'pedro-juan-y-diego', 'brand', 'Fast food', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Fast food","domain":"https://www.pyd.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Tarragona', 'tarragona', 'brand', 'Fast food', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Fast food","domain":"https://www.tarragona.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Carl''s Jr.', 'carls-jr', 'brand', 'Fast food', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Fast food","domain":"https://www.carlsjr.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Johnny Rockets', 'johnny-rockets', 'brand', 'Fast food', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Fast food","domain":"https://www.johnnyrockets.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Fuente Alemana', 'fuente-alemana', 'brand', 'Hamburgueserías', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Hamburgueserías","domain":"https://www.fuentealemana.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Fuente Mardoqueo', 'fuente-mardoqueo', 'brand', 'Hamburgueserías', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Hamburgueserías","domain":"https://www.mardoqueo.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Dominó', 'domino-fuente-de-soda', 'brand', 'Hamburgueserías', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Hamburgueserías","domain":"https://www.domino.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Tip y Tap', 'tip-y-tap', 'brand', 'Hamburgueserías', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Hamburgueserías","domain":"https://www.tipytap.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Krossbar', 'krossbar', 'brand', 'Hamburgueserías', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Hamburgueserías","domain":"https://www.krossbar.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Liguria', 'liguria', 'brand', 'Hamburgueserías', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Hamburgueserías","domain":"https://www.liguria.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Juan y Medio', 'juan-y-medio', 'brand', 'Hamburgueserías', '{"industry":"Comida y restaurantes","category":"Restaurantes","subcategory":"Hamburgueserías","domain":"https://www.juanymedio.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Coffee Culture', 'coffee-culture', 'brand', 'Cafeterías', '{"industry":"Comida y restaurantes","category":"Café","subcategory":"Cafeterías","domain":"https://www.coffeeculture.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Blackdrop Coffee', 'blackdrop-coffee', 'brand', 'Cafeterías', '{"industry":"Comida y restaurantes","category":"Café","subcategory":"Cafeterías","domain":"https://www.blackdropcoffee.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Work Café Santander', 'work-cafe-santander', 'brand', 'Cafeterías', '{"industry":"Comida y restaurantes","category":"Café","subcategory":"Cafeterías","domain":"https://www.santander.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Bonafide', 'bonafide', 'brand', 'Cafeterías', '{"industry":"Comida y restaurantes","category":"Café","subcategory":"Cafeterías","domain":"https://www.bonafide.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('The Coffee', 'the-coffee', 'brand', 'Cafeterías', '{"industry":"Comida y restaurantes","category":"Café","subcategory":"Cafeterías","domain":"https://thecoffee.jp"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Juan Maestro Café', 'juan-maestro-cafe', 'brand', 'Cafeterías', '{"industry":"Comida y restaurantes","category":"Café","subcategory":"Cafeterías","domain":"https://www.juanmaestro.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Filippo', 'filippo-heladerias', 'brand', 'Heladerías', '{"industry":"Comida y restaurantes","category":"Helados","subcategory":"Heladerías","domain":"https://www.filippo.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Fragola', 'fragola', 'brand', 'Heladerías', '{"industry":"Comida y restaurantes","category":"Helados","subcategory":"Heladerías","domain":"https://www.fragola.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Il Maestrale', 'il-maestrale', 'brand', 'Heladerías', '{"industry":"Comida y restaurantes","category":"Helados","subcategory":"Heladerías","domain":"https://www.ilmaestrale.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Gelatería La Romana', 'gelateria-la-romana', 'brand', 'Heladerías', '{"industry":"Comida y restaurantes","category":"Helados","subcategory":"Heladerías","domain":"https://www.gelateriaromana.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Amorino', 'amorino', 'brand', 'Heladerías', '{"industry":"Comida y restaurantes","category":"Helados","subcategory":"Heladerías","domain":"https://www.amorino.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Costco', 'costco', 'brand', 'Supermercados', '{"industry":"Retail","category":"Alimentación","subcategory":"Supermercados","domain":"https://www.costco.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Aldi', 'aldi', 'brand', 'Supermercados', '{"industry":"Retail","category":"Alimentación","subcategory":"Supermercados","domain":"https://www.aldi.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Lidl', 'lidl', 'brand', 'Supermercados', '{"industry":"Retail","category":"Alimentación","subcategory":"Supermercados","domain":"https://www.lidl.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Whole Foods', 'whole-foods', 'brand', 'Supermercados', '{"industry":"Retail","category":"Alimentación","subcategory":"Supermercados","domain":"https://www.wholefoodsmarket.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('7-Eleven', 'seven-eleven', 'brand', 'Minimarkets', '{"industry":"Retail","category":"Alimentación","subcategory":"Minimarkets","domain":"https://www.7-eleven.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Circle K', 'circle-k', 'brand', 'Minimarkets', '{"industry":"Retail","category":"Alimentación","subcategory":"Minimarkets","domain":"https://www.circlek.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Amazon Prime', 'amazon-prime-marketplace', 'brand', 'Marketplaces', '{"industry":"Retail","category":"Grandes tiendas","subcategory":"Marketplaces","domain":"https://www.amazon.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Temu Chile', 'temu-chile', 'brand', 'Marketplaces', '{"industry":"Retail","category":"Grandes tiendas","subcategory":"Marketplaces","domain":"https://www.temu.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Shein Chile', 'shein-chile', 'brand', 'Marketplaces', '{"industry":"Retail","category":"Grandes tiendas","subcategory":"Marketplaces","domain":"https://www.shein.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Facebook Marketplace Chile', 'facebook-marketplace-chile', 'brand', 'Marketplaces', '{"industry":"Retail","category":"Grandes tiendas","subcategory":"Marketplaces","domain":"https://www.facebook.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('TikTok Shop', 'tiktok-shop', 'brand', 'Marketplaces', '{"industry":"Retail","category":"Grandes tiendas","subcategory":"Marketplaces","domain":"https://www.tiktok.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Canon Store', 'canon-store', 'brand', 'Tiendas de tecnología', '{"industry":"Retail","category":"Tecnología","subcategory":"Tiendas de tecnología","domain":"https://store.canon.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Nikon Store', 'nikon-store', 'brand', 'Tiendas de tecnología', '{"industry":"Retail","category":"Tecnología","subcategory":"Tiendas de tecnología","domain":"https://www.nikon.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Sony Store', 'sony-store', 'brand', 'Tiendas de tecnología', '{"industry":"Retail","category":"Tecnología","subcategory":"Tiendas de tecnología","domain":"https://store.sony.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('GoPro Store', 'gopro-store', 'brand', 'Tiendas de tecnología', '{"industry":"Retail","category":"Tecnología","subcategory":"Tiendas de tecnología","domain":"https://gopro.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('DJI Store', 'dji-store', 'brand', 'Tiendas de tecnología', '{"industry":"Retail","category":"Tecnología","subcategory":"Tiendas de tecnología","domain":"https://www.dji.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Robotina', 'robotina', 'brand', 'Aspiradoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Aspiradoras","domain":"https://www.robotina.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('iRobot', 'irobot', 'brand', 'Aspiradoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Aspiradoras","domain":"https://www.irobot.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Ecovacs', 'ecovacs', 'brand', 'Aspiradoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Aspiradoras","domain":"https://www.ecovacs.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Roborock', 'roborock', 'brand', 'Aspiradoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Aspiradoras","domain":"https://www.roborock.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Dreame', 'dreame', 'brand', 'Aspiradoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Aspiradoras","domain":"https://www.dreametech.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Hisense Refrigeradores', 'hisense-refrigeradores', 'brand', 'Refrigeradores', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Refrigeradores","domain":"https://www.hisense.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('TCL Refrigeradores', 'tcl-refrigeradores', 'brand', 'Refrigeradores', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Refrigeradores","domain":"https://www.tcl.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Haier Refrigeradores', 'haier-refrigeradores', 'brand', 'Refrigeradores', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Refrigeradores","domain":"https://www.haier.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Mabe Refrigeradores', 'mabe-refrigeradores', 'brand', 'Refrigeradores', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Refrigeradores","domain":"https://www.mabe.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('GE Refrigeradores', 'ge-refrigeradores', 'brand', 'Refrigeradores', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Refrigeradores","domain":"https://www.geappliances.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Haier Lavadoras', 'haier-lavadoras', 'brand', 'Lavadoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Lavadoras","domain":"https://www.haier.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Mabe Lavadoras', 'mabe-lavadoras', 'brand', 'Lavadoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Lavadoras","domain":"https://www.mabe.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('GE Lavadoras', 'ge-lavadoras', 'brand', 'Lavadoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Lavadoras","domain":"https://www.geappliances.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('TCL Lavadoras', 'tcl-lavadoras', 'brand', 'Lavadoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Lavadoras","domain":"https://www.tcl.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Ursus Trotter Lavadoras', 'ursus-trotter-lavadoras', 'brand', 'Lavadoras', '{"industry":"Hogar","category":"Electrodomésticos","subcategory":"Lavadoras","domain":"https://www.ursustrotter.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Parents Choice', 'parents-choice', 'brand', 'Pañales', '{"industry":"Bebés","category":"Productos bebé","subcategory":"Pañales","domain":"https://www.walmart.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Little Swimmers', 'little-swimmers', 'brand', 'Pañales', '{"industry":"Bebés","category":"Productos bebé","subcategory":"Pañales","domain":"https://www.huggies.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Huggies Natural Care', 'huggies-natural-care', 'brand', 'Pañales', '{"industry":"Bebés","category":"Productos bebé","subcategory":"Pañales","domain":"https://www.huggies.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Pampers Premium Protection', 'pampers-premium-protection', 'brand', 'Pañales', '{"industry":"Bebés","category":"Productos bebé","subcategory":"Pañales","domain":"https://www.pampers.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Pampers Sensitive', 'pampers-sensitive', 'brand', 'Toallitas húmedas', '{"industry":"Bebés","category":"Productos bebé","subcategory":"Toallitas húmedas","domain":"https://www.pampers.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Huggies Pure', 'huggies-pure', 'brand', 'Toallitas húmedas', '{"industry":"Bebés","category":"Productos bebé","subcategory":"Toallitas húmedas","domain":"https://www.huggies.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Johnson''s Cottontouch', 'johnsons-cottontouch', 'brand', 'Toallitas húmedas', '{"industry":"Bebés","category":"Productos bebé","subcategory":"Toallitas húmedas","domain":"https://www.johnsonsbaby.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('WaterWipes Pure', 'waterwipes-pure', 'brand', 'Toallitas húmedas', '{"industry":"Bebés","category":"Productos bebé","subcategory":"Toallitas húmedas","domain":"https://www.waterwipes.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Pedialyte Baby', 'pedialyte-baby', 'brand', 'Fórmulas infantiles', '{"industry":"Bebés","category":"Alimentación bebé","subcategory":"Fórmulas infantiles","domain":"https://www.pedialyte.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Gerber Organic', 'gerber-organic', 'brand', 'Fórmulas infantiles', '{"industry":"Bebés","category":"Alimentación bebé","subcategory":"Fórmulas infantiles","domain":"https://www.gerber.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Nestlé NAN Supreme', 'nan-supreme', 'brand', 'Fórmulas infantiles', '{"industry":"Bebés","category":"Alimentación bebé","subcategory":"Fórmulas infantiles","domain":"https://www.nestle.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Similac Gold', 'similac-gold', 'brand', 'Fórmulas infantiles', '{"industry":"Bebés","category":"Alimentación bebé","subcategory":"Fórmulas infantiles","domain":"https://www.similac.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('VTR Móvil', 'vtr-movil', 'brand', 'Telefonía móvil', '{"industry":"Telecomunicaciones","category":"Telefonía","subcategory":"Telefonía móvil","domain":"https://www.vtr.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Claro Empresas', 'claro-empresas', 'brand', 'Telefonía móvil', '{"industry":"Telecomunicaciones","category":"Telefonía","subcategory":"Telefonía móvil","domain":"https://www.clarochile.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Movistar Empresas', 'movistar-empresas', 'brand', 'Telefonía móvil', '{"industry":"Telecomunicaciones","category":"Telefonía","subcategory":"Telefonía móvil","domain":"https://www.movistar.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Entel Empresas', 'entel-empresas', 'brand', 'Telefonía móvil', '{"industry":"Telecomunicaciones","category":"Telefonía","subcategory":"Telefonía móvil","domain":"https://www.entel.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Peacock', 'peacock', 'brand', 'Streaming de video', '{"industry":"Entretenimiento","category":"Streaming","subcategory":"Streaming de video","domain":"https://www.peacocktv.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Discovery+', 'discovery-plus', 'brand', 'Streaming de video', '{"industry":"Entretenimiento","category":"Streaming","subcategory":"Streaming de video","domain":"https://www.discoveryplus.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Shudder', 'shudder', 'brand', 'Streaming de video', '{"industry":"Entretenimiento","category":"Streaming","subcategory":"Streaming de video","domain":"https://www.shudder.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Viki', 'viki', 'brand', 'Streaming de video', '{"industry":"Entretenimiento","category":"Streaming","subcategory":"Streaming de video","domain":"https://www.viki.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('KKBOX', 'kkbox', 'brand', 'Streaming de música', '{"industry":"Entretenimiento","category":"Streaming","subcategory":"Streaming de música","domain":"https://www.kkbox.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Napster', 'napster', 'brand', 'Streaming de música', '{"industry":"Entretenimiento","category":"Streaming","subcategory":"Streaming de música","domain":"https://www.napster.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Agoda', 'agoda', 'brand', 'Plataformas de reservas', '{"industry":"Viajes y transporte","category":"Turismo","subcategory":"Plataformas de reservas","domain":"https://www.agoda.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Trip.com', 'trip-com', 'brand', 'Plataformas de reservas', '{"industry":"Viajes y transporte","category":"Turismo","subcategory":"Plataformas de reservas","domain":"https://www.trip.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Priceline', 'priceline', 'brand', 'Plataformas de reservas', '{"industry":"Viajes y transporte","category":"Turismo","subcategory":"Plataformas de reservas","domain":"https://www.priceline.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('DoubleTree', 'doubletree', 'brand', 'Hoteles', '{"industry":"Viajes y transporte","category":"Turismo","subcategory":"Hoteles","domain":"https://www.hilton.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Hampton by Hilton', 'hampton-by-hilton', 'brand', 'Hoteles', '{"industry":"Viajes y transporte","category":"Turismo","subcategory":"Hoteles","domain":"https://www.hilton.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Radisson', 'radisson', 'brand', 'Hoteles', '{"industry":"Viajes y transporte","category":"Turismo","subcategory":"Hoteles","domain":"https://www.radissonhotels.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('XTB', 'xtb', 'brand', 'Plataformas de inversión', '{"industry":"Finanzas","category":"Inversiones","subcategory":"Plataformas de inversión","domain":"https://www.xtb.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Plus500', 'plus500', 'brand', 'Plataformas de inversión', '{"industry":"Finanzas","category":"Inversiones","subcategory":"Plataformas de inversión","domain":"https://www.plus500.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Saxo Bank', 'saxo-bank', 'brand', 'Plataformas de inversión', '{"industry":"Finanzas","category":"Inversiones","subcategory":"Plataformas de inversión","domain":"https://www.home.saxo"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Trade Republic', 'trade-republic', 'brand', 'Plataformas de inversión', '{"industry":"Finanzas","category":"Inversiones","subcategory":"Plataformas de inversión","domain":"https://traderepublic.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Degiro', 'degiro', 'brand', 'Plataformas de inversión', '{"industry":"Finanzas","category":"Inversiones","subcategory":"Plataformas de inversión","domain":"https://www.degiro.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Farmex', 'farmex', 'brand', 'Farmacias', '{"industry":"Salud","category":"Medicamentos","subcategory":"Farmacias","domain":"https://www.farmex.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Farmatotal', 'farmatotal', 'brand', 'Farmacias', '{"industry":"Salud","category":"Medicamentos","subcategory":"Farmacias","domain":"https://www.farmatotal.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Chubb', 'chubb-salud', 'brand', 'Seguros de salud', '{"industry":"Salud","category":"Seguros","subcategory":"Seguros de salud","domain":"https://www.chubb.com"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Bupa Seguros', 'bupa-seguros', 'brand', 'Seguros de salud', '{"industry":"Salud","category":"Seguros","subcategory":"Seguros de salud","domain":"https://www.bupa.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Vida Integra Plus', 'vida-integra-plus', 'brand', 'Centros médicos', '{"industry":"Salud","category":"Atención médica","subcategory":"Centros médicos","domain":"https://www.vidaintegra.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('Clínica RedSalud Providencia', 'clinica-redsalud-providencia', 'brand', 'Clínicas privadas', '{"industry":"Salud","category":"Atención médica","subcategory":"Clínicas privadas","domain":"https://www.redsalud.cl"}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      SET session_replication_role = 'origin';
