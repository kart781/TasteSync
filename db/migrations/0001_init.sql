-- migrate:up
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE visit_mode AS ENUM ('dine_in', 'takeaway', 'delivery');
CREATE TYPE feeling_band AS ENUM ('loved', 'fine', 'not_for_me');
CREATE TYPE audience AS ENUM ('public', 'friends', 'circle', 'private');
CREATE TYPE experience_kind AS ENUM ('dine_in', 'delivery');  -- takeaway counts as delivery

CREATE TABLE areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL DEFAULT 'Hyderabad',
  boundary geography(MultiPolygon, 4326),
  UNIQUE (city, name)
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  firebase_uid text UNIQUE NOT NULL,    -- Firebase phone auth owns the number itself
  phone_hash text UNIQUE NOT NULL,      -- HMAC-SHA256 with a server secret; for opt-in contact matching
  birth_date date NOT NULL,
  home_area_id uuid REFERENCES areas(id),
  top_four uuid[] NOT NULL DEFAULT '{}' CHECK (cardinality(top_four) <= 4),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE follows (
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
CREATE INDEX follows_followee_idx ON follows (followee_id);

CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);

CREATE TABLE places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand_id uuid REFERENCES brands(id),
  area_id uuid REFERENCES areas(id),
  address text,
  landmark text,
  geog geography(Point, 4326) NOT NULL,
  cuisines text[] NOT NULL DEFAULT '{}',
  is_delivery_only boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'open', 'closed', 'moved', 'merged')),
  merged_into uuid REFERENCES places(id),
  added_by uuid REFERENCES users(id) ON DELETE SET NULL,
  owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,  -- set when an owner flags "this is my place"
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX places_geog_idx ON places USING gist (geog);
CREATE INDEX places_name_trgm ON places USING gin (name gin_trgm_ops);
CREATE INDEX places_area_idx ON places (area_id) WHERE status = 'open';

CREATE TABLE dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id),
  name text NOT NULL,
  UNIQUE (place_id, name)
);

CREATE TABLE visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id),
  visited_on date NOT NULL DEFAULT current_date,
  mode visit_mode NOT NULL DEFAULT 'dine_in',
  experience experience_kind GENERATED ALWAYS AS (
    CASE WHEN mode = 'dine_in' THEN 'dine_in'::experience_kind
         ELSE 'delivery'::experience_kind END) STORED,
  feeling feeling_band NOT NULL,
  audience audience NOT NULL DEFAULT 'friends',
  note text CHECK (char_length(note) <= 1000),
  price_per_person integer CHECK (price_per_person >= 0),  -- rupees
  was_hosted boolean NOT NULL DEFAULT false,
  photo_keys text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX visits_user_date_idx ON visits (user_id, visited_on DESC);
CREATE INDEX visits_place_idx ON visits (place_id, created_at DESC);

-- Only for delivery and takeaway visits; every check is optional.
CREATE TABLE delivery_checks (
  visit_id uuid PRIMARY KEY REFERENCES visits(id) ON DELETE CASCADE,
  arrival_temp text CHECK (arrival_temp IN ('hot', 'warm', 'cold')),
  packaging text CHECK (packaging IN ('held', 'some_spill', 'leaked')),
  order_correct boolean,
  vs_dine_in text CHECK (vs_dine_in IN ('better', 'same', 'worse', 'not_tried')),
  channel text CHECK (channel IN ('swiggy', 'zomato', 'direct', 'other')),
  minutes_to_arrive smallint CHECK (minutes_to_arrive BETWEEN 0 AND 300)  -- context only
);

CREATE TABLE visit_dishes (
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  dish_id uuid NOT NULL REFERENCES dishes(id),
  is_standout boolean NOT NULL DEFAULT false,
  PRIMARY KEY (visit_id, dish_id)
);

CREATE TABLE visit_companions (
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  companion_id uuid REFERENCES users(id) ON DELETE CASCADE,
  invite_phone_hash text,               -- companion not yet on the app
  CHECK ((companion_id IS NULL) <> (invite_phone_hash IS NULL))
);
CREATE UNIQUE INDEX visit_companions_uniq
  ON visit_companions (visit_id, coalesce(companion_id::text, invite_phone_hash));

-- One row per user, place and experience: the place's position in that list.
CREATE TABLE rankings (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id),
  experience experience_kind NOT NULL,
  band feeling_band NOT NULL,
  position integer CHECK (position >= 1),  -- 1 = best in band; null = not yet compared
  score numeric(3,1) CHECK (score BETWEEN 0 AND 10),  -- recomputed when the band changes
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, place_id, experience),
  CONSTRAINT rankings_position_uniq UNIQUE (user_id, experience, band, position)
    DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX rankings_place_idx ON rankings (place_id);

