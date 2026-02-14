/* ========================================
   Конфигурация и константы
   ======================================== */
const CONFIG = {
    // Базовый путь к папке с карточками
    cardsBasePath: 'Z:/!_STUFF/ALTAIR/КАРТОЧКИ/',
    
    // Пути к папкам для каждой группы (относительно cardsBasePath)
    cardsGroupFolders: [
        'z:\!_STUFF\ALTAIR\КАРТОЧКИ\КОННЕКТОР_910000101',
        'z:\!_STUFF\ALTAIR\КАРТОЧКИ\КОННЕКТОР_910000201',
        'z:\!_STUFF\ALTAIR\КАРТОЧКИ\КОННЕКТОР_910000304',
        'z:\!_STUFF\ALTAIR\КАРТОЧКИ\КОННЕКТОР_910001602',
    ],
    
    backgroundPath: '../assets/backgrounds/',
    defaultBackground: 'project-name-bg.jpg',
    projectName: 'project-name',
    
    // Список доступных фонов для рандомизации
    availableBackgrounds: [
        'project-name-bg.jpg',
        'project-name-bg-B.jpg',
        'BACK_TEXTURE_04.png',
        'BACK_TEXTURE_05.png',
        'BACK_TEXTURE_06.png',
        'BACK_TEXTURE_07.png',
        'BACK_TEXTURE_08.png',
        'BACK_TEXTURE_09.png',
        'BACK_TEXTURE_10.png',
        'BACK_TEXTURE_11.png',
        'BACK_TEXTURE_12.png',
        'BACK_TEXTURE_13.png',
        'BACK_TEXTURE_14.png',
        'BACK_TEXTURE_15.png'
    ],
    cardFormat: 'portrait',
    
    iconsPath: '../assets/icons/'
};

/* ========================================
   State Management
   ======================================== */
const state = {
    cards: [],
    groups: [],
    draggedCard: null,
    dropTarget: null,
    backgroundSegments: [],
    backgroundHeight: 0,
    currentSegmentIndex: 0,
    icons: [],
    projectId: null,
    projectName: CONFIG.projectName,
    cardSettings: {
        borderWidth: 2,
        borderColor: '#cccccc',
        shadowEnabled: true,
        shadowPreset: 'medium',
    },
    backgroundSettings: {
        type: 'image',
        imagePath: null,
        color: '#000000',
        gradient: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
        repeat: 'no-repeat',
        position: 'center',
        size: 'cover',
        mirror: false,
    },
    iconSettings: {
        lightThemeGroup: 'SVG_BLACK',
        darkThemeGroup: 'SVG_WHITE',
        randomized: false,
        randomizeType: 'position',
    },
    featuredCards: [],
    processImage: null,
    processImages: [],
};

/* ========================================
   Инициализация
   ======================================== */
const init = async () => {
    console.log('🚀 Инициализация шаблона портфолио...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const projectParam = urlParams.get('project');
    
    let projectLoaded = false;
    
    if (projectParam === 'new') {
        state.projectId = 'project-' + Date.now();
        state.projectName = 'Новый проект';
    } else if (projectParam) {
        projectLoaded = loadProject(projectParam);
    } else {
        state.projectId = CONFIG.projectName;
    }
    
    await loadIcons();
    await loadBackground();
    
    // Загружаем карточки только если проект не был загружен из localStorage
    // или если в загруженном проекте нет групп
    if (!projectLoaded || state.groups.length === 0) {
        await loadCards();
    } else {
        // Если проект загружен, просто рендерим группы
        renderAllGroups();
    }
    
    await loadProcessImages();
    setupIcons();
    setupEventListeners();
    enableDevMode();
    setupControls();
    applyCardSettings();
    renderMarketplaceCards();
    
    console.log('✅ Инициализация завершена');
};

/* ========================================
   Загрузка фона с чередованием А и Б
   ======================================== */
const loadBackground = async () => {
    const container = document.getElementById('background-container');
    if (!container) {
        console.warn('⚠️ Контейнер для фона не найден');
        return;
    }
    
    container.innerHTML = '';
    state.backgroundSegments = [];
    
    if (state.backgroundSettings.type === 'color') {
        document.body.style.background = state.backgroundSettings.color;
        container.style.display = 'none';
        return;
    }
    
    if (state.backgroundSettings.type === 'gradient') {
        document.body.style.background = state.backgroundSettings.gradient;
        container.style.display = 'none';
        return;
    }
    
    document.body.style.background = '';
    container.style.display = 'block';
    
    if (state.backgroundSettings.imagePath) {
        try {
            await loadBackgroundSegment(state.backgroundSettings.imagePath, true);
            await loadBackgroundSegmentMirrored(state.backgroundSettings.imagePath);
        } catch (error) {
            console.error('❌ Ошибка загрузки пользовательского фона, пробуем дефолтный', error);
            const defaultBg = `${CONFIG.backgroundPath}${CONFIG.defaultBackground}`;
            try {
                await loadBackgroundSegment(defaultBg, true);
                await loadBackgroundSegmentMirrored(defaultBg);
            } catch (e) {
                console.error('❌ Не удалось загрузить дефолтный фон', e);
            }
        }
    } else {
            const bgPath = CONFIG.backgroundPath;
            const bgName = CONFIG.projectName;
            
            if (!bgName || bgName === 'project-name') {
                console.log('📋 Используем дефолтный фон: project-name-bg.jpg');
                const defaultBg = `${bgPath}project-name-bg.jpg`;
                try {
                    await loadBackgroundSegment(defaultBg, true);
                    await loadBackgroundSegmentMirrored(defaultBg);
                } catch (error) {
                    console.error('❌ Не удалось загрузить дефолтный фон', error);
                }
            } else {
                const bgA = `${bgPath}${bgName}-bg.jpg`;
                const bgB = `${bgPath}${bgName}-bg-B.jpg`;
                
                try {
                    await loadBackgroundSegment(bgA, true);
                } catch (error) {
                    console.error(`❌ Не удалось загрузить ${bgA}, пробуем дефолтный`, error);
                    const defaultBg = `${bgPath}project-name-bg.jpg`;
                    try {
                        await loadBackgroundSegment(defaultBg, true);
                        await loadBackgroundSegmentMirrored(defaultBg);
                    } catch (e) {
                        console.error('❌ Не удалось загрузить дефолтный фон', e);
                    }
                    return;
                }
                
                try {
                    const bgBExists = await checkFileExists(bgB);
                    if (bgBExists) {
                        await loadBackgroundSegment(bgB, false);
                    } else {
                        await loadBackgroundSegmentMirrored(bgA);
                    }
                } catch (error) {
                    console.warn(`⚠️ Не удалось проверить/загрузить второй сегмент, дублируем первый с зеркалированием`, error);
                    try {
                        await loadBackgroundSegmentMirrored(bgA);
                    } catch (e) {
                        console.error('❌ Не удалось загрузить дубликат фона', e);
                    }
                }
            }
        }
    
    setupBackgroundScrollListener();
};

const loadBackgroundSegment = (imagePath, isA) => {
    return new Promise((resolve, reject) => {
        const container = document.getElementById('background-container');
        if (!container) {
            console.error('❌ Контейнер для фона не найден');
            reject(new Error('Контейнер для фона не найден'));
            return;
        }
        
        console.log(`🖼️ Загрузка фона: ${imagePath}`);
        
        const segment = document.createElement('div');
        segment.className = 'background-segment';
        segment.dataset.isA = isA;
        
        const img = new Image();
        img.onload = () => {
            console.log(`✅ Фон загружен: ${imagePath}, размер: ${img.width}x${img.height}`);
            
            const segmentHeight = img.height;
            
            segment.style.backgroundImage = `url(${imagePath})`;
            segment.style.backgroundSize = '1440px auto';
            segment.style.backgroundPosition = 'center top';
            segment.style.backgroundRepeat = 'no-repeat';
            segment.style.width = '1440px';
            segment.style.height = `${segmentHeight}px`;
            segment.style.margin = '0 auto';
            segment.style.display = 'block';
            segment.style.position = 'relative';
            segment.style.left = '0';
            
            container.appendChild(segment);
            
            state.backgroundSegments.push({
                element: segment,
                height: segmentHeight,
                isA: isA,
                imagePath: imagePath
            });
            
            updateBackgroundHeight();
            resolve();
        };
        
        img.onerror = (error) => {
            console.error(`❌ Ошибка загрузки фона: ${imagePath}`, error);
            reject(new Error(`Не удалось загрузить фон: ${imagePath}`));
        };
        
        img.src = imagePath;
    });
};

const loadBackgroundSegmentMirrored = (imagePath) => {
    return loadBackgroundSegment(imagePath, false);
};

const updateBackgroundHeight = () => {
    state.backgroundHeight = state.backgroundSegments.reduce((sum, seg) => sum + seg.height, 0);
    const container = document.getElementById('background-container');
    if (container) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        container.style.height = `${state.backgroundHeight}px`;
        container.style.left = '50%';
        container.style.transform = `translateX(-50%) translateY(${scrollTop * 0.5}px)`;
        container.style.width = '1440px';
    }
};

