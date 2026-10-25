--liquibase formatted sql
--changeset outthere:007-badges
-- Collectible badges, earned by scanning their NFC tag. Adapted from the reference schema's
-- badge, user_badge, nfc_tag_status and nfc_tag: tags point at the badge they award, and their
-- place is optional so badges stay off the map. Rewards are paid once per user and badge and
-- recorded on user_badge, like course_completion_reward; nfc_visit/nfc_visit_reward (keyed by
-- place) are not adopted.
-- description holds the badge's story as Markdown; hook is its one-line teaser.
CREATE TABLE badge (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    label varchar(160) NOT NULL UNIQUE,
    description text,
    icon_url text,
    country_id uuid REFERENCES country(id),
    hook text,
    subtitle text,
    image_url text,
    reward_coins bigint NOT NULL DEFAULT 0 CHECK (reward_coins>=0)
);

CREATE TABLE user_badge (
    user_id uuid NOT NULL REFERENCES app_user(id),
    badge_id uuid NOT NULL REFERENCES badge(id),
    earned_at timestamptz NOT NULL DEFAULT now(),
    transaction_id uuid UNIQUE REFERENCES wallet_transaction(id),
    reward_coins bigint NOT NULL DEFAULT 0,
    PRIMARY KEY(user_id,badge_id),
    CHECK ((reward_coins=0 AND transaction_id IS NULL) OR (reward_coins>0 AND transaction_id IS NOT NULL))
);
CREATE INDEX ix_user_badge_user_id_earned_at ON user_badge(user_id,earned_at DESC);

CREATE TABLE nfc_tag_status (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    label varchar(80) NOT NULL UNIQUE
);
INSERT INTO nfc_tag_status(id,label) VALUES
    ('11de493d-fa1b-592e-a0a1-230dfc4565a7','ACTIVE'),
    ('13402db9-72ca-5fba-ac4e-306e8503a0a5','INACTIVE'),
    ('35206d63-4a3d-535d-bbe4-1be97b82c22b','REVOKED');

-- public_code is what the physical tag carries, as mobile://nfc/<public_code> or plain text.
CREATE TABLE nfc_tag (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    badge_id uuid NOT NULL REFERENCES badge(id),
    place_id uuid REFERENCES place(id),
    public_code varchar(120) NOT NULL UNIQUE,
    status_id uuid NOT NULL DEFAULT '11de493d-fa1b-592e-a0a1-230dfc4565a7' REFERENCES nfc_tag_status(id),
    installed_at timestamptz,
    last_checked_at timestamptz
);
CREATE INDEX ix_nfc_tag_badge_id ON nfc_tag(badge_id);

--changeset outthere:007-badges-trsat-stairs
-- The first badge. Photo: "Rijeka-Trsat-stairs2.JPG" by László Szalai (Beyond silence), public
-- domain, https://commons.wikimedia.org/wiki/File:Rijeka-Trsat-stairs2.JPG
INSERT INTO badge(id,label,hook,subtitle,description,image_url,country_id,reward_coins) VALUES (
    'b7000000-0000-4000-8000-000000000001',
    'Trsat Stairs',
    'The Devil mixed up the stairs. Do you think you can count them?',
    'The legend of Rijeka''s Trsat stairs (scalinate fiumane)',
    'There is a popular tale about the Trsat Stairs: no one knows their exact number. According to legend, the Franciscans made a deal with the devil to build a staircase from the foot to the top of the hill, agreeing that the first person to walk up the stairs would be his reward. The next morning, a black goat appeared on the stairs. Realizing he had been tricked, the devil scrambled the steps and even smashed some of them, making it impossible to count them. And so, according to legend, the stairs remain impossible to count to this very day.

But there is another version of the story. Another popular tale tells of a nobleman from the Frankopan family who made a deal with the devil to build a staircase leading up to Trsat. The devil agreed, but only on one condition: the stairs had to lead to a tavern rather than the sanctuary, hoping that people would choose drinking over prayer. The Franciscans, determined to protect the sacred path, prayed for divine help and managed to outwit him. The devil''s plan failed, and the stairs became a path for pilgrims instead.

*In reality, the Trsat Stairs were commissioned in 1531 by Petar Kružić, Captain of Klis, with only a little over a hundred steps at first. Over the centuries, the staircase was gradually extended, making it easier for pilgrims to reach the Sanctuary of Our Lady of Trsat. They are the oldest, longest, and most famous stairs in the city.*

And so, if someone happens to ask how many steps you counted, feel free to say you aren’t sure. Maybe there were 561, or perhaps the devil got them all mixed up again.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Rijeka-Trsat-stairs2.JPG/1280px-Rijeka-Trsat-stairs2.JPG',
    (SELECT id FROM country WHERE iso_code='HR'),
    10
);
INSERT INTO nfc_tag(badge_id,public_code) VALUES ('b7000000-0000-4000-8000-000000000001','trsat-stairs');
