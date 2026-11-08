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
