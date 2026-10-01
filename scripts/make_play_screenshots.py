"""Planly store screenshots: in-app layouts + App Store frames (minimal gray, English UI)."""
from datetime import date, timedelta
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
APP_STORE = OUT / "app-store"
W, H = 1080, 1920
AS_W, AS_H = 1284, 2778  # iPhone 6.5" / 6.7" App Store Connect
IPAD_AS_W, IPAD_AS_H = 2064, 2752  # 13-inch iPad Display (App Store Connect)
S = W / 390  # ~2.769 — RN layout is designed around ~390pt

C = {
    "bg": "#FAFAFA",
    "bg_top": "#F1F5F9",
    "bg_bottom": "#FAFAFA",
    "surface": "#FFFFFF",
    "subtle": "#F4F4F5",
    "primary": "#18181B",
    "primary_light": "#F1F5F9",
    "on_primary": "#FAFAFA",
    "text": "#0F172A",
    "muted": "#64748B",
    "tertiary": "#94A3B8",
    "success": "#15803D",
    "warning": "#B45309",
    "danger": "#B91C1C",
    "border": "#E4E4E7",
    "border_strong": "#D4D4D8",
    "done_bg": "#ECFDF5",
    "done_tx": "#166534",
    "pend_bg": "#FFFBEB",
    "pend_tx": "#B45309",
    "cta": "#3D3E44",
    "cta_deep": "#27272A",
    "hero_start": "#18181B",
    "hero_end": "#3F3F46",
    "hero_date": "#A1A1AA",
    "hero_title": "#FAFAFA",
    "bar_track": "#E4E4E7",
    "bar_fill": "#27272A",
}


def px(n):
    return int(round(n * S))


def font(size, bold=False, serif=False):
    size = max(10, int(round(size * S / 2.2))) if size < 40 else int(round(size))
    # size already in px when passed as design-pt * we convert below
    return _font(size, bold, serif)


def fpt(pt, bold=False, serif=False):
    return _font(max(11, int(round(pt * S))), bold, serif)


def _font(px_size, bold=False, serif=False, light=False):
    fonts = Path(r"C:\Windows\Fonts")
    if serif:
        for name in ("georgia.ttf", "times.ttf"):
            p = fonts / name
            if p.exists():
                return ImageFont.truetype(str(p), px_size)
    if light:
        for name in ("segoeuil.ttf", "segoeui.ttf"):
            p = fonts / name
            if p.exists():
                return ImageFont.truetype(str(p), px_size)
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    p = fonts / name
    if p.exists():
        return ImageFont.truetype(str(p), px_size)
    return ImageFont.load_default()


def fpt_light(pt):
    return _font(max(11, int(round(pt * S))), False, False, light=True)


def rr(draw, box, r, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def screen_canvas():
    """Soft vertical wash — less flat than a single fill."""
    base = _gradient_vertical((W, H), C["bg_top"], C["bg_bottom"])
    return base.convert("RGBA")


def card(img, box, r=18, shadow=True):
    x0, y0, x1, y1 = box
    if shadow:
        for dx, dy, alpha, blur in ((0, 4, 10, 5), (0, 10, 14, 12)):
            sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
            sd = ImageDraw.Draw(sh)
            sd.rounded_rectangle((x0 + dx, y0 + dy, x1 + dx, y1 + dy + 2), r, fill=(15, 23, 42, alpha))
            sh = sh.filter(ImageFilter.GaussianBlur(blur))
            img.alpha_composite(sh)
    d = ImageDraw.Draw(img)
    rr(d, box, r, C["surface"], C["border"], 1)
    return d


def progress_bar(d, box, ratio, fill=None, track=None):
    x0, y0, x1, y1 = box
    fill = fill or C["bar_fill"]
    track = track or C["bar_track"]
    h = y1 - y0
    rr(d, box, h // 2, track, None, 0)
    w = max(int((x1 - x0) * ratio), h)
    rr(d, (x0, y0, x0 + w, y1), h // 2, fill, None, 0)


def draw_hero_band(img, height, rounded_bottom=True):
    """Dark zinc gradient header band."""
    band = Image.new("RGBA", (W, height + px(28)), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    for y in range(height + px(28)):
        t = y / max(height + px(28) - 1, 1)
        top = _hex_rgb(C["hero_start"])
        bot = _hex_rgb(C["hero_end"])
        row = tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3))
        bd.line((0, y, W, y), fill=row + (255,))
    if rounded_bottom:
        mask = Image.new("L", band.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, W, height + px(22)), px(28), fill=255)
        ImageDraw.Draw(mask).rectangle((0, 0, W, height - px(18)), fill=255)
        band.putalpha(mask)
    img.alpha_composite(band, (0, 0))


def brand_mark(img, x, y, size):
    for name in ("brand-logo-source.png", "icon.png", "play-icon-512.png"):
        p = OUT / name
        if not p.exists():
            p = ROOT / "assets" / name
        if p.exists():
            mark = Image.open(p).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
            # rounded
            mask = Image.new("L", (size, size), 0)
            ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), int(size * 0.22), fill=255)
            img.paste(mark, (x, y), mask)
            return
    d = ImageDraw.Draw(img)
    rr(d, (x, y, x + size, y + size), int(size * 0.22), C["primary"])
    d.text((x + size / 2, y + size / 2), "P", font=fpt(16, True), fill="white", anchor="mm")


