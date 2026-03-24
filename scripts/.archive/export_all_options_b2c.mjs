import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import path from 'path';

const url = 'https://neltawfiwpvunkwyvfse.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHRhd2Zpd3B2dW5rd3l2ZnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQ2NzYsImV4cCI6MjA4NzY1NDY3Nn0.RUszyzGL4Hb8Sa30_GJwYOVWVFHtbtUMm9J4mP_Ox2I';

const supabase = createClient(url, key);

const categoryMacroMap = {
  'accesorios': 'Accesorios',
  'aerolineas': 'Turismo',
  'agencias-otas': 'Turismo',
  'aguas': 'Bebidas',
  'alimento-para-gatos': 'Mascotas',
  'alimento-para-perros': 'Mascotas',
  'apps-de-transporte': 'Transporte',
  'apps-delivery': 'Delivery',
  'aspiradoras': 'Electrodomésticos',
  'audifonos': 'Tecnología',
  'automotoras': 'Automotriz',
  'automotoras-concesionarios': 'Automotriz',
  'autos-marcas': 'Automotriz',
  'balnearios': 'Turismo',
  'bancos': 'Finanzas',
  'cafeterias': 'Gastronomía',
  'cafes': 'Gastronomía',
  'calzado': 'Vestuario',
  'carga-laboral': 'Estilo de Vida',
  'centros-de-salud': 'Salud',
  'centros-medicos': 'Salud',
  'cervezas': 'Bebidas',
  'cines': 'Entretenimiento',
  'clinicas': 'Salud',
  'clinicas-veterinarias': 'Mascotas',
  'cochecitos': 'Infantil',
  'colchones': 'Hogar',
  'comunidades-foros': 'Internet',
  'consolas': 'Tecnología',
  'cosmeticos': 'Cuidado Personal',
  'cosmeticos-maquillaje': 'Cuidado Personal',
  'costo-de-vida-percibido': 'Economía',
  'delivery-apps': 'Delivery',
  'delivery-de-comida': 'Gastronomía',
  'deportivo': 'Deportes',
  'desodorantes': 'Cuidado Personal',
  'destinos-playa': 'Turismo',
  'destinos-urbanos': 'Turismo',
  'deuda-y-carga-financiera': 'Economía',
  'electronica-tecnologia-tiendas': 'Retail',
  'energeticas': 'Bebidas',
  'energia-diaria': 'Estilo de Vida',
  'entretenimiento-streaming': 'Entretenimiento',
  'escapadas-termas': 'Turismo',
  'estres-semanal': 'Estilo de Vida',
  'farmacias': 'Salud',
  'fast-fashion': 'Vestuario',
  'fast-food': 'Gastronomía',
  'fast-food-comida-rapida': 'Gastronomía',
  'finanzas-bancos-fintech': 'Finanzas',
  'fintech-billeteras': 'Finanzas',
  'fintech-wallets': 'Finanzas',
  'formula-alimentacion-infantil': 'Infantil',
  'futbol-chile': 'Deportes',
  'futbol-chileno': 'Deportes',
  'gaseosas': 'Bebidas',
  'gastronomia-comida-rapida': 'Gastronomía',
  'hoteles': 'Turismo',
  'institutos': 'Educación',
  'institutos-cft': 'Educación',
  'internet-hogar': 'Telecomunicaciones',
  'inversiones-brokers': 'Finanzas',
  'isapres': 'Salud',
  'lagos-y-montana': 'Turismo',
  'lavadoras': 'Electrodomésticos',
  'linea-movil': 'Telecomunicaciones',
  'marcas': 'Marcas',
  'marcas-chinas-de-autos': 'Automotriz',
  'marcas-de-autos': 'Automotriz',
  'marketplaces': 'Retail',
  'mejoramiento-del-hogar': 'Retail',
  'mensajeria': 'Logística',
  'monitores-gamer': 'Tecnología',
  'movilidad-apps-transporte': 'Transporte',
  'multitiendas': 'Retail',
  'notebooks': 'Tecnología',
  'optimismo-futuro': 'Estilo de Vida',
  'outdoor': 'Deportes',
  'panales': 'Infantil',
  'pastas-dentales': 'Cuidado Personal',
  'perfumes': 'Cuidado Personal',
  'perifericos-gamer': 'Tecnología',
  'pizza': 'Gastronomía',
  'playas': 'Turismo',
  'prensa-digital': 'Medios',
  'prensa-digital-portales': 'Medios',
  'presupuesto-del-hogar': 'Economía',
  'preuniversitarios': 'Educación',
  'proteccion-solar': 'Cuidado Personal',
  'radio': 'Medios',
  'radios': 'Medios',
  'redes-sociales': 'Internet',
  'refrigeradores': 'Electrodomésticos',
  'restaurants': 'Gastronomía',
  'retail-ropa-moda': 'Retail',
  'retail-tiendas-marketplaces': 'Retail',
  'ropa-basica': 'Vestuario',
  'salud-clinicas-farmacias': 'Salud',
  'salud-isapres-seguros': 'Salud',
  'salud-mental-autopercepcion': 'Salud',
  'seguridad-percibida': 'Estilo de Vida',
  'seguros': 'Finanzas',
  'seguros-de-salud': 'Salud',
  'shampoo': 'Cuidado Personal',
  'shopping': 'Retail',
  'skincare': 'Cuidado Personal',
  'smartphones': 'Tecnología',
  'smartwatches': 'Tecnología',
  'streaming-de-musica': 'Entretenimiento',
  'streaming-de-video': 'Entretenimiento',
  'supermercados': 'Supermercados',
  'tablets': 'Tecnología',
  'tarjetas-medios-de-pago': 'Finanzas',
  'televisores': 'Tecnología',
  'tiendas-de-mascotas': 'Mascotas',
  'tiendas-de-tecnologia': 'Retail',
  'tiendas-de-vino': 'Retail',
  'toallitas-humedas': 'Infantil',
  'tv-abierta': 'Medios',
  'tv-online': 'Entretenimiento',
  'tv-paga': 'Entretenimiento',
  'universidades': 'Educación',
  'vinas': 'Bebidas'
};

