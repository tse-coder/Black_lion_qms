// Internationalization (i18n) for English and Amharic

export type Language = 'en' | 'am';

export const translations = {
  en: {
    // Common
    appName: 'Black Lion Hospital',
    subtitle: 'Digital Queue Management System',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    close: 'Close',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    refresh: 'Refresh',
    
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    checkIn: 'Check-in',
    display: 'Queue Display',
    patients: 'Patients',
    queues: 'Queues',
    users: 'Users',
    settings: 'Settings',
    notifications: 'Notifications',
    reports: 'Reports',
    
    // Auth
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    demoLogin: 'Demo Login',
    loginAs: 'Login as',
    welcomeBack: 'Welcome Back',
    loginDescription: 'Enter your credentials to access your account',
    
    // Roles
    patient: 'Patient',
    doctor: 'Doctor',
    labTechnician: 'Lab Technician',
    admin: 'Admin',
    
    // Queue
    queueNumber: 'Queue Number',
    department: 'Department',
    serviceType: 'Service Type',
    priority: 'Priority',
    status: 'Status',
    estimatedWait: 'Estimated Wait',
    position: 'Position in Queue',
    joinedAt: 'Joined At',
    nowServing: 'Now Serving',
    waiting: 'Waiting',
    inProgress: 'In Progress',
    complete: 'Complete',
    cancelled: 'Cancelled',
    callNext: 'Call Next',
    completePatient: 'Complete',
    
    // Priority
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    // Departments
    cardiology: 'Cardiology',
    laboratory: 'Laboratory',
    radiology: 'Radiology',
    pharmacy: 'Pharmacy',
    emergency: 'Emergency',
    generalMedicine: 'General Medicine',
    orthopedics: 'Orthopedics',
    pediatrics: 'Pediatrics',
    
    // Service Types
    generalConsultation: 'General Consultation',
    specialist: 'Specialist',
    labTest: 'Laboratory Test',
    imaging: 'Imaging',
    medicationPickup: 'Medication Pickup',
    emergencyService: 'Emergency Service',
    
    // Check-in
    checkInTitle: 'Patient Check-in',
    checkInDescription: 'Enter your details to get a queue number',
    cardNumber: 'Card Number',
    selectDepartment: 'Select Department',
    selectServiceType: 'Select Service Type',
    selectPriority: 'Select Priority',
    getTicket: 'Get Ticket',
    ticketGenerated: 'Ticket Generated!',
    yourQueueNumber: 'Your Queue Number',
    pleaseWait: 'Please wait for your number to be called',
    printTicket: 'Print Ticket',
    
    // Landing
    welcomeTitle: 'Welcome to Black Lion Hospital',
    welcomeSubtitle: 'Digital Queue Management System',
    searchQueue: 'Search Queue Status',
    searchPlaceholder: 'Enter queue number or phone number',
    searchButton: 'Search',
    getNewTicket: 'Get a New Ticket',
    
    // Display
    displayTitle: 'Queue Display',
    refreshing: 'Refreshing...',
    lastUpdated: 'Last Updated',
    noPatients: 'No patients waiting',
    
    // Doctor Dashboard
    doctorDashboard: 'Doctor Dashboard',
    currentlyServing: 'Currently Serving',
    waitingPatients: 'Waiting Patients',
    todayStatistics: 'Today\'s Statistics',
    totalWaiting: 'Total Waiting',
    urgentCases: 'Urgent Cases',
    highPriorityCases: 'High Priority',
    avgWaitTime: 'Avg. Wait Time',
    noCurrentPatient: 'No patient currently being served',
    noWaitingPatients: 'No patients waiting',
    
    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    userManagement: 'User Management',
    queueManagement: 'Queue Management',
    systemOverview: 'System Overview',
    allDepartments: 'All Departments',
    activeQueues: 'Active Queues',
    totalUsers: 'Total Users',
    todayVisits: 'Today\'s Visits',
    
    // Lab Dashboard
    labDashboard: 'Lab Technician Dashboard',
    labQueue: 'Laboratory Queue',
    pendingTests: 'Pending Tests',
    completedTests: 'Completed Tests',
    
    // Patient Dashboard
    patientDashboard: 'Patient Dashboard',
    myQueues: 'My Queues',
    queueHistory: 'Queue History',
    myProfile: 'My Profile',
    
    // Messages
    loginSuccess: 'Login successful',
    loginError: 'Invalid email or password',
    logoutSuccess: 'Logged out successfully',
    queueCreated: 'Queue ticket created successfully',
    queueNotFound: 'Queue not found',
    patientCalled: 'Next patient has been called',
    patientCompleted: 'Patient consultation completed',
    networkError: 'Network error. Please try again.',
    
    // Time
    minutes: 'minutes',
    hours: 'hours',
    justNow: 'Just now',
    ago: 'ago',
  },
  
  am: {
    // Common - Amharic (placeholder translations)
    appName: 'ጥቁር አንበሳ ሆስፒታል',
    subtitle: 'ዲጂታል ወረፋ አስተዳደር ስርዓት',
    loading: 'በመጫን ላይ...',
    error: 'ስህተት',
    success: 'ተሳክቷል',
    cancel: 'ይቅር',
    confirm: 'አረጋግጥ',
    save: 'አስቀምጥ',
    edit: 'አርትዕ',
    delete: 'ሰርዝ',
    search: 'ፈልግ',
    back: 'ተመለስ',
    next: 'ቀጣይ',
    submit: 'አስገባ',
    close: 'ዝጋ',
    logout: 'ውጣ',
    login: 'ግባ',
    register: 'ተመዝገብ',
    refresh: 'አድስ',
    
    // Navigation
    home: 'መነሻ',
    dashboard: 'ዳሽቦርድ',
    checkIn: 'ቼክ-ኢን',
    display: 'ወረፋ ማሳያ',
    patients: 'ታካሚዎች',
    queues: 'ወረፋዎች',
    users: 'ተጠቃሚዎች',
    settings: 'ቅንብሮች',
    notifications: 'ማስታወቂያዎች',
    reports: 'ሪፖርቶች',
    
    // Auth
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    forgotPassword: 'የይለፍ ቃል ረሳሁ?',
    noAccount: 'መለያ የሎትም?',
    hasAccount: 'መለያ አሎት?',
    demoLogin: 'ዴሞ መግቢያ',
    loginAs: 'እንደ ግባ',
    welcomeBack: 'እንኳን ደህና መጡ',
    loginDescription: 'መለያዎን ለመድረስ መረጃዎን ያስገቡ',
    
    // Roles
    patient: 'ታካሚ',
    doctor: 'ሐኪም',
    labTechnician: 'የላብ ቴክኒሻን',
    admin: 'አስተዳዳሪ',
    
    // Queue
    queueNumber: 'የወረፋ ቁጥር',
    department: 'ክፍል',
    serviceType: 'የአገልግሎት ዓይነት',
    priority: 'ቅድሚያ',
    status: 'ሁኔታ',
    estimatedWait: 'የሚገመት ጊዜ',
    position: 'በወረፋ ውስጥ ቦታ',
    joinedAt: 'የተቀላቀለበት ጊዜ',
    nowServing: 'አሁን እየተገለገለ ያለ',
    waiting: 'በመጠበቅ ላይ',
    inProgress: 'በሂደት ላይ',
    complete: 'ተጠናቅቋል',
    cancelled: 'ተሰርዟል',
    callNext: 'ቀጣዩን ጥራ',
    completePatient: 'ጨርስ',
    
    // Priority
    urgent: 'አስቸኳይ',
    high: 'ከፍተኛ',
    medium: 'መካከለኛ',
    low: 'ዝቅተኛ',
    
    // Departments
    cardiology: 'የልብ ክፍል',
    laboratory: 'ላቦራቶሪ',
    radiology: 'ራዲዮሎጂ',
    pharmacy: 'ፋርማሲ',
    emergency: 'ድንገተኛ',
    generalMedicine: 'ጠቅላላ ህክምና',
    orthopedics: 'ኦርቶፔዲክስ',
    pediatrics: 'የህፃናት',
    
    // Service Types
    generalConsultation: 'ጠቅላላ ምክክር',
    specialist: 'ስፔሻሊስት',
    labTest: 'የላብ ምርመራ',
    imaging: 'ምስል',
    medicationPickup: 'መድሃኒት ማንሳት',
    emergencyService: 'የድንገተኛ አገልግሎት',
    
    // Check-in
    checkInTitle: 'የታካሚ ቼክ-ኢን',
    checkInDescription: 'የወረፋ ቁጥር ለማግኘት መረጃዎን ያስገቡ',
    cardNumber: 'የካርድ ቁጥር',
    selectDepartment: 'ክፍል ይምረጡ',
    selectServiceType: 'የአገልግሎት ዓይነት ይምረጡ',
    selectPriority: 'ቅድሚያ ይምረጡ',
    getTicket: 'ትኬት ያግኙ',
    ticketGenerated: 'ትኬት ተፈጥሯል!',
    yourQueueNumber: 'የእርስዎ ወረፋ ቁጥር',
    pleaseWait: 'እባክዎ ቁጥርዎ እስኪጠራ ይጠብቁ',
    printTicket: 'ትኬት ያትሙ',
    
    // Landing
    welcomeTitle: 'ወደ ጥቁር አንበሳ ሆስፒታል እንኳን ደህና መጡ',
    welcomeSubtitle: 'ዲጂታል ወረፋ አስተዳደር ስርዓት',
    searchQueue: 'የወረፋ ሁኔታ ፈልግ',
    searchPlaceholder: 'የወረፋ ቁጥር ወይም ስልክ ያስገቡ',
    searchButton: 'ፈልግ',
    getNewTicket: 'አዲስ ትኬት ያግኙ',
    
    // Display
    displayTitle: 'ወረፋ ማሳያ',
    refreshing: 'በማደስ ላይ...',
    lastUpdated: 'የመጨረሻ ማሻሻያ',
    noPatients: 'ምንም ታካሚ አይጠብቅም',
    
    // Doctor Dashboard
    doctorDashboard: 'የሐኪም ዳሽቦርድ',
    currentlyServing: 'አሁን እየተገለገለ ያለ',
    waitingPatients: 'በመጠበቅ ላይ ያሉ ታካሚዎች',
    todayStatistics: 'የዛሬ ስታቲስቲክስ',
    totalWaiting: 'ጠቅላላ የሚጠብቁ',
    urgentCases: 'አስቸኳይ ጉዳዮች',
    highPriorityCases: 'ከፍተኛ ቅድሚያ',
    avgWaitTime: 'አማካይ የመጠበቅ ጊዜ',
    noCurrentPatient: 'አሁን የሚገለገል ታካሚ የለም',
    noWaitingPatients: 'ምንም ታካሚ አይጠብቅም',
    
    // Admin Dashboard
    adminDashboard: 'የአስተዳዳሪ ዳሽቦርድ',
    userManagement: 'የተጠቃሚ አስተዳደር',
    queueManagement: 'የወረፋ አስተዳደር',
    systemOverview: 'የስርዓት አጠቃላይ እይታ',
    allDepartments: 'ሁሉም ክፍሎች',
    activeQueues: 'ንቁ ወረፋዎች',
    totalUsers: 'ጠቅላላ ተጠቃሚዎች',
    todayVisits: 'የዛሬ ጎብኝዎች',
    
    // Lab Dashboard
    labDashboard: 'የላብ ቴክኒሻን ዳሽቦርድ',
    labQueue: 'የላቦራቶሪ ወረፋ',
    pendingTests: 'በመጠበቅ ላይ ያሉ ምርመራዎች',
    completedTests: 'የተጠናቀቁ ምርመራዎች',
    
    // Patient Dashboard
    patientDashboard: 'የታካሚ ዳሽቦርድ',
    myQueues: 'የእኔ ወረፋዎች',
    queueHistory: 'የወረፋ ታሪክ',
    myProfile: 'የእኔ መገለጫ',
    
    // Messages
    loginSuccess: 'መግቢያ ተሳክቷል',
    loginError: 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል',
    logoutSuccess: 'በተሳካ ሁኔታ ወጥቷል',
    queueCreated: 'የወረፋ ትኬት በተሳካ ሁኔታ ተፈጠረ',
    queueNotFound: 'ወረፋ አልተገኘም',
    patientCalled: 'ቀጣዩ ታካሚ ተጠርቷል',
    patientCompleted: 'የታካሚ ምክክር ተጠናቅቋል',
    networkError: 'የአውታር ስህተት። እባክዎ ዳግም ይሞክሩ።',
    
    // Time
    minutes: 'ደቂቃዎች',
    hours: 'ሰዓቶች',
    justNow: 'አሁኑኑ',
    ago: 'በፊት',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(key: TranslationKey, language: Language): string {
  return translations[language][key] || translations.en[key] || key;
}

export function t(key: TranslationKey, language: Language): string {
  return getTranslation(key, language);
}
