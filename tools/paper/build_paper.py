"""Build the YunaVerse paper-doll art for the game.

Sources (full 1024x1536 canvases, from ChatGPT, lined up by hand) live in art/yunaverse/:
  bases/<base>.png                  plain character in white tee + shorts, bald, no face
  faces/<expr>.png                  drawn for the KID head (fitted to other heads here)
  hair/<style>_<front|back>.<base>.png   drawn on <base>'s head (fitted to other heads here)
  clothes/<kind>.<id>.<base>.png    drawn for <base> only (top / bottom / shoes)

Writes trimmed WebP images to src/assets/paper/ and their positions to src/data/paperArt.ts.
Hair is recoloured into every HAIR_COLOURS entry and the bases into every skin tone.
Run:  python3 tools/paper/build_paper.py   (needs Pillow)
"""
import colorsys, glob, json, os, re
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'art', 'yunaverse')
OUT = os.path.join(ROOT, 'src', 'assets', 'paper')
TS = os.path.join(ROOT, 'src', 'data', 'paperArt.ts')
BASES = ['kid', 'preschool']                 # bodies the game uses (adult.png is kept for later)
SKIN_REF = (247, 188, 140)                   # skin colour of the source bases
SKIN_TONES = ['#FAD5B8', '#F3BE97', '#DDA071', '#A8693F']   # same 4 tones as the vector characters
HAIR_REF = (92, 55, 36)                      # hair colour the hairstyles are drawn in
HAIR_COLOURS = {'black': '#3A2F31', 'darkbrown': '#5C3A26', 'brown': '#8A5A3A', 'blonde': '#E2B56A', 'ginger': '#C9622F', 'pink': '#EE8DB8'}

hexrgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
load = lambda p: Image.open(p).convert('RGBA')

def head_box(img):
    """(top, bottom, left, right) of the head: rows from the crown down to where the neck starts."""
    a = img.getchannel('A'); W, H = a.size; top = None; widest = (0, 0, 0)
    for y in range(0, H, 2):
        xs = [x for x in range(0, W, 2) if a.getpixel((x, y)) > 128]
        if not xs: continue
        if top is None: top = y
        w = xs[-1] - xs[0]
        if y - top > 80 and w < 0.5 * widest[0]: return top, y, widest[1], widest[2]
        if w > widest[0]: widest = (w, xs[0], xs[-1])

def transform(src_head, dst_head):
    """Scale + offset that moves something drawn on one head onto another (by head height and centre)."""
    st, sb, sl, sr = src_head; dt, db, dl, dr = dst_head
    k = (db - dt) / (sb - st)
    return k, (dl + dr) / 2 - (sl + sr) / 2 * k, (dt + db) / 2 - (st + sb) / 2 * k

def trim(img):
    bb = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    return img.crop(bb), bb

def recolour(img, ref, target, keep):
    """Shift pixels near `ref` to `target`, keeping their light/dark shading; `keep` pixels stay as they are."""
    import numpy as np
    a = np.asarray(img).astype(np.float32); rgb = a[..., :3]
    mask = (a[..., 3] > 0) & ~keep(rgb)
    k = rgb.sum(-1, keepdims=True) / sum(ref)
    new = np.clip(np.array(target, np.float32) * k, 0, 255)
    a[..., :3] = np.where(mask[..., None], new, rgb)
    return Image.fromarray(a.round().astype(np.uint8), 'RGBA')

def _hsv(rgb):
    import numpy as np
    r, g, b = rgb[..., 0] / 255, rgb[..., 1] / 255, rgb[..., 2] / 255
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    h = np.where(d == 0, 0, np.where(mx == r, ((g - b) / np.maximum(d, 1e-6)) % 6, np.where(mx == g, (b - r) / np.maximum(d, 1e-6) + 2, (r - g) / np.maximum(d, 1e-6) + 4))) / 6
    return h, s, mx

def is_not_skin(rgb):
    h, s, v = _hsv(rgb)
    return ~((v > 0.45) & (s > 0.15) & (s < 0.6) & (h > 0.02) & (h < 0.12))

def is_not_hair(rgb):
    h, s, v = _hsv(rgb)
    return (v < 0.16) | (rgb[..., 2] > rgb[..., 1]) | (s < 0.2) | (v > 0.72)   # outline, pink clips/bows, white bits

os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(OUT, '*.webp')): os.remove(f)
imports, names = [], {}
SCALE = 0.5        # images are stored smaller than the source; positions stay in source units
def save(img, name):
    img = img.resize((max(1, round(img.width * SCALE)), max(1, round(img.height * SCALE))), Image.LANCZOS)
    img.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=86, method=6)
    var = 'p' + str(len(imports)); imports.append(f"import {var} from '../assets/paper/{name}.webp';"); names[name] = var
    return var

