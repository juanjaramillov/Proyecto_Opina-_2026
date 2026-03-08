import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const domainFixes: Record<string, string> = {
  // Missing ones provided by user
  "Claro Video": "clarovideo.com",
  "Clínica Dávila": "davila.cl",
  "DIRECTV GO": "directvgo.com",
  "Farmacia Galénica": "farmaciagalenica.cl",
  "Mayorista 10": "mayorista10.cl",
  "Tarjeta Lider BCI": "liderbci.cl",
  "U. Diego Portales (UDP)": "udp.cl",
  "VTR Móvil": "vtr.com",

  // Clearly wrong ones found in the export
  "Entel": "entel.cl",
  "Ripley": "ripley.cl",
  "Banco Ripley": "bancoripley.cl",
  "Casa Silva": "casasilva.cl",
  "Claro": "clarochile.cl",
  "Consalud": "consalud.cl",
  "DercoCenter": "dercocenter.cl",
  "ENAC": "enac.cl",
  "Family Shop": "familyshop.cl",
  "Fpay": "fpay.cl",
  "Gildemeister": "gildemeister.cl",
  "HDI": "hdi.cl",
  "iMessage": "apple.com", 
  "Jahuel": "termasjahuel.cl",
  "Kaufmann": "kaufmann.cl",
  "Kig": "getkig.com", // Assuming kig delivery
  "Kunstmann": "cerveza-kunstmann.cl",
  "Lapostolle": "lapostollewines.com",
  "Lippi": "lippioutdoor.com",
  "MG": "mgmotor.cl",
  "Monster Energy": "monsterenergy.com",
  "Montes": "monteswines.com",
  "Mundo": "mundotelecomunicaciones.com",
  "Nueva Masvida": "nuevamasvida.cl",
  "Pomar": "pomar.cl",
  "Portillo": "skiportillo.com",
  "Prex": "prexcard.cl",
  "Pucón": "pucon.cl",
  "Puerto Montt": "puertomontt.cl",
  "Termas Geométricas": "termasgeometricas.cl",
  "Redcompra": "transbank.cl",
  "Rock & Pop": "rockandpop.cl",
  "Samsung Store": "samsung.com",
  "San Pedro": "sanpedro.cl",
  "Santo Tomás": "santotomas.cl",
  "Tavelli": "tavelli.cl",
  "Tenpo": "tenpo.cl",
  "Tidal": "tidal.com",
  "U. de Chile": "uchile.cl",
  "United": "united.com",
  "Valparaíso": "valparaiso.cl",
  "Virgin Mobile": "virginmobile.cl",
  "VTR": "vtr.com",
  "Iquique (Cavancha)": "iquique.cl"
};

async function run() {
    console.log('🔄 Starting manual Brandfetch domain overrides...\n');
    let successCount = 0;
    let failedCount = 0;

    for (const [label, domain] of Object.entries(domainFixes)) {
        console.log(`Updating "${label}" -> ${domain}`);
        const { error } = await supabase
            .from('battle_options')
            .update({ brand_domain: domain })
            .eq('label', label);

        if (error) {
            console.error(`❌ Failed to update ${label}:`, error);
            failedCount++;
        } else {
            console.log(`✅ Success`);
            successCount++;
        }
    }

    console.log('\n====================================');
    console.log('🎉 Manual Overrides Complete!');
    console.log(`Total Success : ${successCount}`);
    console.log(`Total Failed  : ${failedCount}`);
    console.log('====================================\n');
}

run().catch(console.error);
