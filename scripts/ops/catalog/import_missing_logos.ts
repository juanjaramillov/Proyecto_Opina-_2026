import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rawData = `
ABC,[Multitiendas],www.abc.cl
ADN Radio,[Radios],www.adnradio.cl
AliExpress,[Marketplaces],www.aliexpress.com
Alvi,[Supermercados],www.alvi.cl
Amazon,[Marketplaces],www.amazon.com
Amazon Music,[Streaming de música],music.amazon.com
Amphora,[Accesorios],www.amphora.cl
Apple Music,[Streaming de música],music.apple.com
Apple TV+,[Streaming de video],tv.apple.com
Aquarius,[Aguas],www.coca-cola.com
BCI,[Bancos],www.bci.cl
BCI Seguros,[Seguros de salud],www.bciseguros.cl
BMW,[Marcas de autos],www.bmw.cl
BYD,[Marcas chinas de autos],www.byd.com
Banco BICE,[Bancos],www.bice.cl
Banco Falabella,[Bancos],www.bancofalabella.cl
Banco de Chile,[Bancos],www.bancochile.cl
BancoEstado,[Bancos],www.bancoestado.cl
Banmédica,[Isapres],www.banmedica.cl
Benedictino,[Aguas],www.benedictino.cl
Bershka,[Fast fashion],www.bershka.com
BioBioChile,[Prensa digital],www.biobiochile.cl
Bruno Fritsch,[Automotoras / concesionarios],www.brunofritsch.cl
Bupa,[Centros médicos],www.bupa.cl
Burger King,[Fast food],www.burgerking.cl
CNN Chile,[Prensa digital],www.cnnchile.com
Cachantun,[Aguas],www.cachantun.cl
Café Haiti,[Cafeterías],www.cafehaiti.cl
Carolina,[Radios],www.radiocarolina.cl
Castaño,[Cafeterías],www.castano.cl
Chery,[Marcas chinas de autos],www.chery.cl
Chevrolet,[Marcas de autos],www.chevrolet.cl
Chilemat,[Mejoramiento del hogar],www.chilemat.cl
Cine Hoyts,[Cines],www.cinehoyts.cl
Cinemark,[Cines],www.cinemark.cl
Cineplanet,[Cines],www.cineplanet.cl
Cinestar,[Cines],www.cinestar.cl
Cinépolis,[Cines],www.cinepolis.cl
Claro Hogar,[Internet hogar],www.claro.cl
Claro TV,[TV paga],www.claro.cl
Claro video,[TV online],www.clarovideo.com
Colmena,[Isapres],www.colmena.cl
Columbia,[Outdoor],www.columbia.com
Consalud,[Isapres],www.consalud.cl
Consorcio,[Seguros de salud],www.consorcio.cl
Construmart,[Mejoramiento del hogar],www.construmart.cl
Cooperativa,[Radios],www.cooperativa.cl
Corona,[Ropa básica],www.corona.cl
Cruz Blanca,[Isapres],www.cruzblanca.cl
Cruz Verde,[Farmacias],www.cruzverde.cl
DGO,[TV online],www.directvgo.com
DIRECTV,[TV paga],www.directv.cl
Decathlon,[Deportivo],www.decathlon.cl
Deezer,[Streaming de música],www.deezer.com
DercoCenter,[Automotoras / concesionarios],www.dercocenter.cl
Disney+,[Streaming de video],www.disneyplus.com
Doggis,[Fast food],www.doggis.cl
Doite,[Outdoor],www.doite.cl
Dr. Simi,[Farmacias],www.drsimi.cl
Dunkin,[Cafeterías],www.dunkin.cl
Easy,[Mejoramiento del hogar],www.easy.cl
El Mostrador,[Prensa digital],www.elmostrador.cl
Emol,[Prensa digital],www.emol.com
Entel Fibra,[Internet hogar],www.entel.cl
Evian,[Aguas],www.evian.com
Falabella,[Tiendas de tecnología],www.falabella.com
Family Shop,[Ropa básica],www.familyshop.cl
Farmacias Ahumada,[Farmacias],www.farmaciasahumada.cl
Forever 21,[Fast fashion],www.forever21.com
Fracción,[Farmacias],www.farmaciafraccion.cl
GTD,[Internet hogar],www.gtd.cl
Geely,[Marcas chinas de autos],www.geely.com
Gildemeister,[Automotoras / concesionarios],www.gildemeister.cl
Great Wall,[Marcas chinas de autos],www.gwm-global.com
H&M,[Ropa básica],www.hm.com
HDI Seguros,[Seguros de salud],www.hdi.cl
Haval,[Marcas chinas de autos],www.gwm.cl
Hites,[Multitiendas],www.hites.com
Hyundai,[Marcas de autos],www.hyundai.cl
Imperial,[Mejoramiento del hogar],www.imperial.cl
Itaú,[Bancos],www.itau.cl
Spotify,[Streaming de música],www.spotify.com
Starbucks,[Cafeterías],www.starbucks.cl
Subway,[Fast food],www.subway.com
Suzuki,[Marcas de autos],www.suzuki.cl
Tottus,[Supermercados],www.tottus.cl
Toyota,[Marcas de autos],www.toyota.cl
Unimarc,[Supermercados],www.unimarc.cl
VTR,[Internet hogar],www.vtr.com
Vital,[Aguas],www.vitalagua.cl
YouTube Music,[Streaming de música],music.youtube.com
Zara,[Fast fashion],www.zara.com
Zurich,[Seguros de salud],www.zurich.cl
aCuenta,[Supermercados],www.acuenta.cl
adidas,[Deportivo],www.adidas.cl
`;

async function run() {
    const lines = rawData.trim().split('\n');
    let successCount = 0;
    let failCount = 0;

    for (const line of lines) {
        if (!line.trim() || line.startsWith('Marca,')) continue;
        const parts = line.split(',');
        if (parts.length >= 3) {
            const label = parts[0].trim();
            const domain = parts[2].trim();

            if (domain) {
                console.log(`Updating ${label} -> ${domain}`);
                const { error, count } = await supabase
                    .from('battle_options')
                    .update({ brand_domain: domain })
                    .eq('label', label);

                if (error) {
                    console.error(`Failed to update ${label}: ${error.message}`);
                    failCount++;
                } else {
                    successCount++;
                }
            }
        }
    }
    console.log(`\nFinished: ${successCount} updated successfully, ${failCount} failed.`);
}

run().catch(console.error);
