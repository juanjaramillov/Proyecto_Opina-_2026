-- Adición de trazabilidad editorial a current_topics
ALTER TABLE current_topics 
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- En el módulo Actualidad las referencias a estatus se ampliarán:
-- 'detected' | 'draft' | 'review' | 'approved' | 'published' | 'rejected' | 'archived'
-- Dado que current_topics.status es de tipo text sin una restricción CHECK,
-- no es necesario modificar el schema de la tabla para soportar estos nuevos strings de estado.