const setupBackgroundScrollListener = () => {
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const container = document.getElementById('background-container');
        if (container) {
            container.style.transform = `translateX(-50%) translateY(${scrollTop * 0.5}px)`;
            lastScrollTop = scrollTop;
        }
    });
};

const randomizeBackground = async () => {
    const bgPath = CONFIG.backgroundPath;
    const backgrounds = CONFIG.availableBackgrounds.length > 0 
        ? CONFIG.availableBackgrounds 
        : ['default-bg.jpg'];
    
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    state.backgroundSettings.type = 'image';
    state.backgroundSettings.imagePath = `${bgPath}${randomBg}`;
    CONFIG.projectName = randomBg.replace('-bg.jpg', '').replace('.jpg', '');
    await loadBackground();
    saveProject();
};

const updateBackgroundSettings = async (settings) => {
    Object.assign(state.backgroundSettings, settings);
    await applyBackgroundSettings();
    saveProject();
};

const applyBackgroundSettings = async () => {
    const body = document.body;
    const container = document.getElementById('background-container');
    
    if (state.backgroundSettings.type === 'color') {
        body.style.background = state.backgroundSettings.color;
        if (container) container.style.display = 'none';
    } else if (state.backgroundSettings.type === 'gradient') {
        body.style.background = state.backgroundSettings.gradient;
        if (container) container.style.display = 'none';
    } else {
        body.style.background = '';
        if (container) container.style.display = 'block';
        await loadBackground();
    }
};

/* ========================================
   Загрузка иконок
   ======================================== */
const loadIcons = async () => {
    const iconsPath = CONFIG.iconsPath;
    state.icons = {
        pngBlack: [],
        svgBlack: [],
        svgWhite: []
    };
    
    const loadIconGroup = async (folder, key) => {
        const folderPath = `${iconsPath}${folder}/`;
        let count = 0;
        
        for (let i = 0; i < 100; i++) {
            const num = i.toString().padStart(2, '0');
            let iconPath;
            
            if (folder === 'PNG_BLACK') {
                iconPath = `${folderPath}ICON_BLACK_0${num}.png`;
            } else if (folder === 'SVG_BLACK') {
                iconPath = `${folderPath}ICON_SVG_BLACK_0${num}.svg`;
            } else if (folder === 'SVG_WHITE') {
                iconPath = `${folderPath}ICON_SVG_WHITE_0${num}.svg`;
            }
            
            if (await checkFileExists(iconPath)) {
                state.icons[key].push({
                    src: iconPath,
                    folder: folder
                });
                count++;
            } else if (i > 20) {
                break;
            }
        }
    };
    
    await loadIconGroup('PNG_BLACK', 'pngBlack');
    await loadIconGroup('SVG_BLACK', 'svgBlack');
    await loadIconGroup('SVG_WHITE', 'svgWhite');
    
    console.log(`✅ Загружено иконок: PNG_BLACK=${state.icons.pngBlack.length}, SVG_BLACK=${state.icons.svgBlack.length}, SVG_WHITE=${state.icons.svgWhite.length}`);
};

/* ========================================
   Размещение иконок группами в макете
   ======================================== */
const setupIcons = () => {
    if (!state.icons || (!state.icons.pngBlack && !state.icons.svgBlack && !state.icons.svgWhite)) {
        console.warn('⚠️ Нет доступных иконок для размещения');
        return;
    }
    
    document.querySelectorAll('.decorative-icons').forEach(container => {
        container.innerHTML = '';
    });
    
    const lightThemeIcons = state.icons.svgBlack || [];
    const darkThemeIcons = state.icons.svgWhite || [];
    const alwaysIcons = state.icons.pngBlack || [];
    
    let availableIcons = [...alwaysIcons];
    
    const useLightTheme = state.iconSettings.lightThemeGroup === 'SVG_BLACK';
    if (useLightTheme) {
        availableIcons = [...availableIcons, ...lightThemeIcons];
    } else {
        availableIcons = [...availableIcons, ...darkThemeIcons];
    }
    
    if (state.iconSettings.randomized && state.iconSettings.randomizeType === 'filename') {
        availableIcons = [...availableIcons].sort(() => Math.random() - 0.5);
    }
    
    const iconGroups = [
        { count: 3, size: 40, section: 'intro' },
        { count: 5, size: 80, section: 'intro' },
        { count: 7, size: 40, section: 'process' },
        { count: 4, size: 80, section: 'process' },
        { count: 9, size: 40, section: 'footer' },
        { count: 6, size: 80, section: 'footer' }
    ];
    
    let iconIndex = 0;
    
    iconGroups.forEach((group, groupIndex) => {
        const section = document.querySelector(`.section--${group.section}`);
        if (!section) return;
        
        let iconsContainer = section.querySelector('.decorative-icons');
        if (!iconsContainer) {
            iconsContainer = document.createElement('div');
            iconsContainer.className = 'decorative-icons';
            const container = section.querySelector('.section__container');
            if (container) {
                container.appendChild(iconsContainer);
            } else {
                section.appendChild(iconsContainer);
            }
        }
        
        let actualCount = group.count;
        if (group.count === 5) {
            actualCount = 5 + Math.floor(Math.random() * 3);
        } else if (group.count === 4) {
            actualCount = 4 + Math.floor(Math.random() * 6);
        }
        
        const sectionRect = section.getBoundingClientRect();
        const textBlocks = section.querySelectorAll('h1, h2, h3, .intro__title, .intro__text, .section__title, .process-block, .process-block__title, .process-block__text, .contacts, .contacts__title, .contacts__info, p[contenteditable="true"]');
        const textBlockRects = Array.from(textBlocks).map(block => {
            const rect = block.getBoundingClientRect();
            return {
                top: rect.top - sectionRect.top,
                left: rect.left - sectionRect.left,
                bottom: rect.bottom - sectionRect.top,
                right: rect.right - sectionRect.left,
                width: rect.width,
                height: rect.height
            };
        });
        
        const iconPadding = 40; // Увеличен отступ для предотвращения налезания на текст
        const iconSize = group.size;
        
        const isPositionValid = (topPercent, leftPercent) => {
            const containerWidth = sectionRect.width;
            const containerHeight = sectionRect.height;
            const iconTop = (topPercent / 100) * containerHeight;
            const iconLeft = (leftPercent / 100) * containerWidth;
            const iconRight = iconLeft + iconSize;
            const iconBottom = iconTop + iconSize;
            
            for (const textRect of textBlockRects) {
                const textTop = textRect.top - iconPadding;
                const textLeft = textRect.left - iconPadding;
                const textBottom = textRect.bottom + iconPadding;
                const textRight = textRect.right + iconPadding;
                
                if (!(iconRight < textLeft || iconLeft > textRight || iconBottom < textTop || iconTop > textBottom)) {
                    return false;
                }
            }
            return true;
        };
        
        for (let i = 0; i < actualCount && iconIndex < availableIcons.length; i++) {
            const icon = availableIcons[iconIndex % availableIcons.length];
            iconIndex++;
            
            const iconElement = document.createElement('img');
            iconElement.src = icon.src;
            iconElement.alt = '';
            iconElement.className = `icon icon--group-${groupIndex}-${i}`;
            iconElement.style.width = `${group.size}px`;
            iconElement.style.height = `${group.size}px`;
            iconElement.style.background = 'none';
            iconElement.style.border = 'none';
            iconElement.style.padding = '0';
            iconElement.style.margin = '0';
            iconElement.setAttribute('aria-hidden', 'true');
            
            let top, left;
            let attempts = 0;
            const maxAttempts = 100;
            
            do {
                if (state.iconSettings.randomized && state.iconSettings.randomizeType === 'position') {
                    const side = Math.random();
                    
                    if (side < 0.25) {
                        top = Math.random() * 100;
                        left = Math.random() * 8;
                    } else if (side < 0.5) {
                        top = Math.random() * 100;
                        left = 92 + Math.random() * 8;
                    } else if (side < 0.75) {
                        top = Math.random() * 15;
                        left = Math.random() * 100;
                    } else {
                        top = 85 + Math.random() * 15;
                        left = Math.random() * 100;
                    }
                } else {
                    const side = (iconIndex + i) % 4;
                    if (side === 0) {
                        top = (i * 15) % 100;
                        left = 5;
                    } else if (side === 1) {
                        top = (i * 20) % 100;
                        left = 95;
                    } else if (side === 2) {
                        top = 10;
                        left = (i * 20) % 100;
                    } else {
                        top = 90;
                        left = (i * 25) % 100;
                    }
                }
                attempts++;
            } while (!isPositionValid(top, left) && attempts < maxAttempts);
            
            iconElement.style.position = 'absolute';
            iconElement.style.top = `${top}%`;
            iconElement.style.left = `${left}%`;
            iconElement.style.opacity = '1';
            
            iconsContainer.appendChild(iconElement);
        }
    });
    
    console.log('✅ Иконки размещены группами в макете');
};