def icon_home(d, cx, cy, color, filled=False):
    s = px(9)
    d.polygon([(cx, cy - s), (cx - s, cy), (cx - s, cy + s), (cx + s, cy + s), (cx + s, cy)], outline=color, width=3)
    if filled:
        d.polygon([(cx, cy - s + 2), (cx - s + 2, cy + 1), (cx - s + 2, cy + s), (cx + s - 2, cy + s), (cx + s - 2, cy + 1)], fill=color)


def icon_check(d, cx, cy, color, filled=False):
    r = px(10)
    d.rounded_rectangle((cx - r, cy - r, cx + r, cy + r), 4, outline=color, width=3, fill=color if filled else None)
    d.line((cx - 5, cy, cx - 1, cy + 5, cx + 7, cy - 5), fill="white" if filled else color, width=3)


def icon_chart(d, cx, cy, color):
    d.rectangle((cx - 10, cy + 2, cx - 4, cy + 10), fill=color)
    d.rectangle((cx - 2, cy - 4, cx + 4, cy + 10), fill=color)
    d.rectangle((cx + 6, cy - 10, cx + 12, cy + 10), fill=color)


def icon_gear(d, cx, cy, color):
    d.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), outline=color, width=3)
    d.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=color)


def tab_bar(img, active):
    d = ImageDraw.Draw(img)
    y = H - px(82)
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rectangle((0, y - 6, W, H), fill=(15, 23, 42, 8))
    sh = sh.filter(ImageFilter.GaussianBlur(8))
    img.alpha_composite(sh)
    d = ImageDraw.Draw(img)
    d.rectangle((0, y, W, H), fill=C["surface"])
    d.line((px(16), y, W - px(16), y), fill=C["border"], width=1)
    tabs = [
        ("Home", "home"),
        ("Tasks", "tasks"),
        ("Stats", "stats"),
        ("Settings", "settings"),
    ]
    slot = W / 4
    for i, (label, key) in enumerate(tabs):
        cx = int(slot * i + slot / 2)
        on = key == active
        col = C["primary"] if on else C["tertiary"]
        iy = y + px(14)
        if on:
            pill_w = px(52)
            rr(d, (cx - pill_w // 2, y + px(6), cx + pill_w // 2, y + px(38)), px(14), C["subtle"], None, 0)
        if key == "home":
            icon_home(d, cx, iy, col, filled=on)
        elif key == "tasks":
            icon_check(d, cx, iy, col, filled=on)
        elif key == "stats":
            icon_chart(d, cx, iy, col if on else C["tertiary"])
        else:
            icon_gear(d, cx, iy, col)
        d.text((cx, y + px(38)), label, font=fpt(10, on), fill=col, anchor="mt")


def section_header(d, x, y, title, subtitle=None):
    d.rounded_rectangle((x, y + 2, x + px(3), y + px(26)), 2, fill=C["cta"])
    d.text((x + px(12), y), title, font=fpt(19, True), fill=C["text"])
    if subtitle:
        d.text((x + px(12), y + px(24)), subtitle, font=fpt(12), fill=C["muted"])
        return y + px(50)
    return y + px(34)


def module_icon(d, cx, cy, kind):
    s = px(8)
    col = C["primary"]
    if kind == "list":
        for i in range(3):
            yy = cy - s + i * (s * 0.55)
            d.rounded_rectangle((cx - s, yy, cx + s, yy + px(3)), 2, fill=col)
    elif kind == "plan":
        d.rounded_rectangle((cx - s, cy - s, cx + s, cy + s), px(4), outline=col, width=2)
        d.line((cx - s + 2, cy - s + px(6), cx + s - 2, cy - s + px(6)), fill=col, width=2)
    elif kind == "stats":
        icon_chart(d, cx, cy, col)
    else:
        d.ellipse((cx - s * 0.55, cy - s, cx + s * 0.55, cy - s * 0.2), outline=col, width=2)
        d.rectangle((cx - px(2), cy - s * 0.15, cx + px(2), cy + s * 0.5), fill=col)


def task_row(img, x, y, w, title, time, done, priority):
    h = px(68)
    d = card(img, (x, y, x + w, y + h), r=px(18))
    stripe = {"high": C["danger"], "medium": C["warning"], "low": C["success"]}[priority]
    d.rounded_rectangle((x + px(8), y + px(12), x + px(12), y + h - px(12)), 4, fill=stripe)
    # complete
    cx, cy = x + px(32), y + h // 2 - px(6)
    d.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), outline=C["success"], width=2)
    d.text((cx, y + h - px(14)), "Undo" if done else "Done", font=fpt(8, True), fill=C["success"], anchor="ms")
    # title + time
    tx = x + px(52)
    title_font = fpt(15, True)
    d.text((tx, y + px(16)), title, font=title_font, fill=C["muted"] if done else C["text"])
    if done:
        tw = d.textlength(title, font=title_font)
        d.line((tx, y + px(24), tx + tw, y + px(24)), fill=C["muted"], width=2)
    d.text((tx, y + px(40)), time, font=fpt(12, True), fill=C["tertiary"])
    # badge
    label = "Completed" if done else "Pending"
    bg, tc = (C["done_bg"], C["done_tx"]) if done else (C["pend_bg"], C["pend_tx"])
    bw = int(d.textlength(label, font=fpt(11, True))) + px(22)
    bx1 = x + w - px(52) - bw
    rr(d, (bx1, y + px(22), bx1 + bw, y + px(44)), 20, bg, C["border"], 1)
    d.text((bx1 + bw / 2, y + px(33)), label, font=fpt(11, True), fill=tc, anchor="mm")
    # delete
    dx = x + w - px(28)
    d.text((dx, y + px(22)), "✕", font=fpt(14), fill=C["danger"], anchor="mm")
    d.text((dx, y + h - px(14)), "Delete", font=fpt(8, True), fill=C["danger"], anchor="ms")
    return y + h + px(14)


