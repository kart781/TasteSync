-- migrate:up
-- Proof of visit, dish ratings and disclosure strikes (PRD v4, "Trust: verification and anti-fraud").
-- was_hosted keeps its name; the app labels it "comped or hosted".

CREATE TYPE proof_method AS ENUM ('receipt', 'order_screenshot');

ALTER TABLE visits
  ADD COLUMN proof_method proof_method,
  ADD COLUMN verified_at timestamptz,
  ADD CONSTRAINT visits_proof_complete CHECK ((proof_method IS NULL) = (verified_at IS NULL));

-- One proof verifies one visit by one account. Rows outlive a deleted visit (visit_id goes null)
-- so the same receipt cannot verify another visit. Only the keyed fingerprint is kept, never the text.
CREATE TABLE proofs (
  fingerprint text PRIMARY KEY,          -- HMAC of merchant + date + total + bill or order number
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  visit_id uuid REFERENCES visits(id) ON DELETE SET NULL,
  method proof_method NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX proofs_user_created ON proofs (user_id, created_at);

ALTER TABLE visit_dishes ADD COLUMN rating feeling_band;

CREATE TABLE disclosure_strikes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visit_id uuid REFERENCES visits(id) ON DELETE SET NULL,
  reason text NOT NULL CHECK (char_length(reason) <= 500),
  confirmed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX disclosure_strikes_user ON disclosure_strikes (user_id, confirmed_at);

-- migrate:down
DROP TABLE disclosure_strikes;
ALTER TABLE visit_dishes DROP COLUMN rating;
DROP TABLE proofs;
ALTER TABLE visits
  DROP CONSTRAINT visits_proof_complete,
  DROP COLUMN verified_at,
  DROP COLUMN proof_method;
DROP TYPE proof_method;