/* ========================================
   Загрузка изображений процесса
   ======================================== */
const loadProcessImages = async () => {
    const processImagesPath = '../SHABLON_BEHANCE_1440/PROCESS_Images/';
    state.processImages = [];
    
    console.log('📁 Загрузка изображений процесса из:', processImagesPath);
    
    if (state.processImage) {
        const img = document.getElementById('process-image');
        if (img) {
            img.src = state.processImage;
        }
    }
};

/* ========================================
   Загрузка карточек из папок
   ======================================== */
const loadCards = async () => {
    console.log('📦 Начинаю загрузку карточек из папок...');
    
    for (let groupIndex = 0; groupIndex < CONFIG.cardsGroupFolders.length; groupIndex++) {
        const folderName = CONFIG.cardsGroupFolders[groupIndex];
        
        let folderPath;
        const normalizedFolder = folderName.replace(/\\/g, '/');
        
        if (normalizedFolder.match(/^[A-Za-z]:/)) {
            let cleanPath = normalizedFolder;
            if (cleanPath.match(/^[A-Za-z]:[^\/]/)) {
                cleanPath = cleanPath.replace(/^([A-Za-z]:)/, '$1/');
            }
            folderPath = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
        } else {
            folderPath = `${CONFIG.cardsBasePath}${folderName}/`;
        }
        
        folderPath = convertToFileUrl(folderPath);
        
        console.log(`📁 Загрузка группы ${groupIndex + 1} из папки: ${folderPath}`);
        
        try {
            const groupCards = await loadCardsFromFolder(folderPath, groupIndex + 1);
            
            if (groupCards.length === 0) {
                console.warn(`⚠️ В папке ${folderPath} не найдено карточек`);
                continue;
            }
            
            const firstCard = findFirstCard(groupCards);
            const largeCards = determineLargeCards(groupCards, firstCard);
            
            const cardsWithMetadata = groupCards.map((card, index) => ({
                ...card,
                isFirst: card === firstCard,
                isLarge: largeCards.includes(card),
                groupId: groupIndex + 1,
                positionInGroup: index,
                isEmpty: false
            }));
            
            state.groups.push({
                id: groupIndex + 1,
                cards: cardsWithMetadata,
                format: CONFIG.cardFormat,
                name: `Группа ${groupIndex + 1}`
            });
            
            console.log(`✅ Группа ${groupIndex + 1}: загружено ${groupCards.length} карточек`);
        } catch (error) {
            console.error(`❌ Ошибка загрузки группы ${groupIndex + 1}:`, error);
        }
    }
    
    renderAllGroups();
};

const loadCardsFromFolder = async (folderPath, groupId) => {
    const cards = [];
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    // folderPath уже конвертирован в file:// URL, но для проверки нужен обычный путь
    const normalPath = folderPath.replace(/^file:\/\/\//, '').replace(/^([A-Za-z]):/, '$1:');
    
    for (let i = 1; i <= 100; i++) {
        const num = i.toString().padStart(3, '0');
        for (const ext of extensions) {
            const variants = [
                `${normalPath}${num}${ext}`,
                `${normalPath}_${num}_${ext}`,
                `${normalPath}${groupId}_${num}${ext}`,
                `${normalPath}${num}_${ext}`
            ];
            
            for (const path of variants) {
                const fileUrl = convertToFileUrl(path);
                if (await checkFileExists(fileUrl)) {
                    cards.push({
                        id: `${groupId}-${cards.length + 1}`,
                        src: fileUrl,
                        alt: `Card ${groupId}-${cards.length + 1}`,
                        groupId: groupId
                    });
                    break;
                }
            }
            if (cards.length > 0 && cards[cards.length - 1].src.includes(num)) break;
        }
    }
    
    return cards;
};

const findFirstCard = (cards) => {
    const with01 = cards.filter(c => c.src.includes('_01_'));
    const withSht = with01.filter(c => c.src.includes('_sht'));
    if (withSht.length > 0) return withSht[0];
    if (with01.length > 0) return with01[0];
    return cards[0];
};

const determineLargeCards = (cards, firstCard) => {
    const largeCards = [];
    const withoutFirst = cards.filter(c => c !== firstCard);
    const shuffled = [...withoutFirst].sort(() => Math.random() - 0.5);
    const largeCardsCount = cards.length > 11 ? 2 : 1;
    
    for (let i = 0; i < largeCardsCount && i < shuffled.length; i++) {
        largeCards.push(shuffled[i]);
    }
    
    return largeCards;
};

const convertToFileUrl = (path) => {
    // Убираем file:/// если уже есть
    let cleanPath = path.replace(/^file:\/\/\//, '');
    // Заменяем обратные слеши на прямые
    cleanPath = cleanPath.replace(/\\/g, '/');
    // Конвертируем Windows путь в file:// URL
    cleanPath = cleanPath.replace(/^([A-Za-z]):/, 'file:///$1:');
    return cleanPath;
};

const checkFileExists = async (path) => {
    return new Promise((resolve) => {
        const img = new Image();
        let resolved = false;
        
        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                resolve(false);
            }
        }, 2000); // Таймаут 2 секунды
        
        img.onload = () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve(true);
            }
        };
        
        img.onerror = () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve(false);
            }
        };
        
        img.src = path;
    });
};

/* ========================================
   Рендеринг всех групп
   ======================================== */
const renderAllGroups = () => {
    const container = document.getElementById('gallery-groups-container');
    if (!container) {
        console.warn('⚠️ Контейнер для групп не найден');
        return;
    }
    
    container.innerHTML = '';
    
    state.groups.forEach((group, index) => {
        if (index > 0) {
            const iconsGroup = createIconsGroup();
            container.appendChild(iconsGroup);
        }
        
        const groupContainer = document.createElement('div');
        groupContainer.className = 'gallery-grid';
        groupContainer.dataset.groupId = group.id;
        groupContainer.dataset.groupFormat = group.format || CONFIG.cardFormat;
        
        const header = document.createElement('div');
        header.className = 'gallery-grid__header';
        const groupName = group.name || `Группа ${group.id}`;
        header.innerHTML = `
            <input type="text" class="gallery-grid__title-input" value="${groupName}" 
                   onchange="updateGroupName(${group.id}, this.value)" 
                   placeholder="Название группы">
            <button class="group-edit-btn" onclick="handleEditGroup(${group.id})">Редактировать</button>
        `;
        
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'gallery-grid__cards';
        
        groupContainer.appendChild(header);
        groupContainer.appendChild(cardsContainer);
        container.appendChild(groupContainer);
        
        renderGroup(group);
    });
    
    renderFeaturedCards();
    renderMarketplaceCards();
};

/* ========================================
   Рендеринг одной группы
   ======================================== */