def module_card(d, box, title, subtitle, icon_kind="list"):
    x0, y0, x1, y1 = box
    rr(d, box, px(16), C["surface"], C["border"], 1)
    ix0, iy0 = x0 + px(12), y0 + px(14)
    rr(d, (ix0, iy0, ix0 + px(38), iy0 + px(38)), px(11), C["primary_light"], C["border"], 1)
    module_icon(d, ix0 + px(19), iy0 + px(19), icon_kind)
    d.text((x0 + px(58), y0 + px(16)), title, font=fpt(13, True), fill=C["text"])
    d.text((x0 + px(58), y0 + px(36)), subtitle, font=fpt(10), fill=C["muted"])


# datetime.weekday(): Monday=0 … Sunday=6 (en-US store screenshots)
_DAYS = "Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split()
_DAYS_U = [x.upper() for x in _DAYS]
_MONTHS = "January February March April May June July August September October November December".split()
_MONTHS_U = [x.upper() for x in _MONTHS]
_DOW_SHORT = "Mon Tue Wed Thu Fri Sat Sun".split()


def today_caps(d=None):
    d = d or date.today()
    return f"{_DAYS_U[d.weekday()]}, {d.day} {_MONTHS_U[d.month - 1]} {d.year}"


def format_long(d):
    return f"{_DAYS[d.weekday()]}, {d.day} {_MONTHS[d.month - 1]} {d.year}"