base_img = {b: load(os.path.join(SRC, 'bases', b + '.png')) for b in BASES}
heads = {b: head_box(base_img[b]) for b in BASES}
place = lambda bb, t: [round(bb[0] * t[0] + t[1]), round(bb[1] * t[0] + t[2]), round((bb[2] - bb[0]) * t[0]), round((bb[3] - bb[1]) * t[0])]
ident = (1.0, 0.0, 0.0)

# faces: drawn for the kid head
faces = {}
for p in sorted(glob.glob(os.path.join(SRC, 'faces', '*.png'))):
    expr = os.path.basename(p)[:-4]; img, bb = trim(load(p))
    faces[expr] = {'src': save(img, 'face-' + expr), 'at': {b: place(bb, transform(heads['kid'], heads[b])) for b in BASES}}

# hair: each style drawn on one base, recoloured, fitted to every head.
# ChatGPT often draws hair too big/low; HAIR_FIT = (scale, nudge down) puts the hair top at y=220 on the kid head.
HAIR_FIT = {'bobbangs': (0.73, 0), 'bowwaves': (0.86, 0), 'braids': (0.72, -15), 'locs': (0.95, 0), 'messy': (0.7, 0),
            'sideswept': (0.75, 0), 'spacebuns': (0.74, 0)}
hair_top = {}
for p in glob.glob(os.path.join(SRC, 'hair', '*_front.*.png')):
    hair_top[os.path.basename(p).split('_front')[0]] = load(p).getchannel('A').point(lambda v: 255 if v > 100 else 0).getbbox()[1]
def hair_fit(style, bb):
    if style not in HAIR_FIT: return bb
    k, dy = HAIR_FIT[style]; t = hair_top[style]
    return (512 + (bb[0] - 512) * k, 220 + dy + (bb[1] - t) * k, 512 + (bb[2] - 512) * k, 220 + dy + (bb[3] - t) * k)
hair = {}
for p in sorted(glob.glob(os.path.join(SRC, 'hair', '*.png'))):
    m = re.match(r'(.+)_(front|back)\.(\w+)\.png$', os.path.basename(p)); style, part, drawn_on = m.groups()
    img, bb = trim(load(p)); h = hair.setdefault(style, {})
    h[part] = {'src': {c: save(recolour(img, HAIR_REF, hexrgb(hx), is_not_hair), f'hair-{style}-{part}-{c}') for c, hx in HAIR_COLOURS.items()},
               'at': {b: place(hair_fit(style, bb), transform(heads[drawn_on], heads[b])) for b in BASES}}

# clothes: for one base only
clothes = {}
for p in sorted(glob.glob(os.path.join(SRC, 'clothes', '*.png'))):
    kind, cid, base = os.path.basename(p)[:-4].split('.'); img, bb = trim(load(p))
    clothes[cid] = {'kind': kind, 'base': base, 'src': save(img, f'cloth-{cid}'), 'at': place(bb, ident)}

# accessories: ChatGPT draws these big and centred, so each slot has a target spot on the KID canvas
# (w = width; cx/cy = centre; top/bottom = edge), then head items follow the head, body items the body.
ACC_SLOTS = {   # slot: (target, drawn over the front hair?, follows)
    'head': (dict(w=525, cx=512, bottom=468), True, 'head'),       # caps and hats: brim just above the eyes
    'eyes': (dict(w=440, cx=521, cy=548), True, 'head'),            # glasses on the eyes
    'ears': (dict(w=600, cx=512, top=405), True, 'head'),           # headphones: cups over the ears
    'hair': (dict(w=180, cx=672, cy=318), True, 'head'),            # bows and clips: top right of the head
    'bag':  (dict(w=360, cx=545, top=735), False, 'body'),          # bags and backpacks: from the shoulders
}
def fit_box(bb, w, cx, top=None, bottom=None, cy=None):
    k = w / (bb[2] - bb[0]); h = (bb[3] - bb[1]) * k
    if top is not None and bottom is not None: h = bottom - top          # stretch to fit both (legs)
    y = top if top is not None else (bottom - h if bottom is not None else cy - h / 2)
    return [round(cx - w / 2), round(y), round(w), round(h)]
def width_at(img, y):
    a = img.getchannel('A'); xs = [x for x in range(0, img.width, 2) if a.getpixel((x, y)) > 128]
    return xs[-1] - xs[0]
def body_transform(b, by='width'):
    """Kid body -> another body: scale by shoulder width (or neck-to-feet height), line up the neck."""
    if b == 'kid': return ident
    feet = lambda n: base_img[n].getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox()[3]
    k = (width_at(base_img[b], heads[b][1] + 90) / width_at(base_img['kid'], heads['kid'][1] + 90) if by == 'width'
         else (feet(b) - heads[b][1]) / (feet('kid') - heads['kid'][1]))
    return k, 512 - 512 * k, heads[b][1] - heads['kid'][1] * k
