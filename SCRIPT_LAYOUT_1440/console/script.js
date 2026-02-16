// Portfolio Layout Builder - Web Version
// Based on SCRIPT_LAYOUT_1440

// Фон: двухцветная неконтрастная текстура, случайная при каждой загрузке
function generateBackgroundTexture() {
    const w = 2560;
    const h = 1080;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d');
    const hue = 220 + Math.floor(Math.random() * 40);
    const base = `hsl(${hue}, 28%, 5%)`;
    const second = `hsl(${hue}, 22%, ${5 + Math.random() * 4}%)`;
    cx.fillStyle = base;
    cx.fillRect(0, 0, w, h);
    const count = 80 + Math.floor(Math.random() * 60);
    for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 80 + Math.random() * 180;
        const g = cx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, second.replace(/^hsl\(/, 'hsla(').replace(/\)$/, ', 0.06)'));
        g.addColorStop(0.6, second.replace(/^hsl\(/, 'hsla(').replace(/\)$/, ', 0.02)'));
        g.addColorStop(1, 'transparent');
        cx.fillStyle = g;
        cx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return c.toDataURL('image/png');
}

// Configuration (columns/columnWidth зависят от выбранного layout)
const CONFIG = {
    canvasWidth: 1440,
    marginLeftRight: Math.floor(1440 * 0.083),
    marginTop: 0, // intro + process height, задаётся в updateConfigForLayout
    columnGap: Math.floor(1440 * 0.018),
    rowGap: Math.floor(1440 * 0.018),
    columns: 4,
    columnWidth: 0,
    workWidth: 0,
    cardFrame: 2
};

// Фиксированные сетки по схемам (1 карточка всегда на своём месте)
const LAYOUT_CONFIG = [
    // 0: 3 колонки, 12 слотов (3_col_layout_12_4)
    { columns: 3, slots: [[0, 0, 2, 2], [2, 0, 1, 1], [2, 1, 1, 1], [0, 2, 1, 1], [1, 2, 2, 2], [0, 3, 1, 1], [0, 4, 2, 2], [2, 4, 1, 1], [2, 5, 1, 1], [0, 6, 1, 1], [0, 7, 1, 1], [1, 6, 2, 2]] },
    // 1: 4 колонки, 15 слотов — строго по 4_col_layout_15_3 (8–11 подняты на модуль)
    {
        columns: 4, slots: [
            [0, 0, 2, 2],   // 1 — большой, верхний левый
            [2, 1, 2, 2],   // 2 — под 3 и 4
            [2, 0, 1, 1],   // 3 — справа от 1
            [3, 0, 1, 1],   // 4
            [0, 2, 2, 2],   // 5 — под 1
            [2, 3, 1, 1],   // 6 — под 2
            [0, 4, 1, 1],   // 7 — под 5
            [1, 4, 2, 2],   // 8 — в одну линию с 7, без пропуска
            [3, 4, 1, 1],   // 9 — справа от 8
            [3, 5, 1, 1],   // 10 — под 9
            [0, 6, 2, 2],   // 11 — под 7, без пропуска
            [2, 7, 1, 1],   // 12 — под 8
            [3, 7, 1, 1],   // 13 — под 10
            [2, 8, 1, 1],   // 14
            [3, 8, 1, 1]    // 15
        ]
    },
    // 2: 4 колонки, 20 слотов — строго по 4_col_layout_20_2 (1 карточка по центру сверху)
    {
        columns: 4, slots: [
            [1, 0, 2, 2],   // 1 — большой, центр сверху
            [0, 0, 1, 1],   // 2 — слева от 1
            [3, 0, 1, 1],   // 3 — справа от 1
            [0, 1, 1, 1],   // 4 — под 2
            [3, 1, 1, 1],   // 5 — под 3
            [0, 2, 2, 2],   // 6 — под 4
            [2, 2, 1, 1],   // 7 — справа от 6
            [3, 2, 1, 1],   // 8 — справа от 7
            [0, 4, 2, 2],   // 9 — под 6
            [2, 3, 2, 2],   // 10 — под 7 и 8
            [2, 5, 1, 1],   // 11 — под левой половиной 10
            [3, 5, 1, 1],   // 12 — справа от 11
            [0, 6, 1, 1], [1, 6, 1, 1], [2, 6, 1, 1], [3, 6, 1, 1],   // 13–16
            [0, 7, 1, 1], [1, 7, 1, 1], [2, 7, 1, 1], [3, 7, 1, 1]    // 17–20
        ]
    },
    // 3: 4 колонки, 20 слотов — строго по 4_col_layout_20_1 (6 и далее опущены на 1 модуль)
    {
        columns: 4, slots: [
            [0, 0, 2, 2],   // 1 — большой, верхний левый
            [2, 0, 1, 1],   // 2 — справа от 1
            [3, 0, 1, 1],   // 3
            [2, 1, 2, 2],   // 4 — под 2 и 3
            [0, 2, 2, 2],   // 5 — под 1
            [2, 3, 1, 1],   // 6 — под 4 (опущен)
            [3, 3, 1, 1],   // 7 — под 4
            [0, 4, 1, 1],   // 8 — под 5 (опущен)
            [2, 4, 2, 2],   // 9 — под 6 и 7
            [0, 5, 2, 2],   // 10 — под 8
            [2, 6, 1, 1],   // 11 — под 9
            [3, 6, 1, 1],   // 12 — справа от 11
            [0, 7, 1, 1], [1, 7, 1, 1], [2, 7, 1, 1], [3, 7, 1, 1],   // 13–16
            [0, 8, 1, 1], [1, 8, 1, 1], [2, 8, 1, 1], [3, 8, 1, 1]    // 17–20
        ]
    },
    // 4: 4S — 4 колонки, все одинаковые 1×1 (6 рядов = 24 слота)
    {
        columns: 4, slots: (function () {
            const s = [];
            for (let r = 0; r < 6; r++)
                for (let c = 0; c < 4; c++)
                    s.push([c, r, 1, 1]);
            return s;
        })()
    },
    // 5: 3S — 3 колонки, все одинаковые 1×1 (8 рядов = 24 слота)
    {
        columns: 3, slots: (function () {
            const s = [];
            for (let r = 0; r < 8; r++)
                for (let c = 0; c < 3; c++)
                    s.push([c, r, 1, 1]);
            return s;
        })()
    },
    // 6: 8K — 4 колонки, 9 слотов (центральный герой 2×2, 8 карточек вокруг)
    {
        columns: 4, slots: [
            [1, 0, 2, 2],   // 1 — Hero (Top Center)
            [0, 0, 1, 1],   // 2 — Left Top
            [3, 0, 1, 1],   // 3 — Right Top
            [0, 1, 1, 1],   // 4 — Left Middle
            [3, 1, 1, 1],   // 5 — Right Middle
            [0, 2, 1, 1],   // 6 — Left Bottom
            [1, 2, 1, 1],   // 7 — Below Hero Left
            [2, 2, 1, 1],   // 8 — Below Hero Right
            [3, 2, 1, 1]    // 9 — Right Bottom
        ]
    },
    // 7: 9K — 4 колонки, 9 слотов (центральный герой 2×2, альтернативная раскладка)
    {
        columns: 4, slots: [
            [1, 0, 2, 2],   // 1 — большой центр
            [0, 0, 1, 1],   // 2 — левый верхний угол
            [3, 0, 1, 1],   // 3 — правый верхний угол
            [0, 1, 1, 1],   // 4 — левый средний
            [3, 1, 1, 1],   // 5 — правый средний
            [0, 2, 1, 1],   // 6 — левый нижний
            [3, 2, 1, 1],   // 7 — правый нижний
            [1, 2, 1, 1],   // 8 — под героем слева
            [2, 2, 1, 1]    // 9 — под героем справа
        ]
    },
    // 8: 10K — 4 колонки, 10 слотов (асимметричная раскладка, 2 больших)
    {
        columns: 4, slots: [
            [0, 0, 2, 2],   // 1 — большой левый верхний
            [2, 0, 1, 1],   // 2 — правый верхний
            [3, 0, 1, 1],   // 3 — крайний правый верхний
            [2, 1, 1, 1],   // 4 — правый средний
            [3, 1, 1, 1],   // 5 — крайний правый средний
            [0, 2, 1, 1],   // 6 — левый под героем
            [1, 2, 1, 1],   // 7 — средний под героем
            [0, 3, 1, 1],   // 8 — левый нижний
            [1, 3, 1, 1],   // 9 — средний нижний
            [2, 2, 2, 2]    // 10 — большой правый нижний
        ]
    },
    // 9: 41K — 6 колонок, 41 слот (7 больших героев 2×2 + 34 маленьких)
    {
        columns: 6, slots: [
            // Row 0 (Standard)
            [0, 0, 2, 2],   // 1 — Hero (Top Left)
            [2, 0, 1, 1],   // 2
            [3, 0, 1, 1],   // 3
            [4, 0, 2, 2],   // 4 — Hero (Top Right)
            [2, 1, 1, 1],   // 5 (Under 2)
            [3, 1, 1, 1],   // 6 (Under 3)
            [0, 2, 1, 1],   // 7 (Under 1-Left)
            [1, 2, 1, 1],   // 8 (Under 1-Right)

            // Row 2 (Shifted Hero)
            [2, 2, 2, 2],   // 9 — Hero (Center)
            [4, 2, 1, 1],   // 10 (Under 4-Left)
            [5, 2, 1, 1],   // 11 (Under 4-Right)
            [0, 3, 1, 1],   // 12
            [1, 3, 1, 1],   // 13
            [4, 3, 1, 1],   // 14
            [5, 3, 1, 1],   // 15

            // Row 4 (Standard again)
            [0, 4, 2, 2],   // 16 — Hero (Mid Left)
            [2, 4, 1, 1],   // 17
            [3, 4, 1, 1],   // 18
            [4, 4, 2, 2],   // 19 — Hero (Mid Right)
            [2, 5, 1, 1],   // 20
            [3, 5, 1, 1],   // 21
            [0, 6, 1, 1],   // 22
            [1, 6, 1, 1],   // 23

            // Row 6 (Shifted Hero again)
            [2, 6, 2, 2],   // 24 — Hero (Lower Center)
            [4, 6, 1, 1],   // 25
            [5, 6, 1, 1],   // 26
            [0, 7, 1, 1],   // 27
            [1, 7, 1, 1],   // 28
            [4, 7, 1, 1],   // 29
            [5, 7, 1, 1],   // 30

            // Row 8 (Standard)
            [0, 8, 2, 2],   // 31 — Hero (Bottom Left)
            [2, 8, 1, 1],   // 32
            [3, 8, 1, 1],   // 33
            [4, 8, 2, 2],   // 34 — Hero (Bottom Right)
            [2, 9, 1, 1],   // 35
            [3, 9, 1, 1],   // 36
            [0, 10, 1, 1],  // 37
            [1, 10, 1, 1],  // 38
            [4, 10, 1, 1],  // 39
            [5, 10, 1, 1]   // 40
        ]
    },
    // 10: ISO1 — Diagonal (изометрия, диагональ)
    {
        columns: 1,
        isometric: true,
        type: 'diagonal',
        slots: []
    },
    // 11: ISO2 — Wave (изометрия, волна)
    {
        columns: 1,
        isometric: true,
        type: 'wave',
        slots: []
    },
    // 12: ISO3 — Stack (изометрия, стек)
    {
        columns: 1,
        isometric: true,
        type: 'stack',
        slots: []
    },
    // 13: P17 - Geometric (1/4 modules)
    {
        type: 'p17',
        isometric: false,
        columns: 4, // Base columns, but we might use finer grid
        slots: []
    },
    // 14: P09 - Chaotic (Mixed modules)
    {
        type: 'p09',
        isometric: false,
        columns: 4,
        slots: []
    }
];

function getLayoutIndex() {
    return Math.min(parseInt(state.layoutChoice, 10) || 0, LAYOUT_CONFIG.length - 1);
}

function getIntroHeight() {
    return state.introEnabled ? 320 : 0;
}
function getProcessHeight() {
    if (!state.processEnabled) return 0;
    let h = 80 + 60 + 40;
    if (state.processImage && state.processImage.image) {
        const img = state.processImage.image;
        const w = CONFIG.canvasWidth - 2 * CONFIG.marginLeftRight;
        const scale = w / img.width;
        h += Math.floor(img.height * scale) + 60;
    } else {
        h += 200;
    }
    h += 80 + 40;
    return h;
}
function updateConfigForLayout() {
    const idx = getLayoutIndex();
    const layout = LAYOUT_CONFIG[idx];

    // Toggle ISO settings visibility
    const isoSettingsGroup = document.getElementById('isoSettingsGroup');
    if (isoSettingsGroup) {
        isoSettingsGroup.style.display = layout.isometric ? 'block' : 'none';
    }

    // Toggle ISO Background Controls
    const isoBgControls = document.getElementById('isoBgControls');
    if (isoBgControls) {
        isoBgControls.style.display = layout.isometric ? 'block' : 'none';
    }

    // Toggle Standard Layout Controls visibility
    // VertAlign and ContentMargin only make sense for Standard Layouts
    const standardControls = document.querySelectorAll('.setting-group.sg-frame, .setting-group.sg-shadow, .setting-group:has(#contentMarginRange), .setting-group:has(input[name="vertAlign"])');
    // Actually, frame and shadow apply to both? 
    // ISO has its own shadow logic in drawIsometricCard, but it uses getShadowParams.
    // Let's keep them visible but maybe disable VertAlign for ISO?
    // VertAlign is irrelevant for ISO. ContentMargin is irrelevant for ISO.

    // Isometric layouts don't use column grid
    if (layout.isometric) {
        return;
    }

    // Isometric layouts don't use column grid
    if (layout.isometric) {
        return;
    }

    // New Layouts Logic (P17/P09)
    const patternGroup = document.getElementById('patternSettingsGroup');
    if (patternGroup) patternGroup.style.display = 'none';

    if (layout.type === 'p17' || layout.type === 'p09') {
        if (patternGroup) patternGroup.style.display = 'block';
        CONFIG.columns = 6; // Dense grid (Standard 3 cols * 2)
        if (layout.type === 'p17') {
            layout.slots = generateP17Slots(Math.max(state.images.length, 12), state.p17Seed);
        } else {
            layout.slots = generateP09Slots(Math.max(state.images.length, 6), state.p09Seed);
        }
    } else {
        CONFIG.columns = layout.columns;
    }

    // Check if CONFIG.columns is valid
    if (!CONFIG.columns) CONFIG.columns = 3;

    CONFIG.workWidth = CONFIG.canvasWidth - 2 * (state.contentMargin !== undefined ? state.contentMargin : CONFIG.marginLeftRight);

    // Recalculate column width based on margins (Content Margin slider)
    // If state.contentMargin is set, use it. Else use default.
    const margin = state.contentMargin !== undefined ? state.contentMargin : 100;
    CONFIG.marginLeftRight = margin;
    CONFIG.workWidth = CONFIG.canvasWidth - 2 * margin;

    // Use state.columnGap if available, else default to 40
    CONFIG.columnGap = state.columnGap !== undefined ? state.columnGap : 40;
    CONFIG.rowGap = state.columnGap !== undefined ? state.columnGap : 40; // Sync row gap? Or separate? Let's sync for now or keep row fixed? 
    // Usually standard layouts have equal gaps? The original code had fixed 40. 
    // Let's make rowGap sync with columnGap for uniformity unless requested otherwise.

    const gaps = (CONFIG.columns - 1) * CONFIG.columnGap;
    CONFIG.columnWidth = Math.floor((CONFIG.workWidth - gaps) / CONFIG.columns);
    CONFIG.marginTop = getIntroHeight() + getProcessHeight();
}