const renderGroup = (group) => {
    const galleryGrid = document.querySelector(`.gallery-grid[data-group-id="${group.id}"]`);
    
    if (!galleryGrid) {
        console.warn(`⚠️ Контейнер для группы ${group.id} не найден`);
        return;
    }
    
    const cardsContainer = galleryGrid.querySelector('.gallery-grid__cards');
    if (!cardsContainer) {
        console.warn(`⚠️ Контейнер для карточек группы ${group.id} не найден`);
        return;
    }
    
    cardsContainer.innerHTML = '';
    
    const sortedCards = [...group.cards].sort((a, b) => {
        const posA = a.positionInGroup !== undefined ? a.positionInGroup : 999;
        const posB = b.positionInGroup !== undefined ? b.positionInGroup : 999;
        return posA - posB;
    });
    
    let firstCardFound = false;
    let rightSideIndex = 0;
    
    sortedCards.forEach((card, index) => {
        if (card.isEmpty) {
            const emptyBlock = document.createElement('div');
            let classes = `card card--empty ${card.isLarge ? 'card--first' : ''} ${group.format === 'square' ? 'card--square' : 'card--portrait'}`;
            
            if (card.isLarge || card.isFirst) {
                firstCardFound = true;
                rightSideIndex = 0;
            } else if (firstCardFound && rightSideIndex < 4) {
                // Пустые блоки тоже могут быть справа
                classes += ' card--right-side';
                emptyBlock.dataset.rightPosition = rightSideIndex + 1;
                rightSideIndex++;
            }
            
            emptyBlock.className = classes;
            emptyBlock.dataset.cardId = card.id;
            emptyBlock.dataset.groupId = card.groupId;
            emptyBlock.dataset.position = card.positionInGroup;
            cardsContainer.appendChild(emptyBlock);
        } else {
            const cardElement = createCardElement(card, group.format || CONFIG.cardFormat);
            
            // Если это первая большая карточка, отмечаем её
            if (card.isFirst || card.isLarge) {
                firstCardFound = true;
                rightSideIndex = 0;
            } else if (firstCardFound && rightSideIndex < 4) {
                // Следующие 4 карточки после большой размещаем справа
                cardElement.classList.add('card--right-side');
                cardElement.dataset.rightPosition = rightSideIndex + 1;
                rightSideIndex++;
            }
            
            cardsContainer.appendChild(cardElement);
        }
    });
    
    applyCardSettings();
};

/* ========================================
   Создание группы иконок между группами
   ======================================== */
const createIconsGroup = () => {
    const iconsGroup = document.createElement('div');
    iconsGroup.className = 'icons-group';
    
    if (state.icons.length > 0) {
        const shuffledIcons = [...state.icons].sort(() => Math.random() - 0.5);
        const iconsCount = 3 + Math.floor(Math.random() * 5);
        const selectedIcons = shuffledIcons.slice(0, Math.min(iconsCount, state.icons.length));
        
        selectedIcons.forEach(icon => {
            const iconElement = document.createElement('img');
            iconElement.src = icon.src;
            iconElement.alt = '';
            iconElement.className = 'icons-group__icon';
            iconElement.style.width = Math.random() > 0.5 ? '40px' : '80px';
            iconElement.style.height = iconElement.style.width;
            iconElement.setAttribute('aria-hidden', 'true');
            iconsGroup.appendChild(iconElement);
        });
    }
    
    return iconsGroup;
};

/* ========================================
   Создание элемента карточки
   ======================================== */
const createCardElement = (cardData, cardFormat = null) => {
    const card = document.createElement('article');
    const format = cardFormat || cardData.format || CONFIG.cardFormat;
    const formatClass = format === 'square' ? 'card--square' : 'card--portrait';
    
    let sizeClass = '';
    if (cardData.isFirst || cardData.isLarge) {
        sizeClass = 'card--first';
    }
    
    card.className = `card ${formatClass} ${sizeClass}`;
    card.dataset.cardId = cardData.id;
    card.dataset.groupId = cardData.groupId;
    card.dataset.position = cardData.positionInGroup;
    card.draggable = !cardData.isEmpty;
    
    const sizeToggleClass = (cardData.isFirst || cardData.isLarge) ? 'card__size-toggle--large' : 'card__size-toggle--normal';
    const sizeToggleTitle = (cardData.isFirst || cardData.isLarge) ? 'Уменьшить до 1 колонки' : 'Увеличить до 2 колонок';
    
    card.innerHTML = `
        <img src="${cardData.src}" alt="${cardData.alt}" class="card__img" 
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22%3E%3Crect fill=%22%23333%22 width=%22300%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-family=%22Arial%22 font-size=%2220%22%3EКарточка ${cardData.id}%3C/text%3E%3C/svg%3E'">
        <button class="card__size-toggle ${sizeToggleClass}" 
                onclick="handleToggleCardSize('${cardData.id}', ${cardData.groupId})" 
                title="${sizeToggleTitle}"></button>
        <div class="card__controls">
            <button class="card__btn card__btn--first" onclick="handleToggleFirst(${cardData.id}, ${cardData.groupId})" 
                    title="Сделать первой в группе">★</button>
            <button class="card__btn card__btn--swap" onclick="handleSwapMode(${cardData.id})" 
                    title="Поменять местами">⇄</button>
        </div>
    `;
    
    card.addEventListener('dragstart', (e) => {
        state.draggedCard = card;
        card.classList.add('card--dragging');
        e.dataTransfer.effectAllowed = 'move';
    });
    
    card.addEventListener('dragend', (e) => {
        card.classList.remove('card--dragging');
        document.querySelectorAll('.card--drop-target').forEach(c => {
            c.classList.remove('card--drop-target');
        });
        state.draggedCard = null;
    });
    
    card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (state.draggedCard && state.draggedCard !== card && 
            state.draggedCard.dataset.groupId === card.dataset.groupId) {
            card.classList.add('card--drop-target');
        }
    });
    
    card.addEventListener('dragleave', (e) => {
        card.classList.remove('card--drop-target');
    });
    
    card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('card--drop-target');
        
        if (state.draggedCard && state.draggedCard !== card && 
            state.draggedCard.dataset.groupId === card.dataset.groupId) {
            swapCards(state.draggedCard, card);
        }
    });
    
    return card;
};

const swapCards = (card1, card2) => {
    const groupId = parseInt(card1.dataset.groupId);
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const card1Data = group.cards.find(c => c.id === card1.dataset.cardId);
    const card2Data = group.cards.find(c => c.id === card2.dataset.cardId);
    
    if (!card1Data || !card2Data) return;
    
    const tempPos = card1Data.positionInGroup;
    card1Data.positionInGroup = card2Data.positionInGroup;
    card2Data.positionInGroup = tempPos;
    
    renderGroup(group);
    saveProject();
};

/* ========================================
   Рендеринг карточек в подвале
   ======================================== */
const renderFooterCards = () => {
    const footerGrid = document.getElementById('footer-cards-grid');
    
    if (!footerGrid) return;
    
    footerGrid.innerHTML = '';
    
    state.groups.slice(0, 4).forEach(group => {
        if (group.cards.length > 0) {
            const firstCard = group.cards[0];
            const cardElement = createCardElement({
                ...firstCard,
                isFirst: false
            });
            
            cardElement.draggable = false;
            const controls = cardElement.querySelector('.card__controls');
            if (controls) {
                controls.remove();
            }
            
            footerGrid.appendChild(cardElement);
        }
    });
    
    console.log(`👣 Подвал: отображено ${Math.min(4, state.groups.length)} карточек`);
};

/* ========================================
   Рендеринг секции главных фото в первом разделе
   ======================================== */