accessories = {}
for p in sorted(glob.glob(os.path.join(SRC, 'accessories', '*.png'))):
    slot, aid = os.path.basename(p)[:-4].split('.'); img, bb = trim(load(p))
    target, over_hair, follows = ACC_SLOTS[slot]; kb = fit_box(bb, **target)
    box = (kb[0], kb[1], kb[0] + kb[2], kb[1] + kb[3])
    accessories[aid] = {'slot': slot, 'src': save(img, f'acc-{aid}'), 'overHair': over_hair,
                        'at': {b: place(box, transform(heads['kid'], heads[b]) if follows == 'head' else body_transform(b, 'height')) for b in BASES}}

# loose tops: drawn without a template, so they're fitted onto the kid body (width + collar height)
# and onto the other bodies from there; they can be worn on every body
TOP_FIT = {'w': 440, 'top': 700}
TOP_FIT_EACH = {'heart-crop-tee': dict(w=420, top=724), 'jersey-23': dict(w=410, top=722), 'fairy-dress': dict(w=430, top=724),
                'cream-top': dict(w=440, top=724), 'bear-sweater': dict(w=450, top=716), 'tan-blazer': dict(w=455, top=712),
                'pink-cardigan': dict(w=455, top=712)}
# bottoms: ChatGPT draws long legs, so width follows the waist and length the ankles (on every body)
BOTTOM_FIT = {'baggy-jeans': dict(w=340, top=975, bottom=1398), 'cargo-pants': dict(w=330, top=975, bottom=1396),
              'black-shorts': dict(w=300, top=975), 'lavender-skirt': dict(w=370, top=975), 'blue-skirt': dict(w=370, top=975),
              'plaid-skirt': dict(w=370, top=975), 'overalls': dict(w=300, top=742)}
OVER_TOP = {'overalls'}          # drawn over the top (bib and straps)
# shoes: fitted to each body's own feet
FEET = {}
def feet_of(b):
    a = base_img[b].getchannel('A'); f = a.point(lambda v: 255 if v > 60 else 0).getbbox()[3]
    xs = [x for x in range(1024) if a.getpixel((x, f - 30)) > 128]
    return xs[0], xs[-1], f
SHOE_W = {'bow-shoes': 1.0, 'loafers': 1.0}       # width as a share of the feet span (chunky sneakers a bit wider)
def place_xy(bb, b):
    """Kid body -> body b for bottoms: x by hip width, y by neck-to-feet height."""
    if b == 'kid': return place(bb, ident)
    kx = body_transform(b, 'width')[0]; ky = body_transform(b, 'height')[0]
    oy = heads[b][1] - heads['kid'][1] * ky
    return [round(512 + (bb[0] - 512) * kx), round(bb[1] * ky + oy), round((bb[2] - bb[0]) * kx), round((bb[3] - bb[1]) * ky)]
def short_bottom(bb, b):
    """Shorts and skirts: same hem height above the knees on every body, slightly smaller on smaller bodies."""
    if b == 'kid': return place(bb, ident)
    kx = body_transform(b, 'width')[0]; h = (bb[3] - bb[1]) * 0.85; bottom = bb[3] + 15 - (feet_of('kid')[2] - feet_of(b)[2]) * 0
    return [round(512 + (bb[0] - 512) * kx), round(bottom - h), round((bb[2] - bb[0]) * kx), round(h)]
for p in sorted(glob.glob(os.path.join(SRC, 'clothes-fit', '*.png'))):
    kind, cid = os.path.basename(p)[:-4].split('.'); img, bb = trim(load(p))
    if kind == 'shoes':
        at = {}
        for b in BASES:
            x0, x1, f = feet_of(b); k = SHOE_W.get(cid, 1.1); fb = fit_box(bb, (x1 - x0) * k, (x0 + x1) / 2, bottom=f + 10)
            at[b] = [round(v) for v in fb]
        clothes[cid] = {'kind': kind, 'base': 'any', 'src': save(img, f'cloth-{cid}'), 'at': at['kid'], 'atBase': at}
        continue
    t = (BOTTOM_FIT if kind == 'bottom' else TOP_FIT_EACH).get(cid, TOP_FIT); kb = fit_box(bb, t['w'], 512, top=t['top'], bottom=t.get('bottom'))
    box = (kb[0], kb[1], kb[0] + kb[2], kb[1] + kb[3])
    clothes[cid] = {'kind': kind, 'base': 'any', 'src': save(img, f'cloth-{cid}'), 'at': place(box, ident), 'overTop': cid in OVER_TOP,
                    'atBase': {b: (short_bottom(box, b) if kind == 'bottom' and 'bottom' not in t and cid not in OVER_TOP else place_xy(box, b) if kind == 'bottom'
                                   else place(box, body_transform(b, 'width'))) for b in BASES}}

