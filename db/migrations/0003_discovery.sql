-- migrate:up
-- Discover and location (PRD v3.2).

-- Area centres label the location bar and order the area picker.
ALTER TABLE areas ADD COLUMN center geography(Point, 4326);
UPDATE areas SET center = ST_MakePoint(v.lng, v.lat)::geography
FROM (VALUES  -- approximate centres
  ('Jubilee Hills', 17.4325, 78.4073),
  ('Banjara Hills', 17.4156, 78.4347),
  ('Gachibowli', 17.4401, 78.3489),
  ('Madhapur and Hitec City', 17.4483, 78.3915),
  ('Kondapur', 17.4698, 78.3578),
  ('Kukatpally', 17.4849, 78.4138),
  ('Ameerpet', 17.4375, 78.4483),
  ('Begumpet', 17.4447, 78.4664),
  ('Secunderabad', 17.4399, 78.4983),
  ('Old City', 17.3616, 78.4747)
) AS v(name, lat, lng)
WHERE areas.city = 'Hyderabad' AND areas.name = v.name;

-- price_band: 1 = up to ₹300 per person, 2 = up to ₹700, 3 = up to ₹1,500, 4 = above.
-- Set at seeding or review; the nightly job replaces it once 3 prices are logged.
ALTER TABLE places ADD COLUMN price_band smallint CHECK (price_band BETWEEN 1 AND 4);
-- null = not known yet; Order in shows places where this is not false.
ALTER TABLE places ADD COLUMN offers_delivery boolean;

-- Shelf inputs written by the nightly job.
ALTER TABLE place_scores
  ADD COLUMN heat numeric(6,2) NOT NULL DEFAULT 0,
  ADD COLUMN visitors_14d integer NOT NULL DEFAULT 0,
  ADD COLUMN median_price integer;

-- migrate:down
ALTER TABLE place_scores DROP COLUMN heat, DROP COLUMN visitors_14d, DROP COLUMN median_price;
ALTER TABLE places DROP COLUMN price_band, DROP COLUMN offers_delivery;
ALTER TABLE areas DROP COLUMN center;
