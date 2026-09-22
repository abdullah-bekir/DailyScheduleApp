"""Play Store phone shots that follow Planly screen layout (Home + Tasks)."""
from datetime import date, timedelta
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
W, H = 1080, 1920
S = W / 390  # ~2.769 — RN layout is designed around ~390pt

C = {
    "bg": "#FAFAFA",
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
    "hero_date": "#B4B8BF",
    "hero_title": "#FAFAFA",
}


def px(n):
    return int(round(n * S))


def font(size, bold=False, serif=False):
    size = max(10, int(round(size * S / 2.2))) if size < 40 else int(round(size))
    # size already in px when passed as design-pt * we convert below
    return _font(size, bold, serif)


def fpt(pt, bold=False, serif=False):
    return _font(max(11, int(round(pt * S))), bold, serif)


def _font(px_size, bold=False, serif=False):
    fonts = Path(r"C:\Windows\Fonts")
    if serif:
        for name in ("georgia.ttf", "times.ttf"):
            p = fonts / name
            if p.exists():
                return ImageFont.truetype(str(p), px_size)
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    p = fonts / name
    if p.exists():
        return ImageFont.truetype(str(p), px_size)
    return ImageFont.load_default()


def rr(draw, box, r, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def card(img, box, r=18, shadow=True):
    x0, y0, x1, y1 = box
    if shadow:
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(sh)
        sd.rounded_rectangle((x0 + 2, y0 + 6, x1 + 2, y1 + 8), r, fill=(15, 23, 42, 18))
        sh = sh.filter(ImageFilter.GaussianBlur(6))
        img.alpha_composite(sh)
    d = ImageDraw.Draw(img)
    rr(d, box, r, C["surface"], C["border"], 2)
    return d


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
    y = H - px(78)
    d.rectangle((0, y, W, H), fill=C["surface"])
    tabs = [
        ("Ana sayfa", "home"),
        ("Görevler", "tasks"),
        ("İstatistikler", "stats"),
        ("Ayarlar", "settings"),
    ]
    slot = W / 4
    for i, (label, key) in enumerate(tabs):
        cx = int(slot * i + slot / 2)
        on = key == active
        col = C["primary"] if on else C["tertiary"]
        iy = y + px(16)
        if key == "home":
            icon_home(d, cx, iy, col, filled=on)
        elif key == "tasks":
            icon_check(d, cx, iy, col, filled=on)
        elif key == "stats":
            icon_chart(d, cx, iy, col)
        else:
            icon_gear(d, cx, iy, col)
        d.text((cx, y + px(36)), label, font=fpt(10, on), fill=col, anchor="mt")


def section_header(d, x, y, title, subtitle=None):
    d.rounded_rectangle((x, y + 4, x + px(4), y + px(30)), 4, fill=C["primary"])
    d.text((x + px(14), y), title, font=fpt(20, True), fill=C["text"])
    if subtitle:
        d.text((x + px(14), y + px(26)), subtitle, font=fpt(13), fill=C["muted"])
        return y + px(52)
    return y + px(36)


def task_row(img, x, y, w, title, time, done, priority):
    h = px(68)
    d = card(img, (x, y, x + w, y + h), r=px(18))
    stripe = {"high": C["danger"], "medium": C["warning"], "low": C["success"]}[priority]
    d.rounded_rectangle((x + px(8), y + px(12), x + px(12), y + h - px(12)), 4, fill=stripe)
    # complete
    cx, cy = x + px(32), y + h // 2 - px(6)
    d.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), outline=C["success"], width=2)
    d.text((cx, y + h - px(14)), "Geri al" if done else "Tamamla", font=fpt(8, True), fill=C["success"], anchor="ms")
    # title + time
    tx = x + px(52)
    title_font = fpt(15, True)
    d.text((tx, y + px(16)), title, font=title_font, fill=C["muted"] if done else C["text"])
    if done:
        tw = d.textlength(title, font=title_font)
        d.line((tx, y + px(24), tx + tw, y + px(24)), fill=C["muted"], width=2)
    d.text((tx, y + px(40)), time, font=fpt(12, True), fill=C["tertiary"])
    # badge
    label = "Tamamlanan" if done else "Bekliyor"
    bg, tc = (C["done_bg"], C["done_tx"]) if done else (C["pend_bg"], C["pend_tx"])
    bw = int(d.textlength(label, font=fpt(11, True))) + px(22)
    bx1 = x + w - px(52) - bw
    rr(d, (bx1, y + px(22), bx1 + bw, y + px(44)), 20, bg, C["border"], 1)
    d.text((bx1 + bw / 2, y + px(33)), label, font=fpt(11, True), fill=tc, anchor="mm")
    # delete
    dx = x + w - px(28)
    d.text((dx, y + px(22)), "✕", font=fpt(14), fill=C["danger"], anchor="mm")
    d.text((dx, y + h - px(14)), "Sil", font=fpt(8, True), fill=C["danger"], anchor="ms")
    return y + h + px(14)


