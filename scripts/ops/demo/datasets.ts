export const DEMO_DATASETS = {
  telecom: {
    category: {
      id: null, // Se inyecta al crear o buscar
      name: "Telecomunicaciones Demo",
      slug: "telecom-demo",
      active: true,
      generation_mode: "ai_curated_pairs"
    },
    entities: [
      { name: "Entel", slug: "entel-demo", is_active_hub: true, is_active_versus: true },
      { name: "Movistar", slug: "movistar-demo", is_active_hub: true, is_active_versus: true },
      { name: "Claro", slug: "claro-demo", is_active_hub: true, is_active_versus: true },
      { name: "WOM", slug: "wom-demo", is_active_hub: true, is_active_versus: true }
    ]
  },
  banking: {
    category: {
      id: null,
      name: "Banca Demo",
      slug: "banking-demo",
      active: true,
      generation_mode: "ai_curated_pairs"
    },
    entities: [
      { name: "Banco de Chile", slug: "banco-de-chile-demo", is_active_hub: true, is_active_versus: true },
      { name: "Santander", slug: "santander-demo", is_active_hub: true, is_active_versus: true },
      { name: "Bci", slug: "bci-demo", is_active_hub: true, is_active_versus: true },
      { name: "Scotiabank", slug: "scotiabank-demo", is_active_hub: true, is_active_versus: true },
      { name: "BancoEstado", slug: "bancoestado-demo", is_active_hub: true, is_active_versus: true }
    ]
  }
};