function getCurrentLayout() {
    const layout = LAYOUT_CONFIG[getLayoutIndex()];
    return layout.slots || [];
}

// State
let state = {
    images: [],
    aspectRatio: 0.75,
    layoutChoice: '0',
    background: null,
    bgType: 'random',
    bgVerticalOffset: 0,
    bgHistory: [],
    frameColor: 'white',
    frameSize: 2,
    shadowPreset: '3',
    projectName: '',
    introTitle: 'Карточки товара',
    introText: 'Представляю вашему вниманию серию карточек товара, разработанную для электро-коробов BT-AT и BT-AG. Этот проект охватил полный цикл создания маркетинговых материалов – от профессиональной фотосъемки до финальной верстки и подготовки файлов для различных каналов.',
    introFont: "'Helvetica Neue', Arial, sans-serif",
    introFontSize: 48,
    processSectionTitle: 'Процесс работы',
    processStep1Title: 'Фотография и обработка',
    processStep1Text: 'Предметная фотосъемка продукции с акцентом на детали и текстуру, последующая профессиональная ретушь, обтравка и цветокоррекция.',
    processStep2Title: 'Контент и тексты',
    processStep2Text: 'Сбор и анализ информации о продукте, разработка информативного и лаконичного текста с акцентом на ключевых преимуществах.',
    processStep3Title: 'Концепция и дизайн',
    processStep3Text: 'Создание концепции дизайна карточек, разработка макета с учетом визуальной иерархии и фирменного стиля бренда.',
    processFont: "'Helvetica Neue', Arial, sans-serif",
    processFontSize: 18,
    processImage: null, // { src, image } for canvas
    introEnabled: false,
    processEnabled: false,
    iconsEnabled: true,
    iconTheme: 'png_black', // png_black | svg_black | svg_white
    iconRandomizeType: 'position', // position | filename | custom_position
    iconOpacity: 0.3,
    iconPositions: [], // Array of {x, y} relative coordinates (0-1)
    icons: { pngBlack: [], svgBlack: [], svgWhite: [] },
    // ISO background
    isoBg: null,
    isoBgType: 'gradient', // gradient | custom
    isoBgHistory: [],
    // ISO Layout Settings
    isoSettings: {
        lens: 0, // 0 = Tele (Isometric), 300 = Fisheye
        angle: 0,
        scale: 100,
        spacing: 100,
        zInterval: 20, // Depth scale factor
    },
    // Presets
    presets: [],
    // New Controls
    vertAlign: 'center', // 'top', 'center', 'bottom'
    contentMargin: 100, // px
    columnGap: 40, // px
    shadowDist: 20,
    shadowBlur: 40,
    shadowOpacity: 0.4,
    shadowDistX: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    previewZoom: 100, // Zoom percentage
    // Shadow Presets
    shadowPresets: [
        { name: 'Soft', dist: 20, blur: 40, opacity: 0.4, distX: 0 },
        { name: 'Medium', dist: 30, blur: 50, opacity: 0.5, distX: 0 },
        { name: 'Hard', dist: 10, blur: 10, opacity: 0.6, distX: 0 },
        { name: 'Float', dist: 60, blur: 80, opacity: 0.3, distX: 0 },
        { name: 'Left', dist: 20, blur: 40, opacity: 0.4, distX: -30 },
        { name: 'Right', dist: 20, blur: 40, opacity: 0.4, distX: 30 },
    ],
    // New Layouts State
    p17Seed: 12345,
    p09Seed: 12345,
};

function getIconsBaseUrl() {
    // Vite alias '/assets' -> project root 'assets'
    // This allows us to use the original files without copying
    return '/assets/icons/';
}

function loadIcons() {
    const base = getIconsBaseUrl();
    if (!base) {
        console.warn('Не удалось определить базовый путь к иконкам');
        return;
    }
    console.log('Attempting to load icons from base:', base);
    const MAX_ICONS = 160;
    const groups = [
        { folder: 'PNG_BLACK', key: 'pngBlack', prefix: 'ICON_BLACK_', ext: '.png' },
        { folder: 'SVG_BLACK', key: 'svgBlack', prefix: 'ICON_SVG_BLACK_', ext: '.svg' },
        { folder: 'SVG_WHITE', key: 'svgWhite', prefix: 'ICON_SVG_WHITE_', ext: '.svg' }
    ];
    state.icons = { pngBlack: [], svgBlack: [], svgWhite: [] };
    let done = 0;
    groups.forEach(({ folder, key, prefix, ext }) => {
        let pending = MAX_ICONS;
        let finished = 0;
        let loadedCount = 0;
        for (let i = 1; i <= MAX_ICONS; i++) {
            const num = i.toString().padStart(3, '0');
            const url = `${base}${folder}/${prefix}${num}${ext}`;
            const img = new Image();
            img.onload = () => {
                let dataUrl = url;
                try {
                    const c = document.createElement('canvas');
                    c.width = img.naturalWidth;
                    c.height = img.naturalHeight;
                    const cx = c.getContext('2d');
                    cx.drawImage(img, 0, 0);
                    dataUrl = c.toDataURL('image/png');
                } catch (_) { }
                state.icons[key].push({ src: url, image: img, dataUrl });
                finished++;
                loadedCount++;
                if (finished === pending) {
                    done++;
                    console.log(`Loaded ${loadedCount} icons for ${key}`);
                    if (done === 3) render();
                }
            };
            img.onerror = () => {
                pending--;
                // finished++; // Don't increment finished here, just reduce pending total
                // Actually, logic is: try MAX_ICONS. If error, it means file doesn't exist (end of sequence or gap).
                // We track completion of *attempts*?
                // The original logic was: wait for ALL 160 attempts?
                // Let's just log errors sparingly.
                if (i === 1) console.warn(`Failed to load first icon for ${key}: ${url}`);

                // Original completion logic:
                finished++;
                if (finished >= pending + (MAX_ICONS - pending)) { done++; if (done === 3) render(); }
            };
            img.crossOrigin = 'anonymous';
            img.src = url;
        }
    });
}

// Извлекает номер из суффикса _01, _02, _03 и т.д. для сортировки по имени
function cardIndex(filename) {
    const m = filename.match(/_(\d+)(?:\.[^.]+)?$/);
    return m ? parseInt(m[1], 10) : 999;
}

// Background history management
function updateBgHistorySelect() {
    const select = document.getElementById('bgHistorySelect');
    if (!select) return;
    select.innerHTML = '<option value="">История фонов</option>';
    state.bgHistory.forEach((bg, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = bg.name;
        select.appendChild(opt);
    });
}

function loadBgHistoryFromLocalStorage() {
    try {
        const saved = localStorage.getItem('bgHistory');
        if (saved) {
            const hist = JSON.parse(saved);
            let loaded = 0;
            hist.forEach(item => {
                const img = new Image();
                img.onload = () => {
                    state.bgHistory.push({ src: item.src, image: img, name: item.name });
                    loaded++;
                    if (loaded === hist.length) updateBgHistorySelect();
                };
                img.onerror = () => {
                    loaded++;
                    if (loaded === hist.length) updateBgHistorySelect();
                };
                img.src = item.src;
            });
        }
    } catch (e) { console.warn('Failed to load bg history:', e); }
}

function saveBgHistoryToLocalStorage() {
    try {
        const toSave = state.bgHistory.map(b => ({ src: b.src, name: b.name }));
        localStorage.setItem('bgHistory', JSON.stringify(toSave));
    } catch (e) { console.warn('Failed to save bg history:', e); }
}

function randomizeBgVerticalOffset() {
    if (!state.background || state.bgType !== 'custom') return;
    const canvasH = getCanvasHeight();
    const W = CONFIG.canvasWidth;
    const bg = state.background;
    const scaleW = W / bg.width;
    const scaledH = bg.height * scaleW;

    // Random offset ensuring full coverage
    const maxOffset = Math.max(0, scaledH - canvasH);
    state.bgVerticalOffset = Math.floor(Math.random() * maxOffset);
    render();
}

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const bgInput = document.getElementById('bgInput');
const cardsList = document.getElementById('cardsList');
const pathInput = document.getElementById('pathInput');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const buildBtn = document.getElementById('buildBtn');
const exportPngBtn = document.getElementById('exportPngBtn');

// Initialize
function init() {
    const bgEl = document.getElementById('bg-texture');
    if (bgEl) {
        // При запуске через Python --serve используем текстуру с сервера, иначе генерируем в JS
        fetch('/api/background-texture')
            .then(r => r.ok ? r.blob() : Promise.reject())
            .then(blob => {
                bgEl.style.backgroundImage = 'url(' + URL.createObjectURL(blob) + ')';
            })
            .catch(() => {
                bgEl.style.backgroundImage = 'url(' + generateBackgroundTexture() + ')';
            });
    }
    updateConfigForLayout();
    loadBgHistoryFromLocalStorage();
    setupEventListeners();
    resizeCanvas();
    window.addEventListener('resize', () => resizeCanvas());
}

function resizeCanvas() {
    const container = document.getElementById('canvasContainer');
    if (!container) return;

    // Base width - usually we want it to fit in container
    // User wants "Zoom" to control width.
    // Let's say 100% zoom = Fit to Container width (minus padding).
    // Or 100% = 1:1 pixel size?
    // User said: "Zoom window I meant that it increases inside <section class="preview-area"> ... It stands across the full width."
    // This implies 100% slider = 100% Container Width.
    // And > 100% = Overflow container (scroll).

    const containerW = container.clientWidth - 40; // Padding
    const zoomFactor = (state.previewZoom || 100) / 100;

    // Calculate drawn width based on zoom
    // Options:
    // A) Zoom based on actual pixels (100% = 1440px). 
    //    Problem: 1440px is too big for most screens. User likely wants "Fit" as base.
    // B) Zoom based on Container Width (100% = Full Width).

    // Let's go with B, as user said "Stands across full width".
    // So 100% on slider = containerW.
    // 50% = half container.
    // 200% = 2x container.

    const finalWidth = Math.max(100, containerW * zoomFactor);

    canvas.style.width = `${finalWidth}px`;
    canvas.style.height = 'auto'; // Aspect ratio handles height
    canvas.style.aspectRatio = `${CONFIG.canvasWidth}/${getCanvasHeight()}`;

    // Remove transform scale if we are sizing via width
    canvas.style.transform = 'none';
}

