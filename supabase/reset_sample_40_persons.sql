-- ==============================================================================
-- SQL RESET & SEED TỪNG BƯỚC TUẦN TỰ (40 THÀNH VIÊN - 5 ĐỜI)
-- ==============================================================================

-- BƯỚC 1: XÓA SẠCH DỮ LIỆU CŨ THEO THỨ TỰ BẢNG CON TRƯỚC, BẢNG CHA SAU
UPDATE public.profiles SET person_id = null;
DELETE FROM public.family_events;
DELETE FROM public.parent_child;
DELETE FROM public.unions;
DELETE FROM public.branch_grants;
DELETE FROM public.persons;

-- BƯỚC 2: TẠO TOÀN BỘ 40 THÀNH VIÊN VÀO BẢNG PERSONS TRƯỚC
-- (Đời 1)
INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('10000000-0000-0000-0000-000000000001', 'Nguyễn Văn Khởi Tổ', 'MALE', 'DECEASED', '1905-01-10', '1980-11-20', 15, 10, false, 'Mộ táng tại đồi cội nguồn, Bắc Ninh', 'Bắc Ninh', 'Bắc Ninh', 'Cụ Khởi Tổ', 1, 'ROOT');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('10000000-0000-0000-0000-000000000002', 'Trần Thị Cả (Bà Cả)', 'FEMALE', 'DECEASED', '1908-03-15', '1985-05-10', 21, 3, false, 'Chính thất Cụ Khởi Tổ', 'Bắc Ninh', 'Bắc Ninh', 'Bà Cả sinh Chi 1 và Chi 2', 1, 'ROOT');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('10000000-0000-0000-0000-000000000003', 'Lê Thị Hai (Bà Hai)', 'FEMALE', 'DECEASED', '1915-08-20', '1992-09-12', 17, 8, false, 'Thứ thất Cụ Khởi Tổ', 'Hưng Yên', 'Hưng Yên', 'Bà Hai sinh Chi 3 và Chi 4', 1, 'ROOT');

