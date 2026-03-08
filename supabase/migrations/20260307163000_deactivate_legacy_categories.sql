-- Deactivate legacy mega-categories from before the UI refactor
UPDATE categories
SET active = false
WHERE slug IN (
    'gastronomia-comida-rapida',
    'finanzas-bancos-fintech',
    'telecom-movil-fibra',
    'transporte-aerolineas',
    'salud-clinicas-farmacias',
    'retail-tiendas-marketplaces',
    'entretenimiento-streaming',
    'retail-ropa-moda',
    'apps-delivery',
    'salud-isapres-seguros'
);

-- Delete the battle that was mistakenly created by AI in the legacy category
DELETE FROM battles
WHERE category_id IN (
    SELECT id FROM categories WHERE slug IN (
        'gastronomia-comida-rapida',
        'finanzas-bancos-fintech',
        'telecom-movil-fibra',
        'transporte-aerolineas',
        'salud-clinicas-farmacias',
        'retail-tiendas-marketplaces',
        'entretenimiento-streaming',
        'retail-ropa-moda',
        'apps-delivery',
        'salud-isapres-seguros'
    )
);