function setupEventListeners() {
    // File upload
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Background
    document.querySelectorAll('input[name="bg"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.bgType = e.target.value;
            if (e.target.value === 'random') {
                state.background = null;
                render();
            }
        });
    });

    // Custom bg button
    const customBgBtn = document.getElementById('customBgBtn');
    if (customBgBtn) {
        customBgBtn.addEventListener('click', () => bgInput.click());
    }

    // Bg history select
    const bgHistorySelect = document.getElementById('bgHistorySelect');
    if (bgHistorySelect) {
        bgHistorySelect.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value);
            if (!isNaN(idx) && state.bgHistory[idx]) {
                state.background = state.bgHistory[idx].image;
                state.bgType = 'custom';
                state.bgVerticalOffset = 0;
                render();
            }
        });
    }

    // Bg randomize button
    const bgRandomizeBtn = document.getElementById('bgRandomizeBtn');
    if (bgRandomizeBtn) {
        bgRandomizeBtn.addEventListener('click', randomizeBgVerticalOffset);
    }

    bgInput.addEventListener('change', (e) => {
        if (e.target.files[0]) processBgFile(e.target.files[0]);
    });

    // Background Drop Zone
    const bgDropZone = document.getElementById('bgDropZone');
    if (bgDropZone) {
        bgDropZone.addEventListener('click', () => bgInput.click());
        bgDropZone.addEventListener('dragover', (e) => { e.preventDefault(); bgDropZone.classList.add('dragover'); });
        bgDropZone.addEventListener('dragleave', (e) => { e.preventDefault(); bgDropZone.classList.remove('dragover'); });
        bgDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            bgDropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                processBgFile(file);
            }
        });
    }

    // Settings
    document.querySelectorAll('input[name="aspect"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.aspectRatio = parseFloat(e.target.value);
            render();
        });
    });

    document.querySelectorAll('input[name="layout"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.layoutChoice = e.target.value;
            updateConfigForLayout();
            render();
        });
    });

    document.querySelectorAll('input[name="frame"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.frameColor = e.target.value;
            render();
        });
    });
    document.getElementById('frameSizeInput').addEventListener('input', (e) => {
        state.frameSize = Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 2));
        render();
    });

    document.querySelectorAll('input[name="shadow"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.shadowPreset = e.target.value;
            render();
        });
    });

    document.getElementById('saveProjectBtn').addEventListener('click', saveProject);
    document.getElementById('loadProjectBtn').addEventListener('click', loadProject);
    document.getElementById('clearCardsBtn').addEventListener('click', () => {
        state.images = [];
        updateCardsList();
        render();
    });
    document.getElementById('exportAllBtn').addEventListener('click', exportAllLayouts);

    const introTitleInput = document.getElementById('introTitleInput');
    const introTextInput = document.getElementById('introTextInput');
    if (introTitleInput) { introTitleInput.value = state.introTitle; introTitleInput.addEventListener('input', () => { state.introTitle = introTitleInput.value; render(); }); }
    if (introTextInput) { introTextInput.value = state.introText; introTextInput.addEventListener('input', () => { state.introText = introTextInput.value; render(); }); }
    const introFontSelect = document.getElementById('introFontSelect');
    const introFontSizeInput = document.getElementById('introFontSizeInput');
    if (introFontSelect) { introFontSelect.value = state.introFont; introFontSelect.addEventListener('change', () => { state.introFont = introFontSelect.value; render(); }); }
    if (introFontSizeInput) { introFontSizeInput.value = state.introFontSize; introFontSizeInput.addEventListener('input', () => { state.introFontSize = Math.max(12, Math.min(96, parseInt(introFontSizeInput.value, 10) || 48)); render(); }); }

    const processSectionTitleInput = document.getElementById('processSectionTitleInput');
    ['processStep1Title', 'processStep1Text', 'processStep2Title', 'processStep2Text', 'processStep3Title', 'processStep3Text'].forEach((key, i) => {
        const el = document.getElementById(key + 'Input');
        if (el) { el.value = state[key]; el.addEventListener('input', () => { state[key] = el.value; render(); }); }
    });
    if (processSectionTitleInput) { processSectionTitleInput.value = state.processSectionTitle; processSectionTitleInput.addEventListener('input', () => { state.processSectionTitle = processSectionTitleInput.value; render(); }); }
    const processFontSelect = document.getElementById('processFontSelect');
    const processFontSizeInput = document.getElementById('processFontSizeInput');
    if (processFontSelect) { processFontSelect.value = state.processFont; processFontSelect.addEventListener('change', () => { state.processFont = processFontSelect.value; render(); }); }
    if (processFontSizeInput) { processFontSizeInput.value = state.processFontSize; processFontSizeInput.addEventListener('input', () => { state.processFontSize = Math.max(10, Math.min(32, parseInt(processFontSizeInput.value, 10) || 18)); render(); }); }
    const processImageInput = document.getElementById('processImageInput');
    if (processImageInput) {
        processImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    state.processImage = { src: ev.target.result, image: img };
                    const nameEl = document.getElementById('processImageName');
                    if (nameEl) nameEl.textContent = file.name;
                    render();
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    const introEnabledToggle = document.getElementById('introEnabledToggle');
    const processEnabledToggle = document.getElementById('processEnabledToggle');
    const iconsEnabledToggle = document.getElementById('iconsEnabledToggle');
    if (introEnabledToggle) { introEnabledToggle.checked = state.introEnabled; introEnabledToggle.addEventListener('change', () => { state.introEnabled = introEnabledToggle.checked; render(); }); }
    if (processEnabledToggle) { processEnabledToggle.checked = state.processEnabled; processEnabledToggle.addEventListener('change', () => { state.processEnabled = processEnabledToggle.checked; render(); }); }
    if (iconsEnabledToggle) { iconsEnabledToggle.checked = state.iconsEnabled; iconsEnabledToggle.addEventListener('change', () => { state.iconsEnabled = iconsEnabledToggle.checked; render(); }); }
    const iconThemeSelect = document.getElementById('iconThemeSelect');
    // const iconRandomizeSelect = document.getElementById('iconRandomizeSelect'); // Removed
    if (iconThemeSelect) { iconThemeSelect.value = state.iconTheme; iconThemeSelect.addEventListener('change', () => { state.iconTheme = iconThemeSelect.value; render(); }); }

    // New Icon Controls
    document.getElementById('iconRandomPlaceBtn')?.addEventListener('click', generateRandomIconPositions);
    document.getElementById('iconRandomItemBtn')?.addEventListener('click', randomizeIconItems);

    const iconOpacityRange = document.getElementById('iconOpacityRange');
    const iconOpacityValue = document.getElementById('iconOpacityValue');
    if (iconOpacityRange) {
        iconOpacityRange.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            state.iconOpacity = val / 100;
            if (iconOpacityValue) iconOpacityValue.textContent = val + '%';
            render();
        });
    }

    const loadIconsBtn = document.getElementById('loadIconsBtn');
    if (loadIconsBtn) loadIconsBtn.addEventListener('click', loadIcons);

    buildBtn.addEventListener('click', buildHTML);
    exportPngBtn.addEventListener('click', exportImage);
    const exportCurrentHtmlBtn = document.getElementById('exportCurrentHtmlBtn');
    if (exportCurrentHtmlBtn) exportCurrentHtmlBtn.addEventListener('click', exportCurrentHTML);

    // ISO Background controls
    const isoBgBtn = document.getElementById('isoBgBtn');
    const isoBgInput = document.getElementById('isoBgInput');
    if (isoBgBtn && isoBgInput) {
        isoBgBtn.addEventListener('click', () => isoBgInput.click());
        isoBgInput.addEventListener('change', (e) => {
            if (e.target.files[0]) processIsoBgFile(e.target.files[0]);
        });
    }

    // ISO Background Drop Zone
    const isoBgDropZone = document.getElementById('isoBgDropZone');
    if (isoBgDropZone) {
        isoBgDropZone.addEventListener('click', () => document.getElementById('isoBgInput').click()); // isoBgInput is locally scoped in original code? No, it's global constant or element?
        // Wait, isoBgInput is defined in line 667 as local const inside setupEventListeners: const isoBgInput = document.getElementById('isoBgInput');
        // But I need access to it. It is available in this scope.
        isoBgDropZone.addEventListener('dragover', (e) => { e.preventDefault(); isoBgDropZone.classList.add('dragover'); });
        isoBgDropZone.addEventListener('dragleave', (e) => { e.preventDefault(); isoBgDropZone.classList.remove('dragover'); });
        isoBgDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            isoBgDropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                processIsoBgFile(file);
            }
        });
    }
    document.querySelectorAll('input[name="isobg"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.isoBgType = e.target.value;
            if (e.target.value === 'gradient') {
                state.isoBg = null;
            }
            render();
        });
    });
    const isoBgHistorySelect = document.getElementById('isoBgHistorySelect');
    if (isoBgHistorySelect) {
        isoBgHistorySelect.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value);
            if (!isNaN(idx) && state.isoBgHistory[idx]) {
                state.isoBg = state.isoBgHistory[idx].image;
                state.isoBgType = 'custom';
                render();
            }
        });
    }
    const isoBgBlurRange = document.getElementById('isoBgBlurRange');
    const isoBgBlurValue = document.getElementById('isoBgBlurValue');
    if (isoBgBlurRange) {
        isoBgBlurRange.addEventListener('input', (e) => {
            state.isoBgBlur = parseInt(e.target.value) || 0;
            if (isoBgBlurValue) isoBgBlurValue.textContent = state.isoBgBlur;
            if (isoBgBlurValue) isoBgBlurValue.textContent = state.isoBgBlur;
            render();
        });
    }

    // ISO Settings Controls
    // New Standard Layout Controls
    // Content Margin
    const contentMarginRange = document.getElementById('contentMarginRange');
    const contentMarginValue = document.getElementById('contentMarginValue');
    if (contentMarginRange) {
        contentMarginRange.addEventListener('input', (e) => {
            state.contentMargin = parseInt(e.target.value, 10);
            if (contentMarginValue) contentMarginValue.textContent = state.contentMargin + 'px';
            updateConfigForLayout();
            render();
        });
    }

    // Column Gap
    const columnGapRange = document.getElementById('columnGapRange');
    const columnGapValue = document.getElementById('columnGapValue');
    if (columnGapRange) {
        columnGapRange.addEventListener('input', (e) => {
            state.columnGap = parseInt(e.target.value, 10);
            if (columnGapValue) columnGapValue.textContent = state.columnGap + 'px';
            updateConfigForLayout();
            render();
        });
    }

    // Vertical Align
    document.querySelectorAll('input[name="vertAlign"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.vertAlign = e.target.value;
            render();
        });
    });

    // Advanced Shadows
    const shadowDistRange = document.getElementById('shadowDistRange');
    const shadowBlurRange = document.getElementById('shadowBlurRange');
    const shadowOpacityRange = document.getElementById('shadowOpacityRange');

    if (shadowDistRange) {
        shadowDistRange.addEventListener('input', (e) => {
            state.shadowDist = parseInt(e.target.value, 10);
            document.getElementById('shadowDistValue').textContent = state.shadowDist;
            render();
        });
    }
    if (shadowBlurRange) {
        shadowBlurRange.addEventListener('input', (e) => {
            state.shadowBlur = parseInt(e.target.value, 10);
            document.getElementById('shadowBlurValue').textContent = state.shadowBlur;
            render();
        });
    }
    if (shadowOpacityRange) {
        shadowOpacityRange.addEventListener('input', (e) => {
            state.shadowOpacity = parseInt(e.target.value, 10) / 100;
            document.getElementById('shadowOpacityValue').textContent = Math.round(state.shadowOpacity * 100) + '%';
            render();
        });
    }

    // ISO Controls
    const isoLensRange = document.getElementById('isoLensRange');
    const isoAngleRange = document.getElementById('isoAngleRange');
    const isoScaleRange = document.getElementById('isoScaleRange');
    const isoSpacingRange = document.getElementById('isoSpacingRange');
    const isoViewAngleRange = document.getElementById('isoViewAngleRange');

    const isoApertureRange = document.getElementById('isoApertureRange');
    const isoFocusPosRange = document.getElementById('isoFocusPosRange');
    const isoFocusWidthRange = document.getElementById('isoFocusWidthRange');

    const isoRotXRange = document.getElementById('isoRotXRange');
    const isoRotYRange = document.getElementById('isoRotYRange');
    const isoRotZRange = document.getElementById('isoRotZRange');
    const btnResetRotation = document.getElementById('btnResetRotation');

    const isoLensValue = document.getElementById('isoLensValue');
    const isoAngleValue = document.getElementById('isoAngleValue');
    const isoScaleValue = document.getElementById('isoScaleValue');
    const isoSpacingValue = document.getElementById('isoSpacingValue');
    const isoViewAngleValue = document.getElementById('isoViewAngleValue');

    const isoApertureValue = document.getElementById('isoApertureValue');
    const isoFocusPosValue = document.getElementById('isoFocusPosValue');
    const isoFocusWidthValue = document.getElementById('isoFocusWidthValue');

    const isoRotXValue = document.getElementById('isoRotXValue');
    const isoRotYValue = document.getElementById('isoRotYValue');
    const isoRotZValue = document.getElementById('isoRotZValue');

    if (isoLensRange) {
        isoLensRange.addEventListener('input', (e) => {
            state.isoSettings.lens = parseInt(e.target.value);
            if (isoLensValue) isoLensValue.textContent = state.isoSettings.lens;
            render();
        });
    }
    if (isoApertureRange) {
        isoApertureRange.addEventListener('input', (e) => {
            state.isoSettings.aperture = parseFloat(e.target.value);
            if (isoApertureValue) isoApertureValue.textContent = state.isoSettings.aperture;
            render();
        });
    }
    if (isoFocusPosRange) {
        isoFocusPosRange.addEventListener('input', (e) => {
            state.isoSettings.focusPos = parseInt(e.target.value);
            if (isoFocusPosValue) isoFocusPosValue.textContent = state.isoSettings.focusPos + '%';
            render();
        });
    }
    if (isoFocusWidthRange) {
        isoFocusWidthRange.addEventListener('input', (e) => {
            state.isoSettings.focusWidth = parseInt(e.target.value);
            if (isoFocusWidthValue) isoFocusWidthValue.textContent = state.isoSettings.focusWidth;
            render();
        });
    }
    if (isoAngleRange) {
        isoAngleRange.addEventListener('input', (e) => {
            state.isoSettings.angle = parseInt(e.target.value);
            if (isoAngleValue) isoAngleValue.textContent = state.isoSettings.angle + '°';
            render();
        });
    }
    if (isoScaleRange) {
        isoScaleRange.addEventListener('input', (e) => {
            state.isoSettings.scale = parseInt(e.target.value);
            if (isoScaleValue) isoScaleValue.textContent = state.isoSettings.scale + '%';
            render();
        });
    }
    if (isoSpacingRange) {
        isoSpacingRange.addEventListener('input', (e) => {
            state.isoSettings.spacing = parseInt(e.target.value);
            if (isoSpacingValue) isoSpacingValue.textContent = state.isoSettings.spacing + '%';
            render();
        });
    }
    if (isoViewAngleRange) {
        isoViewAngleRange.addEventListener('input', (e) => {
            state.isoSettings.viewAngle = parseInt(e.target.value);
            if (isoViewAngleValue) isoViewAngleValue.textContent = state.isoSettings.viewAngle + '°';
            render();
        });
    }
    if (isoRotXRange) {
        isoRotXRange.addEventListener('input', (e) => {
            state.isoSettings.rotateX = parseInt(e.target.value);
            if (isoRotXValue) isoRotXValue.textContent = state.isoSettings.rotateX + '°';
            render();
        });
    }
    if (isoRotYRange) {
        isoRotYRange.addEventListener('input', (e) => {
            state.isoSettings.rotateY = parseInt(e.target.value);
            if (isoRotYValue) isoRotYValue.textContent = state.isoSettings.rotateY + '°';
            render();
        });
    }
    if (isoRotZRange) {
        isoRotZRange.addEventListener('input', (e) => {
            state.isoSettings.rotateZ = parseInt(e.target.value);
            if (isoRotZValue) isoRotZValue.textContent = state.isoSettings.rotateZ + '°';
            render();
        });
    }

    if (btnResetRotation) {
        btnResetRotation.addEventListener('click', () => {
            state.isoSettings.rotateX = 0;
            state.isoSettings.rotateY = 0;
            state.isoSettings.rotateZ = 0;

            if (isoRotXRange) isoRotXRange.value = 0;
            if (isoRotYRange) isoRotYRange.value = 0;
            if (isoRotZRange) isoRotZRange.value = 0;

            if (isoRotXValue) isoRotXValue.textContent = '0°';
            if (isoRotYValue) isoRotYValue.textContent = '0°';
            if (isoRotZValue) isoRotZValue.textContent = '0°';

            render();
        });
    }

    // Shadow Dist X
    const shadowDistXRange = document.getElementById('shadowDistXRange');
    if (shadowDistXRange) {
        shadowDistXRange.addEventListener('input', (e) => {
            state.shadowDistX = parseInt(e.target.value, 10);
            document.getElementById('shadowDistXValue').textContent = state.shadowDistX;
            render();
        });
    }

    // Standard 3D Rotation
    const stdRotXRange = document.getElementById('stdRotXRange');
    const stdRotYRange = document.getElementById('stdRotYRange');
    const stdRotZRange = document.getElementById('stdRotZRange');
    const btnResetStdRotation = document.getElementById('btnResetStdRotation');

    if (stdRotXRange) {
        stdRotXRange.addEventListener('input', (e) => {
            state.rotateX = parseInt(e.target.value, 10);
            document.getElementById('stdRotXValue').textContent = state.rotateX + '°';
            render();
        });
    }
    if (stdRotYRange) {
        stdRotYRange.addEventListener('input', (e) => {
            state.rotateY = parseInt(e.target.value, 10);
            document.getElementById('stdRotYValue').textContent = state.rotateY + '°';
            render();
        });
    }
    if (stdRotZRange) {
        stdRotZRange.addEventListener('input', (e) => {
            state.rotateZ = parseInt(e.target.value, 10);
            if (stdRotZValue) stdRotZValue.textContent = state.rotateZ + '°';
            render();
        });
    }

    // Reset Standard Rotation
    const btnResetStd = document.getElementById('btnResetStdRotation');
    if (btnResetStd) {
        btnResetStd.addEventListener('click', () => {
            state.rotateX = 0;
            state.rotateY = 0;
            state.rotateZ = 0;
            if (stdRotXRange) stdRotXRange.value = 0;
            if (stdRotYRange) stdRotYRange.value = 0;
            if (stdRotZRange) stdRotZRange.value = 0;
            document.getElementById('stdRotXValue').textContent = '0°';
            document.getElementById('stdRotYValue').textContent = '0°';
            document.getElementById('stdRotZValue').textContent = '0°';
            render();
        });
    }

    // Collapsible Panels
    document.querySelectorAll('.collapsible-panel .panel-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('collapsed');
        });
    });
    // Z-Interval
    const isoZInt = document.getElementById('isoZIntervalRange');
    const isoZIntVal = document.getElementById('isoZIntervalValue');
    if (isoZInt) {
        isoZInt.addEventListener('input', (e) => {
            state.isoSettings.zInterval = parseInt(e.target.value, 10);
            if (isoZIntVal) isoZIntVal.textContent = state.isoSettings.zInterval;
            render();
        });
    }

    // Preview Zoom
    const zoomRange = document.getElementById('previewZoomRange');
    const zoomVal = document.getElementById('previewZoomValue');
    if (zoomRange) {
        zoomRange.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            state.previewZoom = val;
            if (zoomVal) zoomVal.textContent = val + '%';

            // Apply zoom via resize logic (width based)
            resizeCanvas();
        });
    }

    // Toggle Groups functionality
    document.querySelectorAll('.collapsible-group .group-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('collapsed');
        });
    });

    setupShadowPresetsEvents();
    setupPatternControls();
}

function setupPatternControls() {
    const btn = document.getElementById('btnRandomizePattern');
    if (btn) {
        btn.addEventListener('click', () => {
            // Change seed
            state.p17Seed = Math.floor(Math.random() * 10000);
            state.p09Seed = Math.floor(Math.random() * 10000);
            updateConfigForLayout(); // Re-generate slots
            render();
        });
    }
}

