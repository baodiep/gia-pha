-- 008_family_import_transaction.sql
-- Function to perform transactional family batch import with full rollback on error

create or replace function public.import_family_batch(
  p_batch_id uuid,
  p_actor_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_persons jsonb;
  v_p jsonb;
  v_inserted_id uuid;
  v_external_id text;
  v_person_map jsonb := '{}'::jsonb; -- map external_id -> generated uuid
  v_created_persons_count integer := 0;
  v_created_relationships_count integer := 0;
  v_created_unions_count integer := 0;
  v_father_ext text;
  v_mother_ext text;
  v_father_uuid uuid;
  v_mother_uuid uuid;
  v_child_uuid uuid;
  v_spouse_arr jsonb;
  v_sp_ext text;
  v_partner1_uuid uuid;
  v_partner2_uuid uuid;
  v_existing_union_count integer;
  v_existing_pc_count integer;
begin
  -- 1. Verify caller is active admin
  if not public.is_admin(p_actor_id) then
    raise exception 'Unauthorized: Only Admin can perform family batch import';
  end if;

  v_persons := p_payload->'persons';
  if v_persons is null or jsonb_array_length(v_persons) = 0 then
    raise exception 'Empty import payload';
  end if;

  -- 2. Pass 1: Insert all persons and build mapping (external_id -> uuid)
  for v_p in select * from jsonb_array_elements(v_persons)
  loop
    v_external_id := v_p->>'externalId';
    if v_external_id is null or v_external_id = '' then
      raise exception 'Missing externalId in person item';
    end if;

    insert into public.persons (
      full_name,
      gender,
      life_status,
      birth_date,
      death_date,
      death_lunar_day,
      death_lunar_month,
      death_lunar_is_leap_month,
      death_anniversary_note,
      birth_place,
      hometown,
      bio,
      generation_no,
      branch_code
    ) values (
      v_p->>'fullName',
      coalesce((v_p->>'gender')::public.gender_type, 'UNKNOWN'),
      coalesce((v_p->>'lifeStatus')::public.life_status_type, 'LIVING'),
      nullif(v_p->>'birthDate', '')::date,
      nullif(v_p->>'deathDate', '')::date,
      nullif(v_p->>'deathLunarDay', '')::smallint,
      nullif(v_p->>'deathLunarMonth', '')::smallint,
      coalesce((v_p->>'deathLunarIsLeapMonth')::boolean, false),
      nullif(v_p->>'deathAnniversaryNote', ''),
      nullif(v_p->>'birthPlace', ''),
      nullif(v_p->>'hometown', ''),
      nullif(v_p->>'bio', ''),
      nullif(v_p->>'generationNo', '')::integer,
      nullif(v_p->>'branchCode', '')
    )
    returning id into v_inserted_id;

    v_person_map := jsonb_set(v_person_map, array[v_external_id], to_jsonb(v_inserted_id::text));
    v_created_persons_count := v_created_persons_count + 1;
  end loop;

  -- 3. Pass 2: Connect parent-child relationships
  for v_p in select * from jsonb_array_elements(v_persons)
  loop
    v_external_id := v_p->>'externalId';
    v_child_uuid := (v_person_map->>v_external_id)::uuid;

    -- Father relation (Lineage)
    v_father_ext := v_p->>'fatherExternalId';
    if v_father_ext is not null and v_father_ext <> '' then
      v_father_uuid := (v_person_map->>v_father_ext)::uuid;
      if v_father_uuid is not null and v_father_uuid <> v_child_uuid then
        select count(*) into v_existing_pc_count
        from public.parent_child
        where parent_id = v_father_uuid and child_id = v_child_uuid;

        if v_existing_pc_count = 0 then
          insert into public.parent_child (
            parent_id,
            child_id,
            relationship_type,
            is_lineage_relation
          ) values (
            v_father_uuid,
            v_child_uuid,
            'BIOLOGICAL',
            true
          );
          v_created_relationships_count := v_created_relationships_count + 1;
        end if;
      end if;
    end if;

    -- Mother relation
    v_mother_ext := v_p->>'motherExternalId';
    if v_mother_ext is not null and v_mother_ext <> '' then
      v_mother_uuid := (v_person_map->>v_mother_ext)::uuid;
      if v_mother_uuid is not null and v_mother_uuid <> v_child_uuid then
        select count(*) into v_existing_pc_count
        from public.parent_child
        where parent_id = v_mother_uuid and child_id = v_child_uuid;

        if v_existing_pc_count = 0 then
          insert into public.parent_child (
            parent_id,
            child_id,
            relationship_type,
            is_lineage_relation
          ) values (
            v_mother_uuid,
            v_child_uuid,
            'BIOLOGICAL',
            false
          );
          v_created_relationships_count := v_created_relationships_count + 1;
        end if;
      end if;
    end if;
  end loop;

  -- 4. Pass 3: Connect spouse unions
  for v_p in select * from jsonb_array_elements(v_persons)
  loop
    v_external_id := v_p->>'externalId';
    v_partner1_uuid := (v_person_map->>v_external_id)::uuid;
    v_spouse_arr := v_p->'spouseExternalIds';

    if v_spouse_arr is not null and jsonb_array_length(v_spouse_arr) > 0 then
      for v_sp_ext in select jsonb_array_elements_text(v_spouse_arr)
      loop
        v_partner2_uuid := (v_person_map->>v_sp_ext)::uuid;
        if v_partner2_uuid is not null and v_partner1_uuid <> v_partner2_uuid then
          select count(*) into v_existing_union_count
          from public.unions
          where (partner1_id = v_partner1_uuid and partner2_id = v_partner2_uuid)
             or (partner1_id = v_partner2_uuid and partner2_id = v_partner1_uuid);

          if v_existing_union_count = 0 then
            insert into public.unions (
              partner1_id,
              partner2_id,
              status
            ) values (
              v_partner1_uuid,
              v_partner2_uuid,
              'MARRIED'
            );
            v_created_unions_count := v_created_unions_count + 1;
          end if;
        end if;
      end loop;
    end if;
  end loop;

  -- 5. Audit Log Entry
  insert into public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value
  ) values (
    p_actor_id,
    'IMPORT_FAMILY_BATCH',
    'BATCH',
    p_batch_id::text,
    null,
    jsonb_build_object(
      'batch_id', p_batch_id,
      'persons_count', v_created_persons_count,
      'relationships_count', v_created_relationships_count,
      'unions_count', v_created_unions_count
    )
  );

  return jsonb_build_object(
    'success', true,
    'batch_id', p_batch_id,
    'created_persons', v_created_persons_count,
    'created_relationships', v_created_relationships_count,
    'created_unions', v_created_unions_count
  );
end;
$$;
