/**
 * indiaStatesAndCities.ts
 * Comprehensive database of all 28 States and 8 Union Territories of India
 * along with their prominent cities and travel destinations.
 */

export interface StateInfo {
  state: string
  type: 'state' | 'union_territory'
  cities: string[]
}

export const INDIA_STATES_AND_CITIES: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada',
    'Kadapa (Cuddapah)', 'Ananthapuramu', 'Eluru', 'Vizianagaram', 'Nandyal', 'Machilipatnam', 'Ongole',
    'Adoni', 'Tenali', 'Proddatur', 'Chittoor', 'Hindupur', 'Bhimavaram', 'Madanapalle', 'Guntakal',
    'Srikakulam', 'Dharmavaram', 'Gudivada', 'Narasaraopet', 'Tadipatri', 'Mangalagiri', 'Chilakaluripet',
    'Amaravati', 'Alluri Sitharama Raju (Paderu)', 'Anakapalli', 'Annamayya (Rayachoti)', 'Bapatla',
    'Dr. B.R. Ambedkar Konaseema (Amalapuram)', 'NTR District', 'Palnadu', 'Parvathipuram Manyam',
    'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai (Puttaparthi)', 'West Godavari', 'YSR District',
    'Araku Valley', 'Srisailam', 'Lepakshi', 'Horsley Hills'
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Aalo (Along)', 'Tezu', 'Roing',
    'Daporijo', 'Seppa', 'Khonsa', 'Namsai', 'Changlang', 'Yingkiong', 'Dirang', 'Bhalukpong', 'Mechuka',
    'Anjaw (Hawai)', 'Dibang Valley (Anini)', 'East Kameng', 'East Siang', 'Kamle (Raga)', 'Kra Daadi (Jamin)',
    'Kurung Kumey (Koloriang)', 'Lepa Rada (Basar)', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Siang (Likabali)',
    'Lower Subansiri', 'Pakke Kessang (Lemmi)', 'Papum Pare (Yupia)', 'Shi Yomi (Tato)', 'Siang (Pangin)',
    'Tirap', 'Upper Dibang Valley', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri',
    'Diphu', 'North Lakhimpur', 'Karimganj', 'Sivasagar', 'Goalpara', 'Barpeta', 'Hailakandi', 'Mangaldai',
    'Haflong', 'Kokrajhar', 'Morigaon', 'Nalbari', 'Hojai', 'Rangia', 'Golaghat', 'Dhemaji', 'Digboi',
    'Baksa (Mushakpur)', 'Bajali (Pathsala)', 'Biswanath Chariali', 'Charaideo (Sonari)', 'Chirang (Kajalgaon)',
    'Darrang', 'Dima Hasao', 'Kamrup (Amingaon)', 'Kamrup Metropolitan', 'Karbi Anglong', 'Lakhimpur',
    'Majuli (Garamur)', 'Sonitpur', 'South Salmara-Mankachar (Hatsingimari)', 'Tamulpur', 'Udalguri',
    'West Karbi Anglong (Hamren)', 'Kaziranga', 'Manas'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif (Nalanda)', 'Arrah (Bhojpur)',
    'Begusarai', 'Katihar', 'Munger', 'Chhapra (Saran)', 'Danapur', 'Saharsa', 'Sasaram (Rohtas)', 'Hajipur (Vaishali)',
    'Dehri', 'Siwan', 'Motihari (East Champaran)', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi',
    'Jamalpur', 'Jehanabad', 'Aurangabad', 'Lakhisarai', 'Bettiah (West Champaran)', 'Madhubani', 'Samastipur',
    'Bhabua (Kaimur)', 'Gopalganj', 'Jamui', 'Khagaria', 'Madhepura', 'Araria', 'Arwal', 'Banka',
    'Dighwara', 'Dumraon', 'Forbesganj', 'Kasba', 'Makhdumpur', 'Maner', 'Marhaura', 'Masaurhi', 'Mokama',
    'Narkatiaganj', 'Naugachhia', 'Piro', 'Raxaul', 'Rosera', 'Sultanganj', 'Supaul', 'Tikari',
    'Bodh Gaya', 'Rajgir', 'Vaishali', 'Sheohar', 'Sheikhpura'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur (Bastar)', 'Ambikapur (Surguja)',
    'Dhamtari', 'Durg', 'Mahasamund', 'Kanker (Uttar Bastar)', 'Dantewada (Dakshin Bastar)', 'Champa', 'Kawardha (Kabirdham)',
    'Bhatapara', 'Balod', 'Baloda Bazar', 'Balrampur', 'Bemetara', 'Bijapur', 'Gariaband', 'Gaurela-Pendra-Marwahi',
    'Janjgir', 'Jashpur', 'Khairagarh-Chhuikhadan-Gandai', 'Kondagaon', 'Koriya (Baikunthpur)',
    'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki', 'Mungeli', 'Narayanpur', 'Sakti',
    'Sarangarh-Bilaigarh', 'Sukma', 'Surajpur', 'Chitrakote', 'Sirpur'
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Cuncolim', 'Canacona',
    'Pernem', 'Quepem', 'Sanguem', 'Valpoi', 'Dharbandora', 'North Goa District', 'South Goa District',
    'Tiswadi', 'Bardez', 'Salcete', 'Mormugao', 'Calangute', 'Candolim', 'Baga', 'Anjuna', 'Vagator',
    'Morjim', 'Arambol', 'Palolem', 'Agonda', 'Colva', 'Benaulim', 'Majorda', 'Cavelossim', 'Sinquerim',
    'Mandrem', 'Assagao', 'Aldona', 'Dona Paula', 'Bambolim'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand',
    'Navsari', 'Morbi', 'Nadiad (Kheda)', 'Surendranagar', 'Bharuch', 'Mehsana', 'Bhuj (Kutch)', 'Porbandar',
    'Palanpur (Banaskantha)', 'Valsad', 'Vapi', 'Gondal', 'Veraval (Gir Somnath)', 'Godhra (Panchmahal)',
    'Patan', 'Kalol', 'Dahod', 'Botad', 'Amreli', 'Deesa', 'Jetpur', 'Chhota Udaipur', 'Dang (Ahwa)',
    'Devbhumi Dwarka (Khambhalia)', 'Mahisagar (Lunawada)', 'Modasa (Aravalli)', 'Narmada (Rajpipla)',
    'Sabarkantha (Himmatnagar)', 'Tapi (Vyara)', 'Somnath', 'Dwarka', 'Statue of Unity (Kevadia)',
    'Gir (Sasan Gir)', 'Mandvi', 'Saputara', 'Anjar', 'Gandhidham', 'Mundra', 'Diu Gateway'
  ],
  'Haryana': [
    'Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat',
    'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar (Kurukshetra)', 'Kaithal', 'Rewari',
    'Palwal', 'Hansi', 'Narnaul (Mahendragarh)', 'Fatehabad', 'Tohana', 'Charkhi Dadri', 'Nuh', 'Jhajjar',
    'Pinjore', 'Manesar', 'Sultanpur', 'Kalka', 'Pehowa', 'Ladwa', 'Gharaunda', 'Assandh', 'Gohana'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Nahan (Sirmaur)', 'Bilaspur', 'Chamba', 'Kullu', 'Hamirpur',
    'Una', 'Keylong (Lahaul and Spiti)', 'Reckong Peo (Kinnaur)', 'Manali', 'McLeod Ganj', 'Spiti Valley',
    'Kaza', 'Kasol', 'Dalhousie', 'Bir Billing', 'Kasauli', 'Jibhi', 'Tirthan Valley', 'Sangla', 'Kalpa',
    'Palampur', 'Khajjiar', 'Sundernagar', 'Paonta Sahib', 'Baddi', 'Nalagarh', 'Nurpur', 'Kangra',
    'Parwanoo', 'Rohru', 'Rampur Bushahr', 'Naggar', 'Chail'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur (East Singhbhum)', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro', 'Hazaribagh',
    'Giridih', 'Ramgarh', 'Medininagar (Daltonganj / Palamu)', 'Chirkunda', 'Jhumri Telaiya (Koderma)', 'Sahibganj',
    'Chaibasa (West Singhbhum)', 'Gumla', 'Dumka', 'Godda', 'Jamtara', 'Khunti', 'Latehar', 'Lohardaga',
    'Pakur', 'Seraikela Kharsawan', 'Simdega', 'Chatra', 'Garhwa', 'Netarhat', 'Betla', 'Parasnath',
    'Madhupur', 'Ghatshila', 'Bhurkunda', 'Chakradharpur'
  ],
  'Karnataka': [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru (Dakshina Kannada)',
    'Belagavi', 'Kalaburagi (Gulbarga)', 'Davanagere', 'Ballari', 'Vijayapura (Bijapur)', 'Shivamogga',
    'Tumakuru', 'Raichur', 'Bidar', 'Hosapete (Vijayanagara)', 'Gadag', 'Hassan', 'Udupi', 'Challakere',
    'Bagalkote', 'Chikkamagaluru', 'Chitradurga', 'Chamarajanagar', 'Chikkaballapura', 'Haveri',
    'Kodagu (Madikeri / Coorg)', 'Kolar', 'Koppal', 'Mandya', 'Ramanagara', 'Uttara Kannada (Karwar)',
    'Yadgir', 'Hampi', 'Gokarna', 'Dandeli', 'Badami', 'Murudeshwar', 'Bandipur', 'Kabini',
    'Pattadakal', 'Aihole', 'Karkala', 'Bhatkal', 'Kumta', 'Sirsi', 'Sringeri', 'Horanadu'
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi (Ernakulam)', 'Kozhikode (Calicut)', 'Kollam', 'Thrissur', 'Kannur',
    'Alappuzha (Alleppey)', 'Kottayam', 'Palakkad', 'Manjeri (Malappuram)', 'Thalassery', 'Ponnani',
    'Vatakara', 'Kanhangad (Kasaragod)', 'Payyanur', 'Koyilandy', 'Neyyattinkara', 'Idukki (Painavu)',
    'Pathanamthitta', 'Wayanad (Kalpetta)', 'Munnar', 'Varkala', 'Kovalam', 'Thekkady', 'Kumarakom',
    'Vagamon', 'Bekal', 'Athirappilly', 'Guruvayur', 'Marari', 'Cherai', 'Vythiri', 'Sultan Bathery'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
    'Murwara (Katni)', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna',
    'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur',
    'Narmadapuram (Hoshangabad)', 'Itarsi', 'Sehore', 'Betul', 'Seoni', 'Datia', 'Nagda', 'Dhar',
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Dindori', 'Harda',
    'Jhabua', 'Maihar', 'Mandla', 'Mauganj', 'Narsinghpur', 'Niwari', 'Pandhurna', 'Panna', 'Raisen',
    'Rajgarh', 'Shahdol', 'Shajapur', 'Sheopur', 'Sidhi', 'Tikamgarh', 'Umaria', 'Khajuraho',
    'Pachmarhi', 'Orchha', 'Mandu', 'Sanchi', 'Omkareshwar', 'Bhedaghat', 'Kanha', 'Bandhavgarh', 'Pench'
  ],
  'Maharashtra': [
    'Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar',
    'Chhatrapati Sambhaji Nagar (Aurangabad)', 'Navi Mumbai', 'Solapur', 'Mira-Bhayandar', 'Bhiwandi',
    'Amravati', 'Nanded', 'Kolhapur', 'Akola', 'Panvel', 'Ulhasnagar', 'Sangli', 'Malegaon', 'Jalgaon',
    'Latur', 'Dhule', 'Ahmednagar (Ahilyanagar)', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna',
    'Ambarnath', 'Bhusawal', 'Ratnagiri', 'Beed', 'Bhandara', 'Buldhana', 'Gadchiroli', 'Gondia',
    'Hingoli', 'Nandurbar', 'Dharashiv (Osmanabad)', 'Palghar', 'Raigad (Alibaug)', 'Satara',
    'Sindhudurg (Oros)', 'Wardha', 'Washim', 'Yavatmal', 'Lonavala', 'Khandala', 'Mahabaleshwar',
    'Panchgani', 'Matheran', 'Shirdi', 'Igatpuri', 'Tarkarli', 'Lavasa', 'Alibaug', 'Karjat', 'Murud'
  ],
  'Manipur': [
    'Imphal East', 'Imphal West', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Senapati',
    'Ukhrul', 'Chandel', 'Tamenglong', 'Jiribam', 'Kangpokpi', 'Kamjong', 'Noney', 'Pherzawl',
    'Tengnoupal', 'Moirang', 'Loktak Lake', 'Andro', 'Moreh', 'Mayang Imphal', 'Lilong'
  ],
  'Meghalaya': [
    'East Khasi Hills (Shillong)', 'West Garo Hills (Tura)', 'West Jaintia Hills (Jowai)', 'Ri-Bhoi (Nongpoh)',
    'West Khasi Hills (Nongstoin)', 'East Garo Hills (Williamnagar)', 'South Garo Hills (Baghmara)',
    'South West Garo Hills (Ampati)', 'East Jaintia Hills (Khliehriat)', 'North Garo Hills (Resubelpara)',
    'South West Khasi Hills (Mawkyrwat)', 'Eastern West Khasi Hills (Mairang)', 'Cherrapunji (Sohra)',
    'Dawki', 'Mawlynnong', 'Mawsynram', 'Nongriat', 'Mawphlang', 'Jowai'
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Lawngtlai', 'Mamit', 'Siaha', 'Hnahthial',
    'Khawzawl', 'Saitual', 'Reiek', 'Vantawng', 'Hmuifang', 'Bairabi', 'Zawlnuam', 'Darlawn'
  ],
  'Nagaland': [
    'Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon', 'Phek', 'Kiphire',
    'Longleng', 'Peren', 'Noklak', 'Chumoukedima', 'Niuland', 'Tseminyu', 'Shamator',
    'Dzukou Valley', 'Khonoma', 'Pfütsero', 'Medziphema'
  ],
  'Odisha': [
    'Bhubaneswar (Khordha)', 'Cuttack', 'Rourkela (Sundargarh)', 'Brahmapur (Ganjam)', 'Sambalpur',
    'Puri', 'Balasore (Baleswar)', 'Bhadrak', 'Baripada (Mayurbhanj)', 'Jharsuguda', 'Jeypore (Koraput)',
    'Bargarh', 'Rayagada', 'Bolangir (Balangir)', 'Angul', 'Dhenkanal', 'Kendrapara', 'Jajpur',
    'Kendujhar (Keonjhar)', 'Jagatsinghpur', 'Nayagarh', 'Nuapada', 'Kalahandi (Bhawanipatna)',
    'Kandhamal (Phulbani)', 'Koraput', 'Malkangiri', 'Nabarangpur', 'Subarnapur (Sonepur)',
    'Deogarh', 'Boudh', 'Gajapati (Paralakhemundi)', 'Konark', 'Gopalpur', 'Chilika Lake',
    'Daringbadi', 'Chandipur', 'Paradip', 'Talcher', 'Sunabeda'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)', 'Hoshiarpur',
    'Batala (Gurdaspur)', 'Pathankot', 'Moga', 'Abohar (Fazilka)', 'Malerkotla', 'Khanna', 'Phagwara (Kapurthala)',
    'Muktsar (Sri Muktsar Sahib)', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Faridkot', 'Sunam (Sangrur)',
    'Fatehgarh Sahib', 'Fazilka', 'Gurdaspur', 'Mansa', 'Rupnagar (Ropar)', 'Sangrur',
    'Shahid Bhagat Singh Nagar (Nawanshahr)', 'Tarn Taran', 'Anandpur Sahib', 'Zirakpur', 'Dera Bassi'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur',
    'Sikar', 'Pali', 'Sri Ganganagar', 'Beawar', 'Churu', 'Hanumangarh', 'Kishangarh', 'Tonk',
    'Dhaulpur (Dholpur)', 'Sawai Madhopur', 'Nagaur', 'Makrana', 'Barmer', 'Chittorgarh', 'Dungarpur',
    'Banswara', 'Baran', 'Bundi', 'Dausa', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Karauli',
    'Pratapgarh', 'Rajsamand', 'Sirohi', 'Anupgarh', 'Balotra', 'Deeg', 'Didwana-Kuchaman',
    'Dudu', 'Gangapur City', 'Hindaun', 'Jaipur Rural', 'Jodhpur Rural', 'Kekri', 'Khairthal-Tijara',
    'Kotputli-Behror', 'Neem Ka Thana', 'Phalodi', 'Salumbar', 'Sanchore', 'Shahpura',
    'Pushkar', 'Mount Abu', 'Kumbhalgarh', 'Mandawa', 'Ranthambore', 'Nathdwara'
  ],
  'Sikkim': [
    'Gangtok', 'Namchi (South Sikkim)', 'Geyzing (West Sikkim)', 'Mangan (North Sikkim)', 'Pakyong',
    'Soreng', 'Pelling', 'Lachung', 'Lachen', 'Ravangla', 'Yuksom', 'Zuluk', 'Nathula',
    'Gurudongmar', 'Singtam', 'Rangpo', 'Jorethang', 'Rinchenpong'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)', 'Salem', 'Tiruppur', 'Erode',
    'Tirunelveli', 'Vellore', 'Thoothukudi (Tuticorin)', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi (Virudhunagar)',
    'Karur', 'Udhagamandalam (Ooty / Nilgiris)', 'Hosur (Krishnagiri)', 'Nagercoil (Kanyakumari)', 'Kanchipuram',
    'Kumarapalayam', 'Karaikkudi (Sivaganga)', 'Neyveli (Cuddalore)', 'Cuddalore', 'Kumbakonam', 'Tiruvannamalai',
    'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai', 'Vaniyambadi (Tirupattur)', 'Ambur', 'Nagapattinam',
    'Ariyalur', 'Chengalpattu', 'Dharmapuri', 'Kallakurichi', 'Mayiladuthurai', 'Namakkal', 'Perambalur',
    'Ramanathapuram', 'Tenkasi', 'Theni', 'Tiruvallur', 'Tiruvarur', 'Viluppuram', 'Kodaikanal',
    'Rameswaram', 'Mahabalipuram', 'Yercaud', 'Coonoor', 'Chidambaram', 'Velankanni'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal (Hanamkonda)', 'Nizamabad', 'Karimnagar', 'Ramagundam (Peddapalli)', 'Khammam',
    'Mahabubnagar', 'Nalgonda', 'Adilabad', 'Siddipet', 'Suryapet', 'Miryalaguda', 'Jagtial', 'Mancherial',
    'Nirmal', 'Kamareddy', 'Kothagudem (Bhadradri)', 'Bhadradri Kothagudem', 'Jangaon', 'Jayashankar Bhupalpally',
    'Jogulamba Gadwal', 'Kumuram Bheem Asifabad', 'Mahabubabad', 'Medak', 'Medchal-Malkajgiri', 'Mulugu',
    'Nagarkurnool', 'Narayanpet', 'Rajanna Sircilla', 'Ranga Reddy (Shamshabad)', 'Sangareddy', 'Vikarabad',
    'Wanaparthy', 'Yadadri Bhuvanagiri', 'Nagarjuna Sagar', 'Bhadrachalam', 'Secunderabad'
  ],
  'Tripura': [
    'Agartala (West Tripura)', 'Dharmanagar (North Tripura)', 'Udaipur (Gomati)', 'Kailashahar (Unakoti)',
    'Bishramganj (Sepahijala)', 'Teliamura (Khowai)', 'Khowai', 'Belonia (South Tripura)', 'Ambassa (Dhalai)',
    'Melaghar', 'Sabroom', 'Santirbazar', 'Kumarghat', 'Ranirbazar', 'Jampui Hills', 'Neermahal', 'Unakoti'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh',
    'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti',
    'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah',
    'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar (Noida / Greater Noida)',
    'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras',
    'Jalaun (Orai)', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj',
    'Kaushambi', 'Kheri (Lakhimpur Kheri)', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj',
    'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar',
    'Pilibhit', 'Pratapgarh', 'Prayagraj (Allahabad)', 'Raebareli', 'Rampur', 'Saharanpur',
    'Sambhal', 'Sant Kabir Nagar (Khalilabad)', 'Shahjahanpur', 'Shamli', 'Shravasti',
    'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi',
    'Vrindavan', 'Fatehpur Sikri', 'Sarnath', 'Barsana', 'Goverdhan'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Roorkee', 'Haldwani', 'Rudrapur (Udham Singh Nagar)',
    'Kashipur', 'Mussoorie', 'Almora', 'Pithoragarh', 'Pauri Garhwal (Kotdwar)', 'Tehri Garhwal (New Tehri)',
    'Chamoli (Gopeshwar)', 'Uttarkashi', 'Bageshwar', 'Champawat', 'Rudraprayag', 'Auli', 'Kedarnath',
    'Badrinath', 'Ranikhet', 'Jim Corbett (Ramnagar)', 'Chopta', 'Lansdowne', 'Kausani', 'Valley of Flowers',
    'Mukteshwar', 'Joshimath', 'Dhanaulti', 'Kanakchauri', 'Gangotri', 'Yamunotri', 'Hemkund Sahib'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Asansol (Paschim Bardhaman)', 'Siliguri', 'Durgapur', 'Bardhaman (Purba Bardhaman)',
    'Malda (English Bazar)', 'Baharampur (Murshidabad)', 'Habra (North 24 Parganas)', 'Kharagpur (Paschim Medinipur)',
    'Shantipur (Nadia)', 'Dankuni (Hooghly)', 'Dhulian', 'Ranaghat', 'Haldia (Purba Medinipur)', 'Raiganj (Uttar Dinajpur)',
    'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat (Dakshin Dinajpur)', 'Basirhat',
    'Bankura', 'Chinsurah', 'Alipurduar', 'Purulia', 'Jhargram', 'Cooch Behar', 'Kalimpong',
    'Darjeeling', 'Birbhum (Suri / Bolpur)', 'South 24 Parganas (Baruipur / Alipore)',
    'Digha', 'Sundarbans', 'Shantiniketan', 'Mirik', 'Dooars', 'Kurseong', 'Mandarmani', 'Bakkhali'
  ],

  // ── Union Territories ──
  'Andaman and Nicobar Islands': [
    'South Andaman (Port Blair)', 'North and Middle Andaman (Mayabunder)', 'Nicobars (Car Nicobar)',
    'Havelock Island (Swaraj Dweep)', 'Neil Island (Shaheed Dweep)', 'Diglipur', 'Baratang', 'Ross Island',
    'Rangat', 'Little Andaman (Hut Bay)'
  ],
  'Chandigarh': [
    'Chandigarh Capital City', 'Sector 17 Commercial Plaza', 'Sukhna Lake & Rock Garden Environs',
    'Manimajra', 'Industrial Area Phase 1 & 2'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Daman', 'Diu', 'Silvassa (Dadra and Nagar Haveli)', 'Nani Daman', 'Moti Daman', 'Ghoghla'
  ],
  'Delhi': [
    'New Delhi', 'Central Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'South Delhi',
    'South East Delhi', 'South West Delhi', 'West Delhi', 'East Delhi', 'Shahdara',
    'Old Delhi & Chandni Chowk', 'Connaught Place', 'Hauz Khas & Mehrauli', 'Aerocity & Dwarka',
    'Rohini & Pitampura', 'Saket & Vasant Kunj'
  ],
  'Jammu & Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Budgam', 'Pulwama', 'Kupwara', 'Shopian',
    'Ganderbal', 'Bandipora', 'Kulgam', 'Kathua', 'Udhampur', 'Reasi', 'Samba', 'Rajouri',
    'Poonch', 'Doda', 'Ramban', 'Kishtwar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Patnitop',
    'Katra (Vaishno Devi)', 'Doodhpathri', 'Yusmarg', 'Aharbal', 'Verinag'
  ],
  'Ladakh': [
    'Leh', 'Kargil', 'Nubra Valley (Diskit / Hunder)', 'Pangong Tso', 'Zanskar (Padum)',
    'Tso Moriri', 'Turtuk', 'Khardung La', 'Drass', 'Changthang'
  ],
  'Lakshadweep': [
    'Kavaratti', 'Agatti Island', 'Amini', 'Andrott', 'Bangaram Island', 'Bitra',
    'Chetlat', 'Kadmat', 'Kalpeni', 'Kiltan', 'Minicoy'
  ],
  'Puducherry': [
    'Puducherry (Pondicherry)', 'Karaikal', 'Mahe', 'Yanam',
    'White Town (French Quarter)', 'Auroville', 'Paradise Beach'
  ]
}