function setupShadowPresetsEvents() {
    const list = document.getElementById('shadowPresetsList');
    const btnAdd = document.getElementById('btnAddShadowPreset');
    const btnReset = document.getElementById('btnResetShadows');

    const renderPresets = () => {
        if (!list) return;
        list.innerHTML = '';
        state.shadowPresets.forEach((p, idx) => {
            const btn = document.createElement('button');
            btn.className = 'preset-item'; // Reuse existing style
            btn.style.margin = '0';
            btn.innerHTML = `<span class="preset-name">${p.name}</span>`;
            if (idx > 5) { // Allow deleting custom presets
                const del = document.createElement('span');
                del.className = 'preset-del';
                del.textContent = '×';
                del.onclick = (e) => {
                    e.stopPropagation();
                    state.shadowPresets.splice(idx, 1);
                    renderPresets();
                };
                btn.appendChild(del);
            }
            btn.onclick = () => applyShadowPreset(p);
            list.appendChild(btn);
        });
    };

    const applyShadowPreset = (p) => {
        state.shadowDist = p.dist;
        state.shadowBlur = p.blur;
        state.shadowOpacity = p.opacity;
        state.shadowDistX = p.distX !== undefined ? p.distX : 0;

        // Update UI
        updateRangeUI('shadowDistRange', 'shadowDistValue', state.shadowDist);
        updateRangeUI('shadowBlurRange', 'shadowBlurValue', state.shadowBlur);
        updateRangeUI('shadowOpacityRange', 'shadowOpacityValue', Math.round(state.shadowOpacity * 100) + '%', state.shadowOpacity * 100);
        updateRangeUI('shadowDistXRange', 'shadowDistXValue', state.shadowDistX);

        render();
    };

    const updateRangeUI = (id, valId, valText, valInput) => {
        const input = document.getElementById(id);
        const span = document.getElementById(valId);
        if (input) input.value = valInput !== undefined ? valInput : parseInt(valText, 10) || 0;
        if (span) span.textContent = valText;
    };

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            // Reset to defaults (Soft)
            applyShadowPreset({ dist: 20, blur: 40, opacity: 0.4, distX: 0 });
        });
    }

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            const name = prompt('Название пресета:', `Preset ${state.shadowPresets.length + 1}`);
            if (name) {
                state.shadowPresets.push({
                    name,
                    dist: state.shadowDist,
                    blur: state.shadowBlur,
                    opacity: state.shadowOpacity,
                    distX: state.shadowDistX
                });
                renderPresets();
            }
        });
    }

    renderPresets();
}

function handleDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    loadImages(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    loadImages(files);
}

function processBgFile(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                state.background = img;
                state.bgType = 'custom';
                state.bgVerticalOffset = 0;

                // Add to history
                const bgItem = { src: event.target.result, image: img, name: file.name };
                const exists = state.bgHistory.find(b => b.name === file.name);
                if (!exists) {
                    state.bgHistory.unshift(bgItem);
                    if (state.bgHistory.length > 10) state.bgHistory.pop(); // Keep max 10
                    updateBgHistorySelect();
                    saveBgHistoryToLocalStorage();
                }

                // Update drop zone text
                const dz = document.getElementById('bgDropZone');
                if (dz) dz.querySelector('.drop-text').textContent = file.name;

                render();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ISO Background handler
function processIsoBgFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            state.isoBg = img;
            state.isoBgType = 'custom';

            // Add to ISO history
            const bgItem = { src: event.target.result, image: img, name: file.name };
            const exists = state.isoBgHistory.find(b => b.name === file.name);
            if (!exists) {
                state.isoBgHistory.unshift(bgItem);
                if (state.isoBgHistory.length > 10) state.isoBgHistory.pop();
                updateIsoBgHistorySelect();
            }

            // Update drop zone text
            const dz = document.getElementById('isoBgDropZone');
            if (dz) dz.querySelector('.drop-text').textContent = file.name;

            render();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function updateIsoBgHistorySelect() {
    const sel = document.getElementById('isoBgHistorySelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">История ISO фонов</option>';
    state.isoBgHistory.forEach((bg, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = bg.name || `ISO фон ${i + 1}`;
        sel.appendChild(opt);
    });
}

// Multi-pass box blur for Lens Blur effect
function applyLensBlur(sourceCanvas, radius) {
    if (radius <= 0) return;
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const sourceCtx = sourceCanvas.getContext('2d');
    const imageData = sourceCtx.getImageData(0, 0, w, h);
    const pixels = imageData.data;

    // 3-pass box blur approximates Gaussian
    for (let pass = 0; pass < 3; pass++) {
        // Horizontal pass
        const tmp = new Uint8ClampedArray(pixels);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = Math.min(w - 1, Math.max(0, x + dx));
                    const idx = (y * w + nx) * 4;
                    r += pixels[idx]; g += pixels[idx + 1]; b += pixels[idx + 2]; a += pixels[idx + 3];
                    count++;
                }
                const idx = (y * w + x) * 4;
                tmp[idx] = r / count; tmp[idx + 1] = g / count; tmp[idx + 2] = b / count; tmp[idx + 3] = a / count;
            }
        }
        // Vertical pass
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                for (let dy = -radius; dy <= radius; dy++) {
                    const ny = Math.min(h - 1, Math.max(0, y + dy));
                    const idx = (ny * w + x) * 4;
                    r += tmp[idx]; g += tmp[idx + 1]; b += tmp[idx + 2]; a += tmp[idx + 3];
                    count++;
                }
                const idx = (y * w + x) * 4;
                pixels[idx] = r / count; pixels[idx + 1] = g / count; pixels[idx + 2] = b / count; pixels[idx + 3] = a / count;
            }
        }
    }
    sourceCtx.putImageData(imageData, 0, 0);
}

function loadImages(files) {
    let loadedCount = 0;
    const totalFiles = files.length;
    if (totalFiles === 0) return;
    const temp = [];
    if (files[0].webkitRelativePath) {
        const parts = files[0].webkitRelativePath.split('/');
        if (parts.length > 1) state.projectName = parts[0];
    } else if (files[0].path) {
        const parts = files[0].path.split(/[/\\]/);
        if (parts.length > 1) state.projectName = parts[parts.length - 2];
    }
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                temp.push({ src: event.target.result, image: img, name: file.name, moduleSize: 1 });
                loadedCount++;
                if (loadedCount === totalFiles) {
                    temp.sort((a, b) => (cardIndex(a.name) - cardIndex(b.name)) || a.name.localeCompare(b.name));
                    // Append to existing images instead of replacing
                    state.images.push(...temp);
                    updateCardsList();
                    render();
                }
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === totalFiles) {
                    temp.sort((a, b) => (cardIndex(a.name) - cardIndex(b.name)) || a.name.localeCompare(b.name));
                    // Append to existing images instead of replacing
                    state.images.push(...temp);
                    updateCardsList();
                    render();
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function moveCardToSlot(fromIndex, toSlot) {
    if (fromIndex === toSlot - 1) return;
    const card = state.images.splice(fromIndex, 1)[0];
    state.images.splice(toSlot - 1, 0, card);
    updateCardsList();
    render();
}

function updateCardsList() {
    cardsList.innerHTML = '';
    const n = state.images.length;
    state.images.forEach((img, index) => {
        const row = document.createElement('div');
        row.className = `card-row ${index === 0 ? 'hero' : ''}`;
        row.draggable = true;
        row.dataset.index = index;
        const opts = Array.from({ length: n }, (_, i) =>
            `<option value="${i + 1}" ${i === index ? 'selected' : ''}>${i + 1}</option>`
        ).join('');
        row.innerHTML = `
            <div class="card-thumb"><img src="${img.src}" alt=""></div>
            <div class="slot-select-wrap">
                <label>Слот</label>
                <select class="slot-select" data-index="${index}">${opts}</select>
            </div>
            <button type="button" class="remove-btn" data-index="${index}" title="Удалить">×</button>
        `;
        cardsList.appendChild(row);
    });

    cardsList.querySelectorAll('.slot-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const fromIndex = parseInt(sel.dataset.index);
            const toSlot = parseInt(sel.value);
            moveCardToSlot(fromIndex, toSlot);
        });
    });
    cardsList.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            state.images.splice(index, 1);
            updateCardsList();
            render();
        });
    });
    cardsList.querySelectorAll('.card-row').forEach(row => {
        row.addEventListener('dragstart', handleCardDragStart);
        row.addEventListener('dragend', handleCardDragEnd);
    });
    cardsList.addEventListener('dragover', handleCardDragOver);
    cardsList.addEventListener('drop', handleCardDrop);

    buildBtn.disabled = n === 0;
    exportPngBtn.disabled = n === 0;
    document.getElementById('exportAllBtn').disabled = n === 0;
    const exportCurrentHtmlBtn = document.getElementById('exportCurrentHtmlBtn');
    if (exportCurrentHtmlBtn) exportCurrentHtmlBtn.disabled = n === 0;
}

let draggedCardIndex = null;
function handleCardDragStart(e) {
    draggedCardIndex = parseInt(e.currentTarget.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedCardIndex);
    e.currentTarget.classList.add('dragging');
}
function handleCardDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    draggedCardIndex = null;
}

// --- Presets Logic ---
function initPresets() {
    const btnSave = document.getElementById('btnSavePreset');
    const nameInput = document.getElementById('presetNameInput');

    if (btnSave && nameInput) {
        btnSave.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name) {
                savePreset(name);
                nameInput.value = '';
            }
        });
    }
    renderPresets();
}

function savePreset(name) {
    // Capture visual settings
    const preset = {
        id: Date.now(),
        name: name,
        layout: getLayoutIndex(), // 0-5
        layoutChoice: state.layoutChoice, // string key just in case
        isoSettings: JSON.parse(JSON.stringify(state.isoSettings)),
        bg: state.bg, // image data?
        bgType: state.bgType,
        bgColor: state.bgColor,
        bgGradient: state.bgGradient,
        frameSize: state.frameSize,
        frameColor: state.frameColor,
        canvasColor: state.canvasColor,
        aspectRatio: state.aspectRatio,
        iconTheme: state.iconTheme
        // We do NOT save specific card images, just settings
    };

    state.presets.push(preset);
    renderPresets();
    saveProject(); // Auto-save project to persist presets
}

function loadPreset(id) {
    const preset = state.presets.find(p => p.id === id);
    if (!preset) return;

    // Apply Settings
    // Layout
    const layoutRadios = document.querySelectorAll('input[name="layout"]');
    if (layoutRadios[preset.layout]) {
        layoutRadios[preset.layout].checked = true;
        // Trigger change?
        state.layoutChoice = preset.layoutChoice || getLayoutChoiceFromIndex(preset.layout);
    }

    // ISO Settings
    if (preset.isoSettings) {
        state.isoSettings = JSON.parse(JSON.stringify(preset.isoSettings));
        // Update Inputs
        updateIsoInputs();
    }

    // BG & Colors
    state.bgType = preset.bgType;
    state.bgColor = preset.bgColor;
    state.bgGradient = preset.bgGradient;
    state.frameSize = preset.frameSize || 0;
    state.frameColor = preset.frameColor || 'white';
    state.canvasColor = preset.canvasColor || '#1a1a1a';
    state.aspectRatio = preset.aspectRatio || 0.75;
    state.iconTheme = preset.iconTheme;

    // Update basic inputs
    const frameSizeInput = document.getElementById('frameSize');
    if (frameSizeInput) {
        frameSizeInput.value = state.frameSize;
        document.getElementById('frameSizeValue').textContent = state.frameSize + 'px';
    }

    // Background Restore (Complex if it was an image)
    // If bgType was 'custom' (image), we might not have the image data if it wasn't saved in preset.
    // Presets usually save CONFIG, not heavy assets.
    // If user wants to reuse BG image, we should probably store it in state.bgHistory?
    // For now, let's restore Gradient/Color. If Custom, we might fail if state.bg is not set.
    // Let's assume user just wants layout settings.

    // Re-render
    render();

    // Update UI highlights
    renderPresets();
}

function deletePreset(id, e) {
    if (e) e.stopPropagation();
    state.presets = state.presets.filter(p => p.id !== id);
    renderPresets();
    saveProject();
}

function renderPresets() {
    const list = document.getElementById('presetList');
    if (!list) return;
    list.innerHTML = '';

    if (state.presets.length === 0) {
        list.innerHTML = '<div class="empty-msg">Нет пресетов</div>';
        return;
    }

    state.presets.forEach(p => {
        const item = document.createElement('div');
        item.className = 'preset-item';
        item.draggable = true;
        item.dataset.id = p.id;

        item.innerHTML = `
            <span class="preset-name">${p.name}</span>
            <div class="preset-del" title="Delete">x</div>
        `;

        item.addEventListener('click', () => loadPreset(p.id));
        item.querySelector('.preset-del').addEventListener('click', (e) => deletePreset(p.id, e));

        // Drag Events
        item.addEventListener('dragstart', handlePresetDragStart);
        item.addEventListener('dragover', handlePresetDragOver);
        item.addEventListener('drop', handlePresetDrop);

        list.appendChild(item);
    });
}

// Preset Drag & Drop
let dragSrcEl = null;
function handlePresetDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}
function handlePresetDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}
function handlePresetDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (dragSrcEl !== this) {
        // Swap IDs in array
        const srcId = parseInt(dragSrcEl.dataset.id);
        const targetId = parseInt(this.dataset.id);

        const srcIdx = state.presets.findIndex(p => p.id === srcId);
        const targetIdx = state.presets.findIndex(p => p.id === targetId);

        if (srcIdx >= 0 && targetIdx >= 0) {
            const temp = state.presets[srcIdx];
            state.presets.splice(srcIdx, 1);
            state.presets.splice(targetIdx, 0, temp);
            renderPresets();
            saveProject();
        }
    }
    return false;
}

function updateIsoInputs() {
    const ids = {
        lens: 'isoLensRange',
        angle: 'isoAngleRange',
        scale: 'isoScaleRange',
        spacing: 'isoSpacingRange',
        viewAngle: 'isoViewAngleRange',
        rotateX: 'isoRotXRange',
        rotateY: 'isoRotYRange',
        rotateZ: 'isoRotZRange',
        aperture: 'isoApertureRange',
        focusPos: 'isoFocusPosRange',
        focusWidth: 'isoFocusWidthRange'
    };
    // ... logic copied from loadProject or refactor into shared function
    // For now, duplicate logic for simplicity or call the one in loadProject if extracted
    ['isoLensRange', 'isoAngleRange', 'isoScaleRange', 'isoSpacingRange', 'isoViewAngleRange', 'isoRotXRange', 'isoRotYRange', 'isoRotZRange', 'isoApertureRange', 'isoFocusPosRange', 'isoFocusWidthRange'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const key = id.replace('iso', '').replace('Range', '');
            let stateKey = key.charAt(0).toLowerCase() + key.slice(1);
            if (key === 'RotX') stateKey = 'rotateX';
            if (key === 'RotY') stateKey = 'rotateY';
            if (key === 'RotZ') stateKey = 'rotateZ';

            if (state.isoSettings[stateKey] !== undefined) {
                el.value = state.isoSettings[stateKey];
                const valEl = document.getElementById(id.replace('Range', 'Value'));
                if (valEl) valEl.textContent = state.isoSettings[stateKey] + (stateKey === 'lens' || stateKey === 'aperture' || stateKey === 'focusWidth' ? '' : (stateKey === 'scale' || stateKey === 'spacing' || stateKey === 'focusPos' ? '%' : '°'));
            }
        }
    });
}
function handleCardDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}
function handleCardDrop(e) {
    e.preventDefault();
    const from = draggedCardIndex;
    if (from == null) return;
    const toEl = e.target.closest('.card-row');
    if (!toEl) return;
    const to = parseInt(toEl.dataset.index);
    if (from === to) return;
    const [moved] = state.images.splice(from, 1);
    state.images.splice(to, 0, moved);
    updateCardsList();
    render();
}

