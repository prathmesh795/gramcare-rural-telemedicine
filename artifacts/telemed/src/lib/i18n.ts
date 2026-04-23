import { create } from "zustand";
import { useEffect } from "react";
import {
  useGetMyProfile,
  useUpdateMyProfile,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import { useUser } from "@clerk/react";

type Language = "en" | "hi";

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18nStore = create<I18nStore>((set) => ({
  language: (typeof window !== "undefined"
    ? (localStorage.getItem("telemed-lang") as Language)
    : null) || "en",
  setLanguage: (lang: Language) => {
    if (typeof window !== "undefined")
      localStorage.setItem("telemed-lang", lang);
    set({ language: lang });
  },
}));

const en = {
  "app.name": "GramCare",
  "app.tagline": "Quality care, within reach — in every village.",
  "nav.home": "Home",
  "nav.dashboard": "Dashboard",
  "nav.book": "Book",
  "nav.appointments": "Appointments",
  "nav.documents": "Documents",
  "nav.symptoms": "Symptoms",
  "nav.emergency": "Emergency",
  "nav.chat": "Chat",
  "nav.patients": "Patients",
  "auth.signin": "Sign In",
  "auth.signup": "Sign Up",
  "auth.signout": "Sign Out",
  "auth.backHome": "Back to home",
  "landing.hero": "Healthcare that reaches every village.",
  "landing.sub":
    "Talk to qualified doctors, check symptoms, and get care from home — even on slow connections.",
  "landing.howItWorks": "How it works",
  "landing.step1":
    "Create a free account. Choose whether you are a patient or a doctor.",
  "landing.step2":
    "Pick a doctor and book an appointment, or check your symptoms right away.",
  "landing.step3":
    "Talk over chat, share documents, and reach help in an emergency.",
  "landing.privacy":
    "Your information stays private and is shared only with the doctor you choose. You are always in control.",
  "feat.doctors.title": "Trusted doctors",
  "feat.doctors.body":
    "Browse specialists and book an appointment that fits your day.",
  "feat.emergency.title": "Emergency button",
  "feat.emergency.body":
    "One tap alerts on-call doctors when minutes matter most.",
  "feat.language.title": "Hindi & English",
  "feat.language.body":
    "Use the app comfortably in the language your family speaks.",
  "feat.lowband.title": "Low-bandwidth ready",
  "feat.lowband.body":
    "Works on weak mobile networks. Messages wait when you go offline.",
  "role.welcome": "Welcome to GramCare",
  "role.select": "Tell us who you are so we can set things up.",
  "role.patient": "I am a patient",
  "role.patientBody": "Book care for me and my family.",
  "role.doctor": "I am a doctor",
  "role.doctorBody": "Receive appointment requests and emergencies.",
  "role.name": "Full name",
  "role.namePh": "e.g. Anjali Sharma",
  "role.village": "Village or town",
  "role.villagePh": "e.g. Ramnagar",
  "role.specialty": "Specialty",
  "role.specialtyPh": "e.g. General Medicine, Pediatrics",
  "role.continue": "Continue",
  "summary.upcoming": "Upcoming",
  "summary.pending": "Pending",
  "summary.completed": "Completed",
  "summary.total": "Total",
  "patient.dash.welcome": "Hello there",
  "patient.dash.sub": "How can we help you today?",
  "patient.dash.upcoming": "Your upcoming appointments",
  "patient.dash.noUpcoming": "No upcoming appointments. Book one any time.",
  "patient.dash.book": "Book appointment",
  "patient.dash.bookSub": "Find a doctor and pick a time.",
  "patient.dash.symp": "Check symptoms",
  "patient.dash.sympSub": "Get quick guidance before a visit.",
  "patient.dash.docs": "My documents",
  "patient.dash.docsSub": "Save reports, prescriptions, scans.",
  "patient.dash.emer": "Emergency",
  "patient.dash.emerSub": "Alert doctors immediately.",
  "patient.dash.chatSub": "Message your care team.",
  "patient.dash.appointmentsSub": "View and manage all visits.",
  "patient.book.title": "Choose a doctor",
  "patient.book.none": "No doctors available yet. Please check back soon.",
  "patient.book.pickSlot": "Pick a time slot",
  "patient.book.reason": "What would you like help with?",
  "patient.book.reasonPh": "e.g. fever and cough for 3 days",
  "patient.book.submit": "Request appointment",
  "patient.book.fillAll": "Please pick a time and add a reason.",
  "patient.book.booked": "Appointment requested.",
  "appointments.upcoming": "Upcoming",
  "appointments.past": "Past",
  "docs.upload": "Upload a document",
  "docs.name": "Document name",
  "docs.namePh": "e.g. Blood report",
  "docs.choose": "Choose a file",
  "docs.compressing": "Preparing...",
  "docs.hint": "Photos are automatically compressed to save data.",
  "docs.uploaded": "Document saved.",
  "docs.yours": "Your documents",
  "docs.empty": "No documents yet.",
  "doc.accept": "Accept",
  "doc.reject": "Reject",
  "doc.complete": "Mark completed",
  "doc.accepted": "Appointment accepted.",
  "doc.rejected": "Appointment rejected.",
  "doc.updated": "Updated.",
  "doc.chat": "Chat",
  "doc.records": "Records",
  "doc.resolve": "Mark resolved",
  "doc.emerResolved": "Emergency marked resolved.",
  "doc.noAppointments": "No appointments yet.",
  "doc.noDocs": "This patient has not uploaded any documents yet.",
  "doc.documents": "Documents",
  "doc.dash.welcome": "Welcome, Doctor",
  "doc.dash.sub": "Here is what needs your attention.",
  "doc.dash.pending": "Pending requests",
  "doc.dash.noPending": "No pending requests.",
  "doc.dash.today": "Today's schedule",
  "doc.dash.noToday": "Nothing on the calendar today.",
  "doc.activeEmer": "Active emergencies",
  "chat.offline": "Offline — your message will send when you reconnect.",
  "chat.queued": "Waiting to send",
  "chat.send": "Send",
  "chat.placeholder": "Type your message...",
  "chat.empty": "No conversations yet",
  "chat.emptyHint":
    "Once you book an appointment or receive a message, it will show here.",
  "chat.back": "All chats",
  "symp.title": "Symptom checker",
  "symp.sub": "Select what you are feeling. This is guidance, not a diagnosis.",
  "symp.pick": "What are you feeling?",
  "symp.pickAtLeast": "Please select at least one symptom.",
  "symp.age": "Age group",
  "symp.check": "Check now",
  "symp.possible": "Possible conditions",
  "symp.none": "No matches. Try selecting a few symptoms.",
  "symptom.fever": "Fever",
  "symptom.cough": "Cough",
  "symptom.headache": "Headache",
  "symptom.sore throat": "Sore throat",
  "symptom.body ache": "Body ache",
  "symptom.fatigue": "Fatigue",
  "symptom.diarrhea": "Diarrhea",
  "symptom.vomiting": "Vomiting",
  "symptom.shortness of breath": "Shortness of breath",
  "symptom.chest pain": "Chest pain",
  "symptom.dizziness": "Dizziness",
  "symptom.rash": "Rash",
  "age.child": "Child",
  "age.adult": "Adult",
  "age.senior": "Senior",
  "urgency.low": "Low urgency",
  "urgency.moderate": "Moderate urgency",
  "urgency.high": "High urgency",
  "urgency.emergency": "Emergency",
  "urgency.low.msg": "You can likely manage this at home; rest and hydrate.",
  "urgency.moderate.msg": "Consider a doctor consultation in the next day or two.",
  "urgency.high.msg": "Please book an appointment with a doctor soon.",
  "urgency.emergency.msg":
    "This may be serious. Use the emergency button or visit the nearest clinic right away.",
  "emer.title": "Alert nearby doctors",
  "emer.body":
    "Use this only for real emergencies. All on-call doctors will be notified with your name and village.",
  "emer.trigger": "Send emergency alert",
  "emer.confirm": "Send an emergency alert?",
  "emer.confirmBody":
    "All available doctors will be notified immediately. Only use this for real emergencies.",
  "emer.yes": "Yes, send alert",
  "emer.sent": "Emergency alert sent.",
  "emer.notePh": "Describe the emergency briefly (optional)",
  "emer.sub": "Get help urgently when you need it most.",
  "emer.confirmed": "Help is on the way.",
  "emer.confirmedBody":
    "Doctors have been notified. Please stay reachable on chat.",
  "common.loading": "Loading...",
  "common.error": "Something went wrong. Please try again.",
  "common.retry": "Retry",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.back": "Back",
};

const hi: Record<keyof typeof en, string> = {
  "app.name": "ग्रामकेयर",
  "app.tagline": "गुणवत्तापूर्ण देखभाल, हर गाँव तक।",
  "nav.home": "होम",
  "nav.dashboard": "डैशबोर्ड",
  "nav.book": "बुक करें",
  "nav.appointments": "अपॉइंटमेंट",
  "nav.documents": "दस्तावेज़",
  "nav.symptoms": "लक्षण",
  "nav.emergency": "आपातकाल",
  "nav.chat": "चैट",
  "nav.patients": "मरीज़",
  "auth.signin": "साइन इन",
  "auth.signup": "साइन अप",
  "auth.signout": "साइन आउट",
  "auth.backHome": "होम पर वापस",
  "landing.hero": "हर गाँव तक पहुँचने वाली स्वास्थ्य सेवा।",
  "landing.sub":
    "योग्य डॉक्टरों से बात करें, लक्षण जाँचें और घर से ही देखभाल पाएँ — धीमे नेटवर्क पर भी।",
  "landing.howItWorks": "यह कैसे काम करता है",
  "landing.step1":
    "मुफ़्त खाता बनाएँ। चुनें कि आप मरीज़ हैं या डॉक्टर।",
  "landing.step2":
    "डॉक्टर चुनें और समय बुक करें, या तुरंत अपने लक्षण जाँचें।",
  "landing.step3": "चैट से बात करें, दस्तावेज़ साझा करें, आपात में मदद पाएँ।",
  "landing.privacy":
    "आपकी जानकारी निजी रहती है और केवल चुने हुए डॉक्टर के साथ साझा होती है।",
  "feat.doctors.title": "भरोसेमंद डॉक्टर",
  "feat.doctors.body":
    "विशेषज्ञों को देखें और अपनी सुविधा के समय पर अपॉइंटमेंट लें।",
  "feat.emergency.title": "आपातकालीन बटन",
  "feat.emergency.body":
    "एक टैप में ड्यूटी पर मौजूद सभी डॉक्टरों को अलर्ट भेजें।",
  "feat.language.title": "हिंदी और अंग्रेज़ी",
  "feat.language.body":
    "अपनी भाषा में आराम से ऐप इस्तेमाल करें।",
  "feat.lowband.title": "कम डेटा में भी",
  "feat.lowband.body":
    "कमज़ोर नेटवर्क पर भी काम करता है। ऑफ़लाइन होने पर संदेश बाद में भेजे जाते हैं।",
  "role.welcome": "ग्रामकेयर में आपका स्वागत है",
  "role.select": "बताइए आप कौन हैं ताकि हम सही अनुभव दिखाएँ।",
  "role.patient": "मैं मरीज़ हूँ",
  "role.patientBody": "अपने और परिवार के लिए देखभाल बुक करें।",
  "role.doctor": "मैं डॉक्टर हूँ",
  "role.doctorBody": "अपॉइंटमेंट और आपातकालीन कॉल प्राप्त करें।",
  "role.name": "पूरा नाम",
  "role.namePh": "जैसे अंजलि शर्मा",
  "role.village": "गाँव या शहर",
  "role.villagePh": "जैसे रामनगर",
  "role.specialty": "विशेषज्ञता",
  "role.specialtyPh": "जैसे सामान्य चिकित्सा, बाल रोग",
  "role.continue": "आगे बढ़ें",
  "summary.upcoming": "आने वाले",
  "summary.pending": "लंबित",
  "summary.completed": "पूरे हुए",
  "summary.total": "कुल",
  "patient.dash.welcome": "नमस्ते",
  "patient.dash.sub": "आज हम कैसे मदद कर सकते हैं?",
  "patient.dash.upcoming": "आपके आने वाले अपॉइंटमेंट",
  "patient.dash.noUpcoming":
    "कोई अपॉइंटमेंट नहीं है। जब चाहें बुक कर सकते हैं।",
  "patient.dash.book": "अपॉइंटमेंट बुक करें",
  "patient.dash.bookSub": "डॉक्टर चुनें और समय तय करें।",
  "patient.dash.symp": "लक्षण जाँचें",
  "patient.dash.sympSub": "डॉक्टर से पहले शुरुआती सलाह पाएँ।",
  "patient.dash.docs": "मेरे दस्तावेज़",
  "patient.dash.docsSub": "रिपोर्ट, दवा पर्ची, स्कैन सहेजें।",
  "patient.dash.emer": "आपातकाल",
  "patient.dash.emerSub": "तुरंत डॉक्टरों को सूचित करें।",
  "patient.dash.chatSub": "अपने डॉक्टर से बात करें।",
  "patient.dash.appointmentsSub": "सभी अपॉइंटमेंट देखें।",
  "patient.book.title": "एक डॉक्टर चुनें",
  "patient.book.none": "अभी कोई डॉक्टर उपलब्ध नहीं है।",
  "patient.book.pickSlot": "समय चुनें",
  "patient.book.reason": "आप किस बारे में मदद चाहते हैं?",
  "patient.book.reasonPh": "जैसे 3 दिन से बुखार और खाँसी",
  "patient.book.submit": "अपॉइंटमेंट भेजें",
  "patient.book.fillAll": "कृपया समय चुनें और कारण लिखें।",
  "patient.book.booked": "अपॉइंटमेंट भेजा गया।",
  "appointments.upcoming": "आने वाले",
  "appointments.past": "पिछले",
  "docs.upload": "दस्तावेज़ अपलोड करें",
  "docs.name": "दस्तावेज़ का नाम",
  "docs.namePh": "जैसे रक्त रिपोर्ट",
  "docs.choose": "फ़ाइल चुनें",
  "docs.compressing": "तैयार हो रहा है...",
  "docs.hint": "फ़ोटो डेटा बचाने के लिए अपने आप छोटी हो जाती हैं।",
  "docs.uploaded": "दस्तावेज़ सहेजा गया।",
  "docs.yours": "आपके दस्तावेज़",
  "docs.empty": "अभी कोई दस्तावेज़ नहीं है।",
  "doc.accept": "स्वीकार",
  "doc.reject": "अस्वीकार",
  "doc.complete": "पूरा चिह्नित करें",
  "doc.accepted": "अपॉइंटमेंट स्वीकार किया गया।",
  "doc.rejected": "अपॉइंटमेंट अस्वीकार किया गया।",
  "doc.updated": "अपडेट हो गया।",
  "doc.chat": "चैट",
  "doc.records": "रिकॉर्ड",
  "doc.resolve": "हल के रूप में चिह्नित",
  "doc.emerResolved": "आपातकाल हल के रूप में चिह्नित।",
  "doc.noAppointments": "अभी कोई अपॉइंटमेंट नहीं।",
  "doc.noDocs": "इस मरीज़ के दस्तावेज़ अभी नहीं हैं।",
  "doc.documents": "दस्तावेज़",
  "doc.dash.welcome": "नमस्ते डॉक्टर",
  "doc.dash.sub": "आपके ध्यान की ज़रूरत इन पर है।",
  "doc.dash.pending": "लंबित अनुरोध",
  "doc.dash.noPending": "कोई लंबित अनुरोध नहीं।",
  "doc.dash.today": "आज का कार्यक्रम",
  "doc.dash.noToday": "आज कैलेंडर पर कुछ नहीं।",
  "doc.activeEmer": "सक्रिय आपातकाल",
  "chat.offline": "ऑफ़लाइन — कनेक्ट होने पर संदेश भेजा जाएगा।",
  "chat.queued": "भेजने के लिए प्रतीक्षारत",
  "chat.send": "भेजें",
  "chat.placeholder": "अपना संदेश लिखें...",
  "chat.empty": "अभी कोई बातचीत नहीं",
  "chat.emptyHint":
    "अपॉइंटमेंट बुक करने या संदेश मिलने पर यहाँ दिखेगा।",
  "chat.back": "सभी चैट",
  "symp.title": "लक्षण जाँचक",
  "symp.sub":
    "जो महसूस हो रहा है चुनें। यह सलाह है, निदान नहीं।",
  "symp.pick": "क्या महसूस हो रहा है?",
  "symp.pickAtLeast": "कम से कम एक लक्षण चुनें।",
  "symp.age": "आयु वर्ग",
  "symp.check": "अभी जाँचें",
  "symp.possible": "संभावित स्थितियाँ",
  "symp.none": "कोई मिलान नहीं। कुछ लक्षण चुनकर पुनः प्रयास करें।",
  "symptom.fever": "बुखार",
  "symptom.cough": "खाँसी",
  "symptom.headache": "सरदर्द",
  "symptom.sore throat": "गले में खराश",
  "symptom.body ache": "बदन दर्द",
  "symptom.fatigue": "थकान",
  "symptom.diarrhea": "दस्त",
  "symptom.vomiting": "उल्टी",
  "symptom.shortness of breath": "साँस फूलना",
  "symptom.chest pain": "छाती में दर्द",
  "symptom.dizziness": "चक्कर",
  "symptom.rash": "चकत्ते",
  "age.child": "बच्चा",
  "age.adult": "वयस्क",
  "age.senior": "वरिष्ठ",
  "urgency.low": "कम आवश्यकता",
  "urgency.moderate": "मध्यम आवश्यकता",
  "urgency.high": "उच्च आवश्यकता",
  "urgency.emergency": "आपातकाल",
  "urgency.low.msg": "घर पर देखभाल संभव है; आराम करें और पानी पिएँ।",
  "urgency.moderate.msg": "एक-दो दिन में डॉक्टर से सलाह लें।",
  "urgency.high.msg": "जल्द ही डॉक्टर से अपॉइंटमेंट लें।",
  "urgency.emergency.msg":
    "यह गंभीर हो सकता है। तुरंत आपातकालीन बटन का उपयोग करें या नज़दीकी क्लिनिक जाएँ।",
  "emer.title": "नज़दीकी डॉक्टरों को सूचित करें",
  "emer.body":
    "केवल वास्तविक आपात में इस्तेमाल करें। सभी ड्यूटी डॉक्टरों को आपका नाम और गाँव भेजा जाएगा।",
  "emer.trigger": "आपातकालीन अलर्ट भेजें",
  "emer.confirm": "आपातकालीन अलर्ट भेजें?",
  "emer.confirmBody":
    "सभी उपलब्ध डॉक्टरों को तुरंत सूचित किया जाएगा। केवल वास्तविक आपात में उपयोग करें।",
  "emer.yes": "हाँ, भेजें",
  "emer.sent": "आपातकालीन अलर्ट भेजा गया।",
  "emer.notePh": "आपात का संक्षेप में वर्णन (वैकल्पिक)",
  "emer.sub": "ज़रूरत पड़ने पर तुरंत मदद पाएँ।",
  "emer.confirmed": "मदद भेजी जा रही है।",
  "emer.confirmedBody":
    "डॉक्टरों को सूचित किया गया है। कृपया चैट पर उपलब्ध रहें।",
  "common.loading": "लोड हो रहा है...",
  "common.error": "कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।",
  "common.retry": "पुनः प्रयास",
  "common.save": "सहेजें",
  "common.cancel": "रद्द करें",
  "common.back": "वापस",
};

const dict = { en, hi } as const;
export type TranslationKey = keyof typeof en;

export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const t = (key: TranslationKey | string): string => {
    const k = key as TranslationKey;
    return (dict[language] as Record<string, string>)[k] || en[k] || key;
  };
  return { t, language };
}

export function useSyncLanguageWithProfile() {
  const { user } = useUser();
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const { data: profile } = useGetMyProfile({
    query: { enabled: !!user, queryKey: getGetMyProfileQueryKey() },
  });
  const updateProfile = useUpdateMyProfile();

  useEffect(() => {
    if (profile && profile.language && profile.language !== language) {
      setLanguage(profile.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.language]);

  const changeLanguage = async (newLang: Language) => {
    setLanguage(newLang);
    if (user) {
      try {
        await updateProfile.mutateAsync({ data: { language: newLang } });
      } catch {
        // non-fatal — UI has already switched
      }
    }
  };

  return { changeLanguage };
}