export const ALL_INDIAN_STATES: string[] = Object.keys(INDIA_STATES_AND_CITIES).sort()

// Coordinates for all 36 Indian states and UTs (approx centroid/capital)
export const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Andhra Pradesh': { lat: 16.50, lng: 80.64 },
  'Arunachal Pradesh': { lat: 27.08, lng: 93.60 },
  'Assam': { lat: 26.14, lng: 91.73 },
  'Bihar': { lat: 25.59, lng: 85.13 },
  'Chhattisgarh': { lat: 21.25, lng: 81.62 },
  'Goa': { lat: 15.29, lng: 74.12 },
  'Gujarat': { lat: 23.21, lng: 72.63 },
  'Haryana': { lat: 29.05, lng: 76.08 },
  'Himachal Pradesh': { lat: 31.10, lng: 77.17 },
  'Jharkhand': { lat: 23.34, lng: 85.30 },
  'Karnataka': { lat: 12.97, lng: 77.59 },
  'Kerala': { lat: 10.85, lng: 76.27 },
  'Madhya Pradesh': { lat: 23.25, lng: 77.41 },
  'Maharashtra': { lat: 19.07, lng: 72.87 },
  'Manipur': { lat: 24.81, lng: 93.93 },
  'Meghalaya': { lat: 25.57, lng: 91.89 },
  'Mizoram': { lat: 23.72, lng: 92.71 },
  'Nagaland': { lat: 25.67, lng: 94.10 },
  'Odisha': { lat: 20.29, lng: 85.82 },
  'Punjab': { lat: 31.14, lng: 75.34 },
  'Rajasthan': { lat: 26.91, lng: 75.78 },
  'Sikkim': { lat: 27.33, lng: 88.61 },
  'Tamil Nadu': { lat: 13.08, lng: 80.27 },
  'Telangana': { lat: 17.38, lng: 78.48 },
  'Tripura': { lat: 23.83, lng: 91.28 },
  'Uttar Pradesh': { lat: 26.84, lng: 80.94 },
  'Uttarakhand': { lat: 30.31, lng: 78.03 },
  'West Bengal': { lat: 22.57, lng: 88.36 },
  'Andaman and Nicobar Islands': { lat: 11.62, lng: 92.72 },
  'Chandigarh': { lat: 30.73, lng: 76.77 },
  'Dadra and Nagar Haveli and Daman and Diu': { lat: 20.42, lng: 72.83 },
  'Delhi': { lat: 28.61, lng: 77.20 },
  'Jammu & Kashmir': { lat: 34.08, lng: 74.79 },
  'Ladakh': { lat: 34.15, lng: 77.57 },
  'Lakshadweep': { lat: 10.56, lng: 72.64 },
  'Puducherry': { lat: 11.94, lng: 79.80 },
}

