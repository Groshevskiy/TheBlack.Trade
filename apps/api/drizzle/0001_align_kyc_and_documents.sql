ALTER TABLE public.tb_documents
  ADD COLUMN IF NOT EXISTS kyc_case_id uuid;

CREATE TABLE IF NOT EXISTS public.tb_kyc_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  profile_json jsonb DEFAULT '{}'::jsonb,
  questionnaire_json jsonb DEFAULT '{}'::jsonb,
  requirements_json jsonb DEFAULT '{}'::jsonb,
  last_decision_reason_code text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tb_kyc_case_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_case_id uuid NOT NULL,
  actor_type text NOT NULL,
  actor_id uuid,
  event_type text NOT NULL,
  from_status text,
  to_status text,
  reason_code text,
  note text,
  payload_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