const renderFeaturedCards = () => {
    const introOverview = document.querySelector('.intro__overview');
    if (!introOverview) return;
    
    const featuredCardsList = [];
    state.groups.forEach(group => {
        const mainCard = group.cards.find(c => c.isFirst);
        if (mainCard) {
            featuredCardsList.push({
                ...mainCard,
                groupId: group.id
            });
        }
    });
    
    state.featuredCards.forEach(cardKey => {
        const [groupId, cardId] = cardKey.split('-');
        const group = state.groups.find(g => g.id === parseInt(groupId));
        if (group) {
            const card = group.cards.find(c => c.id === cardId);
            if (card && !featuredCardsList.find(fc => fc.id === card.id && fc.groupId === group.id)) {
                featuredCardsList.push({
                    ...card,
                    groupId: group.id
                });
            }
        }
    });
    
    const cardsToShow = featuredCardsList.slice(0, 4);
    
    let featuredContainer = introOverview.querySelector('.featured-cards');
    if (!featuredContainer) {
        featuredContainer = document.createElement('div');
        featuredContainer.className = 'featured-cards';
        introOverview.innerHTML = '';
        introOverview.appendChild(featuredContainer);
    }
    
    featuredContainer.innerHTML = '';
    
    if (cardsToShow.length === 0) {
        return;
    }
    
    cardsToShow.forEach(cardData => {
        const group = state.groups.find(g => g.id === cardData.groupId);
        const cardFormat = group ? (group.format || CONFIG.cardFormat) : CONFIG.cardFormat;
        
        const cardElement = document.createElement('figure');
        cardElement.className = `featured-card ${cardFormat === 'square' ? 'featured-card--square' : 'featured-card--portrait'}`;
        cardElement.innerHTML = `<img src="${cardData.src}" alt="${cardData.alt}" class="featured-card__img">`;
        featuredContainer.appendChild(cardElement);
    });
};

/* ========================================
   Рендеринг карточек на скриншоте маркетплейса
   ======================================== */
const renderMarketplaceCards = () => {
    const overlay = document.getElementById('marketplace-cards-overlay');
    if (!overlay) return;
    
    overlay.innerHTML = '';
    
    const cardsToShow = [];
    state.groups.slice(0, 4).forEach((group, index) => {
        if (group.cards.length > 0) {
            const firstCard = group.cards.find(c => c.isFirst) || group.cards[0];
            cardsToShow.push({
                ...firstCard,
                groupFormat: group.format || CONFIG.cardFormat,
                groupIndex: index
            });
        }
    });
    
    if (cardsToShow.length === 0) return;
    
    const cardWidth = 255;
    const cardHeight = 335;
    const cardGap = 11.5;
    const leftOffset = 304;
    const rightOffset = 82;
    const containerWidth = 1440;
    const totalCardsWidth = (cardWidth * 4) + (cardGap * 3);
    const availableWidth = containerWidth - leftOffset - rightOffset;
    
    const savedPositions = JSON.parse(localStorage.getItem('marketplaceCardsPositions') || '{}');
    
    cardsToShow.forEach((cardData, index) => {
        if (index >= 4) return;
        
        const cardElement = document.createElement('div');
        cardElement.className = 'marketplace-card';
        cardElement.dataset.cardIndex = index;
        cardElement.style.position = 'absolute';
        
        const savedPos = savedPositions[index] || { x: leftOffset + index * (cardWidth + cardGap), y: 0 };
        cardElement.style.left = `${savedPos.x}px`;
        cardElement.style.top = `${savedPos.y}px`;
        cardElement.style.width = `${cardWidth}px`;
        cardElement.style.height = `${cardHeight}px`;
        cardElement.style.cursor = 'move';
        cardElement.style.border = '2px solid transparent';
        cardElement.style.transition = 'border-color 0.2s';
        
        const isSquare = cardData.groupFormat === 'square';
        if (isSquare) {
            cardElement.style.display = 'flex';
            cardElement.style.alignItems = 'center';
            cardElement.style.justifyContent = 'center';
        }
        
        const img = document.createElement('img');
        img.src = cardData.src;
        img.alt = cardData.alt || '';
        img.style.width = isSquare ? '255px' : '100%';
        img.style.height = isSquare ? '255px' : '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        img.style.pointerEvents = 'none';
        
        cardElement.appendChild(img);
        
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;
        
        cardElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            cardElement.style.borderColor = 'rgba(255, 255, 255, 0.8)';
            cardElement.style.zIndex = '10';
            startX = e.clientX;
            startY = e.clientY;
            initialX = savedPos.x;
            initialY = savedPos.y;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            const newX = initialX + deltaX;
            const newY = initialY + deltaY;
            
            cardElement.style.left = `${newX}px`;
            cardElement.style.top = `${newY}px`;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                cardElement.style.borderColor = 'transparent';
                cardElement.style.zIndex = '2';
                
                const rect = cardElement.getBoundingClientRect();
                const overlayRect = overlay.getBoundingClientRect();
                const newPos = {
                    x: rect.left - overlayRect.left,
                    y: rect.top - overlayRect.top
                };
                
                savedPositions[index] = newPos;
                localStorage.setItem('marketplaceCardsPositions', JSON.stringify(savedPositions));
            }
        });
        
        overlay.appendChild(cardElement);
    });
    
    console.log(`🛒 Маркетплейс: размещено ${cardsToShow.length} карточек`);
};

/* ========================================
   Настройка панелей управления
   ======================================== */
const setupControls = () => {
    const btnPortrait = document.getElementById('btn-portrait');
    const btnSquare = document.getElementById('btn-square');
    
    if (CONFIG.cardFormat === 'portrait') {
        btnPortrait.classList.add('format-control__btn--active');
        btnSquare.classList.remove('format-control__btn--active');
    } else {
        btnSquare.classList.add('format-control__btn--active');
        btnPortrait.classList.remove('format-control__btn--active');
    }
};

const handleFormatChange = (format) => {
    CONFIG.cardFormat = format;
    state.groups.forEach(group => {
        group.format = format;
    });
    
    renderAllGroups();
    setupControls();
    saveProject();
    
    console.log(`📐 Формат карточек изменен на: ${format === 'square' ? '1:1 Square' : '3:4 Portrait'}`);
};

/* ========================================
   Управление группами
   ======================================== */
const handleAddGroup = () => {
    const modal = document.getElementById('add-group-modal');
    if (modal) {
        document.getElementById('group-folder-path').value = '';
        document.getElementById('group-files-list').value = '';
        modal.classList.add('modal--open');
    }
};

const closeAddGroupModal = () => {
    const modal = document.getElementById('add-group-modal');
    if (modal) modal.classList.remove('modal--open');
};

const confirmAddGroup = () => {
    const format = document.querySelector('input[name="group-format"]:checked').value;
    const folderPath = document.getElementById('group-folder-path').value.trim();
    const filesList = document.getElementById('group-files-list').value.trim();
    
    if (!folderPath && !filesList) {
        alert('Укажите путь к папке или список файлов');
        return;
    }
    
    const newGroupId = state.groups.length > 0 ? Math.max(...state.groups.map(g => g.id)) + 1 : 1;
    
    if (filesList) {
        const files = filesList.split('\n').filter(f => f.trim());
        const cards = files.map((filePath, index) => ({
            id: `${newGroupId}-${index + 1}`,
            src: convertToFileUrl(filePath.trim()),
            alt: `Card ${newGroupId}-${index + 1}`,
            groupId: newGroupId,
            isFirst: index === 0,
            isLarge: false,
            positionInGroup: index,
            isEmpty: false
        }));
        
        if (cards.length > 0) {
            cards[0].isFirst = true;
        }
        
        state.groups.push({
            id: newGroupId,
            cards: cards,
            format: format
        });
    } else {
        state.groups.push({
            id: newGroupId,
            cards: [],
            format: format
        });
    }
    
    renderAllGroups();
    closeAddGroupModal();
    saveProject();
};