async function exportOptions() {
  console.log('Descargando opciones de la DB...');
  
  const allOptions = [];
  let from = 0;
  const step = 1000;
  
  while (true) {
    const { data: options, error } = await supabase
      .from('battle_options')
      .select(`
        id, 
        label, 
        image_url, 
        brand_domain,
        battles (
          categories (
            name,
            slug
          )
        )
      `)
      .range(from, from + step - 1);
      
    if (error) {
      console.error('Error obteniendo datos', error);
      break;
    }
    
    if (!options || options.length === 0) break;
    
    allOptions.push(...options);
    if (options.length < step) break;
    from += step;
  }
  
  console.log('Agrupando y deduplicando por Categoría -> Subcategoría -> Marca...');
  
  const uniqueRowsMap = new Map();
  
  allOptions.forEach(opt => {
    let subcategoria = 'Desconocida';
    let categoriaMacro = 'Otros';
    
    if (opt.battles) {
      const battle = Array.isArray(opt.battles) ? opt.battles[0] : opt.battles;
      if (battle && battle.categories) {
        const category = Array.isArray(battle.categories) ? battle.categories[0] : battle.categories;
        if (category) {
          subcategoria = category.name || 'Desconocida';
          if (category.slug) {
            categoriaMacro = categoryMacroMap[category.slug] || 'Otros';
          }
        }
      }
    }

    const marca = opt.label || '';
    // Key única para no repetir la misma marca en la misma subcategoría
    // (ya que puede estar en varias batallas de la misma subcategoría)
    const key = `${categoriaMacro}_${subcategoria}_${marca}`;
    
    if (!uniqueRowsMap.has(key)) {
      uniqueRowsMap.set(key, {
        "Categoria": categoriaMacro,
        "Subcategoria": subcategoria,
        "Marca": marca,
        "ID": opt.id,
        "Lienes el logo: si/no": (opt.image_url && opt.image_url.trim() !== '') ? 'si' : 'no',
        "Dominio Web": opt.brand_domain || ''
      });
    } else {
      // Tomar lo mejor de logos si antes no tenía
      const existing = uniqueRowsMap.get(key);
      if (existing["Lienes el logo: si/no"] === 'no' && opt.image_url && opt.image_url.trim() !== '') {
        existing["Lienes el logo: si/no"] = 'si';
      }
      if (!existing["Dominio Web"] && opt.brand_domain) {
        existing["Dominio Web"] = opt.brand_domain;
      }
    }
  });

  const rows = Array.from(uniqueRowsMap.values());
  
  // Ordenar por Categoría, luego Subcategoría, luego Marca
  rows.sort((a, b) => {
    if (a.Categoria !== b.Categoria) return a.Categoria.localeCompare(b.Categoria);
    if (a.Subcategoria !== b.Subcategoria) return a.Subcategoria.localeCompare(b.Subcategoria);
    return a.Marca.localeCompare(b.Marca);
  });
  
  console.log(`Se encontraron ${allOptions.length} apariciones en batallas.`);
  console.log(`Resultando en ${rows.length} marcas únicas por subcategoría.`);
  
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Opciones");
  
  const outputPath = path.join(process.cwd(), 'listado_completo_marcas.xlsx');
  XLSX.writeFile(workbook, outputPath);
  
  console.log(`Archivo generado con éxito en: ${outputPath}`);
}

exportOptions().catch(console.error);
