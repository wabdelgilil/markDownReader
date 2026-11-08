export type AppLocale = 'ar' | 'en';

export interface TranslationDictionary {
  brand: {
    title: string;
    tagline: string;
  };
  navbar: {
    openFile: string;
    openFileTooltip: string;
    slideDeck: string;
    slideDeckTooltip: string;
    diagnostics: string;
    diagnosticsTooltip: string;
    exportHtml: string;
    exportHtmlTooltip: string;
    diagramThemes: string;
    diagramThemesTooltip: string;
    toggleOutline: string;
    toggleOutlineTooltip: string;
    themes: {
      light: string;
      dark: string;
      sepia: string;
      editor: string;
    };
    languageToggle: string;
  };
  outline: {
    title: string;
    searchPlaceholder: string;
    emptyText: string;
    collapse: string;
    expand: string;
  };
  viewer: {
    emptyTitle: string;
    emptySubtitle: string;
    openFileBtn: string;
    loadSampleBtn: string;
    copied: string;
    copyCode: string;
    diagramLoading: string;
    diagramStudio: string;
    diagramStudioTooltip: string;
    zoomIn: string;
    zoomOut: string;
    resetZoom: string;
    exportSvg: string;
  };
  diagramThemeModal: {
    title: string;
    subtitle: string;
    defaultBadge: string;
    customEditorTitle: string;
    resetDefault: string;
    previewTitle: string;
    cancel: string;
    apply: string;
    startNode: string;
    processNode: string;
    endNode: string;
    presets: {
      corporate: { title: string; subtitle: string };
      minimalist: { title: string; subtitle: string };
      modern: { title: string; subtitle: string };
      custom: { title: string; subtitle: string };
    };
    fields: {
      processFill: string;
      processStroke: string;
      startEndFill: string;
      startEndStroke: string;
      decisionFill: string;
      decisionStroke: string;
      arrowColor: string;
      textColor: string;
    };
  };
  diagnostics: {
    title: string;
    readingTime: string;
    minutes: string;
    wordCount: string;
    words: string;
    sections: string;
    headings: string;
    diagrams: string;
    codeBlocks: string;
    equations: string;
    links: string;
    healthTitle: string;
    healthyStatus: string;
    issuesDetected: string;
  };
  studioModal: {
    title: string;
    codeTab: string;
    previewTab: string;
    closeTooltip: string;
    exportSvg: string;
    zoomIn: string;
    zoomOut: string;
    reset: string;
  };
  presentation: {
    slide: string;
    of: string;
    exitTooltip: string;
    prevTooltip: string;
    nextTooltip: string;
    fullscreenTooltip: string;
  };
}

