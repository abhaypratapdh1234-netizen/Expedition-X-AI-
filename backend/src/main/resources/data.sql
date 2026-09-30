-- ExpeditionX AI Seed Data for H2 dev database
-- password for all demo users: "password123"
-- BCrypt hash: $2a$12$FpBNtLlXhkBKqTFuIBDl2uBRTnUeqbkl3y74AHZ9J0XGI7z5K3N1i

-- Demo Users
INSERT INTO users (id, name, email, password_hash, role, onboarding_completed, created_at)
SELECT * FROM (VALUES
  (1, 'Abhay Pratap', 'abhaypratap7777@gmail.com',   '$2a$12$FpBNtLlXhkBKqTFuIBDl2uBRTnUeqbkl3y74AHZ9J0XGI7z5K3N1i', 'ADMIN', true,  NOW()),
  (2, 'Demo Traveler', 'demo@expeditionx.ai',   '$2a$12$FpBNtLlXhkBKqTFuIBDl2uBRTnUeqbkl3y74AHZ9J0XGI7z5K3N1i', 'USER',  true,  NOW()),
  (3, 'Alice Explorer', 'alice@expeditionx.ai', '$2a$12$FpBNtLlXhkBKqTFuIBDl2uBRTnUeqbkl3y74AHZ9J0XGI7z5K3N1i', 'USER',  false, NOW())
) v(id, name, email, password_hash, role, onboarding_completed, created_at)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = v.id);

-- Gamification Profiles
INSERT INTO gamification_profiles (id, user_id, xp, level, badges)
SELECT * FROM (VALUES
  (1, 1, 2500, 6, '["Explorer Newbie","Trailblazer","Globetrotter","Wanderlust Master"]'),
  (2, 2,  350, 1, '["Explorer Newbie"]'),
  (3, 3,    0, 1, '["Explorer Newbie"]')
) v(id, user_id, xp, level, badges)
WHERE NOT EXISTS (SELECT 1 FROM gamification_profiles WHERE id = v.id);

