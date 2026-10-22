-- migrate:up
-- The 10 launch areas from the PRD. Boundaries are added later.
INSERT INTO areas (name) VALUES
  ('Jubilee Hills'),
  ('Banjara Hills'),
  ('Gachibowli'),
  ('Madhapur and Hitec City'),
  ('Kondapur'),
  ('Kukatpally'),
  ('Ameerpet'),
  ('Begumpet'),
  ('Secunderabad'),
  ('Old City')
ON CONFLICT (city, name) DO NOTHING;

-- migrate:down
DELETE FROM areas WHERE city = 'Hyderabad' AND boundary IS NULL;
