-- 007_mvp2_rls_policies.sql
-- Row Level Security policies and security functions for MVP2 tables

-- 1. Person Claim Requests
-- SELECT: Admin can view all; Active member can view their own
create policy "Users can view own claim requests or admin view all"
  on public.person_claim_requests
  for select
  using (
    public.is_admin() or (
      public.is_active_user() and user_id = auth.uid()
    )
  );

-- INSERT: Active user can create claim requests for themselves
create policy "Active users can insert own claim requests"
  on public.person_claim_requests
  for insert
  with check (
    public.is_active_user() and user_id = auth.uid()
  );

-- UPDATE/DELETE: Only admin can approve/reject/update claims
create policy "Only admin can update or delete claim requests"
  on public.person_claim_requests
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 2. Profile Change Requests
-- SELECT: Admin can view all; Active member can view their own
create policy "Users can view own change requests or admin view all"
  on public.profile_change_requests
  for select
  using (
    public.is_admin() or (
      public.is_active_user() and user_id = auth.uid()
    )
  );

-- INSERT: Active user can create change requests for themselves
create policy "Active users can insert own change requests"
  on public.profile_change_requests
  for insert
  with check (
    public.is_active_user() and user_id = auth.uid()
  );

-- UPDATE/DELETE: Only admin can approve/reject
create policy "Only admin can update or delete change requests"
  on public.profile_change_requests
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Password Reset Requests
-- Note: Password reset requests are submitted via trusted server action / service role with CAPTCHA validation.
-- Direct client access is restricted.
create policy "Only admin can view and handle password reset requests"
  on public.password_reset_requests
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 4. External Family Resources & Albums
-- SELECT: Active users can view published non-deleted resources; Admin can view all non-deleted
create policy "Active users can view published family resources"
  on public.family_resources
  for select
  using (
    (public.is_admin() and deleted_at is null)
    or (public.is_active_user() and is_published = true and deleted_at is null)
  );

-- ALL: Only admin can manage family resources
create policy "Only admin can manage family resources"
  on public.family_resources
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Event Attendees (RSVPs)
-- SELECT: Active users can view RSVPs of accessible events
create policy "Active users can view event attendees"
  on public.event_attendees
  for select
  using (
    public.is_active_user() and exists (
      select 1 from public.family_events fe
      where fe.id = event_id
        and (
          fe.visibility = 'ALL_MEMBERS'
          or (fe.visibility = 'ADMIN_ONLY' and public.is_admin())
          or (fe.visibility = 'BRANCH' and (
                public.is_admin()
                or public.can_edit_person_rls(fe.root_person_id)
              )
          )
        )
    )
  );

-- INSERT/UPDATE/DELETE: Active users can manage their own RSVP; Admin can manage all
create policy "Users can manage own RSVP or admin manage all"
  on public.event_attendees
  for all
  using (
    public.is_admin() or (
      public.is_active_user() and user_id = auth.uid()
    )
  )
  with check (
    public.is_admin() or (
      public.is_active_user() and user_id = auth.uid()
    )
  );

-- 6. Notifications (In-app)
-- SELECT: Users can only view their own notifications
create policy "Users can view own notifications"
  on public.notifications
  for select
  using (
    auth.uid() = user_id and public.is_active_user()
  );

-- UPDATE: Users can mark their own notifications as read
create policy "Users can update own notifications"
  on public.notifications
  for update
  using (
    auth.uid() = user_id and public.is_active_user()
  )
  with check (
    auth.uid() = user_id and public.is_active_user()
  );

-- INSERT: Admin or system server actions can insert notifications
create policy "Admin or system can insert notifications"
  on public.notifications
  for insert
  with check (
    public.is_admin() or public.is_active_user()
  );

-- 7. Notification Preferences
-- SELECT & UPDATE: Users manage only their own preferences; Admin can view all
create policy "Users manage own notification preferences"
  on public.notification_preferences
  for all
  using (
    public.is_admin() or (auth.uid() = user_id and public.is_active_user())
  )
  with check (
    public.is_admin() or (auth.uid() = user_id and public.is_active_user())
  );

-- 8. Browser Push Subscriptions
-- SELECT & ALL: Users manage only their own push subscriptions
create policy "Users manage own push subscriptions"
  on public.push_subscriptions
  for all
  using (
    auth.uid() = user_id and public.is_active_user()
  )
  with check (
    auth.uid() = user_id and public.is_active_user()
  );

-- 9. Contribution Settings
-- SELECT: Active users can view active contribution settings
create policy "Active users can view contribution settings"
  on public.contribution_settings
  for select
  using (
    public.is_admin() or (public.is_active_user() and is_active = true)
  );

-- ALL: Only admin can manage contribution settings
create policy "Only admin can manage contribution settings"
  on public.contribution_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 10. Contributions
-- SELECT: Active users can view non-deleted contributions
create policy "Active users can view contributions"
  on public.contributions
  for select
  using (
    public.is_active_user() and deleted_at is null
  );

-- INSERT/UPDATE/DELETE: Only admin can manage (CRUD/Import) contributions
create policy "Only admin can manage contributions"
  on public.contributions
  for all
  using (public.is_admin())
  with check (public.is_admin());
