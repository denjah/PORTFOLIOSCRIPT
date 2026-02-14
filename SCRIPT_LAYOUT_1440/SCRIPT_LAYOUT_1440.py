# -*- coding: utf-8 -*-
"""
SCRIPT_LAYOUT_1440 — сборка портфолио 1440px.
Режимы: консоль (--serve), CLI с tkinter, API для веб-консоли.
Пропорция: 1:1 или 3:4. Карточки с _+ — всегда 2 колонки.
Вывод: PNG или HTML с координатами (интерактивные кликабельные карточки).
"""
from PIL import Image, ImageDraw, ImageFilter
import os
import sys
import re
import random
import time
import shutil
import json
import base64

import io
import traceback
import tkinter as tk
from tkinter import filedialog, messagebox

# Корень: папка скрипта
ROOT = os.path.dirname(os.path.abspath(__file__))
CONSOLE_DIR = os.path.join(ROOT, "console")
BG_PATH = os.path.join(ROOT, "backgrounds")
os.makedirs(BG_PATH, exist_ok=True)

log_path = os.path.join(ROOT, "portfolio_log.txt")
log_file = open(log_path, "w", encoding="utf-8")

def log(s):
    print(s)
    log_file.write(s + "\n")
    log_file.flush()

# --- Параметры макета ---
CARD_FRAME = 2
CANVAS_WIDTH = 1440
MARGIN_LEFT_RIGHT = int(CANVAS_WIDTH * 0.083)
COLUMN_GAP = int(CANVAS_WIDTH * 0.028)
ROW_GAP = int(CANVAS_WIDTH * 0.028)
COLUMNS = 4
WORK_WIDTH = CANVAS_WIDTH - 2 * MARGIN_LEFT_RIGHT
COLUMN_WIDTH = int((WORK_WIDTH - (COLUMNS - 1) * COLUMN_GAP) / COLUMNS)

# CARD_ASPECT, SINGLE_HEIGHT, DOUBLE_WIDTH, DOUBLE_HEIGHT задаются после выбора пропорции

LAYOUTS = [
    [(0,0,2,2),(0,2,1,1),(0,3,2,2),(2,0,1,1),(3,0,1,1),(2,1,2,2),(2,3,1,1),(3,3,1,1),(2,4,1,1),(3,4,1,1)],
    [(0,0,1,2),(1,0,1,1),(2,0,1,1),(3,0,1,1),(1,1,2,2),(0,2,1,1),(0,3,1,1),(3,1,1,2),(1,3,1,1),(3,3,1,1)],
    [(0,0,2,2),(2,0,2,2),(0,2,1,1),(2,2,1,2),(0,3,2,2),(3,2,1,1),(0,5,1,1),(1,5,1,1),(2,5,1,1),(3,5,1,1)],
    [(0,0,1,2),(1,0,1,1),(2,0,1,1),(3,0,1,1),(1,1,2,2),(0,2,1,1),(0,3,1,1),(3,1,1,2),(2,3,1,1),(3,3,1,1)],
]

def choose_aspect():
    print("\nПропорция карточек:")
    print("  1 — 1:1")
    print("  2 — 3:4")
    try:
        s = input("Номер (1–2) [2]: ").strip() or "2"
        return 1.0 if s == "1" else 3 / 4
    except (ValueError, EOFError):
        return 3 / 4

def choose_layout():
    print("\nПорядок вёрстки (1–4):")
    print("  1 — слева большие блоки, справа мелкие и 2x2")
    print("  2 — слева высокая колонка, справа верх 2+1, середина 2x2")
    print("  3 — два больших сверху, снизу микс и ряд из 4")
    print("  4 — как 2, нижние слоты в других позициях")
    try:
        s = input("Номер (1–4) [1]: ").strip() or "1"
        n = int(s)
        if 1 <= n <= 4:
            return n - 1
    except (ValueError, EOFError):
        pass
    return 0