const handleEditGroup = (groupId) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    state.currentEditGroupId = groupId;
    
    const modal = document.getElementById('edit-group-modal');
    const cardsList = document.getElementById('edit-group-cards-list');
    const previewArea = document.getElementById('edit-group-preview');
    
    if (!modal || !cardsList || !previewArea) return;
    
    cardsList.innerHTML = '';
    previewArea.innerHTML = '';
    
    const previewContainer = document.createElement('div');
    previewContainer.className = 'gallery-grid__cards';
    previewContainer.style.display = 'grid';
    previewContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    previewContainer.style.gap = '20px';
    
    const sortedCards = [...group.cards].sort((a, b) => {
        const posA = a.positionInGroup !== undefined ? a.positionInGroup : 999;
        const posB = b.positionInGroup !== undefined ? b.positionInGroup : 999;
        return posA - posB;
    });
    
    sortedCards.forEach(card => {
        if (card.isEmpty) {
            const emptyBlock = document.createElement('div');
            emptyBlock.className = `card card--empty ${card.isLarge ? 'card--first' : ''} ${group.format === 'square' ? 'card--square' : 'card--portrait'}`;
            emptyBlock.style.border = 'none';
            emptyBlock.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            emptyBlock.style.minHeight = '200px';
            previewContainer.appendChild(emptyBlock);
        } else {
            const cardElement = createCardElement(card, group.format || CONFIG.cardFormat);
            const controls = cardElement.querySelector('.card__controls');
            const sizeToggle = cardElement.querySelector('.card__size-toggle');
            if (controls) controls.remove();
            if (sizeToggle) sizeToggle.remove();
            cardElement.style.cursor = 'default';
            cardElement.draggable = false;
            previewContainer.appendChild(cardElement);
        }
    });
    
    previewArea.appendChild(previewContainer);
    
    sortedCards.forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'edit-card-item';
        item.draggable = !card.isEmpty;
        item.dataset.cardId = card.id;
        item.innerHTML = `
            <div class="edit-card-item__drag">☰</div>
            <div class="edit-card-item__preview">
                ${card.isEmpty ? '<div class="edit-card-item__empty">Пустой блок</div>' : `<img src="${card.src}" alt="">`}
            </div>
            <div class="edit-card-item__info">
                <div class="edit-card-item__name">${card.isEmpty ? 'Пустой блок' : `Карточка ${card.id}`}</div>
                <div class="edit-card-item__actions">
                    ${!card.isEmpty ? `
                        <button class="btn btn--small" onclick="handleToggleCardSizeInEdit('${card.id}', ${groupId})">
                            ${card.isLarge ? '1×' : '2×'}
                        </button>
                        <button class="btn btn--small" onclick="handleToggleMainCardInEdit('${card.id}', ${groupId})">
                            ${card.isFirst ? '★' : '☆'}
                        </button>
                        <button class="btn btn--small btn--danger" onclick="handleRemoveCardFromGroup('${card.id}', ${groupId})">Удалить</button>
                    ` : `
                        <button class="btn btn--small" onclick="handleToggleEmptyBlockSize('${card.id}', ${groupId})">
                            ${card.isLarge ? '1×' : '2×'}
                        </button>
                        <button class="btn btn--small btn--danger" onclick="handleRemoveCardFromGroup('${card.id}', ${groupId})">Удалить</button>
                    `}
                </div>
            </div>
        `;
        
        item.addEventListener('dragstart', (e) => {
            state.draggedCardInEdit = item;
            item.classList.add('edit-card-item--dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('edit-card-item--dragging');
            document.querySelectorAll('.edit-card-item--drop-target').forEach(i => {
                i.classList.remove('edit-card-item--drop-target');
            });
            state.draggedCardInEdit = null;
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (state.draggedCardInEdit && state.draggedCardInEdit !== item) {
                item.classList.add('edit-card-item--drop-target');
            }
        });
        
        item.addEventListener('dragleave', () => {
            item.classList.remove('edit-card-item--drop-target');
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('edit-card-item--drop-target');
            
            if (state.draggedCardInEdit && state.draggedCardInEdit !== item) {
                reorderCardsInGroup(state.draggedCardInEdit.dataset.cardId, item.dataset.cardId, groupId);
            }
        });
        
        cardsList.appendChild(item);
    });
    
    modal.classList.add('modal--open');
};

const reorderCardsInGroup = (cardId1, cardId2, groupId) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const card1 = group.cards.find(c => c.id === cardId1);
    const card2 = group.cards.find(c => c.id === cardId2);
    
    if (!card1 || !card2) return;
    
    const tempPos = card1.positionInGroup;
    card1.positionInGroup = card2.positionInGroup;
    card2.positionInGroup = tempPos;
    
    handleEditGroup(groupId);
    renderGroup(group);
    saveProject();
};

const closeEditGroupModal = () => {
    const modal = document.getElementById('edit-group-modal');
    if (modal) modal.classList.remove('modal--open');
    state.currentEditGroupId = null;
};

const confirmEditGroup = () => {
    const groupId = state.currentEditGroupId;
    if (!groupId) return;
    
    const filesList = document.getElementById('edit-group-files-list').value.trim();
    
    if (filesList) {
        const group = state.groups.find(g => g.id === groupId);
        if (group) {
            const files = filesList.split('\n').filter(f => f.trim());
            const newCards = files.map((filePath, index) => {
                const existingCard = group.cards.find(c => c.src === convertToFileUrl(filePath.trim()));
                if (existingCard) {
                    return existingCard;
                }
                
                return {
                    id: `${groupId}-${group.cards.length + index + 1}`,
                    src: convertToFileUrl(filePath.trim()),
                    alt: `Card ${groupId}-${group.cards.length + index + 1}`,
                    groupId: groupId,
                    isFirst: false,
                    isLarge: false,
                    positionInGroup: group.cards.length + index,
                    isEmpty: false
                };
            });
            
            group.cards.push(...newCards);
        }
    }
    
    renderAllGroups();
    closeEditGroupModal();
    saveProject();
};

const handleRemoveCardFromGroup = (cardId, groupId) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    group.cards = group.cards.filter(c => c.id !== cardId);
    
    handleEditGroup(groupId);
    renderGroup(group);
    renderFeaturedCards();
    saveProject();
};

const handleDeleteGroup = () => {
    const groupId = state.currentEditGroupId;
    if (!groupId) return;
    
    if (!confirm('Удалить эту группу?')) return;
    
    state.groups = state.groups.filter(g => g.id !== groupId);
    
    renderAllGroups();
    closeEditGroupModal();
    saveProject();
};

const handleToggleCardSizeInEdit = (cardId, groupId) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const card = group.cards.find(c => c.id === cardId);
    if (!card) return;
    
    card.isLarge = !card.isLarge;
    if (card.isLarge) {
        card.isFirst = false;
    }
    
    handleEditGroup(groupId);
    renderGroup(group);
    saveProject();
};

const handleToggleMainCardInEdit = (cardId, groupId) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const card = group.cards.find(c => c.id === cardId);
    if (!card) return;
    
    if (card.isFirst) {
        card.isFirst = false;
    } else {
        group.cards.forEach(c => {
            if (c.id === cardId) {
                c.isFirst = true;
            } else {
                c.isFirst = false;
            }
        });
    }
    
    handleEditGroup(groupId);
    renderGroup(group);
    renderFeaturedCards();
    saveProject();
};

const addEmptyBlockToGroup = () => {
    const groupId = state.currentEditGroupId;
    if (!groupId) return;
    
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const newCard = {
        id: `${groupId}-empty-${Date.now()}`,
        src: '',
        alt: '',
        groupId: groupId,
        isFirst: false,
        isLarge: false,
        positionInGroup: group.cards.length,
        isEmpty: true
    };
    
    group.cards.push(newCard);
    
    handleEditGroup(groupId);
    renderGroup(group);
    saveProject();
};

const handleToggleEmptyBlockSize = (cardId, groupId) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const card = group.cards.find(c => c.id === cardId);
    if (!card) return;
    
    card.isLarge = !card.isLarge;
    
    handleEditGroup(groupId);
    renderGroup(group);
    saveProject();
};

const handleToggleCardSize = (cardId, groupId) => {
    console.log('🔄 handleToggleCardSize:', cardId, groupId);
    const group = state.groups.find(g => g.id === groupId);
    if (!group) {
        console.warn('⚠️ Группа не найдена:', groupId);
        return;
    }
    
    const card = group.cards.find(c => String(c.id) === String(cardId));
    if (!card) {
        console.warn('⚠️ Карточка не найдена:', cardId, 'в группе', groupId);
        return;
    }
    
    card.isLarge = !card.isLarge;
    if (card.isLarge) {
        card.isFirst = false;
    }
    
    console.log('✅ Размер карточки изменен:', card.isLarge);
    renderGroup(group);
    applyCardSettings();
    saveProject();
};

const handleToggleFirst = (cardId, groupId) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    group.cards.forEach(c => {
        if (c.id === cardId) {
            c.isFirst = true;
        } else {
            c.isFirst = false;
        }
    });
    
    renderGroup(group);
    renderFeaturedCards();
    saveProject();
};

let swapMode = false;
let swapCard1 = null;