def home():
    img = screen_canvas()
    d = ImageDraw.Draw(img)
    pad = px(20)
    hero_h = px(172)
    draw_hero_band(img, hero_h)
    d = ImageDraw.Draw(img)
    brand_mark(img, px(22), px(20), px(36))
    d.text((px(68), px(28)), "PLANLY", font=fpt(11, True), fill=C["hero_title"])
    d.text((px(22), px(66)), today_caps(), font=fpt(10, True), fill=C["hero_date"])
    d.text((px(22), px(92)), "Hello", font=fpt_light(36), fill=C["hero_title"])
    d.text((px(22), px(138)), "Focus on today's plan.", font=fpt(14), fill=C["hero_date"])

    y = hero_h - px(8)
    # summary
    card(img, (pad, y, W - pad, y + px(168)), r=px(24))
    d = ImageDraw.Draw(img)
    d.text((pad + px(22), y + px(16)), "Today's summary", font=fpt(13, True), fill=C["text"])
    d.text((pad + px(22), y + px(42)), "TODAY'S PROGRESS", font=fpt(12, True), fill=C["muted"])
    d.text((W - pad - px(22), y + px(36)), "40", font=fpt(30, True), fill=C["muted"], anchor="rt")
    d.text((W - pad - px(8), y + px(52)), "%", font=fpt(14, True), fill=C["muted"], anchor="rt")
    track = (pad + px(22), y + px(82), W - pad - px(22), y + px(98))
    progress_bar(d, track, 0.4)
    d.text((pad + px(22), y + px(108)), "Today 2/5 tasks · 1 done · 1 left", font=fpt(14, True), fill=C["text"])
    d.text((pad + px(22), y + px(136)), "40% progress · 5 tasks for 100%.", font=fpt(12), fill=C["tertiary"])
    y += px(184)

    # stats
    gap = px(10)
    sw = (W - pad * 2 - gap * 2) // 3
    stats = [("2", "Total tasks", C["primary"]), ("1", "Left", C["warning"]), ("1", "Done", C["success"])]
    for i, (val, lab, accent) in enumerate(stats):
        x = pad + i * (sw + gap)
        card(img, (x, y, x + sw, y + px(72)), r=px(18))
        d = ImageDraw.Draw(img)
        d.rectangle((x, y + px(8), x + px(3), y + px(64)), fill=accent)
        d.text((x + px(14), y + px(12)), val, font=fpt(21, True), fill=C["text"])
        d.text((x + px(14), y + px(42)), lab, font=fpt(10, True), fill=C["muted"])
    y += px(88)

    y = section_header(d, pad, y, "Modules", "Tasks, stats, and settings")
    cw = (W - pad * 2 - px(12)) // 2
    ch = px(80)
    modules = [
        ("To-dos", "1/2 completed", "list"),
        ("Task plan", "Weekly strip · Tasks", "plan"),
        ("Statistics", "18 completion pts", "stats"),
        ("Reminders", "In-day reminders", "bell"),
    ]
    for i, (t, s, ik) in enumerate(modules):
        col, row = i % 2, i // 2
        x = pad + col * (cw + px(12))
        yy = y + row * (ch + px(12))
        module_card(d, (x, yy, x + cw, yy + ch), t, s, ik)
    y += ch * 2 + px(36)

    y = section_header(d, pad, y, "Today's tasks")
    # quote
    card(img, (pad, y, W - pad, y + px(88)), r=px(18))
    d = ImageDraw.Draw(img)
    rr(d, (pad + px(22), y + px(14), pad + px(22) + px(132), y + px(32)), 999, C["subtle"], C["border"], 1)
    d.text((pad + px(88), y + px(23)), "DAILY MOTIVATION", font=fpt(9, True), fill=C["muted"], anchor="mm")
    d.text(((W) / 2, y + px(52)), "Small steps, a clear day.", font=fpt(15, True), fill=C["text"], anchor="mt")
    y += px(106)

    y = task_row(img, pad, y, W - pad * 2, "Finish presentation slides", "09:00", True, "high")
    y = task_row(img, pad, y, W - pad * 2, "Evening walk", "18:30", False, "medium")

    rr(d, (pad, y, W - pad, y + px(52)), px(18), C["cta"])
    d.text((W / 2, y + px(26)), "+ Add task", font=fpt(16, True), fill=C["on_primary"], anchor="mm")
    d.text((W / 2, y + px(64)), "New tasks default to today's date.", font=fpt(12), fill=C["muted"], anchor="mt")

    tab_bar(img, "home")
    return img.convert("RGB")