function getSingleHeight() {
    return Math.floor(CONFIG.columnWidth / state.aspectRatio);
}

function getShadowParams() {
    const presets = {
        '1': { blur: 3, offsetY: 1, alpha: 0.15 },    // Очень мягкая
        '2': { blur: 5, offsetY: 2, alpha: 0.2 },     // Мягкая
        '3': { blur: 8, offsetY: 3, alpha: 0.3 },     // Умеренная
        '4': { blur: 10, offsetY: 4, alpha: 0.4 },    // Средняя (бывшая weak)
        '5': { blur: 14, offsetY: 5, alpha: 0.5 },    // Заметная (бывшая medium)
        '6': { blur: 18, offsetY: 7, alpha: 0.65 }    // Сильная (бывшая strong)
    };
    return presets[state.shadowPreset] || presets['3'];
}

function getDoubleWidth() {
    return CONFIG.columnWidth * 2 + CONFIG.columnGap;
}

function getDoubleHeight() {
    return Math.floor(getDoubleWidth() / state.aspectRatio);
}

function layoutHeightRows(layout) {
    let maxRow = 0;
    for (const slot of layout) {
        const row = slot[1], hRows = slot[3];
        maxRow = Math.max(maxRow, row + hRows);
    }
    return maxRow;
}

function getCanvasHeight() {
    updateConfigForLayout();
    const layout = LAYOUT_CONFIG[getLayoutIndex()];

    // Isometric layouts use fixed aspect ratio
    if (layout && layout.isometric) {
        return Math.floor(CONFIG.canvasWidth * 0.5);
    }

    // Standard grid layouts
    if (!layout || !layout.slots || layout.slots.length === 0) {
        return 1080;
    }

    // Calculate exact height needed by simulating placement
    let maxContentY = 0;
    const singleH = getSingleHeight();
    const slotCount = layout.slots.length;

    // We must account for ALL images
    for (let i = 0; i < state.images.length; i++) {
        // Find which slot this image goes into
        const slotIndex = i % slotCount;
        const cycle = Math.floor(i / slotCount);

        const slot = layout.slots[slotIndex];
        const col = slot[0];
        const row = slot[1];
        const wCols = slot[2];
        const hRows = slot[3];

        const rowOffset = cycle * layoutHeightRows(layout.slots); // Cycle offset

        // Calculate Y position + Height of this specific card
        // y = margin + (row + rowOffset) * (singleH + gap)
        const yTop = CONFIG.marginTop + CONFIG.marginLeftRight + (row + rowOffset) * (singleH + CONFIG.rowGap);
        const heightPx = hRows * singleH + (hRows - 1) * CONFIG.rowGap;

        maxContentY = Math.max(maxContentY, yTop + heightPx);
    }

    // Base height if no images (min 1080 or based on layout)
    if (state.images.length === 0) return 1080;

    // Add bottom padding
    return Math.max(1080, Math.ceil(maxContentY + 100));
}

// Isometric layout functions
function calculateIsometricPositions(cardCount, layoutType) {
    const W = CONFIG.canvasWidth;
    const H = getCanvasHeight();

    // User settings
    const userLens = state.isoSettings ? (state.isoSettings.lens || 0) : 0;
    const userAngleOffset = state.isoSettings ? state.isoSettings.angle : 0;
    const userScalePercent = state.isoSettings ? state.isoSettings.scale : 100;
    const userSpacingPercent = state.isoSettings ? (state.isoSettings.spacing || 100) : 100;
    // userViewAngle handles the layout grid angle, but NOT card distortion anymore
    const userViewAngle = state.isoSettings ? (state.isoSettings.viewAngle || 30) : 30;

    const scaleFactor = userScalePercent / 100;
    const spacingFactor = userSpacingPercent / 100;

    // View Angle: 0-90. Used for grid calculation.
    const tiltRad = userViewAngle * Math.PI / 180;

    // Card size
    const cardAspect = state.aspectRatio || 0.75;
    const baseCardWidth = 320;
    const cardWidth = baseCardWidth * scaleFactor;
    // FIX PROPORTIONS: Determine height strictly by aspect ratio. No squash!
    const cardHeight = cardWidth / cardAspect;

    const positions = [];
    const centerX = W / 2;
    const centerY = H / 2;

    // Helper to add position
    const addPos = (x, y, r, depthIndex) => {
        positions.push({
            x: x,
            y: y,
            rotation: r,
            width: cardWidth,
            height: cardHeight,
            zIndex: depthIndex,
            // Store raw depth usage for Lens effect later
            depthVal: depthIndex
        });
    };

    if (layoutType === 'diagonal') {
        // ISO1: Diagonal
        const angleDeg = -15 + userAngleOffset;
        const angleRad = angleDeg * Math.PI / 180;

        // Determine spacing
        const baseSpacing = baseCardWidth * 0.35 * scaleFactor * spacingFactor;

        const count = cardCount;
        const totalLen = (count - 1) * baseSpacing;

        const startX = centerX - (Math.cos(angleRad) * totalLen) / 2;
        const startY = centerY - (Math.sin(angleRad) * totalLen) / 2;

        for (let i = 0; i < count; i++) {
            addPos(
                startX + Math.cos(angleRad) * baseSpacing * i,
                startY + Math.sin(angleRad) * baseSpacing * i,
                angleDeg,
                i
            );
        }
    } else if (layoutType === 'wave') {
        const isoAngle = tiltRad; // Use view angle for grid tilt
        const depthAngle = isoAngle + Math.PI / 2;

        const baseSize = 280 * scaleFactor;
        const spacing = baseSize * 1.2 * spacingFactor;

        const gridCols = Math.ceil(Math.sqrt(cardCount * 1.3));

        // Center calc...
        const tempPos = [];
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < cardCount; i++) {
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);

            // Grid Projection
            const isoX = col * spacing * Math.cos(isoAngle) + row * spacing * Math.cos(depthAngle);
            const isoY = col * spacing * Math.sin(isoAngle) + row * spacing * Math.sin(depthAngle);

            // Perspective Z shift (visual Y offset)
            const perspectiveY = -row * 15 * scaleFactor;

            tempPos.push({ x: isoX, y: isoY + perspectiveY, r: row, c: col });

            minX = Math.min(minX, isoX);
            maxX = Math.max(maxX, isoX);
            minY = Math.min(minY, isoY + perspectiveY);
            maxY = Math.max(maxY, isoY + perspectiveY);
        }

        const gridW = maxX - minX;
        const gridH = maxY - minY;
        const offsetX = centerX - gridW / 2 - minX;
        const offsetY = centerY - gridH / 2 - minY;

        tempPos.forEach((p, i) => {
            const row = p.r;
            // Removed depthScale (failed attempt at perspective).
            // We use standard size, let Lens filter handle perspective later.

            // Rotation: -ViewAngle + Offset.
            // If grid is rotated by ViewAngle, cards should probably counter-rotate or follow?
            // "Standard Isometrics" often have vertical cards on angled grid.
            // Let's rely on user Rotation knobs for fine tuning.
            // Default: -30 + offset was old.
            const defaultRot = -30 + userAngleOffset;

            positions.push({
                x: offsetX + p.x,
                y: offsetY + p.y,
                rotation: defaultRot,
                width: baseSize,
                height: baseSize / cardAspect,
                zIndex: row * 10 + p.c,
                depthVal: row
            });
        });

    } else if (layoutType === 'stack') {
        // ISO3
        const angleDeg = 15 + userAngleOffset;
        const angleRad = angleDeg * Math.PI / 180;

        const baseSpacing = baseCardWidth * 0.35 * scaleFactor * spacingFactor;
        const totalLen = (cardCount - 1) * baseSpacing;

        const startX = centerX - (Math.cos(angleRad) * totalLen) / 2;
        const startY = centerY - (Math.sin(angleRad) * totalLen) / 2;

        for (let i = 0; i < cardCount; i++) {
            addPos(
                startX + Math.cos(angleRad) * baseSpacing * i,
                startY + Math.sin(angleRad) * baseSpacing * i,
                angleDeg,
                i
            );
        }
    }

    return positions;
}

function drawCardDepth(useCtx, width, height) {
    const use = useCtx;
    const thickness = 10;

    // Right edge depth
    use.fillStyle = 'rgba(0,0,0,0.35)';
    use.beginPath();
    use.moveTo(width / 2, -height / 2);
    use.lineTo(width / 2 + thickness, -height / 2 + thickness);
    use.lineTo(width / 2 + thickness, height / 2 + thickness);
    use.lineTo(width / 2, height / 2);
    use.closePath();
    use.fill();

    // Bottom edge depth
    use.fillStyle = 'rgba(0,0,0,0.4)';
    use.beginPath();
    use.moveTo(-width / 2, height / 2);
    use.lineTo(-width / 2 + thickness, height / 2 + thickness);
    use.lineTo(width / 2 + thickness, height / 2 + thickness);
    use.lineTo(width / 2, height / 2);
    use.closePath();
    use.fill();
}

function drawIsometricCard(useCtx, img, width, height) {
    const use = useCtx;

    // Draw shadow separately as a filled rect (so it's always visible)
    const shadow = getShadowParams();
    const shadowOffsetX = shadow.offsetY * 1.5;
    const shadowOffsetY = shadow.offsetY * 1.5;

    use.save();
    use.fillStyle = `rgba(0, 0, 0, ${shadow.alpha * 0.6})`;
    use.beginPath();
    use.rect(-width / 2 + shadowOffsetX, -height / 2 + shadowOffsetY, width, height);
    use.fill();
    use.restore();

    // Draw image (locked bitmap - no cropping, no stretching)
    use.drawImage(img, -width / 2, -height / 2, width, height);

    // Frame border (white/black, size from settings) - no shadow on border itself
    const frameRgb = state.frameColor === 'black' ? '0, 0, 0' : '255, 255, 255';
    use.strokeStyle = `rgba(${frameRgb}, 0.9)`;
    use.lineWidth = state.frameSize;
    use.strokeRect(-width / 2, -height / 2, width, height);
}

function renderIsometricLayout(useCtx) {
    const use = useCtx || ctx;
    const layout = LAYOUT_CONFIG[getLayoutIndex()];
    if (!layout.isometric || state.images.length === 0) return;

    const positions = calculateIsometricPositions(state.images.length, layout.type);

    const userRotX = state.isoSettings ? (state.isoSettings.rotateX || 0) : 0;
    const userRotY = state.isoSettings ? (state.isoSettings.rotateY || 0) : 0;
    const userRotZ = state.isoSettings ? (state.isoSettings.rotateZ || 0) : 0;

    // Lens/Perspective Factor (0 to 1)
    const lensVal = state.isoSettings ? (state.isoSettings.lens || 0) : 0;

    // DoF Settings
    const aperture = state.isoSettings ? (state.isoSettings.aperture || 0) : 0;
    const focusPos = state.isoSettings ? (state.isoSettings.focusPos || 50) : 50;
    const focusWidth = state.isoSettings ? (state.isoSettings.focusWidth || 10) : 10;

    // Find depth range to map focusPos
    let minDepth = Infinity, maxDepth = -Infinity;
    if (positions.length > 0) {
        positions.forEach(p => {
            const d = p.depthVal !== undefined ? p.depthVal : p.zIndex;
            if (d < minDepth) minDepth = d;
            if (d > maxDepth) maxDepth = d;
        });
    }
    if (minDepth === Infinity) { minDepth = 0; maxDepth = 1; }

    // Mapped focus target
    const depthRange = maxDepth - minDepth;
    // focusPos 0 = Far (minDepth), 100 = Near (maxDepth)? 
    // Usually focusPos 0 = closest, 100 = infinity?
    // Let's map 0-100 to minDepth-maxDepth.
    // If we assume higher zIndex is closer to camera.
    // Let's say user wants to focus on a specific plane.
    const targetDepth = minDepth + (depthRange * (focusPos / 100));

    // Rotation transformations
    // Since we fixed proportions, we render the card as a flat plane rotated in 3D.
    // Canvas doesn't do true 3D. We use Scale to simulate tilt.
    // RotX -> ScaleY. RotY -> ScaleX.
    const scaleY = Math.cos(userRotX * Math.PI / 180);
    const scaleX = Math.cos(userRotY * Math.PI / 180);

    // Offscreen Canvas for Blur
    // We create/reuse a separate canvas to draw the card, then render it to main canvas with blur.
    if (!state.offscreenCanvas) {
        state.offscreenCanvas = document.createElement('canvas');
        state.offscreenCtx = state.offscreenCanvas.getContext('2d');
    }
    const oCanvas = state.offscreenCanvas;
    const oCtx = state.offscreenCtx;

    state.images.forEach((card, i) => {
        const pos = positions[i];
        if (!pos) return;

        // Apply Lens Perspective (Focal Length Simulation)
        // lensVal = 12 (Wide) to 800 (Tele).
        // Higher zIndex/depthVal means closer to camera.
        const depth = pos.depthVal !== undefined ? pos.depthVal : pos.zIndex;

        let perspectiveScale = 1;
        if (lensVal < 800) {
            // Calculate distance from "camera" plane.
            // Assume maxDepth is closest (distance 0).
            // diff is how far back the object is.
            // Multiplier determines scene "physical" depth.
            const depthScale = state.isoSettings.zInterval || 20;
            const distance = (maxDepth - depth) * depthScale;
            // Standard perspective projection: scale = f / (f + z)
            perspectiveScale = lensVal / (lensVal + distance);

            // Clamp to avoid extreme shrinking or division by zero issues
            perspectiveScale = Math.max(0.1, perspectiveScale);
        }

        // Calculate Blur (DoF)
        let blurPx = 0;
        if (aperture > 0) {
            const dist = Math.abs(depth - targetDepth);
            const excess = Math.max(0, dist - (focusWidth / 10)); // Allow some range to be sharp
            // Scale blur by aperture
            blurPx = excess * (aperture / 10);
        }

        use.save();

        // Translate to Center
        use.translate(pos.x, pos.y);

        // Apply Lens Scale
        use.scale(perspectiveScale, perspectiveScale);

        // Apply Base Rotation (from layout) + User Z Rotation
        const totalRot = pos.rotation + userRotZ;
        use.rotate(totalRot * Math.PI / 180);

        // Apply 3D tilt (Scale)
        // Note: scaling by cos(deg) shrinks the dimension.
        // This is mathematically how a rotated plane looks (orthographic).
        // Since user removed "Distortion", they might mean the pseudo-squash we did before.
        // Now 'cardHeight' is correct aspect. So this ScaleX/Y will create the "foreshortening".
        // If they want "No Distortion", maybe they want full un-squashed card but rotated?
        // That would look like a sticker.
        // "Proportions fixed" usually means "Don't squash the image content unless rotated".
        // Current logic: Image is drawn into card, Card is scaled.
        // This creates "squashed image".
        // To fix image distortion while rotating card, we'd need texture mapping (too complex).
        // OR: user just meant "Don't pre-squash the card height in calculation".
        // We removed pre-squash. So now card is 1:1 aspect.
        // If RotX=0, it looks perfect.
        // If RotX=45, it looks like a rotated card.
        // This should be what they want.

        use.scale(scaleX, scaleY);

        const w = pos.width;
        const h = pos.height;
        const halfW = w / 2;
        const halfH = h / 2;

        // BLUR FIX: Render to offscreen canvas if blur is needed
        if (blurPx > 0.5) {
            // Resize offscreen canvas to fit card + blur padding
            const pad = blurPx * 3; // Sufficient padding
            oCanvas.width = w + pad * 2;
            oCanvas.height = h + pad * 2;
            oCtx.clearRect(0, 0, oCanvas.width, oCanvas.height);

            // Draw card centered on offscreen canvas
            // drawTransformedCard expects x, y, w, h
            // We draw at pad, pad
            drawTransformedCard(oCtx, card.image, pad, pad, w, h);

            // Apply blur filter to MAIN context
            use.filter = `blur(${blurPx}px)`;

            // Draw the offscreen canvas centered
            // We need to offset by -halfW - pad
            use.drawImage(oCanvas, -halfW - pad, -halfH - pad);

            // Reset filter
            use.filter = 'none';
        } else {
            // Standard direct draw
            drawTransformedCard(use, card.image, -halfW, -halfH, w, h);
        }

        use.restore();
    });
}