def module_card(d, box, title, subtitle):
    x0, y0, x1, y1 = box
    rr(d, box, px(18), C["surface"], C["border"], 2)
    rr(d, (x0 + px(11), y0 + px(14), x0 + px(49), y0 + px(52)), px(12), C["primary_light"], C["border"], 1)
    d.text((x0 + px(30), y0 + px(33)), "▢", font=fpt(14), fill=C["primary"], anchor="mm")
    d.text((x0 + px(56), y0 + px(16)), title, font=fpt(13, True), fill=C["text"])
    d.text((x0 + px(56), y0 + px(36)), subtitle, font=fpt(11), fill=C["muted"])


# datetime.weekday(): Pazartesi=0 … Pazar=6 (uygulamadaki tr-TR ile aynı)
_DAYS = "Pazartesi Salı Çarşamba Perşembe Cuma Cumartesi Pazar".split()
_DAYS_U = [x.upper() for x in _DAYS]
_MONTHS = "Ocak Şubat Mart Nisan Mayıs Haziran Temmuz Ağustos Eylül Ekim Kasım Aralık".split()
_MONTHS_U = [x.upper() for x in _MONTHS]
_DOW_SHORT = "Pzt Sal Çar Per Cum Cmt Paz".split()


def today_caps(d=None):
    d = d or date.today()
    return f"{_DAYS_U[d.weekday()]}, {d.day} {_MONTHS_U[d.month - 1]} {d.year}"


def format_long(d):
    return f"{_DAYS[d.weekday()]}, {d.day} {_MONTHS[d.month - 1]} {d.year}"