def tasks_screen():
    img = screen_canvas()
    d = ImageDraw.Draw(img)
    pad = px(20)
    today = date.today()
    hero_h = px(124)
    d.rounded_rectangle((0, 0, W, hero_h + px(20)), px(28), fill=C["surface"])
    d.rectangle((0, 0, W, hero_h - px(16)), fill=C["surface"])
    d.line((px(20), hero_h + px(8), W - px(20), hero_h + px(8)), fill=C["border"], width=1)
    rr(d, (px(20), px(20), px(108), px(38)), 999, C["subtle"], C["border"], 1)
    d.text((px(64), px(29)), "TASKS", font=fpt(9, True), fill=C["muted"], anchor="mm")
    d.text((px(20), px(48)), "Tasks", font=fpt(28, True), fill=C["text"])
    d.text((px(20), px(88)), format_long(today), font=fpt(14), fill=C["muted"])

    y = hero_h - px(10)
    # date card
    card(img, (pad, y, W - pad, y + px(132)), r=px(18))
    d = ImageDraw.Draw(img)
    rr(d, (pad + px(12), y + px(12), pad + px(50), y + px(50)), px(10), C["subtle"], C["border_strong"], 1)
    d.text((pad + px(31), y + px(31)), "‹", font=fpt(18, True), fill=C["primary"], anchor="mm")
    d.text((W / 2, y + px(31)), format_long(today), font=fpt(16, True), fill=C["text"], anchor="mm")
    rr(d, (W - pad - px(50), y + px(12), W - pad - px(12), y + px(50)), px(10), C["subtle"], C["border_strong"], 1)
    d.text((W - pad - px(31), y + px(31)), "›", font=fpt(18, True), fill=C["primary"], anchor="mm")
    # week strip
    days = [today + timedelta(days=i) for i in range(-3, 4)]
    cell_w = (W - pad * 2 - px(24) - px(6) * 6) / 7
    for i, dd in enumerate(days):
        x0 = pad + px(12) + i * (cell_w + px(6))
        sel = dd == today
        box = (x0, y + px(62), x0 + cell_w, y + px(118))
        if sel:
            rr(d, box, px(12), C["primary"], None, 0)
            dow_col, day_col = C["on_primary"], C["on_primary"]
        else:
            rr(d, box, px(12), C["subtle"], C["border"], 1)
            dow_col, day_col = C["muted"], C["text"]
        d.text((x0 + cell_w / 2, y + px(76)), _DOW_SHORT[dd.weekday()], font=fpt(10, True), fill=dow_col, anchor="mt")
        d.text((x0 + cell_w / 2, y + px(94)), str(dd.day), font=fpt(13, True), fill=day_col, anchor="mt")
    y += px(148)

    card(img, (pad, y, W - pad, y + px(96)), r=px(18))
    d = ImageDraw.Draw(img)
    d.text((pad + px(14), y + px(10)), "Day progress", font=fpt(15, True), fill=C["muted"])
    d.text((W - pad - px(14), y + px(12)), "%40", font=fpt(14, True), fill=C["primary"], anchor="rt")
    tr = (pad + px(14), y + px(40), W - pad - px(14), y + px(54))
    progress_bar(d, tr, 0.4)
    d.text((pad + px(14), y + px(58)), "2 tasks · 1 done · 1 left", font=fpt(14, True), fill=C["text"])
    d.text((pad + px(14), y + px(78)), "Daily goal: 5 tasks for 100%", font=fpt(12), fill=C["tertiary"])
    y += px(112)

    card(img, (pad, y, W - pad, y + px(128)), r=px(18))
    d = ImageDraw.Draw(img)
    d.text((pad + px(14), y + px(12)), "Add task plan", font=fpt(16, True), fill=C["text"])
    d.text((pad + px(14), y + px(40)), "Add a new task for the selected day.", font=fpt(13), fill=C["muted"])
    rr(d, (pad + px(14), y + px(68), W - pad - px(14), y + px(114)), px(18), C["cta"])
    d.text((W / 2, y + px(91)), "+ Add task plan", font=fpt(16, True), fill=C["on_primary"], anchor="mm")
    y += px(144)

    card(img, (pad, y, W - pad, y + px(280)), r=px(16))
    d = ImageDraw.Draw(img)
    d.text((pad + px(10), y + px(10)), "Task list", font=fpt(15, True), fill=C["text"])
    pw = (W - pad * 2 - px(28)) // 2
    rr(d, (pad + px(10), y + px(40), pad + px(10) + pw, y + px(78)), px(12), C["subtle"], C["border"], 1)
    d.text((pad + px(10) + pw / 2, y + px(48)), "Total tasks", font=fpt(11, True), fill=C["muted"], anchor="mt")
    d.text((pad + px(10) + pw / 2, y + px(64)), "2", font=fpt(14, True), fill=C["text"], anchor="mt")
    rr(d, (pad + px(18) + pw, y + px(40), pad + px(18) + pw * 2, y + px(78)), px(12), C["subtle"], C["border"], 1)
    d.text((pad + px(18) + pw * 1.5, y + px(48)), "Completed", font=fpt(11, True), fill=C["muted"], anchor="mt")
    d.text((pad + px(18) + pw * 1.5, y + px(64)), "1", font=fpt(14, True), fill=C["text"], anchor="mt")
    y = task_row(img, pad + px(10), y + px(90), W - pad * 2 - px(20), "Finish presentation slides", "09:00", True, "high")
    task_row(img, pad + px(10), y, W - pad * 2 - px(20), "Evening walk", "18:30", False, "medium")

    tab_bar(img, "tasks")
    return img.convert("RGB")


