export const STR = {
  ar: {
    title: 'العتبة', sub: 'THRESHOLD', loading: 'جارٍ التحميل', press: 'اضغط للبدء', headphones: 'يُفضَّل استخدام السماعات',
    start: 'ابدأ', cont: 'متابعة', newRun: 'بداية جديدة', settings: 'الإعدادات', anomalies: 'الشذوذات المكتشفة', exit: 'خروج', back: 'رجوع',
    quality: 'الجودة', auto: 'تلقائي', low: 'منخفضة', medium: 'متوسطة', high: 'عالية', volume: 'الصوت', sens: 'حساسية النظر', lang: 'اللغة',
    paused: 'إيقاف مؤقت', resume: 'متابعة اللعب', toMenu: 'القائمة الرئيسية',
    intro1: '٠٣:١٤ بعد منتصف الليل', intro2: 'غادر القطار الأخير منذ زمن.', intro3: 'اقرأ الإرشادات. لا تثق بما اعتدت عليه.',
    hintDesk: 'WASD للحركة · الماوس للنظر · Shift للمشي ببطء · Esc للإيقاف', hintTouch: 'اسحب يسارًا للحركة · اسحب يمينًا للنظر', clickLock: 'انقر للتحكم بالنظر',
    found: 'شذوذ جديد مُسجَّل', unknown: '؟ ؟ ؟', easy: 'واضح', hard: 'خفي', horror: 'خطر', mediumT: 'متوسط',
    endTitle: 'خرجتَ.', endText: 'الهواء بارد، والشارع فارغ، والساعة ما زالت ٠٣:١٤.', secretTitle: 'لم تخرج.', secretText: 'رأيتَ كل شيء، فصار الممر يعرفك. الآن أنت من يقف في آخره.',
    statTime: 'الوقت', statLoops: 'الدورات', statResets: 'مرات العودة للصفر', statFound: 'الشذوذات', secretHint: 'اكتشف كل الشذوذات لترى ما وراء العتبة السابعة.', secretDone: 'رأيتَ ما وراء العتبة.',
    bye: 'يمكنك إغلاق هذه الصفحة الآن.', byeBack: 'عودة', threshold: 'العتبة', caught: 'لم تعد في الوقت المناسب.',
  },
  en: {
    title: 'العتبة', sub: 'THRESHOLD', loading: 'Loading', press: 'Press to begin', headphones: 'Headphones recommended',
    start: 'Start', cont: 'Continue', newRun: 'New run', settings: 'Settings', anomalies: 'Anomalies found', exit: 'Exit', back: 'Back',
    quality: 'Quality', auto: 'Auto', low: 'Low', medium: 'Medium', high: 'High', volume: 'Volume', sens: 'Look sensitivity', lang: 'Language',
    paused: 'Paused', resume: 'Resume', toMenu: 'Main menu',
    intro1: '03:14 a.m.', intro2: 'The last train left a long time ago.', intro3: 'Read the guidance. Do not trust what you are used to.',
    hintDesk: 'WASD to move · Mouse to look · Shift to walk slowly · Esc to pause', hintTouch: 'Drag left side to move · drag right side to look', clickLock: 'Click to look around',
    found: 'New anomaly recorded', unknown: '? ? ?', easy: 'Obvious', hard: 'Subtle', horror: 'Danger', mediumT: 'Moderate',
    endTitle: 'You are out.', endText: 'The air is cold, the street is empty, and the clock still reads 03:14.', secretTitle: 'You never left.', secretText: 'You saw everything, so the corridor knows you now. You are the one standing at the far end.',
    statTime: 'Time', statLoops: 'Loops', statResets: 'Resets to zero', statFound: 'Anomalies', secretHint: 'Find every anomaly to see what lies past the seventh threshold.', secretDone: 'You have seen what lies past the threshold.',
    bye: 'You can close this page now.', byeBack: 'Go back', threshold: 'Threshold', caught: 'You did not turn back in time.',
  },
};
export const i18n = {
  lang: 'ar',
  t(k) { return STR[this.lang][k] ?? k; },
  set(lang) {
    this.lang = lang; document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = this.t(el.dataset.i18n); });
  },
  num(n) { return this.lang === 'ar' ? String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]) : String(n); },
};
