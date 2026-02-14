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
    // 6: 8K — 4 колонки, 9 слотов (центральный герой 2×2)
    {
        columns: 4, slots: [
            [0, 1, 1, 1],   // 4 — левый средний
            [1, 0, 2, 2],   // 1 — большой центр
            [3, 1, 1, 1],   // 5 — правый средний
            [0, 2, 1, 1],   // 6 — левый нижний
            [3, 2, 1, 1],   // 7 — правый нижний
            [1, 2, 1, 1],   // 8 — под героем слева
            [2, 2, 1, 1],   // 9 — под героем справа
            [1, 0, 1, 1],   // 2 — над героем слева (скрыт под героем)
            [2, 0, 1, 1]    // 3 — над героем справа (скрыт под героем)
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
            [0, 0, 2, 2],   // 1 — герой верхний левый
            [2, 0, 1, 1],   // 2
            [3, 0, 1, 1],   // 3
            [4, 0, 2, 2],   // 4 — герой верхний правый
            [2, 1, 1, 1],   // 5 (под 2)
            [3, 1, 1, 1],   // 6 (под 3)
            [0, 2, 1, 1],   // 7 (под 1 слева)
            [1, 2, 1, 1],   // 8 (под 1 справа)
            [2, 2, 2, 2],   // 13 — герой центр
            [4, 2, 1, 1],   // 14 (под 4 слева)
            [5, 2, 1, 1],   // 15 (под 4 справа)
            [0, 3, 1, 1],   // 16
            [1, 3, 1, 1],   // 17
            [4, 3, 1, 1],   // 18
            [5, 3, 1, 1],   // 19
            [5, 0, 2, 2],   // 21 — герой правый край
            [0, 4, 2, 2],   // 22 — герой левый средний
            [2, 4, 1, 1],   // 23 (под 13 слева)
            [3, 4, 1, 1],   // 24 (под 13 справа)
            [4, 4, 2, 2],   // 27 — герой правый средний
            [2, 5, 1, 1],   // 25
            [3, 5, 1, 1],   // 26
            [0, 6, 1, 1],   // 28 (под 22 слева)
            [1, 6, 1, 1],   // 29 (под 22 справа)
            [4, 6, 1, 1],   // 30 (под 27 слева)
            [5, 6, 1, 1],   // 31 (под 27 справа)
            [0, 7, 1, 1],   // 32
            [1, 7, 1, 1],   // 33
            [2, 6, 2, 2],   // 34 — герой центр нижний
            [4, 7, 1, 1],   // 35
            [5, 7, 1, 1],   // 36
            [5, 4, 2, 2],   // 37 — герой правый нижний
            [0, 8, 1, 1],   // 38
            [1, 8, 1, 1],   // 39
            [2, 8, 1, 1],   // 40
            [3, 8, 1, 1]    // 41
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

    // Isometric layouts don't use column grid
    if (layout.isometric) {
        return;
    }

    CONFIG.columns = layout.columns;
    CONFIG.workWidth = CONFIG.canvasWidth - 2 * CONFIG.marginLeftRight;
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
    iconRandomizeType: 'position', // position | filename
    icons: { pngBlack: [], svgBlack: [], svgWhite: [] },
    // ISO background
    isoBg: null,
    isoBgType: 'gradient', // gradient | custom
    isoBgHistory: [],
    isoBgBlur: 20 // Lens blur radius (0-40)
};

function getIconsBaseUrl() {
    const base = document.baseURI || window.location.href;
    const candidates = ['../../assets/icons/', '/assets/icons/', '../assets/icons/'];
    for (const path of candidates) {
        try {
            const url = new URL(path, base).href;
            return url;
        } catch (_) { }
    }
    return '';
}

function loadIcons() {
    const base = getIconsBaseUrl();
    if (!base) {
        console.warn('Не удалось определить базовый путь к иконкам');
        return;
    }
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
                if (finished === pending) { done++; if (done === 3) render(); }
            };
            img.onerror = () => {
                pending--;
                finished++;
                if (finished >= pending + (MAX_ICONS - pending)) { done++; if (done === 3) render(); }
            };
            img.crossOrigin = 'anonymous';
            img.src = url;
        }
    });
    console.log('Загрузка иконок из', base);
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
    const maxWidth = Math.min(container.clientWidth - 40, CONFIG.canvasWidth);
    const scale = maxWidth / CONFIG.canvasWidth;

    canvas.style.width = `${maxWidth}px`;
    canvas.style.height = 'auto';
    canvas.style.aspectRatio = `${CONFIG.canvasWidth}/${getCanvasHeight()}`;
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

    bgInput.addEventListener('change', handleBgSelect);

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
    const iconRandomizeSelect = document.getElementById('iconRandomizeSelect');
    if (iconThemeSelect) { iconThemeSelect.value = state.iconTheme; iconThemeSelect.addEventListener('change', () => { state.iconTheme = iconThemeSelect.value; render(); }); }
    if (iconRandomizeSelect) { iconRandomizeSelect.value = state.iconRandomizeType; iconRandomizeSelect.addEventListener('change', () => { state.iconRandomizeType = iconRandomizeSelect.value; render(); }); }
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
        isoBgInput.addEventListener('change', handleIsoBgSelect);
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
            render();
        });
    }
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

