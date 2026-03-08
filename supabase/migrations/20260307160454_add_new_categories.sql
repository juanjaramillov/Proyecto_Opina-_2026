-- Archivo generado automáticamente
-- Propósito: Agregar las nuevas categorías solicitadas (Automotoras, Belleza, Educación)

INSERT INTO categories (id, name, slug)
VALUES
    ('eec2e4ec-180e-4ec2-82d3-8f5fd5b65326', 'Automotoras (concesionarias)', 'automotoras'),
    ('5d32c667-260c-4517-9c58-b7a836b4598b', 'Cosméticos / Maquillaje', 'cosmeticos'),
    ('84abd76d-9523-40a6-8a17-f09d4931d965', 'Skincare (cuidado de la piel)', 'skincare'),
    ('9152dbbc-eafe-4a29-b8ff-2f9f765c8518', 'Perfumes', 'perfumes'),
    ('2d37b39b-8c97-4c87-bdb6-08be0525ee26', 'Universidades', 'universidades'),
    ('8b5f0266-3899-42f2-8190-31da2217ab2b', 'Institutos / CFT', 'institutos'),
    ('30581960-05e8-44bf-8875-b93aca62b36d', 'Preuniversitarios', 'preuniversitarios')
ON CONFLICT (slug) DO NOTHING;