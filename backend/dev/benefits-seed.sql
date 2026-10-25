-- OPTIONAL LOCAL DEVELOPMENT DATA. Apply after Liquibase, never on production startup.
-- Stable IDs and a once-only opening ledger entry preserve spending on reruns.
BEGIN;
-- Countries (including required flag URLs) are production Liquibase reference
-- data. Reuse them by ISO code below rather than inserting incomplete rows.

INSERT INTO app_user(id,first_name,last_name,username,email,timezone)
VALUES ('b0000000-0000-4000-8000-000000000001','Benefits','Sample Learner',
        'benefits.sample','benefits.sample@example.test','Europe/Zagreb')
ON CONFLICT (id) DO NOTHING;
INSERT INTO wallet(user_id) VALUES ('b0000000-0000-4000-8000-000000000001')
ON CONFLICT (user_id) DO NOTHING;
SELECT id FROM wallet WHERE user_id='b0000000-0000-4000-8000-000000000001' FOR UPDATE;
WITH opening_credit AS (
    INSERT INTO wallet_transaction(wallet_id,type_id,amount,idempotency_key,metadata_json)
    SELECT w.id,t.id,520,'local-benefits-opening-balance','{"demo":true,"scenario":"benefits"}'::jsonb
    FROM wallet w CROSS JOIN wallet_transaction_type t
    WHERE w.user_id='b0000000-0000-4000-8000-000000000001' AND t.label='ADJUSTMENT'
      AND NOT EXISTS (SELECT 1 FROM wallet_transaction wt
          WHERE wt.wallet_id=w.id AND wt.idempotency_key='local-benefits-opening-balance')
    RETURNING wallet_id,amount
)
UPDATE wallet w SET balance=w.balance+c.amount FROM opening_credit c WHERE w.id=c.wallet_id;

INSERT INTO partner(id,name,is_demo) VALUES
 ('b1000000-0000-4000-8000-000000000001','Burek kod braće',true),
 ('b1000000-0000-4000-8000-000000000002','Recuerdos del Sol',true),
 ('b1000000-0000-4000-8000-000000000003','Musée Atelier Lumière',true),
 ('b1000000-0000-4000-8000-000000000004','Caffè Piccolo',true),
 ('b1000000-0000-4000-8000-000000000005','Lisbon Postcard Club',true),
 ('b1000000-0000-4000-8000-000000000006','Adriatic Scoops',true)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,updated_at=now()
WHERE partner.is_demo AND partner.name IS DISTINCT FROM EXCLUDED.name;
INSERT INTO place(id,name,country_id,address,latitude,longitude)
SELECT v.id::uuid,v.name,c.id,v.address,v.lat,v.lon FROM (VALUES
 ('b4000000-0000-4000-8000-000000000001','Burek kod braće — Zagreb','HR','Demo venue, Zagreb',45.815000,15.981900),
 ('b4000000-0000-4000-8000-000000000003','Recuerdos del Sol — Barcelona','ES','Fictional souvenir shop, Barcelona',41.387400,2.168600),
 ('b4000000-0000-4000-8000-000000000004','Musée Atelier Lumière — Paris','FR','Fictional museum, Paris',48.856600,2.352200),
 ('b4000000-0000-4000-8000-000000000005','Caffè Piccolo — Rome','IT','Fictional café, Rome',41.902800,12.496400),
 ('b4000000-0000-4000-8000-000000000006','Lisbon Postcard Club — Lisbon','PT','Fictional stationery shop, Lisbon',38.722300,-9.139300),
 ('b4000000-0000-4000-8000-000000000007','Adriatic Scoops — Split','HR','Fictional gelato shop, Split',43.508100,16.440200)
) AS v(id,name,code,address,lat,lon) JOIN country c ON c.iso_code=v.code
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,country_id=EXCLUDED.country_id,
 address=EXCLUDED.address,latitude=EXCLUDED.latitude,longitude=EXCLUDED.longitude;