def stats_screen():
    img = screen_canvas()
    d = ImageDraw.Draw(img)
    pad = px(20)
    hero_h = px(124)
    d.rounded_rectangle((0, 0, W, hero_h + px(20)), px(28), fill=C["surface"])
    d.rectangle((0, 0, W, hero_h - px(16)), fill=C["surface"])
    d.line((px(20), hero_h + px(8), W - px(20), hero_h + px(8)), fill=C["border"], width=1)
    rr(d, (px(20), px(20), px(96), px(38)), 999, C["subtle"], C["border"], 1)
    d.text((px(58), px(29)), "SUMMARY", font=fpt(9, True), fill=C["muted"], anchor="mm")
    d.text((px(20), px(48)), "Statistics", font=fpt(28, True), fill=C["text"])
    d.text((px(20), px(88)), "Daily, weekly, monthly, or yearly charts.", font=fpt(13), fill=C["muted"])

    y = hero_h - px(8)
    card(img, (pad, y, W - pad, y + px(118)), r=px(22))
    d = ImageDraw.Draw(img)
    d.text((pad + px(16), y + px(12)), "OVERVIEW", font=fpt(11, True), fill=C["muted"])
    gap = px(10)
    pw = (W - pad * 2 - px(32) - gap * 2) // 3
    pills = [("12", "Total tasks"), ("5", "Pending"), ("18", "Completion pts")]
    for i, (val, lab) in enumerate(pills):
        x = pad + px(16) + i * (pw + gap)
        rr(d, (x, y + px(36), x + pw, y + px(98)), px(18), C["subtle"], C["border"], 1)
        d.text((x + px(12), y + px(46)), val, font=fpt(22, True), fill=C["text"])
        d.text((x + px(12), y + px(76)), lab, font=fpt(10, True), fill=C["muted"])
    y += px(132)

    card(img, (pad, y, W - pad, y + px(52)), r=px(18))
    d = ImageDraw.Draw(img)
    d.text((pad + px(14), y + px(10)), "Tier 2", font=fpt(12, True), fill=C["primary"])
    d.text((W - pad - px(14), y + px(10)), "8/10 on this step", font=fpt(11, True), fill=C["muted"], anchor="rt")
    tr = (pad + px(14), y + px(30), W - pad - px(14), y + px(44))
    progress_bar(d, tr, 0.8)
    y += px(64)

    card(img, (pad, y, W - pad, y + px(420)), r=px(22))
    d = ImageDraw.Draw(img)
    rr(d, (pad + px(14), y + px(14), pad + px(72), y + px(36)), 999, C["primary_light"], C["border"], 1)
    d.text((pad + px(43), y + px(25)), "WEEKLY", font=fpt(9, True), fill=C["primary"], anchor="mm")
    d.text((pad + px(14), y + px(48)), "Weekly completion breakdown", font=fpt(16, True), fill=C["text"])
    d.text((pad + px(14), y + px(72)), "Last 8 weeks (Mon–Sun): weekly totals", font=fpt(12), fill=C["muted"])
    chips = ["Daily", "Weekly", "Monthly", "Yearly"]
    cx = pad + px(14)
    for i, ch in enumerate(chips):
        on = ch == "Weekly"
        tw = int(d.textlength(ch, font=fpt(11, True))) + px(24)
        rr(d, (cx, y + px(96), cx + tw, y + px(124)), 999, C["primary"] if on else C["subtle"], C["primary"] if on else C["border"], 1)
        d.text((cx + tw / 2, y + px(110)), ch, font=fpt(11, True), fill=C["on_primary"] if on else C["muted"], anchor="mm")
        cx += tw + px(8)

    plot_y = y + px(140)
    plot_h = px(168)
    rr(d, (pad + px(14), plot_y, W - pad - px(14), plot_y + plot_h + px(36)), px(18), "#FFFFFF", C["border"], 1)
    d.text((pad + px(22), plot_y + px(10)), "Completed (count)", font=fpt(10, True), fill=C["muted"])
    bars = [3, 5, 2, 6, 4, 7, 5]
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    inner_l = pad + px(54)
    inner_r = W - pad - px(22)
    inner_b = plot_y + plot_h
    inner_t = plot_y + px(28)
    max_b = max(bars)
    col_w = (inner_r - inner_l) / len(bars)
    for i, (b, lab) in enumerate(zip(bars, labels)):
        bh = int((inner_b - inner_t - px(8)) * (b / max_b))
        cx = inner_l + col_w * i + col_w / 2
        x0 = int(cx - col_w * 0.28)
        x1 = int(cx + col_w * 0.28)
        y1 = inner_b - px(4)
        y0 = y1 - bh
        highlight = i == 6
        fill = C["primary"] if highlight else "#A1A1AA"
        rr(d, (x0, y0, x1, y1), px(6), fill)
        d.text((cx, y1 + px(10)), lab, font=fpt(10, True), fill=C["muted"], anchor="mt")
        if highlight:
            d.text((cx, y0 - px(6)), str(b), font=fpt(10, True), fill=C["text"], anchor="mb")
    d.text((pad + px(14), plot_y + plot_h + px(14)), "67% completion rate · Points grow as you finish tasks", font=fpt(12), fill=C["muted"])
    y += px(436)

    card(img, (pad, y, W - pad, y + px(100)), r=px(18))
    d = ImageDraw.Draw(img)
    d.text((pad + px(14), y + px(12)), "TODAY & WEEK", font=fpt(11, True), fill=C["muted"])
    d.text((pad + px(14), y + px(34)), "Week (Mon–Sun)", font=fpt(15, True), fill=C["text"])
    d.text((pad + px(14), y + px(58)), "2 today · 7 completed this week", font=fpt(13), fill=C["muted"])

    tab_bar(img, "stats")
    return img.convert("RGB")