# bases: one image per skin tone + the rig numbers the game needs
bases = {}
for b in BASES:
    img, bb = trim(base_img[b]); top, bottom, left, right = heads[b]
    eyes_img = load(os.path.join(SRC, 'faces', 'happy.png'))
    # eye centres: the two dark blobs of the happy face, moved onto this head
    t = transform(heads['kid'], heads[b]); ex = []
    px = eyes_img.load()
    for side in (0, 1):
        pts = [(x, y) for y in range(400, 900, 2) for x in (range(300, 512, 2) if side == 0 else range(512, 724, 2))
               if px[x, y][3] > 200 and sum(px[x, y][:3]) < 120]
        cx = sum(q[0] for q in pts) / len(pts); cy = sum(q[1] for q in pts) / len(pts)
        ex.append([round(cx * t[0] + t[1]), round(cy * t[0] + t[2])])
    a = base_img[b].getchannel('A')
    hip = next(y for y in range(bottom + 200, bb[3]) if a.getpixel((512, y)) < 60)   # where the legs part
    bases[b] = {'src': [save(recolour(img, SKIN_REF, hexrgb(t), is_not_skin), f'base-{b}-{i}') for i, t in enumerate(SKIN_TONES)],
                'at': list(place(bb, ident)), 'neck': bottom, 'crown': top, 'eyes': ex, 'hip': hip, 'feet': bb[3]}

# canvas per base: everything that can be drawn on it, plus a little room
for b in BASES:
    boxes = [bases[b]['at']] + [f['at'][b] for f in faces.values()] + [h[p]['at'][b] for h in hair.values() for p in h] + [c['at'] for c in clothes.values() if c['base'] == b] + [c['atBase'][b] for c in clothes.values() if c['base'] == 'any'] + [a['at'][b] for a in accessories.values()]
    x0 = min(q[0] for q in boxes) - 6; y0 = min(q[1] for q in boxes) - 6
    x1 = max(q[0] + q[2] for q in boxes) + 6; y1 = bases[b]['feet'] + 8
    bases[b]['canvas'] = [x0, y0, x1 - x0, y1 - y0]

js = lambda o: re.sub(r'"(p\d+)"', r'\1', json.dumps(o))
with open(TS, 'w') as f:
    f.write('/** YunaVerse paper-doll art: GENERATED by tools/paper/build_paper.py from art/yunaverse/. Do not edit by hand.\n'
            ' *  Boxes are [x, y, w, h] in the 1024x1536 source canvas; each base has a `canvas` box the character is drawn in. */\n')
    f.write('\n'.join(imports) + '\n\n')
    f.write("export type PaperBase = 'kid' | 'preschool';\nexport type Box = [number, number, number, number];\n")
    f.write(f'export const PAPER_BASES: Record<PaperBase, {{ src: string[]; at: Box; canvas: Box; neck: number; crown: number; eyes: [[number, number], [number, number]]; hip: number; feet: number }}> = {js(bases)};\n')
    f.write(f'export const PAPER_FACES: Record<string, {{ src: string; at: Record<PaperBase, Box> }}> = {js(faces)};\n')
    f.write(f'export const PAPER_HAIR: Record<string, Record<\'front\' | \'back\', {{ src: Record<string, string>; at: Record<PaperBase, Box> }}>> = {js(hair)};\n')
    f.write(f"export const PAPER_CLOTHES: Record<string, {{ kind: 'top' | 'bottom' | 'shoes'; base: PaperBase | 'any'; src: string; at: Box; atBase?: Record<PaperBase, Box>; overTop?: boolean }}> = {js(clothes)};\n")
    f.write(f"export const PAPER_ACCESSORIES: Record<string, {{ slot: 'head' | 'eyes' | 'ears' | 'hair' | 'bag'; src: string; overHair: boolean; at: Record<PaperBase, Box> }}> = {js(accessories)};\n")
    f.write(f'export const PAPER_HAIR_COLOURS: Record<string, string> = {json.dumps(HAIR_COLOURS)};\n')
    f.write(f'export const PAPER_SKIN_TONES = {json.dumps(SKIN_TONES)};\n')
if os.environ.get('PAPER_DEBUG'):
    json.dump({'bases': bases, 'faces': faces, 'hair': hair, 'clothes': clothes, 'accessories': accessories, 'names': {v: k for k, v in names.items()}}, open(os.environ['PAPER_DEBUG'], 'w'))
total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(OUT, '*.webp')))
print(f'{len(imports)} images, {total // 1024} KB; bases:', {b: {k: bases[b][k] for k in ("canvas", "neck", "eyes", "hip")} for b in BASES})