const translations: Record<AppLocale, TranslationDictionary> = {
  ar: {
    brand: {
      title: 'MarkDownReader',
      tagline: 'قارئ ومستعرض مستندات Markdown',
    },
    navbar: {
      openFile: 'فتح ملف',
      openFileTooltip: 'فتح ملف جديد (Ctrl+O)',
      slideDeck: 'عرض شرائح',
      slideDeckTooltip: 'عرض تقديمي بملء الشاشة',
      diagnostics: 'صحة المستند',
      diagnosticsTooltip: 'لوحة فحص جودة وتفاصيل المستند',
      exportHtml: 'تصدير HTML',
      exportHtmlTooltip: 'تصدير ملف HTML مستقل متكامل',
      diagramThemes: 'هوية المخططات',
      diagramThemesTooltip: 'تخصيص أنماط وألوان المخططات',
      toggleOutline: 'فهرس المحتويات',
      toggleOutlineTooltip: 'إظهار / إخفاء فهرس المحتويات (Ctrl+B)',
      themes: {
        light: 'فاتح',
        dark: 'داكن',
        sepia: 'ورقي',
        editor: 'محرر أكواد',
      },
      languageToggle: 'English',
    },
    outline: {
      title: 'فهرس المحتويات',
      searchPlaceholder: 'بحث في الفهرس...',
      emptyText: 'لا توجد عناوين في هذا المستند.',
      collapse: 'إخفاء فهرس المحتويات',
      expand: 'إظهار فهرس المحتويات',
    },
    viewer: {
      emptyTitle: 'لا يوجد مستند مفتوح حالياً',
      emptySubtitle: 'قم بفتح ملف Markdown محلي أو استعرض الدليل التقني النموذجي لاختبار كافة المزايا',
      openFileBtn: 'فتح ملف من الجهاز',
      loadSampleBtn: 'عرض المستند النموذجي',
      copied: 'تم النسخ! ✓',
      copyCode: 'نسخ',
      diagramLoading: 'جاري تحميل المخطط...',
      diagramStudio: 'تكبير وتفاعل',
      diagramStudioTooltip: 'فتح في استوديو تفاعلي منفصل بملء الشاشة',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      resetZoom: 'إعادة ضبط',
      exportSvg: 'تصدير SVG',
    },
    diagramThemeModal: {
      title: 'تخصيص هوية ألوان المخططات',
      subtitle: 'اختر النمط المفضل أو صمم باليت الألوان الخاص بك',
      defaultBadge: 'الافتراضي',
      customEditorTitle: 'محرر الألوان المخصص',
      resetDefault: 'استعادة الافتراضي',
      previewTitle: 'معاينة حية للمخطط بالنمط المختار',
      cancel: 'إلغاء',
      apply: 'حفظ وتطبيق فوراً',
      startNode: 'البداية',
      processNode: 'العملية',
      endNode: 'تم',
      presets: {
        corporate: {
          title: 'المؤسسي (Visio / Lucidchart)',
          subtitle: 'ألوان هندسية معتمدة مع تدرجات وظلال احترافية',
        },
        minimalist: {
          title: 'الهادئ الموحد (Notion / Linear)',
          subtitle: 'خلفيات رمادية حيادية متجانسة تماماً مع المستند بدون تشتيت',
        },
        modern: {
          title: 'العصري الفاخر (Obsidian / Raycast)',
          subtitle: 'بطاقات عائمة بحواف مستديرة وتوهج نيون مستقبلي',
        },
        custom: {
          title: 'نمط مخصص (Custom Palette)',
          subtitle: 'اختر الألوان الخاصة بك للبلوكات والأسهم والنصوص بحرية تامة',
        },
      },
      fields: {
        processFill: 'خلفية بلوك العملية',
        processStroke: 'إطار بلوك العملية',
        startEndFill: 'خلفية البداية والنهاية',
        startEndStroke: 'إطار البداية والنهاية',
        decisionFill: 'خلفية معين القرار',
        decisionStroke: 'إطار معين القرار',
        arrowColor: 'لون الأسهم وخطوط الربط',
        textColor: 'لون النصوص داخل البلوكات',
      },
    },
    diagnostics: {
      title: 'لوحة فحص المستند والإحصائيات',
      readingTime: 'وقت القراءة التقديري',
      minutes: 'دقيقة',
      wordCount: 'إجمالي الكلمات',
      words: 'كلمة',
      sections: 'الأقسام الرئيسية',
      headings: 'عناوين',
      diagrams: 'المخططات البيانية',
      codeBlocks: 'كتل الأكواد',
      equations: 'المعادلات الرياضية',
      links: 'الروابط التشعبية',
      healthTitle: 'مؤشر سلامة المستند',
      healthyStatus: 'المستند سليم ومنظم تقنياً بدون أخطاء.',
      issuesDetected: 'ملاحظات وتنبيهات تنظيمية بحاجة للمراجعة:',
    },
    studioModal: {
      title: 'استوديو استعراض المخطط التفاعلي',
      codeTab: 'الكود المصدري',
      previewTab: 'المعاينة التفاعلية',
      closeTooltip: 'إغلاق (Esc)',
      exportSvg: 'تصدير كملف SVG',
      zoomIn: 'تكبير (+)',
      zoomOut: 'تصغير (-)',
      reset: 'إعادة ضبط الأبعاد',
    },
    presentation: {
      slide: 'شريحة',
      of: 'من',
      exitTooltip: 'إنهاء العرض (Esc)',
      prevTooltip: 'الشريحة السابقة (السهم الأيمن)',
      nextTooltip: 'الشريحة التالية (السهم الأيسر أو مسافة)',
      fullscreenTooltip: 'ملء الشاشة',
    },
  },
  en: {
    brand: {
      title: 'MarkDownReader',
      tagline: 'High-Performance Markdown Document Station',
    },
    navbar: {
      openFile: 'Open File',
      openFileTooltip: 'Open File (Ctrl+O)',
      slideDeck: 'Slide Deck',
      slideDeckTooltip: 'Fullscreen Presentation Deck',
      diagnostics: 'Doc Health',
      diagnosticsTooltip: 'Document Quality & Metrics Inspector',
      exportHtml: 'Export HTML',
      exportHtmlTooltip: 'Export Self-Contained HTML File',
      diagramThemes: 'Diagram Styles',
      diagramThemesTooltip: 'Customize Diagram Styles & Color Palettes',
      toggleOutline: 'Table of Contents',
      toggleOutlineTooltip: 'Toggle Table of Contents (Ctrl+B)',
      themes: {
        light: 'Light',
        dark: 'Dark',
        sepia: 'Sepia',
        editor: 'Code Editor',
      },
      languageToggle: 'العربية',
    },
    outline: {
      title: 'Table of Contents',
      searchPlaceholder: 'Search in outline...',
      emptyText: 'No headings found in this document.',
      collapse: 'Hide Table of Contents',
      expand: 'Show Table of Contents',
    },
    viewer: {
      emptyTitle: 'No Document Currently Open',
      emptySubtitle: 'Open a local Markdown file or load the sample technical guide to explore all capabilities',
      openFileBtn: 'Open Local File',
      loadSampleBtn: 'Load Sample Document',
      copied: 'Copied! ✓',
      copyCode: 'Copy',
      diagramLoading: 'Loading diagram...',
      diagramStudio: 'Focus & Zoom',
      diagramStudioTooltip: 'Open in dedicated interactive fullscreen studio',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetZoom: 'Reset Zoom',
      exportSvg: 'Export SVG',
    },
    diagramThemeModal: {
      title: 'Diagram Style & Palette Customization',
      subtitle: 'Select an architectural preset or design your custom color palette',
      defaultBadge: 'Default',
      customEditorTitle: 'Custom Palette Editor',
      resetDefault: 'Reset to Defaults',
      previewTitle: 'Live Diagram Preview',
      cancel: 'Cancel',
      apply: 'Save & Apply',
      startNode: 'Start',
      processNode: 'Process',
      endNode: 'Done',
      presets: {
        corporate: {
          title: 'Corporate (Visio / Lucidchart)',
          subtitle: 'Approved architectural hues with professional gradients and subtle drop shadows',
        },
        minimalist: {
          title: 'Minimalist (Notion / Linear)',
          subtitle: 'Harmonized neutral zinc tones for distraction-free reading',
        },
        modern: {
          title: 'Modern (Obsidian / Raycast)',
          subtitle: 'Floating cards with rounded corners and futuristic glow accents',
        },
        custom: {
          title: 'Custom Palette',
          subtitle: 'Fully configure custom colors for blocks, borders, arrows, and labels',
        },
      },
      fields: {
        processFill: 'Process Box Background',
        processStroke: 'Process Box Border',
        startEndFill: 'Start / End Background',
        startEndStroke: 'Start / End Border',
        decisionFill: 'Decision Diamond Background',
        decisionStroke: 'Decision Diamond Border',
        arrowColor: 'Arrow & Connector Color',
        textColor: 'Inner Block Text Color',
      },
    },
    diagnostics: {
      title: 'Document Inspector & Analytics',
      readingTime: 'Estimated Reading Time',
      minutes: 'min',
      wordCount: 'Total Words',
      words: 'words',
      sections: 'Key Sections',
      headings: 'headings',
      diagrams: 'Diagrams',
      codeBlocks: 'Code Blocks',
      equations: 'Math Equations',
      links: 'Hyperlinks',
      healthTitle: 'Document Quality Index',
      healthyStatus: 'Document structure is healthy with zero formatting defects.',
      issuesDetected: 'Formatting notices and recommendations to review:',
    },
    studioModal: {
      title: 'Interactive Diagram Studio',
      codeTab: 'Source Code',
      previewTab: 'Interactive Canvas',
      closeTooltip: 'Close (Esc)',
      exportSvg: 'Export as SVG',
      zoomIn: 'Zoom In (+)',
      zoomOut: 'Zoom Out (-)',
      reset: 'Reset View',
    },
    presentation: {
      slide: 'Slide',
      of: 'of',
      exitTooltip: 'Exit Presentation (Esc)',
      prevTooltip: 'Previous Slide (Left Arrow)',
      nextTooltip: 'Next Slide (Right Arrow or Space)',
      fullscreenTooltip: 'Fullscreen Mode',
    },
  },
};

export class I18nService {
  private static readonly STORAGE_KEY = 'md_reader_locale';
  private static currentLocale: AppLocale = 'ar';
  private static listeners: Set<(locale: AppLocale) => void> = new Set();

  public static initialize(): AppLocale {
    const saved = localStorage.getItem(this.STORAGE_KEY) as AppLocale;
    const locale: AppLocale = saved === 'en' || saved === 'ar' ? saved : 'ar';
    this.setLocale(locale);
    return locale;
  }

  public static getLocale(): AppLocale {
    return this.currentLocale;
  }

  public static setLocale(locale: AppLocale): void {
    this.currentLocale = locale;
    localStorage.setItem(this.STORAGE_KEY, locale);

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale);
      document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    }

    this.listeners.forEach((listener) => listener(locale));
  }

  public static toggleLocale(): AppLocale {
    const nextLocale: AppLocale = this.currentLocale === 'ar' ? 'en' : 'ar';
    this.setLocale(nextLocale);
    return nextLocale;
  }

  public static t(): TranslationDictionary {
    return translations[this.currentLocale];
  }

  public static subscribe(listener: (locale: AppLocale) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
