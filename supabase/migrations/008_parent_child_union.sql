-- Migration 008: Add union_id to parent_child to support linking children to specific marriages (multi-spouse support)
ALTER TABLE public.parent_child
ADD COLUMN IF NOT EXISTS union_id uuid REFERENCES public.unions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_parent_child_union_id ON public.parent_child(union_id);

-- Auto-backfill for existing records where parent has only 1 union
UPDATE public.parent_child pc
SET union_id = u.id
FROM public.unions u
WHERE pc.union_id IS NULL
  AND (u.partner1_id = pc.parent_id OR u.partner2_id = pc.parent_id)
  AND (
    SELECT COUNT(*) 
    FROM public.unions u2 
    WHERE u2.partner1_id = pc.parent_id OR u2.partner2_id = pc.parent_id
  ) = 1;