-- Every answer is kept, so rankings can be rebuilt and the method tuned.
CREATE TABLE comparisons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  experience experience_kind NOT NULL,
  new_place_id uuid NOT NULL REFERENCES places(id),
  other_place_id uuid NOT NULL REFERENCES places(id),
  outcome text NOT NULL CHECK (outcome IN ('better', 'worse', 'tie', 'skip')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comparisons_visit_idx ON comparisons (visit_id);

CREATE TABLE lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  circle_id uuid,                        -- set for circle shared lists
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'custom' CHECK (kind IN ('want_to_try', 'custom')),
  audience audience NOT NULL DEFAULT 'friends',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX one_want_to_try_per_user ON lists (owner_id) WHERE kind = 'want_to_try';

CREATE TABLE list_items (
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id),
  added_by uuid REFERENCES users(id) ON DELETE SET NULL,
  note text,
  sort_order integer NOT NULL DEFAULT 0,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (list_id, place_id)
);

CREATE TABLE circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  admin_id uuid NOT NULL REFERENCES users(id),  -- handed to another member before account deletion
  invite_code text UNIQUE NOT NULL,
  invite_expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE lists ADD CONSTRAINT lists_circle_fk
  FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE CASCADE;

CREATE TABLE circle_members (
  circle_id uuid NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (circle_id, user_id)
);
CREATE INDEX circle_members_user_idx ON circle_members (user_id);

-- Which circles a circle-audience visit was shared to.
CREATE TABLE visit_circles (
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  circle_id uuid NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  PRIMARY KEY (visit_id, circle_id)
);
CREATE INDEX visit_circles_circle_idx ON visit_circles (circle_id);

CREATE TABLE polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  experience experience_kind NOT NULL,  -- eat-out or order-in poll
  title text NOT NULL,
  closes_at timestamptz NOT NULL,
  winner_place_id uuid REFERENCES places(id),
  closed_at timestamptz
);

CREATE TABLE poll_options (
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id),
  PRIMARY KEY (poll_id, place_id)
);

CREATE TABLE poll_votes (
  poll_id uuid NOT NULL,
  place_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (poll_id, place_id, user_id),  -- approval voting: one row per acceptable place
  FOREIGN KEY (poll_id, place_id) REFERENCES poll_options(poll_id, place_id) ON DELETE CASCADE
);

CREATE TABLE likes (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, visit_id)
);

CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz
);

-- Computed nightly for pairs with 3 or more shared places; user_a < user_b.
CREATE TABLE taste_matches (
  user_a uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_places integer NOT NULL CHECK (shared_places >= 3),
  match numeric(4,3) NOT NULL CHECK (match BETWEEN 0 AND 1),
  computed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_a, user_b),
  CHECK (user_a < user_b)
);

-- Nightly output; one row per place and experience.
CREATE TABLE place_scores (
  place_id uuid NOT NULL REFERENCES places(id),
  experience experience_kind NOT NULL,
  rankings_count integer NOT NULL,
  city_score numeric(3,1) NOT NULL,
  arrives_hot_pct smallint,      -- delivery rows with 5+ checked visits only
  packaging_holds_pct smallint,
  orders_correct_pct smallint,
  travels_well_pct smallint,
  computed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (place_id, experience)
);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  visit_id uuid REFERENCES visits(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  place_id uuid REFERENCES places(id),
  reason text NOT NULL
    CHECK (reason IN ('duplicate_place', 'wrong_info', 'harassment', 'false_claim', 'spam', 'other')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE blocks (
  blocker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('block', 'mute')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX blocks_blocked_idx ON blocks (blocked_id);

CREATE TABLE push_tokens (
  token text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX push_tokens_user_idx ON push_tokens (user_id);

-- Background work, claimed with FOR UPDATE SKIP LOCKED by the worker.
CREATE TABLE jobs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  run_at timestamptz NOT NULL DEFAULT now(),
  attempts smallint NOT NULL DEFAULT 0,
  last_error text,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX jobs_due_idx ON jobs (run_at) WHERE done_at IS NULL;

-- Product analytics for the beta; user_id is cleared when an account is deleted.
CREATE TABLE events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX events_name_time_idx ON events (name, created_at);

-- migrate:down
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