def choose_background():
    """1 — выбрать файл, 2 — случайный из backgrounds. Возвращает путь или None (random)."""
    print("\nФон:")
    print("  1 — выбрать файл")
    print("  2 — случайный из папки backgrounds")
    try:
        s = input("Номер (1–2) [2]: ").strip() or "2"
        if s == "1":
            path = pick_background_file()
            if path:
                return path
            log("Файл не выбран — использую случайный из backgrounds.")
        return None
    except (ValueError, EOFError):
        return None

def _file_dialog_root():
    r = tk.Tk()
    r.withdraw()
    r.attributes("-topmost", True)
    return r

_ftypes = [
    ("Изображения", "*.png;*.jpg;*.jpeg;*.bmp;*.tiff;*.webp"),
    ("PNG", "*.png"),
    ("JPEG", "*.jpg;*.jpeg"),
    ("Все файлы", "*.*"),
]

def pick_card_files():
    root = _file_dialog_root()
    paths = filedialog.askopenfilenames(
        title="Выберите карточки для макета (Ctrl/Shift — несколько)",
        initialdir=ROOT,
        filetypes=_ftypes,
    )
    root.destroy()
    return list(paths) if paths else []

def pick_background_file():
    """Выбор одного файла с фоном. Возвращает путь или None при отмене."""
    root = _file_dialog_root()
    path = filedialog.askopenfilename(
        title="Выберите файл с фоном",
        initialdir=BG_PATH,
        filetypes=_ftypes,
    )
    root.destroy()
    return path if path and os.path.isfile(path) else None

def _msg_root():
    r = tk.Tk()
    r.withdraw()
    r.attributes("-topmost", True)
    return r

def show_result(success, path=None, error_msg=None):
    """Окно: успех (путь к файлу) или ошибка."""
    root = _msg_root()
    if success and path:
        messagebox.showinfo("Готово", f"Файл создан:\n{path}")
    elif success:
        messagebox.showinfo("Готово", "Сборка выполнена.")
    else:
        msg = (error_msg or "Произошла ошибка.").strip()
        if len(msg) > 800:
            msg = msg[:800] + "\n\n… (полный текст в логе)"
        messagebox.showerror("Ошибка", msg + "\n\nЛог: " + log_path)
    root.destroy()

def ask_run_again():
    """Спросить: выполнить с другой вёрсткой? Возвращает True/False."""
    root = _msg_root()
    ok = messagebox.askyesno("Продолжить?", "Выполнить с другой вёрсткой?\n(Да — те же карточки, пропорция и фон; Нет — выход)")
    root.destroy()
    return bool(ok)

def card_index(filename):
    m = re.search(r"_0*(\d+)", os.path.basename(filename))
    return int(m.group(1)) if m else 999

def is_wide_card(filename):
    return "_+" in os.path.basename(filename)

def slot_to_rect(col, row, w_cols, h_rows, single_height):
    """Слот в пиксели. Высота строк единая (single_height), пропорция задаёт размер 1x1."""
    x = MARGIN_LEFT_RIGHT + col * (COLUMN_WIDTH + COLUMN_GAP)
    y = MARGIN_LEFT_RIGHT + row * (single_height + ROW_GAP)
    w = w_cols * COLUMN_WIDTH + (w_cols - 1) * COLUMN_GAP
    h = h_rows * single_height + (h_rows - 1) * ROW_GAP
    return (int(x), int(y), int(w), int(h))

def layout_height_rows(layout):
    max_row = 0
    for (_, row, _, h_rows) in layout:
        max_row = max(max_row, row + h_rows)
    return max_row