// Common Airport code mappings to state and city
const AIRPORT_MAPPINGS: Record<string, { state: string; city: string }> = {
  'bdq': { state: 'Gujarat', city: 'Vadodara' },
  'vadodara': { state: 'Gujarat', city: 'Vadodara' },
  'del': { state: 'Delhi', city: 'New Delhi' },
  'delhi': { state: 'Delhi', city: 'New Delhi' },
  'bom': { state: 'Maharashtra', city: 'Mumbai' },
  'mumbai': { state: 'Maharashtra', city: 'Mumbai' },
  'blr': { state: 'Karnataka', city: 'Bengaluru' },
  'bangalore': { state: 'Karnataka', city: 'Bengaluru' },
  'bengaluru': { state: 'Karnataka', city: 'Bengaluru' },
  'hyd': { state: 'Telangana', city: 'Hyderabad' },
  'hyderabad': { state: 'Telangana', city: 'Hyderabad' },
  'maa': { state: 'Tamil Nadu', city: 'Chennai' },
  'chennai': { state: 'Tamil Nadu', city: 'Chennai' },
  'ccu': { state: 'West Bengal', city: 'Kolkata' },
  'kolkata': { state: 'West Bengal', city: 'Kolkata' },
  'cok': { state: 'Kerala', city: 'Kochi' },
  'kochi': { state: 'Kerala', city: 'Kochi' },
  'cochin': { state: 'Kerala', city: 'Kochi' },
  'kerala': { state: 'Kerala', city: 'Kochi' },
  'goi': { state: 'Goa', city: 'Panaji' },
  'gox': { state: 'Goa', city: 'Panaji' },
  'goa': { state: 'Goa', city: 'Panaji' },
  'amd': { state: 'Gujarat', city: 'Ahmedabad' },
  'ahmedabad': { state: 'Gujarat', city: 'Ahmedabad' },
  'gujarat': { state: 'Gujarat', city: 'Ahmedabad' },
  'jai': { state: 'Rajasthan', city: 'Jaipur' },
  'jaipur': { state: 'Rajasthan', city: 'Jaipur' },
  'rajasthan': { state: 'Rajasthan', city: 'Jaipur' },
  'pnq': { state: 'Maharashtra', city: 'Pune' },
  'pune': { state: 'Maharashtra', city: 'Pune' },
  'lko': { state: 'Uttar Pradesh', city: 'Lucknow' },
  'atq': { state: 'Punjab', city: 'Amritsar' },
  'amritsar': { state: 'Punjab', city: 'Amritsar' },
  'ded': { state: 'Uttarakhand', city: 'Dehradun' },
  'dehradun': { state: 'Uttarakhand', city: 'Dehradun' },
  'rishikesh': { state: 'Uttarakhand', city: 'Rishikesh' },
  'uttarakhand': { state: 'Uttarakhand', city: 'Dehradun' },
  'sxr': { state: 'Jammu & Kashmir', city: 'Srinagar' },
  'ixl': { state: 'Ladakh', city: 'Leh' },
  'leh': { state: 'Ladakh', city: 'Leh' },
  'ladakh': { state: 'Ladakh', city: 'Leh' },
  'ixc': { state: 'Chandigarh', city: 'Chandigarh' },
  'gau': { state: 'Assam', city: 'Guwahati' },
  'bbi': { state: 'Odisha', city: 'Bhubaneswar' },
  'pat': { state: 'Bihar', city: 'Patna' },
  'idr': { state: 'Madhya Pradesh', city: 'Indore' },
  'trv': { state: 'Kerala', city: 'Thiruvananthapuram' },
}