function handleBgSelect(e) {
    const file = e.target.files[0];
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

                render();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ISO Background handler
function handleIsoBgSelect(e) {
    const file = e.target.files[0];
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

    const rows = layoutHeightRows(layout.slots);
    const singleH = getSingleHeight();
    // marginTop already includes intro + process heights via updateConfigForLayout
    const totalH = CONFIG.marginTop + rows * (singleH + CONFIG.rowGap) - CONFIG.rowGap + CONFIG.marginLeftRight;

    return totalH;
}

// Isometric layout functions
function calculateIsometricPositions(cardCount, layoutType) {
    const W = CONFIG.canvasWidth;
    const H = getCanvasHeight();
    const marginY = 40; // Top/bottom margins
    const marginX = 50; // Left/right margins (user requested 50px)

    // Card size: maintain aspect ratio
    const cardAspect = state.aspectRatio || 0.75;
    const cardWidth = 320;
    const cardHeight = cardWidth / cardAspect;

    const positions = [];

    if (layoutType === 'diagonal') {
        // ISO1: Diagonal from top-left to bottom-right, -15° rotation, less overlap
        const startX = marginX + cardWidth / 2;
        const startY = marginY + cardHeight / 2;
        const endX = W - marginX - cardWidth / 2;
        const endY = H - marginY - cardHeight / 2;

        // Increased spacing to reduce overlap
        const totalDistance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const minSpacing = cardWidth * 0.35; // Minimum card spacing (reduced overlap)
        const actualSpacing = Math.max(minSpacing, totalDistance / Math.max(1, cardCount - 1));

        const angle = Math.atan2(endY - startY, endX - startX);

        for (let i = 0; i < cardCount; i++) {
            positions.push({
                x: startX + Math.cos(angle) * actualSpacing * i,
                y: startY + Math.sin(angle) * actualSpacing * i,
                rotation: -15,
                width: cardWidth,
                height: cardHeight,
                zIndex: i
            });
        }
    } else if (layoutType === 'wave') {
        // ISO2: TRUE ISOMETRIC - cards placed on tilted table, perspective depth
        // View from above-right, cards laid out diagonally with depth scaling

        // Isometric angle (30° from horizontal for classic isometric)
        const isoAngle = Math.PI / 6; // 30 degrees
        const depthAngle = isoAngle + Math.PI / 2; // 120 degrees for depth axis

        // Layout cards in isometric grid with perspective
        const baseCardSize = 280;
        const spacing = baseCardSize * 1.2;

        // Calculate grid dimensions
        const gridCols = Math.ceil(Math.sqrt(cardCount * 1.3));
        const gridRows = Math.ceil(cardCount / gridCols);

        // Calculate grid bounds to center it properly
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        // First pass: calculate bounds
        for (let i = 0; i < cardCount; i++) {
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const isoX = col * spacing * Math.cos(isoAngle) + row * spacing * Math.cos(depthAngle);
            const isoY = col * spacing * Math.sin(isoAngle) + row * spacing * Math.sin(depthAngle);
            const perspectiveY = -row * 15;
            const depthFactor = row * 0.08;
            const scale = 1 - depthFactor;
            const cardW = baseCardSize * scale;
            const cardH = (baseCardSize / cardAspect) * scale;

            minX = Math.min(minX, isoX - cardW / 2);
            maxX = Math.max(maxX, isoX + cardW / 2);
            minY = Math.min(minY, isoY + perspectiveY - cardH / 2);
            maxY = Math.max(maxY, isoY + perspectiveY + cardH / 2);
        }

        // Center the composition
        const gridWidth = maxX - minX;
        const gridHeight = maxY - minY;
        const offsetX = (W - gridWidth) / 2 - minX;
        const offsetY = (H - gridHeight) / 2 - minY;

        // Second pass: position cards with centering offset
        for (let i = 0; i < cardCount; i++) {
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);

            // Isometric projection: convert grid (col, row) to screen (x, y)
            const isoX = col * spacing * Math.cos(isoAngle) + row * spacing * Math.cos(depthAngle);
            const isoY = col * spacing * Math.sin(isoAngle) + row * spacing * Math.sin(depthAngle);

            // Perspective: cards further back are smaller and higher
            const depthFactor = row * 0.08;
            const scale = 1 - depthFactor;
            const perspectiveY = -row * 15;

            positions.push({
                x: offsetX + isoX,
                y: offsetY + isoY + perspectiveY,
                rotation: -30, // Consistent isometric rotation
                width: baseCardSize * scale,
                height: (baseCardSize / cardAspect) * scale,
                zIndex: row * gridCols + col // Back to front rendering
            });
        }
    } else if (layoutType === 'stack') {
        // ISO3: Mirrored diagonal (top-right to bottom-left), +15° rotation, less overlap
        const startX = W - marginX - cardWidth / 2;
        const startY = marginY + cardHeight / 2;
        const endX = marginX + cardWidth / 2;
        const endY = H - marginY - cardHeight / 2;

        // Increased spacing to reduce overlap
        const totalDistance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const minSpacing = cardWidth * 0.35; // Minimum card spacing (reduced overlap)
        const actualSpacing = Math.max(minSpacing, totalDistance / Math.max(1, cardCount - 1));

        const angle = Math.atan2(endY - startY, endX - startX);

        for (let i = 0; i < cardCount; i++) {
            positions.push({
                x: startX + Math.cos(angle) * actualSpacing * i,
                y: startY + Math.sin(angle) * actualSpacing * i,
                rotation: 15,
                width: cardWidth,
                height: cardHeight,
                zIndex: i
            });
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

    // Render from back to front for proper overlap
    state.images.forEach((card, i) => {
        const pos = positions[i];

        use.save();
        use.translate(pos.x, pos.y);
        use.rotate(pos.rotation * Math.PI / 180);

        // Draw thickness/depth (8-12px)
        drawCardDepth(use, pos.width, pos.height);

        // Draw card with enhanced shadow
        drawIsometricCard(use, card.image, pos.width, pos.height);

        use.restore();
    });
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
        const sourceH = Math.min(bg.height - sourceY, height / scaleW);

        if (scaledHeight >= height) {
            use.drawImage(bg, 0, sourceY, bg.width, sourceH, 0, 0, W, height);
        } else {
            // If image is smaller than canvas, tile it vertically
            let y = 0;
            while (y < height) {
                const drawH = Math.min(scaledHeight, height - y);
                const sourceH = drawH / scaleW;
                use.drawImage(bg, 0, 0, bg.width, sourceH, 0, y, W, drawH);
                y += drawH;
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

function renderIconsOnCanvas(useCtx) {
    const use = useCtx || ctx;
    if (!state.iconsEnabled) return;
    const list = state.icons[state.iconTheme] || state.icons.pngBlack || [];
    if (list.length === 0) return;
    let arr = [...list];
    if (state.iconRandomizeType === 'filename') {
        arr = [...arr].sort(() => Math.random() - 0.5);
    }
    const introH = getIntroHeight();
    const processH = getProcessHeight();
    const totalTop = introH + processH;
    const sizes = [40, 80];
    const positions = [
        [0.05, 0.08], [0.92, 0.12], [0.08, 0.82], [0.9, 0.85],
        [0.12, 0.35], [0.85, 0.4], [0.1, 0.6], [0.88, 0.65],
        [0.5, 0.02], [0.5, 0.95]
    ];
    let idx = 0;
    for (let s = 0; s < 2 && idx < arr.length; s++) {
        const size = sizes[s];
        for (let p = 0; p < 5 && idx < arr.length; p++) {
            const pos = state.iconRandomizeType === 'position' ? positions[(idx + p) % positions.length] : positions[p % positions.length];
            const icon = arr[idx];
            const img = icon.image;
            if (img && img.complete && img.naturalWidth) {
                const x = (pos[0] * CONFIG.canvasWidth) - size / 2;
                const y = (pos[1] * totalTop) - size / 2;
                use.globalAlpha = 0.65;
                use.drawImage(img, Math.max(0, x), Math.max(0, y), size, size);
                use.globalAlpha = 1;
            }
            idx++;
        }
    }
}

function placeImage(img, x, y, w, h, isHero = false) {
    const pad = 20;
    const singleHeight = getSingleHeight();

    // Calculate aspect fit
    const imgAspect = img.width / img.height;
    const slotAspect = w / h;
    let drawW, drawH;

    const layoutIdx = getLayoutIndex();
    const isCover = layoutIdx >= 4;

    if (isCover) {
        // Cover (fill)
        if (imgAspect > slotAspect) {
            drawH = h;
            drawW = h * imgAspect;
        } else {
            drawW = w;
            drawH = w / imgAspect;
        }
    } else {
        // Contain (fit)
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

    // Тень: по предустановке
    const shadow = getShadowParams();
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${shadow.alpha})`;
    ctx.shadowBlur = isHero ? shadow.blur * 1.2 : shadow.blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = shadow.offsetY;
    ctx.fillStyle = `rgba(0,0,0,${shadow.alpha * 0.5})`;
    roundRect(ctx, offsetX + 2, offsetY + shadow.offsetY, drawW, drawH, 4);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();

    // Draw image with rounded corners
    ctx.save();
    roundRect(ctx, offsetX, offsetY, drawW, drawH, 4);
    ctx.clip();
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.restore();

    // Рамка карточки (без тени, чтобы не расплывалась)
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, offsetX, offsetY, drawW, drawH, 4);
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
    ctx.restore();

    // Inner frame (белая/чёрная, размер из настройки)
    const frameRgb = state.frameColor === 'black' ? '0, 0, 0' : '255, 255, 255';
    ctx.strokeStyle = `rgba(${frameRgb}, 0.9)`;
    ctx.lineWidth = state.frameSize;
    ctx.strokeRect(offsetX, offsetY, drawW, drawH);
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

function placeImageOnCtx(ctx, img, x, y, w, h, isHero = false) {
    const pad = 20;
    const imgAspect = img.width / img.height;
    const slotAspect = w / h;
    let drawW, drawH;

    // Check layout index from state or pass it?
    // Since placeImageOnCtx is used in exportAllLayouts where state.layoutChoice changes, 
    // we can rely on state.layoutChoice if it's updated correctly before call.
    // exportAllLayouts updates state.layoutChoice.
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

    // Тень: по предустановке
    const shadow = getShadowParams();
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${shadow.alpha})`;
    ctx.shadowBlur = isHero ? shadow.blur * 1.2 : shadow.blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = shadow.offsetY;
    ctx.fillStyle = `rgba(0, 0, 0, ${shadow.alpha * 0.5})`;
    roundRect(ctx, offsetX + 2, offsetY + shadow.offsetY, drawW, drawH, 4);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();

    ctx.save();
    roundRect(ctx, offsetX, offsetY, drawW, drawH, 4);
    ctx.clip();
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    roundRect(ctx, offsetX, offsetY, drawW, drawH, 4);
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
    ctx.restore();

    const frameRgb = state.frameColor === 'black' ? '0, 0, 0' : '255, 255, 255';
    ctx.strokeStyle = `rgba(${frameRgb}, 0.9)`;
    ctx.lineWidth = state.frameSize;
    ctx.strokeRect(offsetX, offsetY, drawW, drawH);
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
        iconRandomizeType: state.iconRandomizeType
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
                state.iconRandomizeType = projectData.iconRandomizeType ?? state.iconRandomizeType;
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

// Initial render
render();