def home():
    img = Image.new("RGBA", (W, H), C["bg"])
    d = ImageDraw.Draw(img)
    pad = px(20)
    # greeting hero
    hero_h = px(168)
    d.rounded_rectangle((0, 0, W, hero_h + px(22)), px(22), fill=C["cta"])
    d.rectangle((0, 0, W, hero_h - px(22)), fill=C["cta"])
    brand_mark(img, px(22), px(18), px(34))
    d.text((px(64), px(26)), "PLANLY", font=fpt(12, True), fill=C["hero_title"])
    d.text((px(22), px(62)), today_caps(), font=fpt(11), fill=C["hero_date"])
    d.text((px(22), px(88)), "Merhaba!", font=fpt(34, True, serif=True), fill=C["hero_title"])
    d.text((px(22), px(132)), "Bugünün planına odaklan.", font=fpt(15), fill=C["hero_date"])

    y = hero_h - px(8)
    # summary
    card(img, (pad, y, W - pad, y + px(168)), r=px(24))
    d = ImageDraw.Draw(img)
    d.text((pad + px(22), y + px(16)), "Bugünün Özeti", font=fpt(13, True), fill=C["text"])
    d.text((pad + px(22), y + px(42)), "BUGÜNÜN İLERLEMESİ", font=fpt(12, True), fill=C["muted"])
    d.text((W - pad - px(22), y + px(36)), "40", font=fpt(30, True), fill=C["muted"], anchor="rt")
    d.text((W - pad - px(8), y + px(52)), "%", font=fpt(14, True), fill=C["muted"], anchor="rt")
    track = (pad + px(22), y + px(82), W - pad - px(22), y + px(96))
    rr(d, track, 20, C["subtle"], C["border"], 1)
    fill_w = int((track[2] - track[0]) * 0.4)
    rr(d, (track[0], track[1], track[0] + fill_w, track[3]), 20, C["muted"])
    d.text((pad + px(22), y + px(108)), "Bugün 2/5 görev · 1 tamamlandı · 1 kalan", font=fpt(14, True), fill=C["text"])
    d.text((pad + px(22), y + px(136)), "İlerleme %40: 5 görev ekleyince %100.", font=fpt(12), fill=C["tertiary"])
    y += px(184)

    # stats
    gap = px(10)
    sw = (W - pad * 2 - gap * 2) // 3
    stats = [("2", "Toplam görev", C["primary"]), ("1", "Kalan", C["warning"]), ("1", "Tamamlanan", C["success"])]
    for i, (val, lab, accent) in enumerate(stats):
        x = pad + i * (sw + gap)
        card(img, (x, y, x + sw, y + px(72)), r=px(18))
        d = ImageDraw.Draw(img)
        d.rectangle((x, y + px(8), x + px(3), y + px(64)), fill=accent)
        d.text((x + px(14), y + px(12)), val, font=fpt(21, True), fill=C["text"])
        d.text((x + px(14), y + px(42)), lab, font=fpt(10, True), fill=C["muted"])
    y += px(88)

    y = section_header(d, pad, y, "Modüller", "Görevler, istatistik ve ayarlar")
    cw = (W - pad * 2 - px(12)) // 2
    ch = px(80)
    modules = [
        ("Yapılacaklar", "1/2 tamamlandı"),
        ("Görev planı", "Haftalık şerit · Görevler"),
        ("İstatistikler", "0 tamamlama puanı"),
        ("Hatırlatıcılar", "Şimdilik tercih; sistem bildirimi yakında"),
    ]
    for i, (t, s) in enumerate(modules):
        col, row = i % 2, i // 2
        x = pad + col * (cw + px(12))
        yy = y + row * (ch + px(12))
        module_card(d, (x, yy, x + cw, yy + ch), t, s)
    y += ch * 2 + px(36)

    y = section_header(d, pad, y, "Bugünün görevleri")
    # quote
    card(img, (pad, y, W - pad, y + px(88)), r=px(18))
    d = ImageDraw.Draw(img)
    d.text(((W) / 2, y + px(16)), "GÜNLÜK MOTİVASYON", font=fpt(11, True), fill=C["primary"], anchor="mt")
    d.text(((W) / 2, y + px(48)), "✨ Küçük adımlar, net bir gün.", font=fpt(14, True), fill=C["text"], anchor="mt")
    y += px(106)

    y = task_row(img, pad, y, W - pad * 2, "Sunum slaytlarını bitir", "09:00", True, "high")
    y = task_row(img, pad, y, W - pad * 2, "Akşam yürüyüşü", "18:30", False, "medium")

    rr(d, (pad, y, W - pad, y + px(52)), px(18), C["cta"])
    d.text((W / 2, y + px(26)), "+ Görev ekle", font=fpt(16, True), fill=C["on_primary"], anchor="mm")
    d.text((W / 2, y + px(64)), "Görevler varsayılan olarak bugünün tarihine eklenir.", font=fpt(12), fill=C["muted"], anchor="mt")

    tab_bar(img, "home")
    return img.convert("RGB")