function drawTransformedCard(ctx, img, x, y, w, h) {
    // 1. Shadow/Depth
    // Simple offset shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    // Shadow offset should be inverse of rotation?
    // Keep it simple: standard offset
    ctx.translate(10, 10);
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.restore();

    // 2. Image
    ctx.save();
    roundRect(ctx, x, y, w, h, 6);
    ctx.clip();

    // Cover/Contain logic for image inside the card frame
    // We have w, h.
    placeImageInRect(ctx, img, x, y, w, h);

    ctx.restore();

    // 3. Frame
    const frameRgb = state.frameColor === 'black' ? '0,0,0' : '255,255,255';
    ctx.strokeStyle = `rgba(${frameRgb}, 0.8)`;
    ctx.lineWidth = state.frameSize;
    ctx.strokeRect(x, y, w, h);
}

function placeImageInRect(ctx, img, x, y, w, h) {
    // Draw image covering the rect
    const imgAspect = img.width / img.height;
    const boxAspect = w / h;
    let drawW, drawH;

    if (imgAspect > boxAspect) {
        drawH = h;
        drawW = h * imgAspect;
    } else {
        drawW = w;
        drawH = w / imgAspect;
    }

    const offX = x + (w - drawW) / 2;
    const offY = y + (h - drawH) / 2;

    ctx.drawImage(img, offX, offY, drawW, drawH);
}


function slotToRect(col, row, wCols, hRows) {
    const singleHeight = getSingleHeight();
    const x = Math.floor(CONFIG.marginLeftRight + col * (CONFIG.columnWidth + CONFIG.columnGap));
    const y = Math.floor(CONFIG.marginTop + CONFIG.marginLeftRight + row * (singleHeight + CONFIG.rowGap));
    const w = Math.floor(wCols * CONFIG.columnWidth + (wCols - 1) * CONFIG.columnGap);
    const h = Math.floor(hRows * singleHeight + (hRows - 1) * CONFIG.rowGap);
    return { x, y, w, h };
}

// Прямое соответствие: карточка i → слот i (порядок задаётся перетаскиванием в списке)
function getSlotRect(slotIndex) {
    updateConfigForLayout();
    const layout = getCurrentLayout();
    const slotsPerCycle = layout.length;
    const rowsPerCycle = layoutHeightRows(layout);
    const slotInCycle = slotIndex % slotsPerCycle;
    const cycle = Math.floor(slotIndex / slotsPerCycle);
    const s = layout[slotInCycle];
    const rowOffset = cycle * rowsPerCycle;
    return slotToRect(s[0], s[1] + rowOffset, s[2], s[3]);
}

function getRandomColor() {
    const colors = [
        '#0f172a', '#1e293b', '#334155', // Slate
        '#111827', '#1f2937', '#374151', // Gray
        '#000000', '#1a1a2e', '#16213e', // Dark
        '#020617', '#0f172a', '#1e293b'  // Deep Blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function renderBackground(height, useCtx) {
    const use = useCtx || ctx;
    const W = CONFIG.canvasWidth;
    const layout = LAYOUT_CONFIG[getLayoutIndex()];

    // Isometric layouts: ISO background
    if (layout.isometric) {
        if (state.isoBgType === 'custom' && state.isoBg) {
            // Draw ISO background image with lens blur
            const bg = state.isoBg;
            const scaleW = W / bg.width;
            const scaleH = height / bg.height;
            const scale = Math.max(scaleW, scaleH); // Cover
            const drawW = bg.width * scale;
            const drawH = bg.height * scale;
            const offsetX = (W - drawW) / 2;
            const offsetY = (height - drawH) / 2;

            use.save();
            if (state.isoBgBlur > 0) {
                use.filter = `blur(${state.isoBgBlur}px)`;
            }
            use.drawImage(bg, offsetX, offsetY, drawW, drawH);
            use.restore();

            // Subtle dark overlay for contrast
            use.fillStyle = 'rgba(0,0,0,0.15)';
            use.fillRect(0, 0, W, height);
        } else {
            // Default diagonal gradient
            const gradient = use.createLinearGradient(0, 0, W, height);
            gradient.addColorStop(0, '#2a2a2a');
            gradient.addColorStop(0.5, '#1a1a1a');
            gradient.addColorStop(1, '#0a0a0a');
            use.fillStyle = gradient;
            use.fillRect(0, 0, W, height);
        }
        return;
    }

    // Standard backgrounds
    if (state.bgType === 'custom' && state.background) {
        const bg = state.background;
        const scaleW = W / bg.width;
        const scaledHeight = bg.height * scaleW;

        const offset = state.bgVerticalOffset || 0;
        const sourceY = offset / scaleW;

        // Calculate content height (cards + margins) for clipping
        let contentBottom = 0;
        if (state.images.length > 0) {
            const currentLayoutSlotRects = state.images.map((_, i) => getSlotRect(i));
            currentLayoutSlotRects.forEach(r => {
                contentBottom = Math.max(contentBottom, r.y + r.h);
            });
            contentBottom += 100; // Add 100px bottom padding
        } else {
            contentBottom = height; // Fallback for empty state
        }

        // Ensure background covers at least the visible canvas or content
        const drawLimitH = Math.max(height, contentBottom);

        if (scaledHeight >= drawLimitH) {
            // Background is tall enough, just draw it (clipped to contentBottom if needed)
            // We draw to 'height' of canvas, but effective "visual" limit is contentBottom.
            // If canvas height is large (e.g. huge screen), we fill it.
            // But user requirement says: "If cards are few, bg is clipped by cards + 100px".
            // So we should fill transparent after contentBottom?
            // The canvas size itself is determined by getCanvasHeight() which ALREADY calculates based on cards.
            // So 'height' PASSED to this function IS the content height (roughly).
            // Let's just draw tiled/mirrored to fill the entire CANVAS height.
            // The clipping "concept" is handled by canvas height resizing in getCanvasHeight().
            // Wait, getCanvasHeight() calculates height based on slots.
            // So if slots end, canvas ends.
            // So we just need to fill the canvas.

            // Actually, the user says: "If cards are few, and background is long, it is clipped by cards + 100px".
            // This implies the canvas height should ALREADY be clipped.
            // Let's re-verify getCanvasHeight().

            // Correct logic: Just fill the 'height' requested.
            // However, to implementation "vertical mirroring":

            let y = 0;
            let tileIndex = 0;
            while (y < height) {
                const drawH = Math.min(scaledHeight, height - y);

                use.save();
                if (tileIndex % 2 === 1) {
                    // Mirror vertically
                    use.translate(0, y + drawH);
                    use.scale(1, -1);
                    use.drawImage(bg, 0, 0, bg.width, drawH / scaleW, 0, 0, W, drawH);
                } else {
                    use.drawImage(bg, 0, 0, bg.width, drawH / scaleW, 0, y, W, drawH);
                }
                use.restore();

                y += drawH;
                tileIndex++;
            }

        } else {
            // Image is smaller than canvas, tile it vertically with mirroring
            let y = 0;
            let tileIndex = 0;
            while (y < height) {
                // Determine how much of the image we can draw in this tile
                const tileH = scaledHeight; // Full rendered height of one tile if space permits
                const drawH = Math.min(tileH, height - y); // Actual height to draw
                const sourceH = bg.height * (drawH / tileH); // Corresponding source height

                use.save();
                if (tileIndex % 2 === 1) {
                    // Mirror vertically
                    // We want the TOP of the tile (y) to correspond to the BOTTOM of the source image
                    // And the BOTTOM of the tile (y+drawH) to correspond to the TOP of the source image
                    // The previous tile (Normal) ended with BOTTOM of source image.

                    use.translate(0, y + drawH);
                    use.scale(1, -1);
                    // Draw from source (0,0) to sourceH.
                    // (0,0) source is Top of image.
                    // Placed at (0,0) local (which is y+drawH global/Canvas Bottom of tile).
                    // So Top of Image -> Bottom of Tile.
                    // SourceH (Bottom of slice) -> Top of Tile.
                    // This creates proper mirroring: Previous(Bottom) <-> Current(Bottom-at-Top).
                    use.drawImage(bg, 0, 0, bg.width, sourceH, 0, 0, W, drawH);
                } else {
                    // Normal orientation
                    use.drawImage(bg, 0, 0, bg.width, sourceH, 0, y, W, drawH);
                }
                use.restore();

                y += drawH;
                tileIndex++;
            }
        }
    } else {
        use.fillStyle = getRandomColor();
        use.fillRect(0, 0, W, height);
    }
}

function renderIntroBlock(useCtx) {
    const use = useCtx || ctx;
    const pad = 80;
    const boxW = CONFIG.canvasWidth - 2 * pad;
    const boxH = 220;
    const y0 = 40;
    const centerX = CONFIG.canvasWidth / 2;
    use.save();
    use.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(use, pad, y0, boxW, boxH, 12);
    use.fill();
    use.font = `${state.introFontSize}px ${state.introFont}`;
    use.fillStyle = '#fff';
    use.textAlign = 'center';
    use.textBaseline = 'top';
    const title = (state.introTitle || '').slice(0, 50);
    use.fillText(title, centerX, y0 + 28);
    use.font = `18px ${state.introFont}`;
    use.fillStyle = 'rgba(255,255,255,0.9)';
    const text = (state.introText || '').slice(0, 200);
    wrapTextCentered(use, text, centerX, y0 + 82, boxW - 80, 22);
    use.restore();
}

function wrapTextCentered(useCtx, text, centerX, startY, maxWidth, lineHeight) {
    const c = useCtx || ctx;
    const words = text.split(/\s+/).filter(Boolean);
    let line = '';
    let currentY = startY;
    c.textAlign = 'center';
    for (const w of words) {
        const test = line ? line + ' ' + w : w;
        const m = c.measureText(test);
        if (m.width > maxWidth && line) {
            c.fillText(line, centerX, currentY);
            line = w;
            currentY += lineHeight;
        } else {
            line = test;
        }
    }
    if (line) c.fillText(line, centerX, currentY);
}

function wrapText(useCtx, text, x, y, maxWidth, lineHeight) {
    const c = useCtx || ctx;
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (const w of words) {
        const test = line + (line ? ' ' : '') + w;
        const m = c.measureText(test);
        if (m.width > maxWidth && line) {
            c.fillText(line, x, currentY);
            line = w;
            currentY += lineHeight;
        } else {
            line = test;
        }
    }
    if (line) c.fillText(line, x, currentY);
}

function renderProcessBlock(useCtx) {
    const use = useCtx || ctx;
    const introH = getIntroHeight();
    const pad = 40;
    const sectionTitleY = introH + 30;
    use.save();
    use.font = `36px ${state.processFont}`;
    use.fillStyle = '#fff';
    use.textAlign = 'center';
    use.fillText(state.processSectionTitle || 'Процесс работы', CONFIG.canvasWidth / 2, sectionTitleY);
    const blockW = 320;
    const blockH = 180;
    const gap = 30;
    const totalW = 3 * blockW + 2 * gap;
    let startX = (CONFIG.canvasWidth - totalW) / 2;
    const blocksY = introH + 90;
    const steps = [
        [state.processStep1Title, state.processStep1Text],
        [state.processStep2Title, state.processStep2Text],
        [state.processStep3Title, state.processStep3Text]
    ];
    for (let i = 0; i < 3; i++) {
        const x = startX + i * (blockW + gap);
        use.fillStyle = 'rgba(0,0,0,0.45)';
        roundRect(use, x, blocksY, blockW, blockH, 12);
        use.fill();
        use.fillStyle = 'rgba(255,255,255,0.4)';
        use.font = '20px ' + state.processFont;
        use.textAlign = 'center';
        use.fillText((i + 1).toString(), x + 30, blocksY - 10);
        use.fillStyle = '#fff';
        use.font = `18px ${state.processFont}`;
        use.fillText((steps[i][0] || '').slice(0, 28), x + blockW / 2, blocksY + 25);
        use.font = `${state.processFontSize}px ${state.processFont}`;
        use.fillStyle = 'rgba(255,255,255,0.8)';
        use.textAlign = 'left';
        wrapText(use, (steps[i][1] || '').slice(0, 100) + '…', x + 15, blocksY + 55, blockW - 30, 18);
    }
    const imgY = blocksY + blockH + 40;
    if (state.processImage && state.processImage.image) {
        const img = state.processImage.image;
        const w = CONFIG.canvasWidth - 2 * CONFIG.marginLeftRight;
        const scale = w / img.width;
        const h = Math.floor(img.height * scale);
        use.drawImage(img, CONFIG.marginLeftRight, imgY, w, h);
    } else {
        use.fillStyle = 'rgba(255,255,255,0.04)';
        use.fillRect(CONFIG.marginLeftRight, imgY, CONFIG.canvasWidth - 2 * CONFIG.marginLeftRight, 180);
        use.fillStyle = 'rgba(255,255,255,0.3)';
        use.font = '16px sans-serif';
        use.textAlign = 'center';
        use.fillText('Изображение процесса', CONFIG.canvasWidth / 2, imgY + 90);
    }
    use.restore();
}

function generateRandomIconPositions() {
    state.iconPositions = [];
    // Generate 12-15 random positions
    // Area: 0.05 to 0.95 for both axes
    const count = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
        state.iconPositions.push({
            x: 0.05 + Math.random() * 0.9,
            y: 0.05 + Math.random() * 0.9,
            sizeIndex: Math.random() > 0.7 ? 1 : 0 // 30% chance for large
        });
    }
    render();
}

function randomizeIconItems() {
    // Just force a re-render, the render function will pick random items if we implement it that way
    // Or shuffle the source array?
    // Let's shuffle the source array in state
    ['pngBlack', 'svgBlack', 'svgWhite'].forEach(key => {
        if (state.icons[key]) {
            state.icons[key].sort(() => Math.random() - 0.5);
        }
    });
    render();
}

