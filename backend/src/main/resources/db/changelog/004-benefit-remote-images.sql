--liquibase formatted sql
--changeset outthere:004-benefit-remote-images

-- Store public photo URLs in the offer records. The backend returns these URLs;
-- the mobile client fetches the images directly from Unsplash.
UPDATE benefit_offer SET image_url = CASE id
    WHEN 'b3000000-0000-4000-8000-000000000001' THEN 'https://images.unsplash.com/photo-1617806501736-fc7cab7c05bf?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000002' THEN 'https://images.unsplash.com/photo-1639949252722-71aa17eca44d?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000003' THEN 'https://images.unsplash.com/photo-1566998474135-99fef8a34ed9?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000004' THEN 'https://images.unsplash.com/photo-1564327367919-cb377ea6a88f?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000005' THEN 'https://images.unsplash.com/photo-1695395599163-ddf059ec55be?auto=format&fit=crop&w=1200&q=80'
    WHEN 'b3000000-0000-4000-8000-000000000006' THEN 'https://images.unsplash.com/photo-1638176474160-10b700d32f25?auto=format&fit=crop&w=1200&q=80'
    ELSE image_url END,
    updated_at = now()
WHERE id IN (
    'b3000000-0000-4000-8000-000000000001',
    'b3000000-0000-4000-8000-000000000002',
    'b3000000-0000-4000-8000-000000000003',
    'b3000000-0000-4000-8000-000000000004',
    'b3000000-0000-4000-8000-000000000005',
    'b3000000-0000-4000-8000-000000000006'
);
