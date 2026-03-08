-- Archivo generado automáticamente
-- Propósito: Borrar los 3 versus manuales restantes (Reyes del Bajón, Guerra de la Plata, Guerra de la Salud)

DELETE FROM battles
WHERE slug IN (
    'reyes_del_bajon',
    'guerra_de_la_plata',
    'guerra_de_la_salud'
);
