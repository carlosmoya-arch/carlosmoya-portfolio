// Existing interface content. Project, LOG, work, image and collaborator records live in /content/.
// Project periods remain null when the CV gives only an employment period.
window.SiteContent = {
  navigation: [
    { key: '1', number: '01', id: 'current' }, { key: '2', number: '02', id: 'work' },
    { key: '3', number: '03', id: 'projects' }, { key: '4', number: '04', id: 'about' },
    { key: '5', number: '05', id: 'log' }, { key: '6', number: '06', id: 'tools' },
    { key: 'c', number: 'C', id: 'contact' }
  ],
  ui: {
    en: {
      sections: ['CURRENT', 'WORK', 'PROJECTS', 'ABOUT', 'LOG', 'TOOLS', 'CONTACT'],
      descriptors: ['Now', 'Practice', 'Selected work', 'Profile', 'Observations', 'Resources', 'Get in touch'],
      profession: 'Architect / Project Manager', practice: 'Independent Practice', index: 'Index',
      language: 'Language', home: 'Carlos Moya, home', navigation: 'Main navigation', help: 'Keyboard index',
      helpOpen: 'Keyboard shortcuts help', close: 'Close', sectionsHelp: 'Open a section', theme: 'Toggle light / dark mode',
      image: 'PROJECT IMAGE — TO BE ADDED', openImage: 'Open enlarged image', gallery: 'Project image gallery',
      expandedImage: 'Enlarged project image', preview: 'Representative image — to be added', next: 'NEXT PROJECT',
      project: 'PROJECT', role: 'Role', type: 'Type', area: 'Area', gfa: 'Gross floor area', livingArea: 'Living area',
      complexArea: 'Industrial complex area', lph: 'LPH', value: 'Project value', investment: 'Investment volume', status: 'Status',
      approximate: 'Approx.', completed: 'Built / Completed', selected: 'Selected architecture', present: 'Present',
      workIntro: 'Professional practice, roles and experience.', currentIntro: 'A working snapshot of practice, interests and explorations.',
      currentLabels: ['Projects', 'Work', 'Collaborations', 'Location', 'Exploring', 'Tools', 'Interests'],
      pending: '[To be added.]', logIntro: 'A record of things I find interesting during work and everyday life.',
      logEmpty: 'No entries published yet.', contactIntro: 'For project enquiries and thoughtful conversations.',
      contactPending: '[Contact details to be added.]', aboutIntro: 'Architect working between Spain and Germany, combining architecture, planning, coordination and project management from design through construction and completion.',
      currentPractice: 'Practice', currentProjects: 'Projects',
      logCategories: ['SITE', 'ARCHITECTURE', 'DETAIL', 'MATERIAL', 'DESIGN', 'OBJECT', 'PROCESS', 'REFERENCE'],
      location: 'Location', languages: 'Languages', education: 'Education', experience: 'Experience', native: 'Native',
      languageNames: ['Spanish', 'German', 'English'], experienceSummary: 'Independent practice and architectural studios in Spain, Germany and Belgium.',
      toolsUse: 'TOOLS I USE', toolsExplore: 'TOOLS / TECHNOLOGIES I EXPLORE', training: 'Training',
      toolCategories: ['ARCHITECTURE / BIM', 'PROJECT MANAGEMENT', 'VISUALIZATION / GRAPHICS', 'AI / DIGITAL EXPERIMENTS'],
      toolsIntro: 'A selected index of tools, training and digital explorations.', toolsExploreIntro: 'Exploration does not imply professional mastery.',
      projectPeriod: 'Period', projectPending: 'Project information', logTitle: 'Observation', internship: 'Intern',
      study: 'Architecture studies', erasmus: 'Erasmus studies', thesis: 'Diploma thesis: Market and cultural centre in Valencia',
      wolfDescription: 'Visitor centre for Wolf, developed as a complex architectural and project management process from design through construction.'
    },
    de: {
      sections: ['AKTUELL', 'BERUFSPRAXIS', 'PROJEKTE', 'PROFIL', 'JOURNAL', 'WERKZEUGE', 'KONTAKT'],
      descriptors: ['Heute', 'Praxis', 'Ausgewählte Arbeiten', 'Profil', 'Beobachtungen', 'Ressourcen', 'Kontakt aufnehmen'],
      profession: 'Architekt / Projektmanager', practice: 'Freie Praxis', index: 'Index',
      language: 'Sprache', home: 'Carlos Moya, Startseite', navigation: 'Hauptnavigation', help: 'Tastaturübersicht',
      helpOpen: 'Hilfe zu Tastenkürzeln', close: 'Schließen', sectionsHelp: 'Bereich öffnen', theme: 'Hell- / Dunkelmodus wechseln',
      image: 'PROJEKTBILD — WIRD ERGÄNZT', openImage: 'Bild vergrößern', gallery: 'Projektbilder',
      expandedImage: 'Vergrößertes Projektbild', preview: 'Repräsentatives Bild — wird ergänzt', next: 'NÄCHSTES PROJEKT',
      project: 'PROJEKT', role: 'Rolle', type: 'Typ', area: 'Fläche', gfa: 'Bruttogrundfläche', livingArea: 'Wohnfläche',
      complexArea: 'Fläche des Industriekomplexes', lph: 'LPH', value: 'Projektwert', investment: 'Investitionsvolumen', status: 'Status',
      approximate: 'Ca.', completed: 'Gebaut / Fertiggestellt', selected: 'Ausgewählte Architektur', present: 'Heute',
      workIntro: 'Berufliche Praxis, Rollen und Erfahrung.', currentIntro: 'Ein Einblick in die aktuelle Praxis, Interessen und Erkundungen.',
      currentLabels: ['Projekte', 'Arbeit', 'Zusammenarbeit', 'Standort', 'Erkundungen', 'Werkzeuge', 'Interessen'],
      pending: '[Wird ergänzt.]', logIntro: 'Ein Verzeichnis von Dingen, die mir bei der Arbeit und im Alltag auffallen.',
      logEmpty: 'Noch keine Einträge veröffentlicht.', contactIntro: 'Für Projektanfragen und anregende Gespräche.',
      contactPending: '[Kontaktdaten werden ergänzt.]', aboutIntro: 'Architekt zwischen Spanien und Deutschland. Meine Praxis verbindet Architektur, Planung, Koordination und Projektmanagement — vom Entwurf über die Bauausführung bis zur Fertigstellung.',
      currentPractice: 'Praxis', currentProjects: 'Projekte',
      logCategories: ['BAUSTELLE', 'ARCHITEKTUR', 'DETAIL', 'MATERIAL', 'DESIGN', 'OBJEKT', 'PROZESS', 'REFERENZ'],
      location: 'Standort', languages: 'Sprachen', education: 'Ausbildung', experience: 'Erfahrung', native: 'Muttersprache',
      languageNames: ['Spanisch', 'Deutsch', 'Englisch'], experienceSummary: 'Freie Praxis und Architekturbüros in Spanien, Deutschland und Belgien.',
      toolsUse: 'WERKZEUGE IN MEINER PRAXIS', toolsExplore: 'WERKZEUGE / TECHNOLOGIEN, DIE ICH ERKUNDE', training: 'Weiterbildung',
      toolCategories: ['ARCHITEKTUR / BIM', 'PROJEKTMANAGEMENT', 'VISUALISIERUNG / GRAFIK', 'KI / DIGITALE EXPERIMENTE'],
      toolsIntro: 'Eine Auswahl an Werkzeugen, Weiterbildungen und digitalen Erkundungen.', toolsExploreIntro: 'Erkundung bedeutet nicht zwingend professionelle Beherrschung.',
      projectPeriod: 'Zeitraum', projectPending: 'Projektinformationen', logTitle: 'Beobachtung', internship: 'Praktikant',
      study: 'Architekturstudium', erasmus: 'Erasmus-Studium', thesis: 'Diplomarbeit: Markt- und Kulturzentrum in Valencia',
      wolfDescription: 'Besucherzentrum für Wolf, entwickelt in einem komplexen Architektur- und Projektmanagementprozess vom Entwurf bis zur Bauausführung.'
    },
    es: {
      sections: ['ACTUAL', 'TRAYECTORIA', 'PROYECTOS', 'PERFIL', 'REGISTRO', 'HERRAMIENTAS', 'CONTACTO'],
      descriptors: ['Ahora', 'Práctica', 'Obra seleccionada', 'Perfil', 'Observaciones', 'Recursos', 'Contactar'],
      profession: 'Arquitecto / Project Manager', practice: 'Práctica independiente', index: 'Índice',
      language: 'Idioma', home: 'Carlos Moya, inicio', navigation: 'Navegación principal', help: 'Atajos de teclado',
      helpOpen: 'Ayuda de atajos de teclado', close: 'Cerrar', sectionsHelp: 'Abrir una sección', theme: 'Cambiar modo claro / oscuro',
      image: 'IMAGEN DEL PROYECTO — PENDIENTE', openImage: 'Ampliar imagen', gallery: 'Galería del proyecto',
      expandedImage: 'Imagen ampliada del proyecto', preview: 'Imagen representativa — pendiente', next: 'SIGUIENTE PROYECTO',
      project: 'PROYECTO', role: 'Rol', type: 'Tipo', area: 'Superficie', gfa: 'Superficie construida', livingArea: 'Superficie residencial',
      complexArea: 'Superficie del complejo industrial', lph: 'LPH', value: 'Valor del proyecto', investment: 'Volumen de inversión', status: 'Estado',
      approximate: 'Aprox.', completed: 'Construido / Finalizado', selected: 'Arquitectura seleccionada', present: 'Actualidad',
      workIntro: 'Trayectoria profesional, roles y experiencia.', currentIntro: 'Una mirada a la práctica actual, los intereses y las exploraciones.',
      currentLabels: ['Proyectos', 'Trabajo', 'Colaboraciones', 'Localización', 'Explorando', 'Herramientas', 'Intereses'],
      pending: '[Pendiente de añadir.]', logIntro: 'Un registro de cosas que encuentro interesantes durante el trabajo y el día a día.',
      logEmpty: 'Todavía no hay entradas publicadas.', contactIntro: 'Para consultas sobre proyectos y conversaciones de interés.',
      contactPending: '[Datos de contacto pendientes.]', aboutIntro: 'Arquitecto entre España y Alemania. Combino arquitectura, planificación, coordinación y project management desde el diseño hasta la construcción y finalización de proyectos.',
      currentPractice: 'Práctica', currentProjects: 'Proyectos',
      logCategories: ['OBRA', 'ARQUITECTURA', 'DETALLE', 'MATERIAL', 'DISEÑO', 'OBJETO', 'PROCESO', 'REFERENCIA'],
      location: 'Localización', languages: 'Idiomas', education: 'Formación', experience: 'Experiencia', native: 'nativo',
      languageNames: ['Español', 'Alemán', 'Inglés'], experienceSummary: 'Práctica independiente y estudios de arquitectura en España, Alemania y Bélgica.',
      toolsUse: 'HERRAMIENTAS QUE UTILIZO', toolsExplore: 'HERRAMIENTAS / TECNOLOGÍAS QUE EXPLORO', training: 'Formación',
      toolCategories: ['ARQUITECTURA / BIM', 'PROJECT MANAGEMENT', 'VISUALIZACIÓN / GRÁFICA', 'IA / EXPERIMENTOS DIGITALES'],
      toolsIntro: 'Una selección de herramientas, formación y exploraciones digitales.', toolsExploreIntro: 'Explorar una herramienta no implica dominio profesional.',
      projectPeriod: 'Periodo', projectPending: 'Información del proyecto', logTitle: 'Observación', internship: 'Prácticas',
      study: 'Estudios de arquitectura', erasmus: 'Estudios Erasmus', thesis: 'Proyecto final: Mercado y centro cultural en Valencia',
      wolfDescription: 'Centro de visitantes para Wolf, desarrollado como un proceso complejo de arquitectura y project management desde el diseño hasta la construcción.'
    }
  },
  current: [
    { label: 'currentPractice', value: { en: 'Independent architecture / Project management', de: 'Freie Architekturpraxis / Projektmanagement', es: 'Arquitectura independiente / Project management' } },
    // Latest assignment listed in the CV; no availability or inferred project period is published.
    { label: 'currentProjects', value: 'PowerCo / Volkswagen — Sagunto' },
    { label: 'location', value: { en: 'Valencia · Munich', de: 'Valencia · München', es: 'Valencia · Múnich' } }
  ],
  // LOG editorial records now live in content/log.js.
  // Entry: { number: '001', title: { en, de, es }, location?: { en, de, es }, date, category, images: ['image-id'], text?: { en, de, es } }.
  logCategories: ['SITE', 'ARCHITECTURE', 'DETAIL', 'MATERIAL', 'DESIGN', 'OBJECT', 'PROCESS', 'REFERENCE'],
  education: [
    { period: '09/2004–07/2007', key: 'study', institution: 'Universitat Politècnica de València' },
    { period: '09/2007–07/2008', key: 'erasmus', institution: 'Leibniz Universität Hannover' },
    { period: '09/2008–01/2011', key: 'thesis', institution: 'Universitat Politècnica de València' }
  ],
  tools: [
    { category: 0, group: 'use', names: ['Vectorworks', 'Revit / BIM', 'AutoCAD', 'Solibri', 'SketchUp', 'Presto'], training: ['CYPE Architecture', 'CYPECAD', 'CYPECAD MEP', 'CYPE Therm HE Plus', 'Arquímedes', 'IVE / BDC IVE'] },
    { category: 1, group: 'use', names: ['Microsoft Project'] },
    { category: 2, group: 'use', names: ['Adobe Photoshop', 'Adobe InDesign', 'Adobe Illustrator', 'ComfyUI', 'Stable Diffusion'] },
    { category: 3, group: 'explore', names: ['ChatGPT', 'Codex', 'Claude', 'Perplexity', 'Hermes', 'Instinct', 'OpenCode', 'MCP', 'Blender'] }
  ],
};