def stats_premium_review_screen():
    """App Store Connect subscription review — Premium on Statistics."""
    img = screen_canvas()
    d = ImageDraw.Draw(img)
    pad = px(20)
    hero_h = px(124)
    d.rounded_rectangle((0, 0, W, hero_h + px(20)), px(28), fill=C["surface"])
    d.rectangle((0, 0, W, hero_h - px(16)), fill=C["surface"])
    d.line((px(20), hero_h + px(8), W - px(20), hero_h + px(8)), fill=C["border"], width=1)
    rr(d, (px(20), px(20), px(96), px(38)), 999, C["subtle"], C["border"], 1)
    d.text((px(58), px(29)), "SUMMARY", font=fpt(9, True), fill=C["muted"], anchor="mm")
    d.text((px(20), px(48)), "Statistics", font=fpt(28, True), fill=C["text"])
    d.text((px(20), px(88)), "Daily, weekly, monthly, or yearly charts.", font=fpt(13), fill=C["muted"])

    y = hero_h + px(4)
    prem_h = px(178)
    card(img, (pad, y, W - pad, y + prem_h), r=px(22))
    d = ImageDraw.Draw(img)
    d.text((pad + px(16), y + px(14)), "PREMIUM", font=fpt(10, True), fill=C["muted"])
    d.text((pad + px(16), y + px(36)), "Planly Premium", font=fpt(20, True), fill=C["text"])
    body = "Weekly, monthly, and yearly charts plus Premium benefits."
    d.text((pad + px(16), y + px(68)), body, font=fpt(12), fill=C["muted"])
    btn_y0 = y + px(102)
    btn_y1 = y + prem_h - px(14)
    rr(d, (pad + px(16), btn_y0, W - pad - px(16), btn_y1), px(16), C["cta"], None, 0)
    d.text(
        ((pad + px(16) + W - pad - px(16)) / 2, (btn_y0 + btn_y1) / 2),
        "Get Premium",
        font=fpt(15, True),
        fill=C["on_primary"],
        anchor="mm",
    )
    y += prem_h + px(14)

    card(img, (pad, y, W - pad, y + px(88)), r=px(18))
    d = ImageDraw.Draw(img)
    d.text((pad + px(14), y + px(12)), "OVERVIEW", font=fpt(11, True), fill=C["muted"])
    d.text((pad + px(14), y + px(38)), "12 total · 5 completed · 18 pts", font=fpt(13), fill=C["text"])

    tab_bar(img, "stats")
    return img.convert("RGB")