-- (Đời 2)
INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('20000000-0000-0000-0000-000000000001', 'Nguyễn Văn Chi Trưởng', 'MALE', 'DECEASED', '1930-02-14', '2010-06-18', 7, 5, false, 'Mộ tại nghĩa trang dòng họ', 'Bắc Ninh', 'Bắc Ninh', 'Trưởng Chi 1 (Con Bà Cả)', 2, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('20000000-0000-0000-0000-000000000002', 'Phạm Thị Dâu Trưởng', 'FEMALE', 'DECEASED', '1933-04-12', '2015-08-01', 17, 6, false, 'Dâu trưởng đời 2', 'Hà Nội', 'Hà Nội', 'Vợ ông Chi Trưởng', 2, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('20000000-0000-0000-0000-000000000003', 'Nguyễn Văn Chi Hai', 'MALE', 'DECEASED', '1934-06-20', '2012-04-15', 25, 3, false, 'Giỗ ông Chi Hai', 'Bắc Ninh', 'Bắc Ninh', 'Trưởng Chi 2 (Con Bà Cả)', 2, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('20000000-0000-0000-0000-000000000004', 'Vũ Thị Dâu Hai', 'FEMALE', 'LIVING', '1938-10-05', null, null, null, false, null, 'Hà Tây', 'Hà Tây', 'Vợ ông Chi Hai', 2, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('20000000-0000-0000-0000-000000000005', 'Nguyễn Văn Chi Ba', 'MALE', 'DECEASED', '1940-01-10', '2020-02-28', 6, 2, false, 'Giỗ ông Chi Ba', 'Bắc Ninh', 'Bắc Ninh', 'Trưởng Chi 3 (Con Bà Hai)', 2, 'CHI_3');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('20000000-0000-0000-0000-000000000006', 'Hoàng Thị Dâu Ba', 'FEMALE', 'LIVING', '1945-07-22', null, null, null, false, null, 'Nam Định', 'Nam Định', 'Vợ ông Chi Ba', 2, 'CHI_3');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('20000000-0000-0000-0000-000000000007', 'Nguyễn Thị Bích (Bà Cô Đời 2)', 'FEMALE', 'LIVING', '1944-12-15', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Con gái Bà Hai', 2, 'CHI_4');

-- (Đời 3)
INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000001', 'Nguyễn Văn Phúc', 'MALE', 'LIVING', '1955-03-10', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Trưởng nam Chi 1 (Có 2 vợ)', 3, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000002', 'Đặng Thị Mai (Vợ 1)', 'FEMALE', 'DECEASED', '1957-05-18', '1998-12-04', 16, 10, false, 'Mộ tại quê nhà', 'Hà Nội', 'Hà Nội', 'Vợ cả ông Phúc', 3, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000003', 'Ngô Thị Lan (Vợ 2)', 'FEMALE', 'LIVING', '1968-09-25', null, null, null, false, null, 'Hải Dương', 'Hải Dương', 'Vợ hai ông Phúc', 3, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000004', 'Nguyễn Văn Lộc', 'MALE', 'LIVING', '1958-08-14', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Thứ nam Chi 1', 3, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000005', 'Bùi Thị Thảo', 'FEMALE', 'LIVING', '1962-02-20', null, null, null, false, null, 'Hải Phòng', 'Hải Phòng', 'Vợ ông Lộc', 3, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000006', 'Nguyễn Văn Thắng', 'MALE', 'LIVING', '1960-11-12', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Trưởng nam Chi 2', 3, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000007', 'Đỗ Thị Hằng', 'FEMALE', 'LIVING', '1963-04-30', null, null, null, false, null, 'Hà Nội', 'Hà Nội', 'Vợ ông Thắng', 3, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000008', 'Nguyễn Văn Lợi', 'MALE', 'LIVING', '1965-06-18', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Thứ nam Chi 2', 3, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000009', 'Lý Thị Cúc', 'FEMALE', 'LIVING', '1967-08-22', null, null, null, false, null, 'Bắc Giang', 'Bắc Giang', 'Vợ ông Lợi', 3, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000010', 'Nguyễn Văn Hùng', 'MALE', 'LIVING', '1970-01-15', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Trưởng nam Chi 3', 3, 'CHI_3');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000011', 'Trịnh Thị Yến', 'FEMALE', 'LIVING', '1973-10-10', null, null, null, false, null, 'Thái Bình', 'Thái Bình', 'Vợ ông Hùng', 3, 'CHI_3');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000012', 'Nguyễn Thị Tuyết', 'FEMALE', 'LIVING', '1974-05-05', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Con gái Chi 3', 3, 'CHI_3');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000013', 'Nguyễn Văn Dũng', 'MALE', 'LIVING', '1978-09-09', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Thứ nam Chi 3', 3, 'CHI_3');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('30000000-0000-0000-0000-000000000014', 'Mai Thị Thu', 'FEMALE', 'LIVING', '1982-12-01', null, null, null, false, null, 'Hà Nội', 'Hà Nội', 'Vợ ông Dũng', 3, 'CHI_3');

-- (Đời 4)
INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000001', 'Nguyễn Văn Đích Tôn (Con bà Mai)', 'MALE', 'LIVING', '1980-01-20', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Đích tôn đời 4 - Con bà Mai (Vợ 1)', 4, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000002', 'Lê Thu Hà', 'FEMALE', 'LIVING', '1983-06-15', null, null, null, false, null, 'Hà Nội', 'Hà Nội', 'Vợ anh Đích Tôn', 4, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000003', 'Nguyễn Thị Ngọc (Con bà Mai)', 'FEMALE', 'LIVING', '1984-08-10', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Con gái bà Mai (Vợ 1)', 4, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000004', 'Nguyễn Văn Minh (Con bà Lan)', 'MALE', 'LIVING', '1995-04-12', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Con trai bà Lan (Vợ 2)', 4, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000005', 'Nguyễn Thị Linh (Con bà Lan)', 'FEMALE', 'LIVING', '1998-11-20', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Con gái bà Lan (Vợ 2)', 4, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000006', 'Nguyễn Văn Hải', 'MALE', 'LIVING', '1988-03-08', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Con trai ông Lộc', 4, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000007', 'Nguyễn Thị Phương', 'FEMALE', 'LIVING', '1992-09-14', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Con gái ông Lộc', 4, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000008', 'Nguyễn Văn Tuấn', 'MALE', 'LIVING', '1987-07-07', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Con trai ông Thắng', 4, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000009', 'Trần Thúy Nga', 'FEMALE', 'LIVING', '1990-10-10', null, null, null, false, null, 'Hưng Yên', 'Hưng Yên', 'Vợ anh Tuấn', 4, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000010', 'Nguyễn Văn Nam', 'MALE', 'LIVING', '1998-05-15', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Con trai ông Hùng', 4, 'CHI_3');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000011', 'Nguyễn Thị Hương', 'FEMALE', 'LIVING', '2001-02-18', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Con gái ông Hùng', 4, 'CHI_3');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('40000000-0000-0000-0000-000000000012', 'Nguyễn Văn Long', 'MALE', 'LIVING', '2005-08-20', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Con trai ông Dũng', 4, 'CHI_3');

-- (Đời 5)
INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('50000000-0000-0000-0000-000000000001', 'Nguyễn Văn Khang (Đích Tôn Đời 5)', 'MALE', 'LIVING', '2010-09-02', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Cháu đích tôn đời 5 họ Nguyễn', 5, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('50000000-0000-0000-0000-000000000002', 'Nguyễn Diệu Anh', 'FEMALE', 'LIVING', '2015-12-10', null, null, null, false, null, 'Hà Nội', 'Bắc Ninh', 'Chắt gái đời 5 Chi 1', 5, 'CHI_1');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('50000000-0000-0000-0000-000000000003', 'Nguyễn Gia Bảo', 'MALE', 'LIVING', '2016-04-20', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Chắt trai đời 5 Chi 2', 5, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('50000000-0000-0000-0000-000000000004', 'Nguyễn Bảo Châu', 'FEMALE', 'LIVING', '2020-07-15', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Chắt gái đời 5 Chi 2', 5, 'CHI_2');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('50000000-0000-0000-0000-000000000005', 'Nguyễn Gia Huy', 'MALE', 'LIVING', '2023-01-05', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Chắt trai đời 5 Chi 3', 5, 'CHI_3');

INSERT INTO public.persons (id, full_name, gender, life_status, birth_date, death_date, death_lunar_day, death_lunar_month, death_lunar_is_leap_month, death_anniversary_note, birth_place, hometown, bio, generation_no, branch_code)
VALUES ('50000000-0000-0000-0000-000000000006', 'Nguyễn Tuệ Mẫn', 'FEMALE', 'LIVING', '2025-06-18', null, null, null, false, null, 'Bắc Ninh', 'Bắc Ninh', 'Chắt gái út đời 5 Chi 3', 5, 'CHI_3');

-- BƯỚC 3: TẠO CÁC CUỘC HÔN PHỐI (UNIONS) VỚI ĐỊNH DẠNG UUID CHUẨN (KHÔNG DÙNG KÝ TỰ 'u' Ở ĐẦU)
INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('01000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'MARRIED', '1928-02-10', 'Hôn phối Bà Cả');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('01000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'MARRIED', '1938-11-15', 'Hôn phối Bà Hai');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('02000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'MARRIED', '1953-01-15', 'Hôn phối Chi 1');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('02000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'MARRIED', '1958-05-20', 'Hôn phối Chi 2');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('02000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006', 'MARRIED', '1968-10-10', 'Hôn phối Chi 3');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('03000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'ENDED',   '1978-03-12', 'Vợ 1: Bà Đặng Thị Mai (Đã mất)');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('03000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'MARRIED', '1993-08-20', 'Vợ 2: Bà Ngô Thị Lan');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('03000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', 'MARRIED', '1985-02-14', 'Hôn phối ông Lộc');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('03000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000011', 'MARRIED', '1996-03-08', 'Hôn phối ông Hùng');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('03000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000014', 'MARRIED', '2004-09-12', 'Hôn phối ông Dũng');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('04000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'MARRIED', '2008-10-20', 'Hôn phối anh Đích Tôn');

INSERT INTO public.unions (id, partner1_id, partner2_id, status, marriage_date, note)
VALUES ('04000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000009', 'MARRIED', '2014-12-05', 'Hôn phối anh Tuấn');

-- BƯỚC 4: TẠO QUAN HỆ CHA-MẸ-CON (PARENT_CHILD)
INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'BIOLOGICAL', true, 2);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'BIOLOGICAL', true, 3);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'BIOLOGICAL', true, 4);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'BIOLOGICAL', true, 2);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000008', 'BIOLOGICAL', true, 2);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000010', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000012', 'BIOLOGICAL', true, 2);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000013', 'BIOLOGICAL', true, 3);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'BIOLOGICAL', true, 2);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 'BIOLOGICAL', true, 3);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000005', 'BIOLOGICAL', true, 4);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000006', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000007', 'BIOLOGICAL', true, 2);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000008', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000010', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000011', 'BIOLOGICAL', true, 2);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('30000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000012', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'BIOLOGICAL', true, 2);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('40000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000003', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('40000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000004', 'BIOLOGICAL', true, 2);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('40000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000005', 'BIOLOGICAL', true, 1);

INSERT INTO public.parent_child (parent_id, child_id, relationship_type, is_lineage_relation, display_order)
VALUES ('40000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000006', 'BIOLOGICAL', true, 2);

-- BƯỚC 5: CẬP NHẬT UNION_ID VÀO PARENT_CHILD NẾU CỘT NÀY ĐÃ TỒN TẠI TRÊN DATABASE
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'parent_child' AND column_name = 'union_id'
  ) THEN
    -- Gán union_id cho các quan hệ
    UPDATE public.parent_child SET union_id = '01000000-0000-0000-0000-000000000001' WHERE parent_id = '10000000-0000-0000-0000-000000000001' AND child_id IN ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003');
    UPDATE public.parent_child SET union_id = '01000000-0000-0000-0000-000000000002' WHERE parent_id = '10000000-0000-0000-0000-000000000001' AND child_id IN ('20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000007');
    UPDATE public.parent_child SET union_id = '02000000-0000-0000-0000-000000000001' WHERE parent_id = '20000000-0000-0000-0000-000000000001';
    UPDATE public.parent_child SET union_id = '02000000-0000-0000-0000-000000000002' WHERE parent_id = '20000000-0000-0000-0000-000000000003';
    UPDATE public.parent_child SET union_id = '02000000-0000-0000-0000-000000000003' WHERE parent_id = '20000000-0000-0000-0000-000000000005';
    UPDATE public.parent_child SET union_id = '03000000-0000-0000-0000-000000000001' WHERE parent_id = '30000000-0000-0000-0000-000000000001' AND child_id IN ('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003');
    UPDATE public.parent_child SET union_id = '03000000-0000-0000-0000-000000000002' WHERE parent_id = '30000000-0000-0000-0000-000000000001' AND child_id IN ('40000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000005');
    UPDATE public.parent_child SET union_id = '03000000-0000-0000-0000-000000000003' WHERE parent_id = '30000000-0000-0000-0000-000000000004';
    UPDATE public.parent_child SET union_id = '04000000-0000-0000-0000-000000000001' WHERE parent_id = '40000000-0000-0000-0000-000000000001';
    UPDATE public.parent_child SET union_id = '04000000-0000-0000-0000-000000000002' WHERE parent_id = '40000000-0000-0000-0000-000000000008';
  END IF;
END $$;

-- BƯỚC 6: GẮN ADMIN VÀO THÀNH VIÊN ĐỜI 4
UPDATE public.profiles
SET person_id = '40000000-0000-0000-0000-000000000001'
WHERE is_admin = true AND person_id IS NULL;
