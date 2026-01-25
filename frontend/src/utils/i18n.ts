// Translation dictionary for Amharic and English
type Language = 'en' | 'am';

// Define the structure based on the English keys to ensure parity
export type TranslationKeys = 
  | 'login' | 'logout' | 'dashboard' | 'queue' | 'patient' | 'doctor' | 'admin' 
  | 'settings' | 'save' | 'cancel' | 'edit' | 'delete' | 'add' | 'search' 
  | 'filter' | 'loading' | 'error' | 'success' | 'welcome' | 'signIn' 
  | 'signOut' | 'email' | 'password' | 'forgotPassword' | 'rememberMe' 
  | 'loginFailed' | 'invalidCredentials' | 'home' | 'profile' | 'notifications' 
  | 'help' | 'queueStatus' | 'currentTicket' | 'nextTicket' | 'waitingTime' 
  | 'patientsInQueue' | 'averageWaitTime' | 'nowServing' | 'myAppointments' 
  | 'bookAppointment' | 'medicalHistory' | 'testResults' | 'prescriptions' 
  | 'patientList' | 'todaysAppointments' | 'patientRecords' | 'prescribeMedication' 
  | 'orderTests' | 'testQueue' | 'pendingTests' | 'completedTests' | 'sampleCollection' 
  | 'userManagement' | 'systemSettings' | 'reports' | 'analytics' | 'exportData' 
  | 'firstName' | 'lastName' | 'phoneNumber' | 'dateOfBirth' | 'gender' 
  | 'address' | 'department' | 'active' | 'inactive' | 'pending' | 'completed' 
  | 'cancelled' | 'inProgress' | 'today' | 'yesterday' | 'tomorrow' | 'thisWeek' 
  | 'thisMonth' | 'noDataFound' | 'confirmDelete' | 'operationSuccessful' | 'operationFailed'
  | 'signUp' | 'createAccount' | 'username' | 'confirmPassword' | 'role' | 'register'
  | 'registrationSuccess' | 'alreadyHaveAccount' | 'selectRole' | 'patientRole' | 'doctorRole'
  | 'labTechnicianRole' | 'adminRole' | 'passwordMismatch' | 'usernameRequired' | 'phoneRequired'
  | 'phoneInvalid' | 'roleRequired';