-- ====== PLACES ======
INSERT INTO places (id, name, city, country, state, category, description, latitude, longitude, avg_cost, image_url, rating, review_count, best_time, safety_advisory, trending, search_count)
SELECT * FROM (VALUES
  (1,  'Red Fort',              'Delhi',    'India', 'Delhi',           'Historical', 'UNESCO World Heritage Site — magnificent Mughal-era fort in red sandstone.',     28.6562, 77.2410,    50, 'https://images.unsplash.com/photo-1705524220939-dac17cf94236?w=800',  4.5, 2340, 'Oct-Mar', 'Safe for tourists. Beware of pickpockets in crowded areas.', true,  15420),
  (2,  'Qutub Minar',          'Delhi',    'India', 'Delhi',           'Historical', 'Tallest brick minaret in the world, built in 1193.',                              28.5245, 77.1855,    35, 'https://images.unsplash.com/photo-1632426237957-5ea14aae7100?w=800',  4.3, 1890, 'Oct-Mar', 'Safe. Well-maintained archaeological site.',                 true,  12300),
  (3,  'India Gate',            'Delhi',    'India', 'Delhi',           'Historical', 'War memorial and iconic landmark of New Delhi.',                                  28.6129, 77.2295,     0, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',  4.6, 5600, 'Oct-Mar', 'Very safe. Popular evening spot.',                          true,  18900),
  (4,  'Taj Mahal',             'Agra',     'India', 'Uttar Pradesh',   'Historical', 'One of the Seven Wonders of the World — symbol of eternal love.',                 27.1751, 78.0421,   250, 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',  4.9,12500, 'Oct-Mar', 'Safe. Book tickets online to avoid queues.',                 true,  45000),
  (5,  'Amber Fort',            'Jaipur',   'India', 'Rajasthan',       'Historical', 'Majestic hilltop fort with stunning architecture and elephant rides.',            26.9855, 75.8513,   200, 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',  4.7, 3400, 'Oct-Mar', 'Safe. Carry water in summers.',                              true,  22000),
  (6,  'Hawa Mahal',            'Jaipur',   'India', 'Rajasthan',       'Historical', 'Palace of Winds with 953 small windows — iconic pink sandstone facade.',          26.9239, 75.8267,    50, 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',  4.4, 2100, 'Oct-Mar', 'Safe area in old city.',                                     false, 11200),
  (7,  'Baga Beach',            'Goa',      'India', 'Goa',             'Beach',      'Famous beach known for nightlife, water sports, and shacks.',                     15.5558, 73.7514,   500, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',  4.2, 4500, 'Nov-Feb', 'Safe. Swim within marked zones.',                            true,  28000),
  (8,  'Dudhsagar Falls',       'Goa',      'India', 'Goa',             'Nature',     'Spectacular four-tiered waterfall on the Mandovi River.',                         15.3144, 74.3143,   800, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',  4.6, 1200, 'Oct-Jan', 'Moderate. Trek can be slippery during monsoon.',             false,  8500),
  (9,  'Solang Valley',         'Manali',   'India', 'Himachal Pradesh','Adventure',  'Adventure sports hub — skiing, paragliding, and zorbing.',                        32.3153, 77.1536,  1500, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 4.5, 1800, 'Dec-Feb (snow), May-Jun', 'Safe. Hire certified adventure operators.', true, 19000),
  (10, 'Old Manali',            'Manali',   'India', 'Himachal Pradesh','Nature',     'Charming village with cafes, temples, and mountain views.',                       32.2615, 77.1866,   200, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 4.4, 2800, 'Mar-Jun, Sep-Nov', 'Safe. Roads tricky in monsoon.',           false, 14000),
  (11, 'Alleppey Backwaters',   'Kerala',   'India', 'Kerala',          'Nature',     'Serene network of canals and lagoons. Famous houseboat cruises.',                  9.4981, 76.3388,  3000, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 4.8, 3200, 'Sep-Mar', 'Very safe. Book houseboats in advance.',                    true,  25000),
  (12, 'Munnar Tea Gardens',    'Kerala',   'India', 'Kerala',          'Nature',     'Rolling hills covered in lush tea plantations.',                                  10.0889, 77.0595,   500, 'https://images.unsplash.com/photo-1580818135730-ebd11086660b?w=800', 4.6, 2100, 'Sep-Mar', 'Safe. Carry warm clothes for evenings.',                     true,  20000),
  (13, 'Gateway of India',      'Mumbai',   'India', 'Maharashtra',     'Historical', 'Iconic arch monument overlooking the Arabian Sea.',                               18.9220, 72.8347,     0, 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800', 4.3, 6800, 'Nov-Feb', 'Safe. Tourist police presence.',                            true,  32000),
  (14, 'Marine Drive',          'Mumbai',   'India', 'Maharashtra',     'Beach',      'C-shaped boulevard known as the Queen''s Necklace at night.',                     18.9432, 72.8235,     0, 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800', 4.5, 5400, 'Nov-Feb', 'Very safe. Great for evening walks.',                       false, 21000),
  (15, 'Varanasi Ghats',        'Varanasi', 'India', 'Uttar Pradesh',   'Culture',    'Ancient ghats along the Ganges — spiritual heart of India.',                      25.3176, 83.0068,   100, 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800', 4.7, 4200, 'Oct-Mar', 'Moderate. Stay aware of surroundings.',                      true,  27000),
  (16, 'Victoria Memorial',     'Kolkata',  'India', 'West Bengal',     'Historical', 'White marble monument dedicated to Queen Victoria, now a museum.',                 22.5449, 88.3426,    30, 'https://images.unsplash.com/photo-1600080077823-a44592513861?w=800', 4.4, 1900, 'Oct-Mar', 'Safe. Beautiful gardens.',                                   false,  9800),
  (17, 'Udaipur City Palace',   'Udaipur',  'India', 'Rajasthan',       'Historical', 'Massive palace complex on the banks of Lake Pichola.',                            24.5764, 73.6915,   300, 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800', 4.8, 2600, 'Oct-Mar', 'Very safe. Romantic city.',                                  true,  18500),
  (18, 'Hampi Ruins',           'Hampi',    'India', 'Karnataka',       'Historical', 'UNESCO site with stunning Vijayanagara Empire ruins.',                            15.3350, 76.4600,   100, 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800', 4.7, 1500, 'Oct-Feb', 'Safe. Carry water and sunscreen.',                          false, 13000),
  (19, 'Leh Palace',            'Leh',      'India', 'Ladakh',          'Adventure',  'Former royal palace with panoramic mountain views.',                              34.1642, 77.5848,   200, 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800', 4.6, 1100, 'Jun-Sep', 'Safe. Acclimatize before trekking.',                         true,  16000),
  (20, 'Darjeeling Tea Estate', 'Darjeeling','India','West Bengal',     'Nature',     'World-famous tea gardens with views of Kanchenjunga.',                           27.0410, 88.2663,   400, 'https://images.unsplash.com/photo-1544085311-11a028465b03?w=800', 4.5, 1800, 'Mar-May, Oct-Nov', 'Safe. Toy train ride recommended.',        false, 11000),
  (21, 'Paris', 'Paris', 'France', 'Île-de-France', 'Historical', 'The City of Light, famous for its cafe culture and the Eiffel Tower.', 48.8566, 2.3522, 8500, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800', 4.8, 42847, 'Apr-Jun, Sep-Oct', 'Safe. Beware of pickpockets at tourist spots.', true, 35000),
  (22, 'Hallstatt', 'Hallstatt', 'Austria', 'Upper Austria', 'Offbeat', 'Fairytale alpine village on the shores of Lake Hallstatt.', 47.5622, 13.6493, 12000, 'https://images.unsplash.com/photo-1596701166649-0d1921350a4f?w=800', 4.9, 12500, 'May-Sep', 'Very safe. Quiet after 8 PM.', false, 15000),
  (23, 'Kyoto', 'Kyoto', 'Japan', 'Kyoto Prefecture', 'Heritage', 'Ancient temples, traditional tea houses, and geisha districts.', 35.0116, 135.7681, 15000, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 4.8, 28000, 'Mar-May, Sep-Nov', 'Extremely safe.', true, 28000),
  (24, 'Santorini', 'Santorini', 'Greece', 'South Aegean', 'Beach', 'Iconic whitewashed houses with blue domes overlooking the Aegean.', 36.3932, 25.4615, 18000, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800', 4.7, 34000, 'May-Oct', 'Safe. Can be very crowded in summer.', true, 42000),
  (25, 'New York City', 'New York City', 'USA', 'New York', 'Nightlife', 'The city that never sleeps. Times Square, Central Park, and Broadway.', 40.7128, -74.0060, 25000, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 4.6, 85000, 'Apr-Jun, Sep-Nov', 'Moderate. Be aware of surroundings at night.', true, 55000),
  (26, 'Cape Town', 'Cape Town', 'South Africa', 'Western Cape', 'Adventure', 'Stunning coastal city with Table Mountain and penguin colonies.', -33.9249, 18.4241, 10000, 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 4.7, 21000, 'Oct-Apr', 'Moderate. Stick to tourist areas.', false, 18000),
  (27, 'Dubai', 'Dubai', 'UAE', 'Dubai', 'Explore', 'Futuristic city with towering skyscrapers, luxury shopping, and desert safaris.', 25.2048, 55.2708, 22000, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 4.8, 65000, 'Nov-Mar', 'Extremely safe.', true, 48000)
) v(id, name, city, country, state, category, description, latitude, longitude, avg_cost, image_url, rating, review_count, best_time, safety_advisory, trending, search_count)
WHERE NOT EXISTS (SELECT 1 FROM places WHERE id = v.id);

-- Ensure existing database rows have 100% accurate, verified image URLs, ratings, and theme categories
UPDATE places SET image_url = 'https://images.unsplash.com/photo-1705524220939-dac17cf94236?w=800', category = 'Heritage, Historical, Food Trails', rating = 4.5 WHERE id = 1;
UPDATE places SET image_url = 'https://images.unsplash.com/photo-1632426237957-5ea14aae7100?w=800', category = 'Heritage, Historical', rating = 4.3 WHERE id = 2;
UPDATE places SET image_url = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800', category = 'Heritage, Historical, Food Trails', rating = 4.5 WHERE id = 3;
UPDATE places SET category = 'Heritage, Historical, Trending', rating = 4.9 WHERE id = 4;
UPDATE places SET category = 'Heritage, Historical, Culture', rating = 4.7 WHERE id = 5;
UPDATE places SET category = 'Heritage, Historical', rating = 4.4 WHERE id = 6;
UPDATE places SET category = 'Beach, Nightlife, Trending, Adventure', rating = 3.9 WHERE id = 7;
UPDATE places SET category = 'Nature, Adventure, Offbeat', rating = 4.6 WHERE id = 8;
UPDATE places SET category = 'Adventure, Nature, Trending', rating = 4.5 WHERE id = 9;
UPDATE places SET category = 'Offbeat, Nature, Food Trails', rating = 3.8 WHERE id = 10;
UPDATE places SET category = 'Nature, Offbeat, Beach, Trending', rating = 4.8 WHERE id = 11;
UPDATE places SET image_url = 'https://images.unsplash.com/photo-1580818135730-ebd11086660b?w=800', category = 'Nature, Offbeat, Adventure', rating = 4.6 WHERE id = 12;
UPDATE places SET category = 'Heritage, Historical, Nightlife, Food Trails', rating = 3.8 WHERE id = 13;
UPDATE places SET category = 'Beach, Nightlife, Food Trails', rating = 4.5 WHERE id = 14;
UPDATE places SET category = 'Heritage, Culture, Food Trails, Spiritual', rating = 4.7 WHERE id = 15;
UPDATE places SET image_url = 'https://images.unsplash.com/photo-1600080077823-a44592513861?w=800', category = 'Heritage, Historical, Food Trails', rating = 3.9 WHERE id = 16;
UPDATE places SET image_url = 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800', category = 'Heritage, Historical, Offbeat, Trending', rating = 4.7 WHERE id = 17;
UPDATE places SET category = 'Heritage, Historical, Offbeat', rating = 4.7 WHERE id = 18;
UPDATE places SET category = 'Adventure, Offbeat, Heritage, Nature', rating = 4.6 WHERE id = 19;
UPDATE places SET category = 'Nature, Offbeat, Heritage', rating = 4.4 WHERE id = 20;
UPDATE places SET category = 'Heritage, Historical, Food Trails, Nightlife', rating = 4.7 WHERE id = 21;
UPDATE places SET category = 'Nature, Offbeat, Heritage', rating = 4.9 WHERE id = 22;
UPDATE places SET category = 'Heritage, Culture, Nature', rating = 4.9 WHERE id = 23;
UPDATE places SET category = 'Beach, Romantic, Heritage', rating = 4.6 WHERE id = 24;
UPDATE places SET category = 'Adventure, Nightlife, Food Trails', rating = 4.4 WHERE id = 25;
UPDATE places SET category = 'Adventure, Nature, Beach', rating = 4.6 WHERE id = 26;
UPDATE places SET category = 'Nightlife, Adventure, Food Trails', rating = 4.4 WHERE id = 27;


-- ====== HOTELS ======
INSERT INTO hotels (id, name, place_id, price_per_night, rating, amenities, image_url, category, latitude, longitude, location, review_count)
SELECT * FROM (VALUES
  (1,  'The Imperial Delhi',         1,  8500.0, 4.8, '["WiFi","Pool","Spa","Restaurant","Gym"]',                          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'Luxury',   28.6280, 77.2190, 'Near Connaught Place, Delhi', 450),
  (2,  'Hotel Palace Heights',       1,  3200.0, 4.2, '["WiFi","Restaurant","Room Service"]',                              'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'Business', 28.6310, 77.2210, 'Connaught Place, Delhi',      320),
  (3,  'Zostel Delhi',               1,   800.0, 4.0, '["WiFi","Cafe","Lockers","Common Area"]',                           'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'Hostel',   28.6350, 77.2250, 'Paharganj, Delhi',            890),
  (4,  'Taj Lake Palace',           17, 15000.0, 4.9, '["WiFi","Pool","Spa","Lake View","Butler Service"]',                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 'Luxury',   24.5750, 73.6800, 'Lake Pichola, Udaipur',       280),
  (5,  'Zostel Manali',              9,   600.0, 4.1, '["WiFi","Cafe","Mountain View","Bonfire"]',                         'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 'Hostel',   32.2500, 77.1800, 'Old Manali',                  650),
  (6,  'Resort Rio Goa',             7,  5500.0, 4.5, '["WiFi","Pool","Beach Access","Spa","Restaurant"]',                 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', 'Luxury',   15.5510, 73.7480, 'Baga Beach, Goa',             520),
  (7,  'Backpacker Panda Goa',       7,   500.0, 3.9, '["WiFi","Common Area","Kitchen","Lockers"]',                        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'Hostel',   15.5530, 73.7500, 'Near Baga Beach, Goa',        430),
  (8,  'Kumarakom Lake Resort',     11, 12000.0, 4.7, '["WiFi","Pool","Ayurveda Spa","Houseboat","Restaurant"]',           'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 'Luxury',    9.6000, 76.4300, 'Kumarakom, Kerala',           310),
  (9,  'Oberoi Amarvilas Agra',      4, 22000.0, 4.9, '["WiFi","Pool","Spa","Taj View","Restaurant"]',                     'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'Luxury',   27.1700, 78.0400, 'Near Taj Mahal, Agra',        190),
  (10, 'Rambagh Palace Jaipur',      5, 18000.0, 4.8, '["WiFi","Pool","Heritage Rooms","Restaurant","Polo Ground"]',       'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 'Luxury',   26.8900, 75.8000, 'Bhawani Singh Road, Jaipur',  240)
) v(id, name, place_id, price_per_night, rating, amenities, image_url, category, latitude, longitude, location, review_count)
WHERE NOT EXISTS (SELECT 1 FROM hotels WHERE id = v.id);

-- ====== NOTIFICATIONS ======
INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
SELECT * FROM (VALUES
  (1, 2, 'BOOKING_UPDATE', 'Booking Confirmed!',   'Your hotel at The Imperial Delhi is confirmed for Jul 20-22.', false, NOW()),
  (2, 2, 'PRICE_DROP',     'Price Drop Alert',      'Hotels in Manali dropped 23%! Book now.', false, NOW()),
  (3, 2, 'REMINDER',       'Trip Reminder',         'Your Goa trip starts in 3 days!', true, NOW()),
  (4, 2, 'REWARD',         'XP Earned!',            'You earned 50 XP for completing your profile.', false, NOW())
) v(id, user_id, type, title, message, read, created_at)
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE id = v.id);

-- ====== LOCAL EVENTS ======
INSERT INTO local_events (id, city, country, name, date, description, source)
SELECT * FROM (VALUES
  (1, 'Delhi',    'India', 'Republic Day Parade',       '2027-01-26', 'Grand military and cultural parade at Rajpath.',        'Government'),
  (2, 'Jaipur',   'India', 'Jaipur Literature Festival','2027-01-23', 'World''s largest free literary festival.',               'JLF'),
  (3, 'Goa',      'India', 'Goa Carnival',              '2027-02-15', 'Three-day festival of parades, music, and dance.',      'Tourism Dept'),
  (4, 'Kerala',   'India', 'Onam Festival',             '2027-08-25', 'Harvest festival with boat races and feasts.',          'Tourism'),
  (5, 'Varanasi', 'India', 'Dev Deepawali',             '2027-11-15', 'Festival of lights on the ghats of Varanasi.',         'Temple Committee'),
  (6, 'Udaipur',  'India', 'Mewar Festival',            '2027-03-20', 'Celebration of spring with processions.',              'Tourism Dept')
) v(id, city, country, name, date, description, source)
WHERE NOT EXISTS (SELECT 1 FROM local_events WHERE id = v.id);



-- ====== REVIEWS ======
INSERT INTO reviews (id, user_id, place_id, rating, comment, sentiment_score, sentiment_label, photos, upvotes, created_at)
SELECT * FROM (VALUES
  (1, 2, 1, 5, 'Absolutely stunning! The historical significance is incredible. The red sandstone architecture is mesmerizing.', 0.9, 'Positive', '[]', 12, NOW()),
  (2, 3, 1, 4, 'Worth visiting. Get there early to avoid crowds and the afternoon heat.', 0.6, 'Positive', '[]', 5, NOW()),
  (3, 2, 1, 3, 'Bit crowded on weekends. Morning visits are best. Sound and light show was okay.', 0.1, 'Neutral', '[]', 2, NOW()),
  (4, 3, 4, 5, 'Taj Mahal is breath-taking! A must visit for everyone.', 0.95, 'Positive', '[]', 45, NOW())
) v(id, user_id, place_id, rating, comment, sentiment_score, sentiment_label, photos, upvotes, created_at)
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE id = v.id);



-- ====== TRIPS & ITINERARY ======
INSERT INTO trips (id, owner_user_id, title, start_date, end_date, status, total_budget, total_spent, cover_image_url, destinations, created_at)
SELECT * FROM (VALUES
  (1, 1, 'Golden Triangle Tour', '2027-10-10', '2027-10-12', 'UPCOMING', 45000.0, 15000.0, 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', 'Delhi,Agra,Jaipur', NOW())
) v(id, owner_user_id, title, start_date, end_date, status, total_budget, total_spent, cover_image_url, destinations, created_at)
WHERE NOT EXISTS (SELECT 1 FROM trips WHERE id = v.id);

INSERT INTO itinerary_items (id, trip_id, place_id, day_number, display_order, estimated_cost, notes, added_by_user_id)
SELECT * FROM (VALUES
  (1, 1, 1, 1, 1, 50.0, 'Visit in the morning', 1),
  (2, 1, 2, 1, 2, 35.0, 'Afternoon visit', 1),
  (3, 1, 4, 2, 1, 250.0, 'Sunrise view', 1),
  (4, 1, 5, 3, 1, 200.0, 'Morning hike', 1)
) v(id, trip_id, place_id, day_number, display_order, estimated_cost, notes, added_by_user_id)
WHERE NOT EXISTS (SELECT 1 FROM itinerary_items WHERE id = v.id);


