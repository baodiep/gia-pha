-- Seed data for Gia Pha MVP 1 development and testing
-- Cây 3 đời, 2 chi, có vợ/chồng, có người đã mất, ngày giỗ âm/dương, và sự kiện mẫu.

-- Clear existing seed data if needed (safe reset)
delete from public.family_events;
delete from public.unions;
delete from public.parent_child;
delete from public.branch_grants;
delete from public.profiles;
delete from public.persons;

-- Fixed UUIDs for predictable testing
-- Đời 1: Cụ Tổ
-- P001: Nguyễn Văn Tổ (Đã mất, Trưởng tộc Đời 1)
-- P002: Trần Thị Tổ Mẫu (Đã mất, Vợ Cụ Tổ)

-- Đời 2:
-- P003: Nguyễn Văn Nhánh 1 (Trưởng Chi 1 - Đời 2, Sống)
-- P004: Lê Thị Dâu 1 (Vợ P003)
-- P005: Nguyễn Văn Nhánh 2 (Trưởng Chi 2 - Đời 2, Sống)
-- P006: Phạm Thị Dâu 2 (Vợ P005)

-- Đời 3:
-- P007: Nguyễn Văn Cháu 1.1 (Con trai Chi 1 - Đời 3)
-- P008: Nguyễn Thị Cháu 1.2 (Con gái Chi 1 - Đời 3)
-- P009: Nguyễn Văn Cháu 2.1 (Con trai Chi 2 - Đời 3)

insert into public.persons (
  id, full_name, gender, life_status, birth_date, death_date,
  death_lunar_day, death_lunar_month, death_lunar_is_leap_month,
  death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code
) values
  ('00000000-0000-0000-0000-000000000001', 'Nguyễn Văn Cụ Tổ', 'MALE', 'DECEASED', '1920-01-15', '1995-10-20', 27, 8, false, 'Giỗ chính hàng năm tại nhà thờ tổ họ Nguyễn', 'Hà Nội', 'Bắc Ninh', 'Cụ tổ lập nghiệp và khởi dựng dòng họ', 1, 'ROOT'),
  ('00000000-0000-0000-0000-000000000002', 'Trần Thị Cụ Bà', 'FEMALE', 'DECEASED', '1922-03-10', '2000-05-12', 9, 4, false, 'Giỗ Cụ Bà', 'Bắc Ninh', 'Bắc Ninh', 'Chính thất Cụ Tổ', 1, 'ROOT'),
  
  ('00000000-0000-0000-0000-000000000003', 'Nguyễn Văn Chi Trưởng', 'MALE', 'LIVING', '1950-06-20', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Trưởng chi 1 họ Nguyễn đời thứ 2', 2, 'CHI_1'),
  ('00000000-0000-0000-0000-000000000004', 'Lê Thị Dâu Trưởng', 'FEMALE', 'LIVING', '1953-08-15', null, null, null, false, null, 'Hà Tây', 'Hà Tây', 'Vợ ông Nguyễn Văn Chi Trưởng', 2, 'CHI_1'),
  
  ('00000000-0000-0000-0000-000000000005', 'Nguyễn Văn Chi Thứ', 'MALE', 'LIVING', '1955-09-12', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Trưởng chi 2 họ Nguyễn đời thứ 2', 2, 'CHI_2'),
  ('00000000-0000-0000-0000-000000000006', 'Phạm Thị Dâu Thứ', 'FEMALE', 'LIVING', '1958-11-25', null, null, null, false, null, 'Hải Phòng', 'Hải Phòng', 'Vợ ông Nguyễn Văn Chi Thứ', 2, 'CHI_2'),

  ('00000000-0000-0000-0000-000000000007', 'Nguyễn Văn Đích Tôn', 'MALE', 'LIVING', '1980-02-10', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Cháu đích tôn chi 1 đời thứ 3', 3, 'CHI_1'),
  ('00000000-0000-0000-0000-000000000008', 'Nguyễn Thị Hoa', 'FEMALE', 'LIVING', '1985-07-22', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Con gái chi 1 đời thứ 3', 3, 'CHI_1'),
  ('00000000-0000-0000-0000-000000000009', 'Nguyễn Văn Dũng', 'MALE', 'LIVING', '1988-12-05', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Con trai chi 2 đời thứ 3', 3, 'CHI_2');

-- Unions (Hôn phối)
insert into public.unions (id, partner1_id, partner2_id, status, marriage_date, note) values
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'MARRIED', '1945-02-15', 'Hôn phối đời 1'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'MARRIED', '1975-10-10', 'Hôn phối chi 1'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'MARRIED', '1982-04-30', 'Hôn phối chi 2');

-- Parent-Child relationships
-- Cụ Tổ (P001) & Cụ Bà (P002) -> Chi Trưởng (P003), Chi Thứ (P005)
-- Lineage relation đánh dấu trên nhánh trực hệ nam dòng họ (hoặc cha ruột dòng tộc)
insert into public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order) values
  -- Đời 1 -> Đời 2 (Chi 1)
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'BIOLOGICAL', true, 1),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'BIOLOGICAL', false, 1),
  
  -- Đời 1 -> Đời 2 (Chi 2)
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'BIOLOGICAL', true, 2),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'BIOLOGICAL', false, 2),

  -- Đời 2 (Chi 1) -> Đời 3 (P007, P008)
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'BIOLOGICAL', true, 1),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'BIOLOGICAL', false, 1),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'BIOLOGICAL', true, 2),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', 'BIOLOGICAL', false, 2),

  -- Đời 2 (Chi 2) -> Đời 3 (P009)
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'BIOLOGICAL', true, 1),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', 'BIOLOGICAL', false, 1);

-- Function helper for editable set (Lineage descendants + their spouses)
create or replace function public.get_branch_editable_persons(p_root_person_id uuid)
returns table(person_id uuid)
language sql
stable
security invoker
as $$
  with lineage as (
    select person_id from public.get_lineage_descendants(p_root_person_id)
  ),
  spouses as (
    select u.partner2_id as person_id
    from public.unions u
    join lineage l on u.partner1_id = l.person_id
    union
    select u.partner1_id as person_id
    from public.unions u
    join lineage l on u.partner2_id = l.person_id
  )
  select person_id from lineage
  union
  select person_id from spouses;
$$;