const handleSwapMode = (cardId) => {
    if (!swapMode) {
        swapMode = true;
        swapCard1 = cardId;
        document.querySelectorAll('.card').forEach(c => {
            if (c.dataset.cardId === cardId) {
                c.classList.add('card--swap-active');
            }
        });
    } else {
        const card1 = swapCard1;
        const card2 = cardId;
        
        if (card1 !== card2) {
            const card1El = document.querySelector(`[data-card-id="${card1}"]`);
            const card2El = document.querySelector(`[data-card-id="${card2}"]`);
            
            if (card1El && card2El) {
                swapCards(card1El, card2El);
            }
        }
        
        swapMode = false;
        swapCard1 = null;
        document.querySelectorAll('.card--swap-active').forEach(c => {
            c.classList.remove('card--swap-active');
        });
    }
};

/* ========================================
   Управление проектами (сохранение/загрузка)
   ======================================== */
const saveProject = () => {
    if (!state.projectId) return;
    
    const projectData = {
        id: state.projectId,
        name: state.projectName,
        lastModified: new Date().toISOString(),
        groups: state.groups,
        cardSettings: state.cardSettings,
        backgroundSettings: state.backgroundSettings,
        iconSettings: state.iconSettings,
        featuredCards: state.featuredCards,
        processImage: state.processImage,
        config: {
            cardFormat: CONFIG.cardFormat,
            projectName: CONFIG.projectName,
        }
    };
    
    const allProjects = JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
    
    const projectIndex = allProjects.findIndex(p => p.id === state.projectId);
    
    if (projectIndex !== -1) {
        allProjects[projectIndex] = projectData;
    } else {
        allProjects.push(projectData);
    }
    
    localStorage.setItem('portfolioProjects', JSON.stringify(allProjects));
    console.log(`💾 Проект "${state.projectName}" сохранен`);
};

const loadProject = (projectId) => {
    const allProjects = JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
    const project = allProjects.find(p => p.id === projectId);
    
    if (!project) {
        console.warn(`⚠️ Проект ${projectId} не найден`);
        return false;
    }
    
    state.projectId = project.id;
    state.projectName = project.name || CONFIG.projectName;
    state.groups = project.groups || [];
    if (project.cardSettings) {
        state.cardSettings = { ...state.cardSettings, ...project.cardSettings };
    }
    if (project.backgroundSettings) {
        state.backgroundSettings = { ...state.backgroundSettings, ...project.backgroundSettings };
    }
    if (project.iconSettings) {
        state.iconSettings = { ...state.iconSettings, ...project.iconSettings };
    }
    state.featuredCards = project.featuredCards || [];
    state.processImage = project.processImage || null;
    
    if (project.config) {
        CONFIG.cardFormat = project.config.cardFormat || CONFIG.cardFormat;
        CONFIG.projectName = project.config.projectName || CONFIG.projectName;
    }
    
    console.log(`📂 Проект "${state.projectName}" загружен`);
    return true;
};

/* ========================================
   Настройки карточек (рамки, тени)
   ======================================== */
const applyCardSettings = () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (card.classList.contains('card--empty')) {
            card.style.border = 'none';
        } else {
            const borderWidth = state.cardSettings.borderWidth || 2;
            const borderColor = state.cardSettings.borderColor || '#cccccc';
            card.style.border = borderWidth === 0 ? 'none' : `${borderWidth}px solid ${borderColor}`;
        }
        
        if (state.cardSettings.shadowEnabled) {
            const shadowPresets = {
                weak: '0 2px 8px rgba(0, 0, 0, 0.2)',
                medium: '0 4px 20px rgba(0, 0, 0, 0.3)',
                strong: '0 8px 40px rgba(0, 0, 0, 0.5)',
                sharp: '0 0 20px rgba(0, 0, 0, 0.6)',
            };
            card.style.boxShadow = shadowPresets[state.cardSettings.shadowPreset] || shadowPresets.medium;
        } else {
            card.style.boxShadow = 'none';
        }
    });
};

const updateCardBorder = (width, color) => {
    state.cardSettings.borderWidth = width;
    state.cardSettings.borderColor = color;
    applyCardSettings();
    saveProject();
};

const updateCardShadow = (enabled, preset) => {
    state.cardSettings.shadowEnabled = enabled;
    if (preset) state.cardSettings.shadowPreset = preset;
    applyCardSettings();
    saveProject();
};

/* ========================================
   Event Listeners
   ======================================== */
const setupEventListeners = () => {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleDevMode();
        }
        
        if (e.key === 'Escape' && swapMode) {
            swapMode = false;
            swapCard1 = null;
            document.querySelectorAll('.card--swap-active').forEach(c => {
                c.classList.remove('card--swap-active');
            });
        }
    });
};

const setupMarketplaceScreenshotControls = () => {
    const screenshot = document.getElementById('ozon-screenshot');
    if (!screenshot) return;
    
    let position = { x: 0, y: 0 };
    
    const savedPosition = localStorage.getItem('marketplaceScreenshotPosition');
    if (savedPosition) {
        try {
            position = JSON.parse(savedPosition);
        } catch (e) {
            console.warn('Не удалось загрузить позицию скриншота', e);
        }
    }
    
    screenshot.style.position = 'relative';
    screenshot.style.left = `${position.x}px`;
    screenshot.style.top = `${position.y}px`;
    screenshot.style.transition = 'none';
    screenshot.style.cursor = 'move';
    screenshot.setAttribute('tabindex', '0');
    
    screenshot.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            position.x -= 1;
            screenshot.style.left = `${position.x}px`;
            localStorage.setItem('marketplaceScreenshotPosition', JSON.stringify(position));
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            position.x += 1;
            screenshot.style.left = `${position.x}px`;
            localStorage.setItem('marketplaceScreenshotPosition', JSON.stringify(position));
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            position.y -= 1;
            screenshot.style.top = `${position.y}px`;
            localStorage.setItem('marketplaceScreenshotPosition', JSON.stringify(position));
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            position.y += 1;
            screenshot.style.top = `${position.y}px`;
            localStorage.setItem('marketplaceScreenshotPosition', JSON.stringify(position));
            e.preventDefault();
        }
    });
    
    screenshot.addEventListener('click', () => {
        screenshot.focus();
    });
};

const enableDevMode = () => {
    const devMode = localStorage.getItem('devMode') === 'true';
    if (devMode) {
        document.body.classList.add('dev-mode');
    }
};

const toggleDevMode = () => {
    document.body.classList.toggle('dev-mode');
    const isEnabled = document.body.classList.contains('dev-mode');
    localStorage.setItem('devMode', isEnabled.toString());
    console.log(`🔧 Dev Mode: ${isEnabled ? 'включен' : 'выключен'}`);
};

const exportState = () => {
    console.log('📊 Текущее состояние:', JSON.stringify(state, null, 2));
    console.log('⚙️ Конфигурация:', JSON.stringify(CONFIG, null, 2));
};

const resetLayout = () => {
    if (confirm('Сбросить раскладку? Все изменения будут потеряны.')) {
        state.groups = [];
        loadCards();
    }
};

const exportToPDF = () => {
    window.print();
};

const exportToBehance = () => {
    console.log('📐 Экспорт для Behance (в разработке)');
};

const openQuickCardEditor = () => {
    openCardSettings();
};

window.openCardSettings = () => {
    const modal = document.getElementById('card-settings-modal');
    if (modal) {
        const borderWidthRadio = document.querySelector(`input[name="border-width"][value="${state.cardSettings.borderWidth || 2}"]`);
        if (borderWidthRadio) borderWidthRadio.checked = true;
        document.getElementById('card-border-color').value = state.cardSettings.borderColor;
        document.getElementById('card-shadow-enabled').checked = state.cardSettings.shadowEnabled;
        const shadowPresetRadio = document.querySelector(`input[name="shadow-preset"][value="${state.cardSettings.shadowPreset || 'medium'}"]`);
        if (shadowPresetRadio) shadowPresetRadio.checked = true;
        
        const colorPresets = { '#000000': 'black', '#ffffff': 'white', '#cccccc': 'gray' };
        const currentColor = state.cardSettings.borderColor.toLowerCase();
        if (colorPresets[currentColor]) {
            const colorRadio = document.querySelector(`input[name="border-color-preset"][value="${currentColor}"]`);
            if (colorRadio) colorRadio.checked = true;
        }
        
        modal.classList.add('modal--open');
    }
};

