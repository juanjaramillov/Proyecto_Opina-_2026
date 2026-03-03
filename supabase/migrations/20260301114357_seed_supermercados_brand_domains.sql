BEGIN;

-- Guerra del Carrito: setear brand_domain para Brandfetch/Clearbit
UPDATE public.battle_options bo
SET brand_domain = CASE lower(trim(bo.label))
  WHEN 'líder' THEN 'lider.cl'
  WHEN 'jumbo' THEN 'jumbo.cl'
  WHEN 'santa isabel' THEN 'santaisabel.cl'
  WHEN 'unimarc' THEN 'unimarc.cl'
  WHEN 'tottus' THEN 'tottus.cl'
  WHEN 'acuenta' THEN 'acuenta.cl'
  WHEN 'mayorista 10' THEN 'mayorista10.cl'
  WHEN 'alvi' THEN 'alvi.cl'
  ELSE bo.brand_domain
END
FROM public.battles b
WHERE b.id = bo.battle_id
  AND b.slug = 'guerra_del_carrito';

COMMIT;