def _process_bg_image(bg, required_height):
    """Масштаб по ширине 1440, crop/extend по высоте."""
    bw, bh = bg.size
    if bw != CANVAS_WIDTH:
        ar = bh / bw
        bg = bg.resize((CANVAS_WIDTH, int(CANVAS_WIDTH * ar)), Image.Resampling.LANCZOS)
        bw, bh = bg.size
    if bh < required_height:
        flip = bg.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        out = Image.new("RGB", (CANVAS_WIDTH, required_height))
        out.paste(bg, (0, 0))
        y = bh
        while y < required_height:
            remain = required_height - y
            if remain >= bh:
                out.paste(flip, (0, y))
                y += bh
            else:
                out.paste(flip.crop((0, 0, CANVAS_WIDTH, remain)), (0, y))
                break
        return out
    return bg.crop((0, 0, CANVAS_WIDTH, required_height))

def load_background(required_height, explicit_path=None):
    """explicit_path: файл фона или None — случайный из backgrounds."""
    fallback = Image.new("RGB", (CANVAS_WIDTH, required_height), (15, 18, 25))
    if explicit_path:
        try:
            bg = Image.open(explicit_path).convert("RGB")
            log(f"Фон: {os.path.basename(explicit_path)}")
            return _process_bg_image(bg, required_height)
        except Exception as e:
            log(f"ERROR фона {explicit_path}: {e}")
            return fallback
    if not os.path.isdir(BG_PATH):
        log("WARNING: Нет папки backgrounds, создаю простой фон.")
        return fallback
    exts = (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp")
    files = [f for f in os.listdir(BG_PATH) if f.lower().endswith(exts)]
    if not files:
        log("WARNING: Нет фонов в backgrounds, создаю простой фон.")
        return fallback
    random.seed(int(time.time() * 1000) + os.getpid())
    fn = random.choice(files)
    path = os.path.join(BG_PATH, fn)
    log(f"Фон (random): {fn}")
    try:
        bg = Image.open(path).convert("RGB")
        return _process_bg_image(bg, required_height)
    except Exception as e:
        log(f"ERROR фона: {e}")
        return fallback

def place(canvas, img, x, y, w, h, hero=False):
    w, h = int(w), int(h)
    x, y = int(x), int(y)
    asp = img.width / img.height
    if asp > w / h:
        nw, nh = w, int(w / asp)
    else:
        nw, nh = int(h * asp), h
    res = img.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = x + (w - nw) // 2
    oy = y + (h - nh) // 2
    pad = 20
    cont = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    sh = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sz = 15 if hero else 10
    op = 100 if hero else 60
    for i in range(sz):
        a = int(op * (1 - i / sz))
        sd.rectangle([pad + i, pad + i, w + pad - i, h + pad - i], (0, 0, 0, a))
    sh = sh.filter(ImageFilter.GaussianBlur(sz))
    cont.paste(sh, (0, 0), sh)
    if hero:
        gl = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
        gd = ImageDraw.Draw(gl)
        gd.rectangle([5, 5, w + pad * 2 - 5, h + pad * 2 - 5], outline=(100, 150, 200, 30), width=8)
        gl = gl.filter(ImageFilter.GaussianBlur(8))
        cont.paste(gl, (0, 0), gl)
    bd = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    bdd = ImageDraw.Draw(bd)
    bw = 3 if hero else 2
    bc = (255, 255, 255, 200) if hero else (200, 200, 200, 150)
    bdd.rectangle([pad, pad, w + pad, h + pad], outline=bc, width=bw)
    cont.paste(bd, (0, 0), bd)
    img_x1 = pad + (w - nw) // 2
    img_y1 = pad + (h - nh) // 2
    img_x2 = img_x1 + nw
    img_y2 = img_y1 + nh
    cl = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    cl.paste(res, (img_x1, img_y1))
    cont = Image.alpha_composite(cont, cl)
    frame_img = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame_img)
    half = CARD_FRAME // 2
    fd.rectangle([img_x1 + half, img_y1 + half, img_x2 - half, img_y2 - half],
                 outline=(255, 255, 255, 255), width=CARD_FRAME)
    cont = Image.alpha_composite(cont, frame_img)
    canvas.paste(cont, (int(ox) - pad, int(oy) - pad), cont)