function renderIconsOnCanvas(useCtx) {
    const use = useCtx || ctx;
    if (!state.iconsEnabled) return;
    const list = state.icons[state.iconTheme];
    if (!list || list.length === 0) return;

    // Use stored positions or generate if empty (and not using legacy fixed positions)
    // Actually, let's switch to using stored positions as the primary method if 'custom_position' is set
    // or just always if we want "Random Place" to work.

    if (state.iconPositions.length === 0) {
        generateRandomIconPositions();
    }

    const sizes = [40, 80]; // Small, Large
    const introH = getIntroHeight();
    const processH = getProcessHeight();
    const totalTop = introH + processH;

    // We need to cover the WHOLE canvas height, not just visible area?
    // Icons should be scattered across the entire scrollable height?
    // Or just the "work area"?
    // The previous code used `totalTop`.
    // `const y = (pos[1] * totalTop) - size / 2;` -> This puts them ONLY in the top Intro/Process area?
    // User said "above background, below cards". Cards are in the main area.
    // So icons should probably be EVERYWHERE.

    const height = getCanvasHeight();

    use.save();
    use.globalAlpha = state.iconOpacity;

    state.iconPositions.forEach((pos, idx) => {
        const icon = list[idx % list.length];
        if (!icon || !icon.image) return;

        const size = sizes[pos.sizeIndex || 0];

        // x is relative to canvasWidth
        const x = (pos.x * CONFIG.canvasWidth) - size / 2;

        // y is relative to... full height?
        // Let's spread them over the full height
        const y = (pos.y * height) - size / 2;

        use.drawImage(icon.image, x, y, size, size);

    });

    use.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function render() {
    updateConfigForLayout();
    if (state.images.length === 0) {
        updateConfigForLayout();
        const height = getCanvasHeight();
        canvas.width = CONFIG.canvasWidth;
        canvas.height = height;
        renderBackground(height);
        if (state.introEnabled) renderIntroBlock();
        if (state.processEnabled) renderProcessBlock();
        if (state.iconsEnabled) renderIconsOnCanvas();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Загрузите изображения для карточек', CONFIG.canvasWidth / 2, height - 80);
        resizeCanvas();
        return;
    }

    const height = getCanvasHeight();
    canvas.width = CONFIG.canvasWidth;
    canvas.height = height;
    renderBackground(height);
    if (state.introEnabled) renderIntroBlock();
    if (state.processEnabled) renderProcessBlock();
    if (state.iconsEnabled) renderIconsOnCanvas();

    // Check if isometric layout
    const layout = LAYOUT_CONFIG[getLayoutIndex()];
    if (layout.isometric) {
        // Render isometric layout
        renderIsometricLayout(ctx);
    } else {
        // Standard grid rendering
        const nCards = state.images.length;
        for (let i = 0; i < nCards; i++) {
            const rect = getSlotRect(i);
            placeImage(state.images[i].image, rect.x, rect.y, rect.w, rect.h, i === 0);
        }
    }
    resizeCanvas();
}

function exportCurrentHTML() {
    if (state.images.length === 0) return;
    generateHTMLClientSide(getLayoutIndex() + 1);
}

function buildHTML() {
    const originalLayout = state.layoutChoice;
    for (let i = 0; i < LAYOUT_CONFIG.length; i++) {
        state.layoutChoice = String(i);
        generateHTMLClientSide(i + 1);
    }
    state.layoutChoice = originalLayout;
    updateConfigForLayout();
    render();
}

function canvasToDataUrl(img) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/jpeg', 0.9);
}

function generateHTMLClientSide(layoutNum) {
    updateConfigForLayout();
    const height = getCanvasHeight();
    const cards = [];
    for (let i = 0; i < state.images.length; i++) {
        const rect = getSlotRect(i);
        cards.push({
            img: state.images[i].src,
            x: rect.x, y: rect.y, w: rect.w, h: rect.h,
            hero: i === 0
        });
    }
    const bgCss = state.bgType === 'custom' && state.background
        ? `url(${canvasToDataUrl(state.background)}) 0 0 / 1440px auto`
        : getRandomColor();
    const cardsHtml = cards.map(c =>
        `<a class="card${c.hero ? ' hero' : ''}" href="${c.img}" target="_blank" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;"><img src="${c.img}" alt=""></a>`
    ).join('\n');
    const bgStyle = typeof bgCss === 'string' && bgCss.startsWith('#')
        ? bgCss
        : bgCss;
    const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const introTitleEsc = esc(state.introTitle);
    const introTextEsc = esc(state.introText).replace(/\n/g, '<br>');
    const introSectionHtml = `<section class="section section--intro"><div class="section__container"><div class="intro__content" style="backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:rgba(0,0,0,.5)"><h1 class="intro__title" style="font-family:${state.introFont};font-size:${state.introFontSize}px">${introTitleEsc}</h1><p class="intro__text" style="font-family:${state.processFont};font-size:18px;text-align:center">${introTextEsc}</p></div></div></section>`;
    const introCss = `.section--intro{min-height:auto;width:100%;}.section__container{padding:80px 40px;position:relative;}.intro__content{max-width:900px;margin:0 auto;text-align:center;padding:40px;border-radius:12px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:rgba(0,0,0,.5)}.intro__title{margin-bottom:40px;text-transform:uppercase;letter-spacing:4px;font-weight:700;color:#fff}.intro__text{line-height:1.8;color:rgba(255,255,255,.9);padding:20px;border-radius:8px}`;

    const processTitleEsc = esc(state.processSectionTitle);
    const steps = [
        [state.processStep1Title, state.processStep1Text],
        [state.processStep2Title, state.processStep2Text],
        [state.processStep3Title, state.processStep3Text]
    ];
    const processBlocksHtml = steps.map((s, i) => `<article class="process-block"><div class="process-block__number">${i + 1}</div><h3 class="process-block__title" style="font-family:${state.processFont};font-size:${state.processFontSize + 4}px">${esc(s[0])}</h3><p class="process-block__text" style="font-family:${state.processFont};font-size:${state.processFontSize}px">${esc(s[1]).replace(/\n/g, '<br>')}</p></article>`).join('<div class="process-flow__arrow">→</div>');
    const processImageHtml = state.processImage && state.processImage.src
        ? `<div class="process-flow__image"><img src="${state.processImage.src}" alt="Process" class="process-flow__img"></div>`
        : '';
    const processSectionHtml = `<section class="section section--process"><div class="section__container"><h2 class="section__title" style="font-family:${state.processFont}">${processTitleEsc}</h2>${processImageHtml}<div class="process-flow"><div class="process-flow__container">${processBlocksHtml}</div></div></div></section>`;
    const processCss = `.section--process{min-height:auto;width:100%}.process-flow__image{margin:40px 0;width:100%}.process-flow__img{width:100%;max-width:1360px;height:auto;display:block}.process-flow__container{display:flex;align-items:center;justify-content:center;gap:30px;flex-wrap:wrap}.process-flow__arrow{font-size:64px;color:rgba(255,255,255,.9);flex-shrink:0}.process-block{background:rgba(0,0,0,.45);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:40px;border-radius:12px;flex:1;min-width:250px;max-width:350px;position:relative}.process-block__number{position:absolute;top:-20px;left:20px;width:40px;height:40px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px}.process-block__title{margin-bottom:20px;color:#fff}.process-block__text{color:rgba(255,255,255,.85);line-height:1.6}.section__title{text-align:center;margin-bottom:40px;text-transform:uppercase;letter-spacing:2px}`;

    let iconsHtml = '';
    if (state.iconsEnabled) {
        const list = state.icons[state.iconTheme] || state.icons.pngBlack || [];
        let arr = [...list];
        if (state.iconRandomizeType === 'filename') arr = [...arr].sort(() => Math.random() - 0.5);
        const positions = [[5, 8], [92, 12], [8, 82], [90, 85], [12, 35], [85, 40], [10, 60], [88, 65]];
        const sizes = [40, 80];
        let idx = 0;
        const introH = getIntroHeight();
        const processH = getProcessHeight();
        const totalH = introH + processH;
        for (let s = 0; s < 2 && idx < arr.length; s++) {
            for (let p = 0; p < 4 && idx < arr.length; p++) {
                const pos = state.iconRandomizeType === 'position' ? positions[(idx + p) % positions.length] : positions[p];
                const icon = arr[idx];
                const dataUrl = icon.dataUrl || icon.src;
                const size = sizes[s];
                const left = (pos[0] / 100) * 1440 - size / 2;
                const top = (pos[1] / 100) * totalH - size / 2;
                iconsHtml += `<img class="deco-icon" src="${dataUrl}" alt="" style="position:absolute;left:${Math.max(0, left)}px;top:${Math.max(0, top)}px;width:${size}px;height:${size}px;opacity:.35;pointer-events:none;z-index:0">`;
                idx++;
            }
        }
    }
    const topHeight = getIntroHeight() + getProcessHeight();
    const iconsWrapHtml = state.iconsEnabled ? `<div class="decorative-icons-wrap" style="position:absolute;top:0;left:0;width:1440px;height:${topHeight}px;pointer-events:none;z-index:1">${iconsHtml}</div>` : '';
    const parts = [];
    if (state.introEnabled) parts.push(introSectionHtml);
    if (state.processEnabled) parts.push(processSectionHtml);
    parts.push(iconsWrapHtml);
    parts.push(`<div class="portfolio">${cardsHtml}</div>`);
    const mainWrap = `<div class="main-wrap" style="position:relative;width:1440px">${parts.join('')}</div>`;
    const sectionCss = (state.introEnabled ? introCss : '') + (state.processEnabled ? processCss : '');

    const fit = layoutNum >= 5 ? 'cover' : 'contain';
    const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Portfolio 1440 - Layout ${layoutNum}</title><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:#0f1219;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:20px;font-family:'Helvetica Neue',Arial,sans-serif;color:#fff}
${sectionCss}
.portfolio{position:relative;width:1440px;height:${height}px;background:${bgStyle};box-shadow:0 20px 60px rgba(0,0,0,.5)}
.card{position:absolute;display:block;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.4);border:2px solid rgba(255,255,255,.15);transition:transform .2s}
.card:hover{transform:scale(1.02)}.card.hero{border-color:rgba(100,150,255,.5)}.card img{width:100%;height:100%;object-fit:${fit};display:block}
</style></head><body>${mainWrap}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${state.projectName || 'portfolio'}_layout_${layoutNum}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function exportImage() {
    updateConfigForLayout();
    const height = getCanvasHeight();
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = CONFIG.canvasWidth;
    exportCanvas.height = height;
    const exportCtx = exportCanvas.getContext('2d');

    renderBackground(height, exportCtx);
    if (state.introEnabled) renderIntroBlock(exportCtx);
    if (state.processEnabled) renderProcessBlock(exportCtx);
    if (state.iconsEnabled) renderIconsOnCanvas(exportCtx);

    const layout = LAYOUT_CONFIG[getLayoutIndex()];

    // Check if isometric layout
    if (layout.isometric) {
        renderIsometricLayout(exportCtx);
    } else {
        // Standard layouts - use slot system
        const nCards = state.images.length;
        for (let i = 0; i < nCards; i++) {
            const rect = getSlotRect(i);
            placeImageOnCtx(exportCtx, state.images[i].image, rect.x, rect.y, rect.w, rect.h, i === 0);
        }
    }

    // Download
    const link = document.createElement('a');
    link.download = `portfolio_1440x${height}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
}

function placeImage(img, x, y, w, h, isHero = false) {
    placeImageOnCtx(ctx, img, x, y, w, h, isHero);
}

function placeImageOnCtx(ctx, img, x, y, w, h, isHero = false) {
    const imgAspect = img.width / img.height;
    const slotAspect = w / h;
    let drawW, drawH;

    // Check layout index from state
    const layoutIdx = getLayoutIndex();
    const isCover = layoutIdx >= 4;

    if (isCover) {
        if (imgAspect > slotAspect) {
            drawH = h;
            drawW = h * imgAspect;
        } else {
            drawW = w;
            drawH = w / imgAspect;
        }
    } else {
        if (imgAspect > slotAspect) {
            drawW = w;
            drawH = w / imgAspect;
        } else {
            drawH = h;
            drawW = h * imgAspect;
        }
    }

    const offsetX = Math.floor(x + (w - drawW) / 2);
    const offsetY = Math.floor(y + (h - drawH) / 2);
    drawW = Math.floor(drawW);
    drawH = Math.floor(drawH);

    // Advanced Shadows
    const dist = state.shadowDist !== undefined ? state.shadowDist : 20;
    const blur = state.shadowBlur !== undefined ? state.shadowBlur : 40;
    const opacity = state.shadowOpacity !== undefined ? state.shadowOpacity : 0.4;

    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${opacity})`;
    ctx.shadowBlur = isHero ? blur * 1.5 : blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = dist; // Vertical distance
    ctx.fillStyle = `rgba(0,0,0,${opacity * 0.5})`;

    // Vertical Align Logic
    let finalY = offsetY;
    if (state.vertAlign === 'top') {
        finalY = y;
    } else if (state.vertAlign === 'bottom') {
        finalY = y + (h - drawH);
    }
    // 'center' is default

    // 3D Rotation (Standard)
    const cx = offsetX + drawW / 2;
    const cy = finalY + drawH / 2;
    const radX = (state.rotateX || 0) * Math.PI / 180;
    const radY = (state.rotateY || 0) * Math.PI / 180;
    const radZ = (state.rotateZ || 0) * Math.PI / 180;
    const scaleX = Math.abs(Math.cos(radY));
    const scaleY = Math.abs(Math.cos(radX));
    const shadowDX = (state.shadowDistX || 0);

    // Calculate 2D offsets for shadow
    const sX = (state.shadowDistX || 0);
    const sY = dist;

    // --- SHADOW PASS ---
    ctx.save();
    // 1. Move to Center
    ctx.translate(cx, cy);
    // 2. Rotate & Scale
    ctx.rotate(radZ);
    // Note: If we want "perspective" we might need more math, 
    // but scale is what we have.
    ctx.scale(scaleX, scaleY);
    // 3. Draw Relative to Center (at -w/2, -h/2)
    // Shadow rect is also offset by sX, sY
    const shX = -drawW / 2 + 2 + sX;
    const shY = -drawH / 2 + sY;

    ctx.fillStyle = `rgba(0,0,0,${opacity * 0.5})`;

    if (opacity > 0) {
        if (blur > 0) ctx.filter = `blur(${blur}px)`;
        roundRect(ctx, shX, shY, drawW, drawH, 4);
        ctx.fill();
        ctx.filter = 'none';
    }
    ctx.restore();

    // --- IMAGE PASS ---
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(radZ);
    ctx.scale(scaleX, scaleY);

    // Draw relative to center
    const drawX = -drawW / 2;
    const drawY = -drawH / 2;

    roundRect(ctx, drawX, drawY, drawW, drawH, 4);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    // --- FRAME PASS ---
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(radZ);
    ctx.scale(scaleX, scaleY);

    ctx.beginPath();
    roundRect(ctx, drawX, drawY, drawW, drawH, 4);

    if (isHero) {
        ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
    } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
    }
    ctx.stroke();

    const frameRgb = state.frameColor === 'black' ? '0, 0, 0' : '255, 255, 255';
    ctx.strokeStyle = `rgba(${frameRgb}, 0.9)`;
    ctx.lineWidth = state.frameSize;
    ctx.strokeRect(drawX, drawY, drawW, drawH);

    ctx.restore();
}