def tasks_screen():
    img = Image.new("RGBA", (W, H), C["bg"])
    d = ImageDraw.Draw(img)
    pad = px(20)
    today = date.today()
    # default hero (white)
    hero_h = px(118)
    d.rounded_rectangle((0, 0, W, hero_h + px(16)), px(26), fill=C["surface"])
    d.rectangle((0, 0, W, hero_h - 20), fill=C["surface"])
    d.rounded_rectangle((px(20), px(28), px(24), px(90)), 4, fill=C["primary"])
    rr(d, (px(36), px(18), px(130), px(40)), 20, C["subtle"], C["border"], 1)
    d.text((px(83), px(29)), "GÖREVLER", font=fpt(11, True), fill=C["muted"], anchor="mm")
    d.text((px(36), px(48)), "Görevler", font=fpt(30, True), fill=C["text"])
    d.text((px(36), px(88)), format_long(today), font=fpt(15), fill=C["muted"])

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
        rr(d, box, px(10), C["primary_light"] if sel else C["subtle"], C["primary"] if sel else C["border"], 1)
        d.text((x0 + cell_w / 2, y + px(76)), _DOW_SHORT[dd.weekday()], font=fpt(10, True), fill=C["muted"], anchor="mt")
        d.text((x0 + cell_w / 2, y + px(94)), str(dd.day), font=fpt(13, True), fill=C["text"], anchor="mt")
    y += px(148)

    card(img, (pad, y, W - pad, y + px(96)), r=px(18))
    d = ImageDraw.Draw(img)
    d.text((pad + px(14), y + px(10)), "Günün ilerlemesi", font=fpt(15, True), fill=C["muted"])
    d.text((W - pad - px(14), y + px(12)), "%40", font=fpt(14, True), fill=C["primary"], anchor="rt")
    tr = (pad + px(14), y + px(40), W - pad - px(14), y + px(50))
    rr(d, tr, 10, C["primary_light"], C["border"], 1)
    rr(d, (tr[0], tr[1], tr[0] + int((tr[2] - tr[0]) * 0.4), tr[3]), 10, C["primary"])
    d.text((pad + px(14), y + px(58)), "2 görev · 1 tamamlandı · 1 kalan", font=fpt(14, True), fill=C["text"])
    d.text((pad + px(14), y + px(78)), "Günlük hedef: 5 görev ekleyince %100", font=fpt(12), fill=C["tertiary"])
    y += px(112)

    card(img, (pad, y, W - pad, y + px(128)), r=px(18))
    d = ImageDraw.Draw(img)
    d.text((pad + px(14), y + px(12)), "Görev planı ekle", font=fpt(16, True), fill=C["text"])
    d.text((pad + px(14), y + px(40)), "Seçtiğin gün için yeni görev ekle.", font=fpt(13), fill=C["muted"])
    rr(d, (pad + px(14), y + px(68), W - pad - px(14), y + px(114)), px(18), C["cta"])
    d.text((W / 2, y + px(91)), "+ Görev planı ekle", font=fpt(16, True), fill=C["on_primary"], anchor="mm")
    y += px(144)

    card(img, (pad, y, W - pad, y + px(280)), r=px(16))
    d = ImageDraw.Draw(img)
    d.text((pad + px(10), y + px(10)), "Görev listesi", font=fpt(15, True), fill=C["text"])
    pw = (W - pad * 2 - px(28)) // 2
    rr(d, (pad + px(10), y + px(40), pad + px(10) + pw, y + px(78)), px(12), C["subtle"], C["border"], 1)
    d.text((pad + px(10) + pw / 2, y + px(48)), "Toplam görev", font=fpt(11, True), fill=C["muted"], anchor="mt")
    d.text((pad + px(10) + pw / 2, y + px(64)), "2", font=fpt(14, True), fill=C["text"], anchor="mt")
    rr(d, (pad + px(18) + pw, y + px(40), pad + px(18) + pw * 2, y + px(78)), px(12), C["subtle"], C["border"], 1)
    d.text((pad + px(18) + pw * 1.5, y + px(48)), "Tamamlanan", font=fpt(11, True), fill=C["muted"], anchor="mt")
    d.text((pad + px(18) + pw * 1.5, y + px(64)), "1", font=fpt(14, True), fill=C["text"], anchor="mt")
    y = task_row(img, pad + px(10), y + px(90), W - pad * 2 - px(20), "Sunum slaytlarını bitir", "09:00", True, "high")
    task_row(img, pad + px(10), y, W - pad * 2 - px(20), "Akşam yürüyüşü", "18:30", False, "medium")

    tab_bar(img, "tasks")
    return img.convert("RGB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    store = ROOT / "store-assets"
    store.mkdir(parents=True, exist_ok=True)
    h = home()
    t = tasks_screen()
    for folder in (OUT, store):
        h.save(folder / "play-phone-home.png", "PNG")
        t.save(folder / "play-phone-tasks.png", "PNG")
    print(OUT / "play-phone-home.png")
    print(OUT / "play-phone-tasks.png")


if __name__ == "__main__":
    main()