def _hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def _gradient_vertical(size, top, bottom):
    w, h = size
    t = _hex_rgb(top)
    b = _hex_rgb(bottom)
    img = Image.new("RGB", size)
    px_row = img.load()
    for y in range(h):
        f = y / max(h - 1, 1)
        row = tuple(int(t[i] + (b[i] - t[i]) * f) for i in range(3))
        for x in range(w):
            px_row[x, y] = row
    return img


def _rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius, fill=255)
    return mask


def compose_store_minimal(screen_rgb, out_w, out_h, margin_ratio=0.045):
    """App UI on soft gray background — no device frame or marketing copy."""
    canvas = _gradient_vertical((out_w, out_h), C["bg_top"], C["bg_bottom"])
    sw, sh = screen_rgb.size
    max_w = int(out_w * (1 - margin_ratio * 2))
    max_h = int(out_h * (1 - margin_ratio * 2))
    scale = min(max_w / sw, max_h / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    scaled = screen_rgb.resize((nw, nh), Image.Resampling.LANCZOS)
    x, y = (out_w - nw) // 2, (out_h - nh) // 2
    radius = max(28, int(min(nw, nh) * 0.024))

    shadow = Image.new("RGBA", (out_w, out_h), (0, 0, 0, 0))
    off = max(10, int(out_w * 0.006))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (x + off, y + off + 8, x + nw + off, y + nh + off + 8),
        radius,
        fill=(15, 23, 42, 18),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(14, int(out_w * 0.012))))

    canvas = canvas.convert("RGBA")
    canvas.alpha_composite(shadow)
    mask = _rounded_mask((nw, nh), radius)
    layer = Image.new("RGBA", (out_w, out_h), (0, 0, 0, 0))
    layer.paste(scaled.convert("RGBA"), (x, y), mask)
    canvas.alpha_composite(layer)
    return canvas.convert("RGB")


APP_STORE_KEYS = ("home", "tasks", "stats")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    APP_STORE.mkdir(parents=True, exist_ok=True)
    stale = APP_STORE / "04-home-1284x2778.png"
    if stale.is_file():
        stale.unlink()
    store = ROOT / "store-assets"
    store.mkdir(parents=True, exist_ok=True)

    screens = {
        "home": home(),
        "tasks": tasks_screen(),
        "stats": stats_screen(),
    }

    for folder in (OUT, store):
        screens["home"].save(folder / "play-phone-home.png", "PNG", optimize=True)
        screens["tasks"].save(folder / "play-phone-tasks.png", "PNG", optimize=True)
        screens["stats"].save(folder / "play-phone-stats.png", "PNG", optimize=True)

    for i, key in enumerate(APP_STORE_KEYS, start=1):
        framed = compose_store_minimal(screens[key], AS_W, AS_H)
        name = f"{i:02d}-{key}-1284x2778.png"
        framed.save(APP_STORE / name, "PNG", optimize=True)
        framed.save(store / f"app-store-{name}", "PNG", optimize=True)

    for i, key in enumerate(APP_STORE_KEYS, start=1):
        framed = compose_store_minimal(screens[key], IPAD_AS_W, IPAD_AS_H, margin_ratio=0.055)
        name = f"ipad-{i:02d}-{key}-2064x2752.png"
        framed.save(APP_STORE / name, "PNG", optimize=True)
        framed.save(store / f"app-store-{name}", "PNG", optimize=True)

    review = stats_premium_review_screen()
    review_name = "ios-subscription-review-1080x1920.png"
    review.save(APP_STORE / review_name, "PNG", optimize=True)

    print("Phone (1080x1920):")
    print(" ", OUT / "play-phone-home.png")
    print(" ", OUT / "play-phone-tasks.png")
    print(" ", OUT / "play-phone-stats.png")
    print(" ", APP_STORE / review_name, "(abonelik inceleme ekran görüntüsü)")
    print("App Store iPhone 6.5\" (1284x2778) — sırayla yükleyin:")
    for p in sorted(APP_STORE.glob("*1284x2778*.png")):
        print(" ", p)
    print("App Store iPad 13\" (2064x2752) — iPad ekran görüntüleri:")
    for p in sorted(APP_STORE.glob("ipad-*2064x2752*.png")):
        print(" ", p)


if __name__ == "__main__":
    main()