# --- HTML / JSON экспорт ---

def _process_bg_to_height(bg, required_height):
    """Фон: масштаб по ширине 1440, затем копировать+зеркалить по высоте."""
    bw, bh = bg.size
    if bw != CANVAS_WIDTH:
        ar = bh / bw
        bg = bg.resize((CANVAS_WIDTH, int(CANVAS_WIDTH * ar)), Image.Resampling.LANCZOS)
        bw, bh = bg.size
    if bh >= required_height:
        return bg.crop((0, 0, CANVAS_WIDTH, required_height))
    flip = bg.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    out = Image.new("RGB", (CANVAS_WIDTH, required_height))
    out.paste(bg, (0, 0))
    y = bh
    while y < required_height:
        remain = required_height - y
        if remain >= bh:
            out.paste(flip, (0, y))
            y += bh
        else:
            out.paste(flip.crop((0, 0, CANVAS_WIDTH, remain)), (0, y))
            break
    return out


def build_layout_data(paths, CARD_ASPECT, lay_idx, bg_path, output_dir=None):
    """
    Строит данные макета без склейки в PNG.
    Возвращает: dict с width, height, cards: [{img, x, y, w, h, hero}], bg_path, bg_base64.
    Карточки сохраняются в output_dir/cards/, фон в output_dir/background.jpg.
    """
    output_dir = output_dir or ROOT
    cards_dir = os.path.join(output_dir, "cards")
    os.makedirs(cards_dir, exist_ok=True)

    SINGLE_HEIGHT = int(COLUMN_WIDTH / CARD_ASPECT)
    layout = LAYOUTS[lay_idx]
    ordered = [(card_index(p), p, is_wide_card(p)) for p in paths]
    ordered.sort(key=lambda x: (x[0], x[1]))
    plus = [(idx, p) for idx, p, wide in ordered if wide]
    normal = [(idx, p) for idx, p, wide in ordered if not wide]
    wide_idx = [i for i, s in enumerate(layout) if s[2] >= 2]
    narrow_idx = [i for i in range(10) if i not in wide_idx]
    n_cards = len(ordered)
    n_cycles = (n_cards + 9) // 10
    n_wide_total = len(wide_idx) * n_cycles
    n_narrow_total = len(narrow_idx) * n_cycles
    if len(plus) > n_wide_total or len(normal) > n_narrow_total:
        raise ValueError(f"Карточек _+ ({len(plus)}) или обычных ({len(normal)}) больше, чем слотов.")

    cards_with_img = []
    for (idx, p, _) in ordered:
        try:
            img = Image.open(p).convert("RGB")
            name = os.path.basename(p)
            wide = is_wide_card(p)
            cards_with_img.append((idx, name, img, wide))
        except Exception as e:
            log(f"Пропуск {p}: {e}")
    if not cards_with_img:
        raise ValueError("Ни одна карточка не загружена.")

    plus_cards = [c for c in cards_with_img if c[3]]
    normal_cards = [c for c in cards_with_img if not c[3]]
    plus_list, normal_list = list(plus_cards), list(normal_cards)
    wide_slots = []
    narrow_slots = []
    for c in range(n_cycles):
        for i in range(10):
            g = c * 10 + i
            if g >= n_cards:
                break
            (wide_slots if i in wide_idx else narrow_slots).append(g)
    slot_to_card = {}
    for g in wide_slots:
        slot_to_card[g] = plus_list.pop(0) if plus_list else normal_list.pop(0)
    for g in narrow_slots:
        slot_to_card[g] = normal_list.pop(0)
    first_card = cards_with_img[0]
    for g in slot_to_card:
        c = slot_to_card[g]
        slot_to_card[g] = (c, c[1] == first_card[1])

    rows_per_cycle = layout_height_rows(layout)
    content_h = MARGIN_LEFT_RIGHT
    def rect(i):
        s = layout[i % 10]
        ro = (i // 10) * rows_per_cycle
        return slot_to_rect(s[0], s[1] + ro, s[2], s[3], SINGLE_HEIGHT)
    for i in range(n_cards):
        _, y, _, h = rect(i)
        content_h = max(content_h, y + h)
    content_h += MARGIN_LEFT_RIGHT
    final_h = int(content_h * 1.05)

    bg_img = None
    bg_rel = None
    if bg_path and os.path.isfile(bg_path):
        try:
            bg_img = Image.open(bg_path).convert("RGB")
            bg_img = _process_bg_to_height(bg_img, final_h)
            bg_path_out = os.path.join(output_dir, "background.jpg")
            bg_img.save(bg_path_out, "JPEG", quality=90)
            bg_rel = "background.jpg"
        except Exception as e:
            log(f"ERROR фона: {e}")
    if bg_img is None:
        exts = (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp")
        files = [f for f in os.listdir(BG_PATH) if f.lower().endswith(exts)] if os.path.isdir(BG_PATH) else []
        if files:
            random.seed(int(time.time() * 1000) + os.getpid())
            fn = random.choice(files)
            p = os.path.join(BG_PATH, fn)
            bg_img = Image.open(p).convert("RGB")
            bg_img = _process_bg_to_height(bg_img, final_h)
        else:
            bg_img = Image.new("RGB", (CANVAS_WIDTH, final_h), (15, 18, 25))
        bg_path_out = os.path.join(output_dir, "background.jpg")
        bg_img.save(bg_path_out, "JPEG", quality=90)
        bg_rel = "background.jpg"

    cards_json = []
    seen = {}
    for i in range(n_cards):
        card, hero = slot_to_card[i]
        idx, name, img, _ = card
        x, y, w, h = rect(i)
        safe = re.sub(r'[^\w\-.]', '_', name)
        if safe in seen:
            seen[safe] += 1
            base, ext = os.path.splitext(safe)
            safe = f"{base}_{seen[safe]}{ext}"
        else:
            seen[safe] = 0
        dst = os.path.join(cards_dir, safe)
        img.save(dst, "PNG")
        rel = f"cards/{safe}"
        cards_json.append({"img": rel, "x": x, "y": y, "w": w, "h": h, "hero": hero})
    return {
        "width": CANVAS_WIDTH,
        "height": final_h,
        "cards": cards_json,
        "background": bg_rel,
    }


def export_html(layout_data, output_path):
    """Пишет HTML с координатами карточек. Фон тайлится и зеркалится через CSS."""
    cards_html = []
    for c in layout_data["cards"]:
        hero_cls = " hero" if c.get("hero") else ""
        cards_html.append(
            f'<a class="card{hero_cls}" href="{c["img"]}" target="_blank" '
            f'style="left:{c["x"]}px;top:{c["y"]}px;width:{c["w"]}px;height:{c["h"]}px;">'
            f'<img src="{c["img"]}" alt=""></a>'
        )
    html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio 1440</title>
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ background:#0f1219; min-height:100vh; display:flex; justify-content:center; padding:20px; }}
.portfolio {{
  position:relative;
  width:{layout_data["width"]}px;
  height:{layout_data["height"]}px;
  background:url({layout_data["background"]}) 0 0 no-repeat;
  background-size:{layout_data["width"]}px 100%;
  box-shadow:0 20px 60px rgba(0,0,0,0.5);
}}
.card {{
  position:absolute;
  display:block;
  overflow:hidden;
  box-shadow:0 10px 30px rgba(0,0,0,0.4);
  border:2px solid rgba(255,255,255,0.15);
  transition:transform .2s, box-shadow .2s;
}}
.card:hover {{ transform:scale(1.02); box-shadow:0 15px 40px rgba(0,0,0,0.5); }}
.card.hero {{ border-color:rgba(100,150,255,0.5); box-shadow:0 0 20px rgba(100,150,255,0.2); }}
.card img {{ width:100%; height:100%; object-fit:contain; display:block; }}
</style>
</head>
<body>
<div class="portfolio">
{chr(10).join(cards_html)}
</div>
</body>
</html>"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)
    return output_path


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--serve":
        run_server()
        return
    try:
        state = {}
        while True:
            path, err = None, None
            try:
                path, err, state = _main(state)
            except Exception as e:
                err = traceback.format_exc()
                log("EXCEPTION:\n" + err)
            show_result(success=(path is not None and os.path.isfile(path)), path=path, error_msg=err)
            if not ask_run_again():
                break
    finally:
        log_file.close()


def generate_console_background_texture():
    """Двухцветная неконтрастная текстура 2560×1080 для фона консоли. Случайная при каждом запросе."""
    w, h = 2560, 1080
    hue = 220 + random.randint(0, 40)
    def hsl_to_rgb(h, s_pct, l_pct):
        s, l = s_pct / 100.0, l_pct / 100.0
        c = (1 - abs(2 * l - 1)) * s
        x = c * (1 - abs((h / 60) % 2 - 1))
        m = l - c / 2
        if h < 60: r, g, b = c, x, 0
        elif h < 120: r, g, b = x, c, 0
        elif h < 180: r, g, b = 0, c, x
        elif h < 240: r, g, b = 0, x, c
        elif h < 300: r, g, b = x, 0, c
        else: r, g, b = c, 0, x
        return (int((r + m) * 255), int((g + m) * 255), int((b + m) * 255))
    base = hsl_to_rgb(hue, 28, 5)
    second = hsl_to_rgb(hue, 22, 5 + int(random.random() * 4))
    base_rgba = Image.new("RGBA", (w, h), (*base, 255))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    count = 80 + random.randint(0, 60)
    for _ in range(count):
        x, y = random.randint(0, w - 1), random.randint(0, h - 1)
        rad = 80 + random.randint(0, 180)
        alpha = random.randint(5, 12)
        draw.ellipse((x - rad, y - rad, x + rad, y + rad), fill=(*second, alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=40))
    out = Image.alpha_composite(base_rgba, overlay).convert("RGB")
    buf = io.BytesIO()
    out.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()


def run_server():
    """HTTP-сервер для веб-консоли. Запуск: python SCRIPT_LAYOUT_1440.py --serve"""
    try:
        from flask import Flask, send_from_directory, request, jsonify, send_file
    except ImportError:
        print("Установите Flask: pip install flask")
        return
    app = Flask(__name__, static_folder=CONSOLE_DIR)
    OUTPUT_DIR = os.path.join(ROOT, "output")
    @app.route("/api/background-texture")
    def api_background_texture():
        png_bytes = generate_console_background_texture()
        return send_file(io.BytesIO(png_bytes), mimetype="image/png")
    @app.route("/")
    def index():
        return send_from_directory(CONSOLE_DIR, "index.html")
    @app.route("/output/<path:path>")
    def output_files(path):
        return send_from_directory(OUTPUT_DIR, path)
    @app.route("/<path:path>")
    def static_files(path):
        return send_from_directory(CONSOLE_DIR, path)
    @app.route("/api/build", methods=["POST"])
    def api_build():
        try:
            data = request.get_json()
            images = data.get("images", [])
            aspect = float(data.get("aspect", 0.75))
            layout_idx = int(data.get("layout", 0))
            bg_type = data.get("bgType", "random")
            bg_base64 = data.get("bgBase64")
            output_mode = data.get("outputMode", "html")
            if not images:
                return jsonify({"success": False, "error": "Нет изображений"}), 400
            if aspect >= 0.99:
                aspect = 1.0
            else:
                aspect = 3 / 4
            out_dir = os.path.join(ROOT, "output")
            os.makedirs(out_dir, exist_ok=True)
            paths = []
            for i, img in enumerate(images):
                name = img.get("name", f"card_{i:02d}.png")
                b64 = img.get("base64", img.get("src", ""))
                if isinstance(b64, str) and "base64," in b64:
                    b64 = b64.split("base64,")[-1]
                raw = base64.b64decode(b64) if b64 else b""
                p = os.path.join(out_dir, "cards_temp", name)
                os.makedirs(os.path.dirname(p), exist_ok=True)
                with open(p, "wb") as f:
                    f.write(raw)
                paths.append(p)
            bg_path = None
            if bg_type == "custom" and bg_base64:
                raw = base64.b64decode(bg_base64.split("base64,")[-1])
                bg_path = os.path.join(out_dir, "bg_temp.jpg")
                with open(bg_path, "wb") as f:
                    f.write(raw)
            layout_data = build_layout_data(paths, aspect, layout_idx, bg_path, out_dir)
            html_path = os.path.join(out_dir, "portfolio.html")
            export_html(layout_data, html_path)
            for p in paths:
                try:
                    os.remove(p)
                except OSError:
                    pass
            return jsonify({
                "success": True,
                "htmlPath": html_path,
                "layout": layout_data,
                "message": f"Создано: {html_path}",
            })
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
    print("Консоль: http://127.0.0.1:5050")
    print("Откройте в браузере для работы с портфолио.")
    app.run(host="127.0.0.1", port=5050, debug=False, threaded=True)


def _main(state):
    """Возвращает (path, error_msg, state). state хранит paths, aspect, bg_path для «повторить»."""
    log("\n--- новый запуск ---")
    reuse = bool(state.get("paths"))
    if reuse:
        CARD_ASPECT = state["aspect"]
        paths = state["paths"]
        bg_path = state.get("bg_path")
        log("Повтор: те же карточки, пропорция, фон.")
    else:
        CARD_ASPECT = choose_aspect()
        bg_path = choose_background()
        paths = pick_card_files()
        state["aspect"] = CARD_ASPECT
        state["paths"] = paths
        state["bg_path"] = bg_path
    aspect_label = "1:1" if CARD_ASPECT == 1.0 else "3:4"
    log(f"Пропорция: {aspect_label}")

    lay_idx = choose_layout()
    log(f"Вёрстка: {lay_idx + 1}")
    layout = LAYOUTS[lay_idx]

    if not paths:
        log("Карточки не выбраны. Выход.")
        return (None, "Карточки не выбраны. Выберите файлы в диалоге.", state)
    log(f"Выбрано файлов: {len(paths)}")

    # Режим вывода: PNG или HTML
    if not reuse:
        print("\nВывод: 1 — PNG (склейка), 2 — HTML (интерактивный)")
        try:
            out_mode = (input("Режим (1–2) [2]: ").strip() or "2")
            state["output_mode"] = "png" if out_mode == "1" else "html"
        except (ValueError, EOFError):
            state["output_mode"] = "html"
    output_mode = state.get("output_mode", "html")
    SINGLE_HEIGHT = int(COLUMN_WIDTH / CARD_ASPECT)

    # Сортируем по номеру _01, _02…
    ordered = [(card_index(p), p, is_wide_card(p)) for p in paths]
    ordered.sort(key=lambda x: (x[0], x[1]))
    plus = [(idx, p) for idx, p, wide in ordered if wide]
    normal = [(idx, p) for idx, p, wide in ordered if not wide]

    wide_idx = [i for i, s in enumerate(layout) if s[2] >= 2]
    narrow_idx = [i for i in range(10) if i not in wide_idx]
    n_wide = len(wide_idx)
    n_narrow = len(narrow_idx)

    n_cards = len(ordered)
    n_cycles = (n_cards + 9) // 10
    n_wide_total = n_wide * n_cycles
    n_narrow_total = n_narrow * n_cycles
    if len(plus) > n_wide_total:
        m = f"Карточек _+ ({len(plus)}) больше, чем слотов на 2 колонки ({n_wide_total}). Уменьшите число _+ или добавьте карточки."
        log(f"ERROR: {m}")
        return (None, m, state)
    if len(normal) > n_narrow_total:
        m = f"Обычных карточек ({len(normal)}) больше, чем узких слотов ({n_narrow_total})."
        log(f"ERROR: {m}")
        return (None, m, state)

    cards_with_img = []
    for (idx, p, _) in ordered:
        try:
            img = Image.open(p).convert("RGB")
            name = os.path.basename(p)
            wide = is_wide_card(p)
            cards_with_img.append((idx, name, img, wide))
        except Exception as e:
            log(f"Пропуск {p}: {e}")
    if not cards_with_img:
        log("ERROR: ни одна карточка не загружена.")
        return (None, "Ни одна карточка не загружена. Проверьте форматы файлов.", state)

    plus_cards = [c for c in cards_with_img if c[3]]
    normal_cards = [c for c in cards_with_img if not c[3]]
    plus_list = list(plus_cards)
    normal_list = list(normal_cards)

    wide_slots = []
    narrow_slots = []
    for c in range(n_cycles):
        for i in range(10):
            g = c * 10 + i
            if g >= n_cards:
                break
            if i in wide_idx:
                wide_slots.append(g)
            else:
                narrow_slots.append(g)

    slot_to_card = {}
    for g in wide_slots:
        card = plus_list.pop(0) if plus_list else normal_list.pop(0)
        slot_to_card[g] = card
    for g in narrow_slots:
        slot_to_card[g] = normal_list.pop(0)

    first_card = cards_with_img[0]
    for g in slot_to_card:
        card = slot_to_card[g]
        slot_to_card[g] = (card, card[1] == first_card[1])

    rows_per_cycle = layout_height_rows(layout)
    content_h = MARGIN_LEFT_RIGHT

    def rect(i):
        s = layout[i % 10]
        ro = (i // 10) * rows_per_cycle
        return slot_to_rect(s[0], s[1] + ro, s[2], s[3], SINGLE_HEIGHT)

    for i in range(n_cards):
        _, y, _, h = rect(i)
        content_h = max(content_h, y + h)
    content_h += MARGIN_LEFT_RIGHT
    final_h = int(content_h * 1.05)
    log(f"Карточек: {n_cards}, циклов: {n_cycles}, высота: {final_h}px")

    if output_mode == "html":
        try:
            layout_data = build_layout_data(paths, CARD_ASPECT, lay_idx, bg_path, ROOT)
            html_path = os.path.join(ROOT, f"portfolio_1440x{final_h}.html")
            export_html(layout_data, html_path)
            log("✓ HTML готов.")
            return (html_path, None, state)
        except Exception as e:
            tb = traceback.format_exc()
            log(f"ERROR HTML: {e}\n{tb}")
            return (None, f"Ошибка: {e}", state)

    bg = load_background(final_h, explicit_path=bg_path)
    log("\n=== Размещение ===")
    for i in range(n_cards):
        if i not in slot_to_card:
            continue
        card, hero = slot_to_card[i]
        x, y, w, h = rect(i)
        log(f"  {i+1}: {card[1]} -> {w}x{h} {'[HERO]' if hero else ''}")
        place(bg, card[2], x, y, w, h, hero=hero)

    out = os.path.join(ROOT, f"portfolio_1440x{final_h}.png")
    try:
        bg.save(out, "PNG", quality=95)
        log("✓ Готово.")
        return (out, None, state)
    except Exception as e:
        tb = traceback.format_exc()
        log(f"ERROR сохранения: {e}\n{tb}")
        return (None, f"Ошибка сохранения: {e}", state)

if __name__ == "__main__":
    main()
