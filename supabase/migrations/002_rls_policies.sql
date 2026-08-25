-- 002_rls_policies.sql
-- Row Level Security policies enforcing Active user guards and Branch-level access

-- 1. Helper functions for RLS checks

-- Check if authenticated user has ACTIVE profile
create or replace function public.is_active_user(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and status = 'ACTIVE'
  );
$$;

-- Check if authenticated user is ADMIN
create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and status = 'ACTIVE' and is_admin = true
  );
$$;

-- Check if a person is in the editable set of the user (lineage descendants + spouses)
create or replace function public.can_edit_person_rls(p_person_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$
  select public.is_admin(p_user_id) or exists (
    select 1
    from public.branch_grants bg
    cross join lateral public.get_branch_editable_persons(bg.root_person_id) editable
    where bg.user_id = p_user_id
      and bg.revoked_at is null
      and editable.person_id = p_person_id
      and public.is_active_user(p_user_id)
  );
$$;

-- 2. Profiles policies
-- Active users can view profiles; users can update own basic profile; admin full access
create policy "Active users can view profiles"
  on public.profiles
  for select
  using (public.is_active_user());

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id and public.is_active_user())
  with check (auth.uid() = id and public.is_active_user());

-- 3. Persons policies
-- SELECT: Only ACTIVE users can read non-deleted persons
create policy "Active users can select persons"
  on public.persons
  for select
  using (public.is_active_user() and deleted_at is null);

-- UPDATE: User must have branch grant or be admin
create policy "Branch managers or admin can update person"
  on public.persons
  for update
  using (public.can_edit_person_rls(id) and deleted_at is null)
  with check (public.can_edit_person_rls(id) and deleted_at is null);

-- INSERT: User must be active
create policy "Active users can insert persons"
  on public.persons
  for insert
  with check (public.is_active_user());

-- 4. Parent-Child policies
create policy "Active users can select parent_child"
  on public.parent_child
  for select
  using (public.is_active_user());

create policy "Branch managers or admin can insert parent_child"
  on public.parent_child
  for insert
  with check (
    public.is_admin() or (
      public.can_edit_person_rls(parent_id) and public.can_edit_person_rls(child_id)
    )
  );

create policy "Branch managers or admin can delete parent_child"
  on public.parent_child
  for delete
  using (
    public.is_admin() or public.can_edit_person_rls(parent_id)
  );

-- 5. Unions policies
create policy "Active users can select unions"
  on public.unions
  for select
  using (public.is_active_user());

create policy "Branch managers or admin can insert unions"
  on public.unions
  for insert
  with check (
    public.is_admin() or (
      public.can_edit_person_rls(partner1_id) or public.can_edit_person_rls(partner2_id)
    )
  );

create policy "Branch managers or admin can update unions"
  on public.unions
  for update
  using (
    public.is_admin() or (
      public.can_edit_person_rls(partner1_id) or public.can_edit_person_rls(partner2_id)
    )
  );

create policy "Branch managers or admin can delete unions"
  on public.unions
  for delete
  using (
    public.is_admin() or (
      public.can_edit_person_rls(partner1_id) or public.can_edit_person_rls(partner2_id)
    )
  );

-- 6. Branch Grants policies
-- Active users can see branch grants; only Admin can insert/update
create policy "Active users can select branch grants"
  on public.branch_grants
  for select
  using (public.is_active_user());

create policy "Only admin can manage branch grants"
  on public.branch_grants
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 7. Family Events policies
-- ALL_MEMBERS: all active users
-- BRANCH: users having grant on event's root_person or descendants/admin
-- ADMIN_ONLY: only admin
create policy "Active users can view family events"
  on public.family_events
  for select
  using (
    public.is_active_user() and (
      visibility = 'ALL_MEMBERS'
      or (visibility = 'ADMIN_ONLY' and public.is_admin())
      or (visibility = 'BRANCH' and (
            public.is_admin()
            or public.can_edit_person_rls(root_person_id)
          )
      )
    )
  );

create policy "Admin or authorized users can manage family events"
  on public.family_events
  for all
  using (
    public.is_admin() or (
      public.is_active_user() and created_by = auth.uid()
    )
  )
  with check (
    public.is_admin() or (
      public.is_active_user() and created_by = auth.uid()
    )
  );

-- 8. Audit Logs policies
-- Only Admin can select audit logs; no direct mutation from client
create policy "Only admin can view audit logs"
  on public.audit_logs
  for select
  using (public.is_admin());