/**
 * Given a search string, airport code, or destination, resolves the corresponding state and city.
 */
export function resolveStateAndCity(query: string): { state: string; city: string } {
  const raw = (query || '').trim()
  if (!raw) return { state: 'Uttarakhand', city: 'Dehradun' }

  const q = raw.toLowerCase()

  // 1. Direct airport/code or alias lookup
  for (const [key, mapping] of Object.entries(AIRPORT_MAPPINGS)) {
    if (q === key || q.includes(key) || q.startsWith(key)) {
      return mapping
    }
  }

  // 2. Direct match on state name
  for (const state of ALL_INDIAN_STATES) {
    if (state.toLowerCase() === q || q.includes(state.toLowerCase()) || state.toLowerCase().includes(q)) {
      const cities = INDIA_STATES_AND_CITIES[state]
      return { state, city: cities[0] || state }
    }
  }

  // 3. Match on city name
  for (const [state, cities] of Object.entries(INDIA_STATES_AND_CITIES)) {
    for (const city of cities) {
      if (city.toLowerCase() === q || q.includes(city.toLowerCase()) || city.toLowerCase().includes(q)) {
        return { state, city }
      }
    }
  }

  return { state: 'Uttarakhand', city: 'Dehradun' }
}

/**
 * Calculate accurate road/air travel distance and duration between two Indian locations
 */
export function calculateAccurateDistanceAndDuration(fromPlace: string, toPlace: string): { distanceKm: number; durationHours: number } {
  const fromInfo = resolveStateAndCity(fromPlace)
  const toInfo = resolveStateAndCity(toPlace)

  const c1 = STATE_COORDINATES[fromInfo.state] || { lat: 20, lng: 78 }
  const c2 = STATE_COORDINATES[toInfo.state] || { lat: 21, lng: 79 }

  if (fromInfo.state === toInfo.state && fromInfo.city === toInfo.city) {
    return { distanceKm: 45, durationHours: 1.2 }
  }

  if (fromInfo.state === toInfo.state) {
    // Inter-city in same state
    return { distanceKm: 185, durationHours: 4.0 }
  }

  // Great-circle Haversine
  const R = 6371 // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const straightDistance = R * c

  // Actual driving corridor factor ~ 1.32x straight line distance
  const distanceKm = Math.round(straightDistance * 1.32)

  // Average road transit speed across Indian highways & terrain ~ 55 km/h
  const durationHours = Math.round((distanceKm / 55) * 10) / 10

  return {
    distanceKm: Math.max(60, distanceKm),
    durationHours: Math.max(1.5, durationHours),
  }
}
