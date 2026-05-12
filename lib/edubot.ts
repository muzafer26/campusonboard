export interface BotResponse {
  text: string;
  suggestions?: string[];
}

interface Rule {
  keywords: string[];
  response: BotResponse;
}

const DEFAULT_SUGGESTIONS = [
  "What documents do I need?",
  "How do I pay fees?",
  "My document was rejected",
  "How do I register?",
];

const KNOWLEDGE_BASE: Rule[] = [
  {
    keywords: ["document", "documents", "what to upload", "required", "list", "need"],
    response: {
      text: "You need to upload 9 documents: Aadhaar Card, SSC Marksheet (10th), HSC Marksheet (12th), Leaving Certificate, Birth Certificate, Caste Certificate (or mark as N/A if General category), Allotment Letter, Fee Payment Receipt, and a Passport Photo.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["aadhaar", "aadhar", "id proof", "identity"],
    response: {
      text: "Upload a clear photo or PDF of your Aadhaar card. Both sides should be visible. Accepted formats: PDF, JPG, PNG. Max size: 10 MB.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["10th", "ssc", "school marksheet", "tenth"],
    response: {
      text: "Upload your Class 10 marksheet issued by your school board. Make sure all details are clearly visible. Accepted: PDF, JPG, PNG up to 10 MB.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["12th", "hsc", "junior college", "marksheet", "twelfth"],
    response: {
      text: "Upload your Class 12 marksheet from your junior college or board. Accepted: PDF, JPG, PNG up to 10 MB.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["caste certificate", "category", "reservation", "general", "open", "obc", "sc", "st"],
    response: {
      text: "If you belong to SC, ST, OBC, NT, or SBC category, upload your government-issued caste certificate. If you are from General/Open category, go to the Caste Certificate task and check 'Mark as Not Applicable'.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["fee", "payment", "receipt", "challan", "how to pay", "pay"],
    response: {
      text: "Pay your admission fees as instructed by the college (bank challan or online transfer). After payment, upload your payment receipt or bank challan to the Fee Payment Receipt task.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["leaving certificate", "lc", "transfer", "school leaving"],
    response: {
      text: "Upload the leaving certificate issued by your previous school or junior college. It should have the school stamp and principal signature.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["allotment letter", "merit", "application form", "cap", "allotment"],
    response: {
      text: "Upload the allotment letter or application form you received from the exam cell (CAP/ACPC/similar). This document proves you were offered admission.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["photo", "passport", "photograph", "picture"],
    response: {
      text: "Upload a recent passport-size photo with a white or light blue background. Accepted formats: JPG or PNG only. Max size: 2 MB.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["birth certificate", "dob", "date of birth", "birth"],
    response: {
      text: "Upload your birth certificate issued by the municipal corporation or hospital. It must clearly show your full name and date of birth.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["reject", "rejected", "wrong document", "reupload", "re-upload"],
    response: {
      text: "If a document was rejected, your admin has provided a reason. Go to that task on your dashboard, read the rejection reason, and upload the correct document.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["approved", "complete", "done", "finished", "all approved"],
    response: {
      text: "Once all 9 documents are approved by the admin, your admission is confirmed! You will see a green 'Admission Complete' banner on your dashboard.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["login", "password", "forgot password", "can't login", "cannot login"],
    response: {
      text: "If you cannot log in, please contact the admission office directly. They will help reset your password or check your account status.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["register", "how to register", "sign up", "registration"],
    response: {
      text: "To register, click 'Register as Student' on the homepage. You will need your Application/Merit Number from your allotment letter and your date of birth. Fill the form and wait for admin to activate your account.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["pending approval", "waiting", "account not active", "not activated", "activate"],
    response: {
      text: "Your account is under review by the admission office. This usually takes 1-2 working days. You will be informed once your account is activated. Contact the admin if urgent.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["deadline", "last date", "due date", "last day"],
    response: {
      text: "Please contact your college admission office or check the official college website for deadline information, as dates vary by institution.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["hostel", "accommodation", "room", "stay", "hostel allocation"],
    response: {
      text: "Hostel allocation is managed separately by the college hostel office. Please contact them directly after completing your online admission process here.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["contact", "help", "office", "phone", "email", "support", "admin"],
    response: {
      text: "Please contact the college admission office. For technical issues with this portal, contact the admin through the dashboard or email support@campusonboard.app.",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["hi", "hello", "hey", "namaste", "greeting"],
    response: {
      text: "Hello! 👋 I'm EduBot, your admission assistant. I can help you with document requirements, fee payment, and any questions about the online admission process. What would you like to know?",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
  {
    keywords: ["thanks", "thank you", "appreciate"],
    response: {
      text: "You're very welcome! Best wishes for your admission journey. Feel free to ask if you need any more help! 🎓",
      suggestions: DEFAULT_SUGGESTIONS,
    },
  },
];

export function getBotReply(message: string): BotResponse {
  const lowerMessage = (message || "").toLowerCase().trim();

  if (!lowerMessage) {
    return {
      text: "Please ask me a question about the admission process. I'm here to help!",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  for (const rule of KNOWLEDGE_BASE) {
    const matched = rule.keywords.some((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );
    if (matched) {
      return rule.response;
    }
  }

  return {
    text: "I'm sorry, I didn't understand that. Here are some things I can help with: document requirements, fee payment, registration process, account issues, and caste certificate. Try asking one of those, or contact the admission office directly.",
    suggestions: DEFAULT_SUGGESTIONS,
  };
}

export function getGreeting(): BotResponse {
  return {
    text: "Hello! 👋 I'm EduBot, your admission assistant. I can help you with document requirements, fee payment, and any questions about the online admission process. What would you like to know?",
    suggestions: DEFAULT_SUGGESTIONS,
  };
}