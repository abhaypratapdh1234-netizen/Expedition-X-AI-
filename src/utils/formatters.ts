// Exchange rates relative to INR (base). In a real app, fetch from an API.
const MOCK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012, // 1 INR = 0.012 USD
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ'
}

export function formatCurrency(amountInINR: number, targetCurrency: string): string {
  const rate = MOCK_RATES[targetCurrency] || 1
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || '₹'
  const convertedAmount = amountInINR * rate
  
  // Format with commas and max 2 decimal places if needed
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: targetCurrency === 'INR' ? 0 : 2
  }).format(convertedAmount)

  return `${symbol}${formatted}`
}

// Basic translator function for demonstration
const TRANSLATIONS: Record<string, Record<string, string>> = {
  'Hindi': {
    'Settings': 'सेटिंग्स',
    'Customize your ExpeditionX AI experience.': 'अपने ExpeditionX AI अनुभव को अनुकूलित करें।',
    'Notifications': 'सूचनाएं',
    'Deal Alerts': 'डील अलर्ट',
    'Get notified about travel deals': 'यात्रा सौदों के बारे में सूचित हों',
    'App Updates': 'ऐप अपडेट',
    'New features and improvements': 'नई सुविधाएँ और सुधार',
    'Trip Reminders': 'यात्रा अनुस्मारक',
    'Reminders before your trips': 'आपकी यात्राओं से पहले अनुस्मारक',
    'Preferences': 'प्राथमिकताएं',
    'Currency': 'मुद्रा',
    'Choose your preferred currency': 'अपनी पसंदीदा मुद्रा चुनें',
    'Language': 'भाषा',
    'App interface language': 'ऐप इंटरफ़ेस भाषा',
    'Legal & Support': 'कानूनी और समर्थन',
    'Privacy Policy': 'गोपनीयता नीति',
    'Terms of Service': 'सेवा की शर्तें',
    'Help & Support': 'मदद और समर्थन',
    'Danger Zone': 'डेंजर जोन',
    'Delete Account': 'खाता हटाएं',
    'Once you delete your account, there is no going back. Please be certain.': 'एक बार जब आप अपना खाता हटा देते हैं, तो वापस नहीं जा सकते। कृपया सुनिश्चित हों।',
    
    // Topbar & Sidebar
    'Dashboard': 'डैशबोर्ड',
    'My Trips': 'मेरी यात्राएं',
    'My Bookings': 'मेरी बुकिंग',
    'Wishlist': 'विशलिस्ट',
    'AI Assistant': 'एआई असिस्टेंट',
    'Reviews': 'समीक्षाएं',
    'Rewards': 'पुरस्कार',
    'Trip Planner': 'ट्रिप प्लानर',
    'Book': 'बुक करें',
    'Travel Toolkit': 'ट्रैवल टूलकिट',
    'Admin Analytics': 'एडमिन एनालिटिक्स',

    // Explore Page
    'Explore Destinations': 'गंतव्यों का अन्वेषण करें',
    "Discover the world's most beautiful places, curated by AI.": 'एआई द्वारा तैयार किए गए दुनिया के सबसे खूबसूरत स्थानों की खोज करें।',
    'Generating...': 'उत्पन्न किया जा रहा है...',
    'Recommended for you': 'आपके लिए अनुशंसित',
    'Search breathtaking destinations...': 'लुभावने गंतव्यों की खोज करें...',
    'Filters': 'फ़िल्टर',
    'All': 'सभी',
    'Searching...': 'खोज रहा है...',
    ' destinations found': ' गंतव्य मिले',
    'Trending': 'ट्रेंडिंग',
    'Historical': 'ऐतिहासिक',
    'Nature': 'प्रकृति',
    'Adventure': 'साहसिक',
    'Relaxation': 'आराम',
    'Cultural': 'सांस्कृतिक',
    'Spiritual': 'आध्यात्मिक',
    'Food': 'भोजन',

    // Trip Overview Page
    'Loading your adventure…': 'आपका रोमांच लोड हो रहा है…',
    'Live Mode': 'लाइव मोड',
    'Start': 'प्रारंभ',
    'People': 'लोग',
    'Budget': 'बजट',
    'Days': 'दिन',
    'Total Spent': 'कुल खर्च',
    'of Budget': 'बजट का',
    'used': 'इस्तेमाल किया',
    'remaining': 'बचा हुआ',
    'Open Cost Estimator': 'लागत अनुमानक खोलें',
    'Confirmed': 'पुष्टि की',
    'Upload required': 'अपलोड आवश्यक',
    'Uploaded': 'अपलोड किया गया',
    'Upload': 'अपलोड',
    'View': 'देखें',
    'Online': 'ऑनलाइन',
    'Edit Full Itinerary': 'पूरी यात्रा कार्यक्रम संपादित करें',
    'activities': 'गतिविधियां',
    'est.': 'अनुमानित',
    'Day': 'दिन',
    'Leisure Day': 'फुरसत का दिन',
    'Itinerary': 'यात्रा कार्यक्रम',
    'Bookings': 'बुकिंग',
    'Documents': 'दस्तावेज़',
    'Collaborators': 'सहयोगी',
    
    // Remaining Topbar & Sidebar
    'Explore': 'खोजें',
    'Planner': 'योजनाकार',
    'Log Out': 'लॉग आउट',
    'Search destinations, trips, users...': 'गंतव्य, यात्राएं, उपयोगकर्ता खोजें...',
    'Explore the world': 'दुनिया की सैर करें',
    'Profile': 'प्रोफ़ाइल',

    // Dashboard
    'Welcome back': 'वापसी पर स्वागत है',
    'Initialize New Trip': 'नई यात्रा शुरू करें',
    'Global Footprint': 'वैश्विक पदचिह्न',
    'Total Expeditions': 'कुल अभियान',
    'AI Budget Saved': 'एआई द्वारा बचाया गया बजट',
    'Explorer Level': 'एक्सप्लोरर स्तर',
    'Cities': 'शहर',
    'Featured Expeditions': 'विशेष अभियान',
    'Financial Telemetry': 'वित्तीय टेलीमेट्री',
    'Access Console': 'कंसोल खोलें',
    'AI Travel Radar': 'एआई ट्रैवल रडार',
    'Predictive Matches': 'अनुमानित मिलान',
    'Interactive Maps': 'इंटरैक्टिव मानचित्र',
    'Route visualization': 'मार्ग दृश्य',
    'Surprise Me': 'मुझे आश्चर्यचकित करें',
    'AI generated trips': 'एआई द्वारा उत्पन्न यात्राएं',
    'Global Destination': 'वैश्विक गंतव्य',
    'Match': 'मेल'
  }
}

export function t(text: string, language: string): string {
  if (language === 'English') return text
  return TRANSLATIONS[language]?.[text] || text
}
