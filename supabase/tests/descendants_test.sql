-- Test query for recursive lineage descendants and editable branch set

-- 1. Query all lineage descendants from Cụ Tổ ('00000000-0000-0000-0000-000000000001')
-- Expected: P001 (Cụ Tổ), P003 (Chi Trưởng), P005 (Chi Thứ), P007 (Cháu Đích Tôn), P008 (Nguyễn Thị Hoa), P009 (Nguyễn Văn Dũng) -> 6 persons
select person_id, full_name, generation_no, branch_code
from public.get_lineage_descendants('00000000-0000-0000-0000-000000000001') d
join public.persons p on p.id = d.person_id
order by generation_no, full_name;

-- 2. Query all lineage descendants from Chi Trưởng ('00000000-0000-0000-0000-000000000003')
-- Expected: P003 (Chi Trưởng), P007 (Cháu Đích Tôn), P008 (Nguyễn Thị Hoa) -> 3 persons
select person_id, full_name, generation_no, branch_code
from public.get_lineage_descendants('00000000-0000-0000-0000-000000000003') d
join public.persons p on p.id = d.person_id
order by generation_no, full_name;

-- 3. Query all editable set from Chi Trưởng ('00000000-0000-0000-0000-000000000003')
-- Lineage descendants (P003, P007, P008) + Spouses (P004 - Lê Thị Dâu Trưởng) -> 4 persons
select person_id, full_name, generation_no, branch_code
from public.get_branch_editable_persons('00000000-0000-0000-0000-000000000003') e
join public.persons p on p.id = e.person_id
order by generation_no, full_name;