const translations: Record<Language, Record<TranslationKeys, string>> = {
  en: {
    // Common
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    queue: 'Queue',
    patient: 'Patient',
    doctor: 'Doctor',
    admin: 'Admin',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    welcome: 'Welcome',
    
    // Auth
    signIn: 'Sign In',
    signOut: 'Sign Out',
    signUp: 'Sign Up',
    createAccount: 'Create Account',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    username: 'Username',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
    loginFailed: 'Login failed. Please try again.',
    invalidCredentials: 'Invalid email or password.',
    registrationSuccess: 'Registration successful! Please login.',
    alreadyHaveAccount: 'Already have an account?',
    
    // Role Selection
    role: 'Role',
    selectRole: 'Select Role',
    patientRole: 'Patient',
    doctorRole: 'Doctor',
    labTechnicianRole: 'Lab Technician',
    adminRole: 'Admin',
    roleRequired: 'Role is required',
    
    // Validation
    passwordMismatch: 'Passwords do not match',
    usernameRequired: 'Username is required',
    phoneRequired: 'Phone number is required',
    phoneInvalid: 'Phone number must be in Ethiopian format (+2519xxxxxxxx)',
    
    // Navigation
    home: 'Home',
    profile: 'Profile',
    notifications: 'Notifications',
    help: 'Help',
    
    // Queue Management
    queueStatus: 'Queue Status',
    currentTicket: 'Current Ticket',
    nextTicket: 'Next Ticket',
    waitingTime: 'Waiting Time',
    patientsInQueue: 'Patients in Queue',
    averageWaitTime: 'Average Wait Time',
    nowServing: 'Now Serving',
    
    // Patient Portal
    myAppointments: 'My Appointments',
    bookAppointment: 'Book Appointment',
    medicalHistory: 'Medical History',
    testResults: 'Test Results',
    prescriptions: 'Prescriptions',
    
    // Doctor Portal
    patientList: 'Patient List',
    todaysAppointments: "Today's Appointments",
    patientRecords: 'Patient Records',
    prescribeMedication: 'Prescribe Medication',
    orderTests: 'Order Tests',
    
    // Lab Portal
    testQueue: 'Test Queue',
    pendingTests: 'Pending Tests',
    completedTests: 'Completed Tests',
    sampleCollection: 'Sample Collection',
    
    // Admin Portal
    userManagement: 'User Management',
    systemSettings: 'System Settings',
    reports: 'Reports',
    analytics: 'Analytics',
    exportData: 'Export Data',
    
    // Forms
    firstName: 'First Name',
    lastName: 'Last Name',
    phoneNumber: 'Phone Number',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    address: 'Address',
    department: 'Department',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    inProgress: 'In Progress',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    
    // Messages
    noDataFound: 'No data found',
    confirmDelete: 'Are you sure you want to delete this item?',
    operationSuccessful: 'Operation completed successfully',
    operationFailed: 'Operation failed. Please try again.',
  },
  am: {
    login: 'መግቢያ',
    logout: 'ውጣ',
    dashboard: 'ዳሽቦርድ',
    queue: 'ተራ',
    patient: 'ታካሚ',
    doctor: 'ሐኪም',
    admin: 'አስተዳዳሪ',
    settings: 'ቅንብሮች',
    save: 'አስቀምጥ',
    cancel: 'ሰርዝ',
    edit: 'አስተካክል',
    delete: 'አጥፋ',
    add: 'ጨምር',
    search: 'ፈልግ',
    filter: 'አጣራ',
    loading: 'በመጫን ላይ...',
    error: 'ስህተት',
    success: 'ተሳክቷል',
    welcome: 'እንኳን ደህና መጡ',
    signIn: 'ይግቡ',
    signOut: 'ይውጡ',
    signUp: 'ይመዝገቡ',
    createAccount: 'መለያ ይፍጠሩ',
    register: 'ይመዝገቡ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    confirmPassword: 'የይለፍ ቃል ያረጋግጡ',
    username: 'የተጠቃሚ ስም',
    forgotPassword: 'የይለፍ ቃልዎን ረስተዋል?',
    rememberMe: 'አስታውሰኝ',
    loginFailed: 'መግቢያው አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    invalidCredentials: 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል።',
    registrationSuccess: 'ምዝገባ ተሳክቷል! እባክዎ ይግቡ።',
    alreadyHaveAccount: 'መለያ አለዎት?',
    
    // Role Selection
    role: 'ሚናው',
    selectRole: 'ሚና ይምረጡ',
    patientRole: 'ታካሚ',
    doctorRole: 'ሐኪም',
    labTechnicianRole: 'ላብ ቴክኒሻን',
    adminRole: 'አስተዳዳሪ',
    roleRequired: 'ሚና ያስፈልጋል',
    
    // Validation
    passwordMismatch: 'የይለፍ ቃሎች አይደሉም',
    usernameRequired: 'የተጠቃሚ ስም ያስፈልጋል',
    phoneRequired: 'ስልክ ቁጥር ያስፈልጋል',
    phoneInvalid: 'ስልክ ቁጥር በኢትዮጵያ ቅርጸት (+2519xxxxxxxx) መሆን አለበት',
    home: 'መነሻ',
    profile: 'መገለጫ',
    notifications: 'ማሳወቂያዎች',
    help: 'እርዳታ',
    queueStatus: 'የተራ ሁኔታ',
    currentTicket: 'የአሁኑ ቲኬት',
    nextTicket: 'የሚቀጥለው ቲኬት',
    waitingTime: 'የመጠባበቂያ ጊዜ',
    patientsInQueue: 'በተራ ላይ ያሉ ታካሚዎች',
    averageWaitTime: 'አማካይ የመጠባበቂያ ጊዜ',
    nowServing: 'አሁን በመታከም ላይ',
    myAppointments: 'የኔ ቀጠሮዎች',
    bookAppointment: 'ቀጠሮ ይያዙ',
    medicalHistory: 'የሕክምና ታሪክ',
    testResults: 'የምርመራ ውጤቶች',
    prescriptions: 'የመድኃኒት ትዕዛዞች',
    patientList: 'የታካሚዎች ዝርዝር',
    todaysAppointments: 'የዛሬ ቀጠሮዎች',
    patientRecords: 'የታካሚ ማህደር',
    prescribeMedication: 'መድኃኒት እዘዝ',
    orderTests: 'ምርመራ እዘዝ',
    testQueue: 'የምርመራ ተራ',
    pendingTests: 'በጥበቃ ላይ ያሉ ምርመራዎች',
    completedTests: 'የተጠናቀቁ ምርመራዎች',
    sampleCollection: 'ናሙና አሰባሰብ',
    userManagement: 'የተጠቃሚዎች አስተዳደር',
    systemSettings: 'የስርዓት ቅንብሮች',
    reports: 'ሪፖርቶች',
    analytics: 'ትንታኔ',
    exportData: 'መረጃ ላክ',
    
    // Forms
    firstName: 'ስም',
    lastName: 'የአያት ስም',
    phoneNumber: 'ስልክ ቁጥር',
    dateOfBirth: 'የትውልድ ቀን',
    gender: 'ጾታ',
    address: 'አድራሻ',
    department: 'ክፍል',
    
    // Status
    active: 'ንቁ',
    inactive: 'ያልነቃ',
    pending: 'በጥበቃ ላይ',
    completed: 'ተጠናቋል',
    cancelled: 'ተሰርዟል',
    inProgress: 'በሂደት ላይ',
    
    // Time
    today: 'ዛሬ',
    yesterday: 'ትናንት',
    tomorrow: 'ነገ',
    thisWeek: 'በዚህ ሳምንት',
    thisMonth: 'በዚህ ወር',
    
    // Messages
    noDataFound: 'ምንም መረጃ አልተገኘም',
    confirmDelete: 'ይህንን መረጃ ለማጥፋት እርግጠኛ ነዎት?',
    operationSuccessful: 'ክንውኑ በተሳካ ሁኔታ ተጠናቅቋል',
    operationFailed: 'ክንውኑ አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
  },
};

// State management
let currentLanguage: Language = (typeof localStorage !== 'undefined' && localStorage.getItem('language') as Language) || 'en';

export const setLanguage = (lang: Language): void => {
  currentLanguage = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('language', lang);
  }
};

export const getLanguage = (): Language => currentLanguage;

export const t = (key: TranslationKeys): string => {
  return translations[currentLanguage][key] || key;
};

export const toggleLanguage = (): Language => {
  const newLang: Language = currentLanguage === 'en' ? 'am' : 'en';
  setLanguage(newLang);
  return newLang;
};

export default translations;