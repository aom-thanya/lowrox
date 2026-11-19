-- ============================================================
-- OPTIONAL clean-up: drop the unprefixed tables (users, events, ...) that
-- duplicate the ms_/txn_ schema. Nothing in the app or the ETL reads them.
-- Stops without dropping anything if any of them still holds rows.
-- ไม่บังคับ: ลบตารางชุดที่ไม่มี prefix ซึ่งซ้ำกับ ms_/txn_
-- ถ้าตารางไหนยังมีข้อมูล สคริปต์จะหยุดและไม่ลบอะไรเลย
-- ============================================================
BEGIN;
DO $$
DECLARE t text; n bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY['group_comments', 'event_participants', 'events', 'user_history_level',
                           'user_goals', 'user_medical_concerns', 'user_constraints',
                           'user_demographics', 'users']
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM public.%I', t) INTO n;
      IF n > 0 THEN RAISE EXCEPTION 'public.% still has % rows — not dropping anything', t, n; END IF;
    END IF;
  END LOOP;
  FOREACH t IN ARRAY ARRAY['group_comments', 'event_participants', 'events', 'user_history_level',
                           'user_goals', 'user_medical_concerns', 'user_constraints',
                           'user_demographics', 'users']
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', t);
  END LOOP;
END $$;
COMMIT;