// Сохранение проекта
function saveProject() {
    const projectData = {
        images: state.images.map(img => ({ src: img.src, name: img.name, moduleSize: img.moduleSize })),
        aspectRatio: state.aspectRatio,
        layoutChoice: state.layoutChoice,
        bgType: state.bgType,
        background: state.background ? canvasToDataUrl(state.background) : null,
        frameColor: state.frameColor,
        frameSize: state.frameSize,
        shadowPreset: state.shadowPreset,
        projectName: state.projectName || 'project',
        introTitle: state.introTitle,
        introText: state.introText,
        introFont: state.introFont,
        introFontSize: state.introFontSize,
        processSectionTitle: state.processSectionTitle,
        processStep1Title: state.processStep1Title,
        processStep1Text: state.processStep1Text,
        processStep2Title: state.processStep2Title,
        processStep2Text: state.processStep2Text,
        processStep3Title: state.processStep3Title,
        processStep3Text: state.processStep3Text,
        processFont: state.processFont,
        processFontSize: state.processFontSize,
        processImage: state.processImage ? state.processImage.src : null,
        introEnabled: state.introEnabled,
        processEnabled: state.processEnabled,
        iconsEnabled: state.iconsEnabled,
        iconTheme: state.iconTheme,
        iconTheme: state.iconTheme,
        iconRandomizeType: state.iconRandomizeType,
        isoSettings: state.isoSettings || {},
        iconRandomizeType: state.iconRandomizeType,
        isoSettings: state.isoSettings || {},
        presets: state.presets || [],
        // New Controls
        vertAlign: state.vertAlign,
        contentMargin: state.contentMargin,
        columnGap: state.columnGap,
        shadowDist: state.shadowDist,
        shadowBlur: state.shadowBlur,
        shadowOpacity: state.shadowOpacity,
        shadowDistX: state.shadowDistX,
        rotateX: state.rotateX,
        rotateY: state.rotateY,
        rotateZ: state.rotateZ
    };
    const json = JSON.stringify(projectData);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${projectData.projectName} _layout.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

// Загрузка проекта
function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectData = JSON.parse(event.target.result);
                state.aspectRatio = projectData.aspectRatio || 0.75;
                state.layoutChoice = projectData.layoutChoice || '0';
                state.bgType = projectData.bgType || 'random';
                state.frameColor = projectData.frameColor || 'white';
                state.frameSize = projectData.frameSize || 2;
                state.shadowPreset = projectData.shadowPreset || 'medium';
                state.projectName = projectData.projectName || '';
                state.introTitle = projectData.introTitle ?? state.introTitle;
                state.introText = projectData.introText ?? state.introText;
                state.introFont = projectData.introFont ?? state.introFont;
                state.introFontSize = projectData.introFontSize ?? state.introFontSize;
                state.processSectionTitle = projectData.processSectionTitle ?? state.processSectionTitle;
                state.processStep1Title = projectData.processStep1Title ?? state.processStep1Title;
                state.processStep1Text = projectData.processStep1Text ?? state.processStep1Text;
                state.processStep2Title = projectData.processStep2Title ?? state.processStep2Title;
                state.processStep2Text = projectData.processStep2Text ?? state.processStep2Text;
                state.processStep3Title = projectData.processStep3Title ?? state.processStep3Title;
                state.processStep3Text = projectData.processStep3Text ?? state.processStep3Text;
                state.processFont = projectData.processFont ?? state.processFont;
                state.processFontSize = projectData.processFontSize ?? state.processFontSize;
                state.introEnabled = projectData.introEnabled !== undefined ? projectData.introEnabled : state.introEnabled;
                state.processEnabled = projectData.processEnabled !== undefined ? projectData.processEnabled : state.processEnabled;
                state.iconsEnabled = projectData.iconsEnabled !== undefined ? projectData.iconsEnabled : state.iconsEnabled;
                state.iconTheme = projectData.iconTheme ?? state.iconTheme;
                state.iconTheme = projectData.iconTheme ?? state.iconTheme;
                state.iconRandomizeType = projectData.iconRandomizeType ?? state.iconRandomizeType;
                if (projectData.isoSettings) {
                    state.isoSettings = { ...state.isoSettings, ...projectData.isoSettings };

                    // Update ISO controls inputs
                    const ids = {
                        lens: 'isoLensRange',
                        angle: 'isoAngleRange',
                        scale: 'isoScaleRange',
                        spacing: 'isoSpacingRange',
                        viewAngle: 'isoViewAngleRange',
                        rotateX: 'isoRotXRange',
                        rotateY: 'isoRotYRange',
                        rotateZ: 'isoRotZRange',
                        aperture: 'isoApertureRange',
                        focusPos: 'isoFocusPosRange',
                        focusWidth: 'isoFocusWidthRange'
                    };
                    ['isoLensRange', 'isoAngleRange', 'isoScaleRange', 'isoSpacingRange', 'isoViewAngleRange', 'isoRotXRange', 'isoRotYRange', 'isoRotZRange', 'isoApertureRange', 'isoFocusPosRange', 'isoFocusWidthRange'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) {
                            const key = id.replace('iso', '').replace('Range', '');
                            let stateKey = key.charAt(0).toLowerCase() + key.slice(1);
                            if (key === 'RotX') stateKey = 'rotateX';
                            if (key === 'RotY') stateKey = 'rotateY';
                            if (key === 'RotZ') stateKey = 'rotateZ';

                            if (state.isoSettings[stateKey] !== undefined) {
                                el.value = state.isoSettings[stateKey];
                                const valEl = document.getElementById(id.replace('Range', 'Value'));
                                if (valEl) valEl.textContent = state.isoSettings[stateKey] + (stateKey === 'lens' || stateKey === 'aperture' || stateKey === 'focusWidth' ? '' : (stateKey === 'scale' || stateKey === 'spacing' || stateKey === 'focusPos' ? '%' : '°'));
                            }
                        }
                    });
                }


                // Load New Controls
                state.vertAlign = projectData.vertAlign || 'center';
                state.contentMargin = projectData.contentMargin !== undefined ? projectData.contentMargin : 100;
                state.columnGap = projectData.columnGap !== undefined ? projectData.columnGap : 40;
                state.shadowDist = projectData.shadowDist || 20;
                state.shadowBlur = projectData.shadowBlur || 40;
                state.shadowBlur = projectData.shadowBlur || 40;
                state.shadowOpacity = projectData.shadowOpacity || 0.4;
                state.shadowDistX = projectData.shadowDistX || 0;
                state.rotateX = projectData.rotateX || 0;
                state.rotateY = projectData.rotateY || 0;
                state.rotateZ = projectData.rotateZ || 0;

                // Update Inputs
                const cmEl = document.getElementById('contentMarginRange');
                if (cmEl) { cmEl.value = state.contentMargin; document.getElementById('contentMarginValue').textContent = state.contentMargin + 'px'; }

                const cgEl = document.getElementById('columnGapRange');
                if (cgEl) { cgEl.value = state.columnGap; document.getElementById('columnGapValue').textContent = state.columnGap + 'px'; }

                document.querySelectorAll('input[name="vertAlign"]').forEach(r => r.checked = r.value === state.vertAlign);

                const sdEl = document.getElementById('shadowDistRange');
                if (sdEl) { sdEl.value = state.shadowDist; document.getElementById('shadowDistValue').textContent = state.shadowDist; }

                const sbEl = document.getElementById('shadowBlurRange');
                if (sbEl) { sbEl.value = state.shadowBlur; document.getElementById('shadowBlurValue').textContent = state.shadowBlur; }

                const soEl = document.getElementById('shadowOpacityRange');
                if (soEl) { soEl.value = state.shadowOpacity * 100; document.getElementById('shadowOpacityValue').textContent = Math.round(state.shadowOpacity * 100) + '%'; }

                if (projectData.processImage) {
                    const img = new Image();
                    img.onload = () => {
                        state.processImage = { src: projectData.processImage, image: img };
                        const nameEl = document.getElementById('processImageName');
                        if (nameEl) nameEl.textContent = '(из проекта)';
                        render();
                    };
                    img.src = projectData.processImage;
                } else {
                    state.processImage = null;
                    const nameEl = document.getElementById('processImageName');
                    if (nameEl) nameEl.textContent = '';
                }
                const introTitleEl = document.getElementById('introTitleInput');
                const introTextEl = document.getElementById('introTextInput');
                if (introTitleEl) introTitleEl.value = state.introTitle;
                if (introTextEl) introTextEl.value = state.introText;
                const introFontSelect = document.getElementById('introFontSelect');
                const introFontSizeInput = document.getElementById('introFontSizeInput');
                if (introFontSelect) introFontSelect.value = state.introFont;
                if (introFontSizeInput) introFontSizeInput.value = state.introFontSize;
                const processSectionTitleInput = document.getElementById('processSectionTitleInput');
                if (processSectionTitleInput) processSectionTitleInput.value = state.processSectionTitle;
                ['processStep1Title', 'processStep1Text', 'processStep2Title', 'processStep2Text', 'processStep3Title', 'processStep3Text'].forEach(key => {
                    const el = document.getElementById(key + 'Input');
                    if (el) el.value = state[key];
                });
                const processFontSelect = document.getElementById('processFontSelect');
                const processFontSizeInput = document.getElementById('processFontSizeInput');
                if (processFontSelect) processFontSelect.value = state.processFont;
                if (processFontSizeInput) processFontSizeInput.value = state.processFontSize;
                const introEnabledToggle = document.getElementById('introEnabledToggle');
                const processEnabledToggle = document.getElementById('processEnabledToggle');
                const iconsEnabledToggle = document.getElementById('iconsEnabledToggle');
                if (introEnabledToggle) introEnabledToggle.checked = state.introEnabled;
                if (processEnabledToggle) processEnabledToggle.checked = state.processEnabled;
                if (iconsEnabledToggle) iconsEnabledToggle.checked = state.iconsEnabled;
                const iconThemeSelect = document.getElementById('iconThemeSelect');
                const iconRandomizeSelect = document.getElementById('iconRandomizeSelect');
                if (iconThemeSelect) iconThemeSelect.value = state.iconTheme;
                if (iconRandomizeSelect) iconRandomizeSelect.value = state.iconRandomizeType;
                if (projectData.background) {
                    const img = new Image();
                    img.onload = () => {
                        state.background = img;
                        render();
                    };
                    img.src = projectData.background;
                } else {
                    state.background = null;
                }
                const loadedImages = [];
                let loaded = 0;
                projectData.images.forEach((imgData, idx) => {
                    const img = new Image();
                    img.onload = () => {
                        loadedImages[idx] = { src: imgData.src, image: img, name: imgData.name, moduleSize: imgData.moduleSize || 1 };
                        loaded++;
                        if (loaded === projectData.images.length) {
                            state.images = loadedImages;
                            updateCardsList();
                            render();
                        }
                    };
                    img.src = imgData.src;
                });
                document.querySelectorAll('input[name="aspect"]').forEach(r => r.checked = parseFloat(r.value) === state.aspectRatio);
                document.querySelectorAll('input[name="layout"]').forEach(r => r.checked = r.value === state.layoutChoice);
                document.querySelectorAll('input[name="bg"]').forEach(r => r.checked = r.value === state.bgType);
                document.querySelectorAll('input[name="frame"]').forEach(r => r.checked = r.value === state.frameColor);
                document.querySelectorAll('input[name="shadow"]').forEach(r => r.checked = r.value === state.shadowPreset);
                document.getElementById('frameSizeInput').value = state.frameSize;
            } catch (err) {
                alert('Ошибка загрузки проекта: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Экспорт всех 4 вёрсток как PNG
function exportAllLayouts() {
    const originalLayout = state.layoutChoice;
    for (let i = 0; i < LAYOUT_CONFIG.length; i++) {
        state.layoutChoice = String(i);
        updateConfigForLayout();
        const height = getCanvasHeight();
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = CONFIG.canvasWidth;
        exportCanvas.height = height;
        const exportCtx = exportCanvas.getContext('2d');
        renderBackground(height, exportCtx);
        if (state.introEnabled) renderIntroBlock(exportCtx);
        if (state.processEnabled) renderProcessBlock(exportCtx);
        if (state.iconsEnabled) renderIconsOnCanvas(exportCtx);
        const nCards = state.images.length;
        for (let j = 0; j < nCards; j++) {
            const rect = getSlotRect(j);
            placeImageOnCtx(exportCtx, state.images[j].image, rect.x, rect.y, rect.w, rect.h, j === 0);
        }
        const link = document.createElement('a');
        link.download = `${state.projectName || 'portfolio'}_layout_${i + 1}_${CONFIG.canvasWidth}x${height}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
    }
    state.layoutChoice = originalLayout;
    updateConfigForLayout();
    render();
}

// Theme toggle
function initTheme() {
    const saved = localStorage.getItem('plb-theme');
    const theme = saved || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButtons(theme);
}

function toggleTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('plb-theme', theme);
    updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
    const darkBtn = document.getElementById('themeDarkBtn');
    const lightBtn = document.getElementById('themeLightBtn');
    if (darkBtn) darkBtn.classList.toggle('active', theme === 'dark');
    if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');
}

// Start
initTheme();
init();
initPresets();

// Initial render
render();

// --- Pattern Generators ---

function seededRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function generateP17Slots(count, seed) {
    const slots = [];
    const cols = 6; // Matches CONFIG.columns
    let r = 0, c = 0;
    const patternType = Math.floor(seededRandom(seed) * 4); // 0-3

    let itemsPlaced = 0;
    let attempts = 0;
    let maxAttempts = count * 4;

    while (itemsPlaced < count && attempts < maxAttempts) {
        let valid = true;
        // Pattern 0: Standard Grid
        if (patternType === 0) valid = true;
        // Pattern 1: Checkerboard (skip 1, place 1)
        if (patternType === 1) { if ((r + c) % 2 !== 0) valid = false; }
        // Pattern 2: Diagonals
        if (patternType === 2) { if ((r + c) % 3 === 0) valid = false; }
        // Pattern 3: Random gaps
        if (patternType === 3) { if (seededRandom(seed + attempts) > 0.8) valid = false; }

        if (valid) {
            slots.push([c, r, 1, 1]);
            itemsPlaced++;
        }
        c++;
        if (c >= cols) { c = 0; r++; }
        attempts++;
    }
    // Fill remaining
    while (itemsPlaced < count) {
        slots.push([c, r, 1, 1]);
        itemsPlaced++;
        c++;
        if (c >= cols) { c = 0; r++; }
    }
    return slots;
}

function generateP09Slots(count, seed) {
    const slots = [];
    const cols = 6;
    const used = {}; // Map "r,c" -> true

    function isOccupied(c, r, w, h) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (used[`${r + y},${c + x}`]) return true;
                if (c + x > cols) return true; // Fix boundary check
            }
        }
        return false;
    }

    function markOccupied(c, r, w, h) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                used[`${r + y},${c + x}`] = true;
            }
        }
    }

    let r = 0;
    let c = 0;
    let placed = 0;
    let currentSeed = seed;

    while (placed < count) {
        // Find next empty 1x1 spot
        while (isOccupied(c, r, 1, 1)) {
            c++;
            if (c >= cols) { c = 0; r++; }
        }

        // Decide size: Large (2x2) or Small (1x1)
        const isLarge = seededRandom(currentSeed++) > 0.7;

        if (isLarge && !isOccupied(c, r, 2, 2) && c + 2 <= cols) {
            slots.push([c, r, 2, 2]);
            markOccupied(c, r, 2, 2);
        } else {
            slots.push([c, r, 1, 1]);
            markOccupied(c, r, 1, 1);
        }
        placed++;
    }
    return slots;
}