INSERT INTO partner_venue(id,partner_id,place_id,active) VALUES
 ('b2000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','b4000000-0000-4000-8000-000000000001',true),
 ('b2000000-0000-4000-8000-000000000003','b1000000-0000-4000-8000-000000000002','b4000000-0000-4000-8000-000000000003',true),
 ('b2000000-0000-4000-8000-000000000004','b1000000-0000-4000-8000-000000000003','b4000000-0000-4000-8000-000000000004',true),
 ('b2000000-0000-4000-8000-000000000005','b1000000-0000-4000-8000-000000000004','b4000000-0000-4000-8000-000000000005',true),
 ('b2000000-0000-4000-8000-000000000006','b1000000-0000-4000-8000-000000000005','b4000000-0000-4000-8000-000000000006',true),
 ('b2000000-0000-4000-8000-000000000007','b1000000-0000-4000-8000-000000000006','b4000000-0000-4000-8000-000000000007',true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO benefit_offer(id,partner_id,title,subtitle,description,terms,terms_version,price_coins,status,starts_at,ends_at,max_per_user,inventory_total,popularity_rank) VALUES
 ('b3000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001',
  'Free burek of your choice','Pick your favourite filling at Burek kod braće',
  'Exchange 150 coins for one free burek of your choice at our demo Zagreb partner.',
  'Demo only. One burek of your choice, subject to availability. Show the generated coupon code at the counter. No cash value.',1,150,'ACTIVE',now()-interval '1 day',now()+interval '90 days',1,50,10),
 ('b3000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000002',
  'Free Barcelona fridge magnet','A little piece of Spain for your fridge',
  'Choose one city-themed fridge magnet at Recuerdos del Sol, an imaginary souvenir shop in Barcelona, Spain.',
  'Demo only. One standard fridge magnet from the selected collection. Premium items excluded. No cash value.',1,100,'ACTIVE',now()-interval '1 day',now()+interval '90 days',1,60,20),
 ('b3000000-0000-4000-8000-000000000003','b1000000-0000-4000-8000-000000000003',
  '10% off a Paris museum exhibition','Discover Colours of Paris at Musée Atelier Lumière',
  'Save 10% on one adult ticket to Colours of Paris, a fictional art exhibition at an imaginary museum in Paris, France.',
  'Demo only. 10% off one full-price adult exhibition ticket purchased at the desk. Not combinable with other discounts. No cash value.',1,200,'ACTIVE',now()-interval '1 day',now()+interval '90 days',1,40,30),
 ('b3000000-0000-4000-8000-000000000004','b1000000-0000-4000-8000-000000000004',
  'Free Roman cappuccino','A coffee break at Caffè Piccolo',
  'Enjoy one regular cappuccino at our imaginary neighbourhood café in Rome, Italy.',
  'Demo only. One regular cappuccino. Extras and food excluded. No cash value.',1,90,'ACTIVE',now()-interval '1 day',now()+interval '90 days',1,50,40),
 ('b3000000-0000-4000-8000-000000000005','b1000000-0000-4000-8000-000000000005',
  'Free Lisbon postcard set','Three illustrated postcards to send home',
  'Pick up a set of three illustrated Lisbon postcards at the imaginary Lisbon Postcard Club in Portugal.',
  'Demo only. One selected three-card set. Postage not included. No cash value.',1,80,'ACTIVE',now()-interval '1 day',now()+interval '90 days',1,40,50),
 ('b3000000-0000-4000-8000-000000000006','b1000000-0000-4000-8000-000000000006',
  'Free gelato by the Adriatic','One scoop of your favourite flavour in Split',
  'Cool down with one scoop of gelato at Adriatic Scoops, an imaginary gelato shop in Split, Croatia.',
  'Demo only. One scoop in a cup or standard cone, subject to availability. Toppings excluded. No cash value.',1,120,'ACTIVE',now()-interval '1 day',now()+interval '90 days',1,50,60)
ON CONFLICT (id) DO UPDATE SET
 title=EXCLUDED.title,subtitle=EXCLUDED.subtitle,description=EXCLUDED.description,
 terms=EXCLUDED.terms,price_coins=EXCLUDED.price_coins,popularity_rank=EXCLUDED.popularity_rank,
 terms_version=benefit_offer.terms_version+1,updated_at=now()
WHERE ROW(benefit_offer.title,benefit_offer.subtitle,benefit_offer.description,
          benefit_offer.terms,benefit_offer.price_coins,benefit_offer.popularity_rank)
 IS DISTINCT FROM ROW(EXCLUDED.title,EXCLUDED.subtitle,EXCLUDED.description,
                      EXCLUDED.terms,EXCLUDED.price_coins,EXCLUDED.popularity_rank);
INSERT INTO offer_venue(offer_id,partner_venue_id,partner_id)
SELECT v.offer_id::uuid,v.venue_id::uuid,o.partner_id FROM (VALUES
 ('b3000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000001'),
 ('b3000000-0000-4000-8000-000000000002','b2000000-0000-4000-8000-000000000003'),
 ('b3000000-0000-4000-8000-000000000003','b2000000-0000-4000-8000-000000000004'),
 ('b3000000-0000-4000-8000-000000000004','b2000000-0000-4000-8000-000000000005'),
 ('b3000000-0000-4000-8000-000000000005','b2000000-0000-4000-8000-000000000006'),
 ('b3000000-0000-4000-8000-000000000006','b2000000-0000-4000-8000-000000000007')
) AS v(offer_id,venue_id) JOIN benefit_offer o ON o.id=v.offer_id::uuid
ON CONFLICT DO NOTHING;
UPDATE benefit_offer SET image_url = CASE id
    WHEN 'b3000000-0000-4000-8000-000000000001' THEN 'https://images.unsplash.com/photo-1617806501736-fc7cab7c05bf?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000002' THEN 'https://images.unsplash.com/photo-1639949252722-71aa17eca44d?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000003' THEN 'https://images.unsplash.com/photo-1566998474135-99fef8a34ed9?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000004' THEN 'https://images.unsplash.com/photo-1564327367919-cb377ea6a88f?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000005' THEN 'https://images.unsplash.com/photo-1695395599163-ddf059ec55be?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000006' THEN 'https://images.unsplash.com/photo-1638176474160-10b700d32f25?auto=format&fit=crop&w=1200&q=80'
    ELSE image_url END
WHERE id IN (
    'b3000000-0000-4000-8000-000000000001',
    'b3000000-0000-4000-8000-000000000002',
    'b3000000-0000-4000-8000-000000000003',
    'b3000000-0000-4000-8000-000000000004',
    'b3000000-0000-4000-8000-000000000005',
    'b3000000-0000-4000-8000-000000000006'
);
COMMIT;