window.closeCardSettings = () => {
    const modal = document.getElementById('card-settings-modal');
    if (modal) modal.classList.remove('modal--open');
};

window.saveCardSettings = () => {
    const borderWidth = parseInt(document.querySelector('input[name="border-width"]:checked').value);
    let borderColor = document.getElementById('card-border-color').value;
    
    const colorPreset = document.querySelector('input[name="border-color-preset"]:checked');
    if (colorPreset) {
        borderColor = colorPreset.value;
        document.getElementById('card-border-color').value = borderColor;
    }
    
    const shadowEnabled = document.getElementById('card-shadow-enabled').checked;
    const shadowPreset = document.querySelector('input[name="shadow-preset"]:checked').value;
    
    updateCardBorder(borderWidth, borderColor);
    updateCardShadow(shadowEnabled, shadowPreset);
    closeCardSettings();
};

window.randomizeIcons = (type = 'position') => {
    state.iconSettings.randomizeType = type;
    
    if (type === 'filename') {
        if (state.icons && state.icons.pngBlack) {
            state.icons.pngBlack = [...state.icons.pngBlack].sort(() => Math.random() - 0.5);
        }
        if (state.icons && state.icons.svgBlack) {
            state.icons.svgBlack = [...state.icons.svgBlack].sort(() => Math.random() - 0.5);
        }
        if (state.icons && state.icons.svgWhite) {
            state.icons.svgWhite = [...state.icons.svgWhite].sort(() => Math.random() - 0.5);
        }
    }
    
    state.iconSettings.randomized = true;
    setupIcons();
    console.log(`🎲 Иконки рандомизированы (тип: ${type})`);
};

window.openProcessImageSelector = () => {
    const modal = document.getElementById('process-image-modal');
    if (!modal) return;
    
    const imagesList = document.getElementById('process-images-list');
    if (!imagesList) return;
    
    imagesList.innerHTML = '<p>Загрузка списка изображений...</p>';
    
    const processImagesPath = '../SHABLON_BEHANCE_1440/PROCESS_Images/';
    
    const exampleImages = [
        'CONNECTORS_IMAGE.png',
        'PROCESS_1.png',
        'PROCESS_2.png'
    ];
    
    imagesList.innerHTML = '';
    exampleImages.forEach((filename, index) => {
        const item = document.createElement('div');
        item.className = 'process-image-item';
        item.style.cssText = 'padding: 10px; margin: 5px 0; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: background-color 0.3s, border-color 0.3s;';
        item.onmouseenter = () => {
            item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            item.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        };
        item.onmouseleave = () => {
            item.style.backgroundColor = '';
            item.style.borderColor = '';
        };
        item.onclick = () => {
            const imagePath = processImagesPath + filename;
            state.processImage = imagePath;
            const img = document.getElementById('process-image');
            if (img) {
                img.src = imagePath;
            }
            saveProject();
            closeProcessImageSelector();
        };
        
        const preview = document.createElement('img');
        preview.src = processImagesPath + filename;
        preview.style.cssText = 'width: 100%; max-width: 150px; height: auto; border-radius: 4px;';
        preview.onerror = () => {
            preview.style.display = 'none';
        };
        
        const name = document.createElement('span');
        name.textContent = filename;
        name.style.cssText = 'font-size: 12px; text-align: center;';
        
        item.appendChild(preview);
        item.appendChild(name);
        imagesList.appendChild(item);
    });
    
    modal.classList.add('modal--open');
};

window.closeProcessImageSelector = () => {
    const modal = document.getElementById('process-image-modal');
    if (modal) modal.classList.remove('modal--open');
};

window.openQuickCardEditor = openQuickCardEditor;
window.openBackgroundSettings = () => {
    const modal = document.getElementById('background-settings-modal');
    if (modal) {
        document.querySelector(`input[name="bg-type"][value="${state.backgroundSettings.type}"]`).checked = true;
        toggleBackgroundTypeControls();
        modal.classList.add('modal--open');
    }
};

window.closeBackgroundSettings = () => {
    const modal = document.getElementById('background-settings-modal');
    if (modal) modal.classList.remove('modal--open');
};

window.saveBackgroundSettings = async () => {
    const bgType = document.querySelector('input[name="bg-type"]:checked').value;
    const settings = { type: bgType };
    
    if (bgType === 'color') {
        settings.color = document.getElementById('bg-color').value;
    } else if (bgType === 'gradient') {
        settings.gradient = document.getElementById('bg-gradient').value || state.backgroundSettings.gradient;
    } else if (bgType === 'image') {
        const fileInput = document.getElementById('bg-file-input');
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                settings.imagePath = e.target.result;
                updateBackgroundSettings(settings);
                closeBackgroundSettings();
            };
            reader.readAsDataURL(file);
            return;
        }
    }
    
    updateBackgroundSettings(settings);
    closeBackgroundSettings();
};

window.toggleBackgroundTypeControls = () => {
    const bgType = document.querySelector('input[name="bg-type"]:checked').value;
    document.getElementById('bg-image-controls').style.display = bgType === 'image' ? 'block' : 'none';
    document.getElementById('bg-color-controls').style.display = bgType === 'color' ? 'block' : 'none';
};

window.handleBackgroundFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        state.backgroundSettings.type = 'image';
        state.backgroundSettings.imagePath = e.target.result;
        await updateBackgroundSettings(state.backgroundSettings);
        console.log('🖼️ Фон загружен');
    };
    reader.readAsDataURL(file);
};

window.randomizeBackground = randomizeBackground;
window.exportToPDF = exportToPDF;
window.exportToBehance = exportToBehance;
window.handleFormatChange = handleFormatChange;
window.handleAddGroup = handleAddGroup;
window.closeAddGroupModal = closeAddGroupModal;
window.confirmAddGroup = confirmAddGroup;
window.handleEditGroup = handleEditGroup;
window.closeEditGroupModal = closeEditGroupModal;
window.confirmEditGroup = confirmEditGroup;
window.handleRemoveCardFromGroup = handleRemoveCardFromGroup;
window.handleDeleteGroup = handleDeleteGroup;
window.handleToggleCardSizeInEdit = handleToggleCardSizeInEdit;
window.handleToggleMainCardInEdit = handleToggleMainCardInEdit;
window.addEmptyBlockToGroup = addEmptyBlockToGroup;
window.handleToggleEmptyBlockSize = handleToggleEmptyBlockSize;
window.handleToggleCardSize = handleToggleCardSize;
window.handleToggleFirst = handleToggleFirst;
window.handleSwapMode = handleSwapMode;
window.toggleDevMode = toggleDevMode;
window.exportState = exportState;
window.resetLayout = resetLayout;

const updateGroupName = (groupId, newName) => {
    const group = state.groups.find(g => g.id === groupId);
    if (group) {
        group.name = newName || `Группа ${groupId}`;
        saveProject();
        renderAllGroups();
    }
};

window.updateGroupName = updateGroupName;

/* ========================================
   Запуск при загрузке страницы
   ======================================== */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/* ========================================
   Консольные команды для пользователя
   ======================================== */
console.log(`
╔════════════════════════════════════════╗
║   ПОРТФОЛИО ШАБЛОН - КОНСОЛЬНЫЕ КОМАНДЫ   ║
╚════════════════════════════════════════╝

📋 Доступные команды:

  toggleDevMode()              - Включить/выключить режим отладки
  exportState()                - Показать текущее состояние
  resetLayout()                - Сбросить раскладку
  handleFormatChange('square') - Переключить на формат 1:1
  handleFormatChange('portrait') - Переключить на формат 3:4
  exportToPDF()                - Экспорт в PDF
  exportToBehance()            - Экспорт для Behance

⌨️ Горячие клавиши:

  Ctrl/Cmd + D        - Dev Mode
  Escape              - Отмена swap mode

🎨 Drag & Drop:
  - Перетаскивайте карточки для обмена местами
  - Кнопка ★ - сделать карточку первой в группе
  - Кнопка ⇄ - режим swap (выбор двух карточек)

📐 Форматы карточек:
  - 3:4 Portrait - вертикальные карточки (по умолчанию)
  - 1:1 Square - квадратные карточки

`);
