"""YunaVerse dress-up characters drawn as SVG.
Canvas: 384 x 720 (body coordinates). Colour tokens like {S} are filled in at runtime (see Doll.tsx):
  S/SD/SO skin, H/HD/HO/HL hair, E/EL/ED/EDD eyes, T/TO plain tee, B/BO plain shorts, U = unique id suffix."""
J = 'stroke-linejoin="round" stroke-linecap="round"'

# ───────────────────────── body ─────────────────────────
def _hand(m):
    X = lambda v: f'{(384 - v) if m else v:g}'
    fingers = [((92, 474), (84, 493)), ((98, 476), (95, 500)), ((105, 476), (107, 500)), ((111, 473), (117, 493))]
    thumb = ((90, 462), (76, 474))
    lines = ''.join(f'M{X(a[0])} {a[1]} L{X(b[0])} {b[1]} ' for a, b in fingers + [thumb])
    palm = f'<ellipse cx="{X(100)}" cy="466" rx="16" ry="15"'
    return (f'<path d="{lines}" stroke="{{SO}}" stroke-width="15" fill="none" stroke-linecap="round"/>'
            f'{palm} fill="{{S}}" stroke="{{SO}}" stroke-width="3"/>'
            f'<path d="{lines}" stroke="{{S}}" stroke-width="9" fill="none" stroke-linecap="round"/>'
            f'{palm} fill="{{S}}" transform="translate(0 -2)"/>')

BODY = f'''<g {J} stroke="{{SO}}" stroke-width="3">
<path d="M148 640 C144 580 144 510 150 470 L182 470 C184 520 184 590 182 642 Z" fill="{{S}}"/>
<path d="M236 640 C240 580 240 510 234 470 L202 470 C200 520 200 590 202 642 Z" fill="{{S}}"/>
<path d="M142 638 C128 644 124 662 136 670 L184 670 C190 658 188 646 182 638 Z" fill="{{S}}"/>
<path d="M242 638 C256 644 260 662 248 670 L200 670 C194 658 196 646 202 638 Z" fill="{{S}}"/>
<path d="M132 360 C112 380 100 410 96 446 C94 460 112 464 116 450 C120 422 128 398 142 384 Z" fill="{{S}}"/>
<path d="M252 360 C272 380 284 410 288 446 C290 460 272 464 268 450 C264 422 256 398 242 384 Z" fill="{{S}}"/>
</g>{_hand(False)}{_hand(True)}<g {J} stroke="{{SO}}" stroke-width="3">
<path d="M176 312 L208 312 L210 352 L174 352 Z" fill="{{SD}}"/>
<path d="M132 350 C150 334 234 334 252 350 C262 400 262 448 256 484 L128 484 C122 448 122 400 132 350 Z" fill="{{S}}"/>
</g>'''

# plain tee / shorts the character wears when nothing is picked
TEE_SHAPE = 'M126 350 C140 340 154 338 162 340 C172 358 212 358 222 340 C230 338 244 340 258 350 L290 396 C294 404 290 412 282 412 L262 408 L262 480 C230 492 154 492 122 480 L122 408 L102 412 C94 412 90 404 94 396 Z'
BASIC_TEE = f'<path d="{TEE_SHAPE}" fill="{{T}}" stroke="{{TO}}" stroke-width="3" {J}/><path d="M162 340 C172 358 212 358 222 340" fill="none" stroke="{{TO}}" stroke-width="3"/>'
SHORTS_SHAPE = 'M126 468 L258 468 C262 500 266 528 268 548 L206 552 L198 512 L186 512 L178 552 L116 548 C118 528 122 500 126 468 Z'
BASIC_SHORTS = f'<path d="{SHORTS_SHAPE}" fill="{{B}}" stroke="{{BO}}" stroke-width="3" {J}/><path d="M192 482 L192 512" stroke="{{BO}}" stroke-width="2"/>'

# ───────────────────────── head ─────────────────────────
FACE = 'M64 210 C62 120 122 70 192 70 C262 70 322 120 320 210 C318 280 270 330 192 332 C114 330 66 280 64 210 Z'
HEAD = f'''<g {J} stroke="{{SO}}" stroke-width="3">
<path d="M70 214 C50 206 40 226 46 246 C52 264 70 270 82 262 Z" fill="{{S}}"/>
<path d="M314 214 C334 206 344 226 338 246 C332 264 314 270 302 262 Z" fill="{{S}}"/>
<path d="M66 230 C58 232 56 246 64 254" fill="none" stroke="{{SD}}"/>
<path d="M318 230 C326 232 328 246 320 254" fill="none" stroke="{{SD}}"/>
<path d="{FACE}" fill="{{S}}"/></g>
<ellipse cx="106" cy="280" rx="28" ry="17" fill="url(#blush{{U}})"/>
<ellipse cx="278" cy="280" rx="28" ry="17" fill="url(#blush{{U}})"/>
<path d="M188 258 Q192 262 196 258" fill="none" stroke="{{SO}}" stroke-width="3" stroke-linecap="round" opacity=".6"/>'''

DEFS = '''<defs><linearGradient id="iris{U}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{ED}"/><stop offset=".5" stop-color="{ED}"/><stop offset=".85" stop-color="{E}"/><stop offset="1" stop-color="{EL}"/></linearGradient>
<radialGradient id="blush{U}"><stop offset="0" stop-color="#FF7F96" stop-opacity=".55"/><stop offset="1" stop-color="#FF7F96" stop-opacity="0"/></radialGradient></defs>'''

INK = '#3A2016'
EYES = ((138, 236, -1), (246, 236, 1))

def eye_open(cx, cy, o, kind, lid=None, wet=False):
    """o = -1 left eye, 1 right eye (the side the outer corner points to). lid: None | 'angry' | 'sad'."""
    # Cute cartoon eye: a dark-rimmed iris shaded darker under the lid, a solid round pupil
    # and one tiny highlight dot so it reads soft and friendly.
    out = (f'<ellipse cx="{cx}" cy="{cy+4}" rx="24" ry="27" fill="url(#iris{{U}})" stroke="{INK}" stroke-width="3"/>'
           f'<ellipse cx="{cx}" cy="{cy+5}" rx="14" ry="17" fill="#1E120D"/>'
           f'<path d="M{cx-17} {cy+20} Q{cx} {cy+30} {cx+17} {cy+20}" fill="none" stroke="{{EL}}" stroke-width="3" stroke-linecap="round" opacity=".8"/>'
           f'<circle cx="{cx+7*o}" cy="{cy-4}" r="{5.5 if wet else 4.5}" fill="#FFFFFF"/>')
    ox, ix = cx + 30 * o, cx - 30 * o
    if lid:
        oy, iy = ((cy - 24, cy - 6) if lid == 'angry' else (cy - 8, cy - 22))
        out += (f'<path d="M{ox} {cy-40} L{ix} {cy-40} L{ix} {iy} L{ox} {oy} Z" fill="{{S}}"/>'
                f'<path d="M{ox} {oy} L{ix} {iy}" stroke="{INK}" stroke-width="5.5" stroke-linecap="round"/>')
    else:
        out += (f'<path d="M{cx+27*o} {cy-2} C{cx+24*o} {cy-30} {cx-22*o} {cy-32} {cx-28*o} {cy-6}" '
                f'fill="none" stroke="{INK}" stroke-width="5.5" stroke-linecap="round"/>')
    if kind == 'girl':
        y0 = cy - 8 if not lid else (oy)
        out += (f'<path d="M{cx+27*o} {y0} C{cx+32*o} {y0-4} {cx+35*o} {y0-7} {cx+37*o} {y0-11}" '
                f'fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
    return out

def eye_closed(cx, cy, o, kind, shape='happy'):
    if shape == 'happy':     # ^ smiling closed eye
        d = f'M{cx-22} {cy+6} Q{cx} {cy-20} {cx+22} {cy+6}'
    else:                    # squeezed >  <
        d = f'M{cx-18*o} {cy-12} L{cx+14*o} {cy} L{cx-18*o} {cy+12}'
    out = f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
    if kind == 'girl' and shape == 'happy':
        out += f'<path d="M{cx+21*o} {cy+2} L{cx+30*o} {cy-6}" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>'
    return out

def brows(kind, mode='normal'):
    w = 5 if kind == 'girl' else 7
    if mode == 'normal': d = 'M110 186 Q132 176 156 184 M228 184 Q252 176 274 186'
    elif mode == 'up':   d = 'M110 176 Q132 164 156 172 M228 172 Q252 164 274 176'
    elif mode == 'sad':  d = 'M110 190 Q134 186 156 172 M228 172 Q250 186 274 190'
    else:                d = 'M112 174 Q134 180 158 194 M226 194 Q250 180 272 174'   # angry
    return f'<path d="{d}" fill="none" stroke="{{HD}}" stroke-width="{w}" stroke-linecap="round"/>'

MOUTH_DARK, MOUTH_LINE, TONGUE = '#8E2A2E', '#5E1A1C', '#F07A86'
def mouth(kind):
    if kind == 'smile':
        return (f'<path d="M164 278 C168 314 216 314 220 278 C202 286 182 286 164 278 Z" fill="{MOUTH_DARK}" stroke="{MOUTH_LINE}" stroke-width="2.5" stroke-linejoin="round"/>'
                '<path d="M172 282 C186 286 198 286 212 282 L210 288 C198 290 186 290 174 288 Z" fill="#FFFFFF"/>'
                f'<path d="M178 300 C188 290 198 290 208 300 C198 308 188 308 178 300 Z" fill="{TONGUE}"/>')
    if kind == 'laugh':
        return (f'<path d="M154 274 C156 330 228 330 230 274 C204 284 180 284 154 274 Z" fill="{MOUTH_DARK}" stroke="{MOUTH_LINE}" stroke-width="2.5" stroke-linejoin="round"/>'
                '<path d="M162 278 C182 284 202 284 222 278 L219 286 C202 290 182 290 165 286 Z" fill="#FFFFFF"/>'
                f'<path d="M172 308 C184 294 200 294 212 308 C200 318 184 318 172 308 Z" fill="{TONGUE}"/>')
    if kind == 'closed':
        return f'<path d="M172 282 Q192 300 212 282" fill="none" stroke="{MOUTH_LINE}" stroke-width="4" stroke-linecap="round"/>'
    if kind == 'o':
        return (f'<ellipse cx="192" cy="292" rx="14" ry="17" fill="{MOUTH_DARK}" stroke="{MOUTH_LINE}" stroke-width="2.5"/>'
                f'<ellipse cx="192" cy="301" rx="8" ry="6" fill="{TONGUE}"/>')
    if kind == 'frown':
        return f'<path d="M176 296 Q192 282 208 296" fill="none" stroke="{MOUTH_LINE}" stroke-width="4" stroke-linecap="round"/>'
    if kind == 'pout':
        return (f'<path d="M174 296 Q192 280 210 296" fill="none" stroke="{MOUTH_LINE}" stroke-width="5" stroke-linecap="round"/>'
                '<path d="M120 296 l10 -6 M126 304 l12 -4 M264 296 l-10 -6 M258 304 l-12 -4" stroke="#E86A6A" stroke-width="3" stroke-linecap="round" opacity=".7"/>')
    if kind == 'wail':
        return (f'<path d="M166 304 C170 274 214 274 218 304 C206 296 178 296 166 304 Z" fill="{MOUTH_DARK}" stroke="{MOUTH_LINE}" stroke-width="2.5" stroke-linejoin="round"/>'
                f'<path d="M178 300 C186 294 198 294 206 300 C198 303 186 303 178 300 Z" fill="{TONGUE}"/>')
    if kind == 'tongue':
        return (f'<path d="M168 280 Q192 300 216 280" fill="none" stroke="{MOUTH_LINE}" stroke-width="4" stroke-linecap="round"/>'
                f'<path d="M182 290 C182 316 206 316 206 290 Z" fill="{TONGUE}" stroke="{MOUTH_LINE}" stroke-width="2.5" stroke-linejoin="round"/>'
                '<path d="M194 294 L194 306" stroke="#D9566A" stroke-width="2" stroke-linecap="round"/>')
    raise KeyError(kind)

TEARS = ('<path d="M120 268 C114 300 116 330 126 352 C134 330 134 300 128 268 Z M264 268 C258 300 260 330 270 352 C278 330 278 300 272 268 Z" '
         'fill="#8FD3FF" stroke="#4FA6E0" stroke-width="2.5" stroke-linejoin="round" opacity=".9"/>')

def face(kind, expr):
    (lx, ly, lo), (rx, ry, ro) = EYES
    if expr == 'happy':  return eye_open(lx, ly, lo, kind) + eye_open(rx, ry, ro, kind) + brows(kind) + mouth('smile')
    if expr == 'laugh':  return eye_closed(lx, ly, lo, kind) + eye_closed(rx, ry, ro, kind) + brows(kind, 'up') + mouth('laugh')
    if expr == 'wink':   return eye_open(lx, ly, lo, kind) + eye_closed(rx, ry, ro, kind) + brows(kind) + mouth('smile')
    if expr == 'wow':    return eye_open(lx, ly, lo, kind, wet=True) + eye_open(rx, ry, ro, kind, wet=True) + brows(kind, 'up') + mouth('o')
    if expr == 'sad':    return eye_open(lx, ly, lo, kind, lid='sad', wet=True) + eye_open(rx, ry, ro, kind, lid='sad', wet=True) + brows(kind, 'sad') + mouth('frown')
    if expr == 'cry':    return eye_closed(lx, ly, lo, kind, 'squeeze') + eye_closed(rx, ry, ro, kind, 'squeeze') + brows(kind, 'sad') + TEARS + mouth('wail')
    if expr == 'angry':  return eye_open(lx, ly, lo, kind, lid='angry') + eye_open(rx, ry, ro, kind, lid='angry') + brows(kind, 'angry') + mouth('pout')
    if expr == 'silly':  return eye_closed(lx, ly, lo, kind) + eye_open(rx, ry, ro, kind) + brows(kind, 'up') + mouth('tongue')
    raise KeyError(expr)

EXPRS = ['happy', 'laugh', 'wink', 'wow', 'sad', 'cry', 'angry', 'silly']

# ───────────────────────── hair ─────────────────────────
def hp(d, fill='{H}', w=3):
    return f'<path d="{d}" fill="{fill}" stroke="{{HO}}" stroke-width="{w}" {J}/>'
def strands(d, op=.5):
    return f'<path d="{d}" fill="none" stroke="{{HO}}" stroke-width="2.5" opacity="{op}" stroke-linecap="round"/>'
def shine(d):
    return f'<path d="{d}" fill="none" stroke="{{HL}}" stroke-width="6" opacity=".5" stroke-linecap="round"/>'

CAP_PART = ('M58 226 C46 120 116 60 192 60 C268 60 338 120 326 226 C320 260 310 290 300 300 C312 250 308 196 284 156 '
            'C272 166 254 170 236 168 C244 156 244 144 240 136 C220 150 190 160 160 160 C170 150 176 140 176 128 '
            'C138 142 106 176 92 222 C84 250 82 280 82 300 C68 286 60 258 58 226 Z')
PART_LINES = strands('M192 64 C186 90 178 116 164 140 M150 76 C130 100 116 130 108 168 M236 76 C256 100 270 130 280 170 M210 66 C220 96 226 120 232 150', .55) + shine('M120 96 C140 82 166 76 190 76')
def part_front(): return hp(CAP_PART) + PART_LINES

CAP_BANGS = ('M54 250 C40 120 112 56 192 56 C272 56 344 120 330 250 C328 290 320 320 312 336 L294 336 C298 280 296 230 290 176 '
             'C272 184 254 176 240 184 C226 176 206 178 192 186 C178 178 158 176 144 184 C130 176 112 184 94 176 '
             'C88 230 86 280 90 336 L72 336 C62 320 56 290 54 250 Z')
BANGS_LINES = strands('M144 70 C136 110 140 150 144 182 M192 62 C190 110 192 150 192 184 M240 70 C248 110 244 150 240 182 M98 120 C92 180 90 260 92 330 M286 120 C292 180 294 260 292 330', .5) + shine('M118 92 C142 78 168 72 192 72')

LONG_BACK = ('M66 190 C40 260 36 360 50 440 C58 470 74 486 92 478 C110 496 130 496 140 486 L244 486 C254 496 274 496 292 478 '
             'C310 486 326 470 334 440 C348 360 344 260 318 190 Z')
LONG_LINES = strands('M70 260 C64 330 66 400 80 460 M98 290 C96 360 100 420 112 480 M314 260 C320 330 318 400 304 460 M286 290 C288 360 284 420 272 480', .55)
WAVY_BACK = ('M64 190 C40 250 26 300 44 350 C26 390 40 430 52 450 C40 480 64 500 84 490 C96 510 124 508 132 492 L252 492 '
             'C260 508 288 510 300 490 C320 500 344 480 332 450 C344 430 358 390 340 350 C358 300 344 250 320 190 Z')
WAVY_LINES = strands('M70 250 C56 300 74 340 58 380 C46 420 66 450 70 480 M104 300 C92 350 112 390 100 430 C94 460 108 480 116 492 M314 250 C328 300 310 340 326 380 C338 420 318 450 314 480 M280 300 C292 350 272 390 284 430 C290 460 276 480 268 492', .55)
BOB_BACK = 'M56 220 C46 290 56 332 78 350 L306 350 C328 332 338 290 328 220 Z'

def bun(cx, cy, r):
    return (hp(f'M{cx-r} {cy} A{r} {r} 0 1 1 {cx+r} {cy} A{r} {r} 0 1 1 {cx-r} {cy} Z') +
            strands(f'M{cx-r*.55} {cy-r*.35} C{cx-r*.2} {cy-r*.7} {cx+r*.3} {cy-r*.6} {cx+r*.5} {cy-r*.2} '
                    f'M{cx-r*.7} {cy+r*.15} C{cx-r*.3} {cy-r*.3} {cx+r*.4} {cy-r*.25} {cx+r*.65} {cy+r*.2}', .6))

FLOWER = ('<g transform="translate(276 128)">' + ''.join(
    f'<circle r="9" cx="{x}" cy="{y}" fill="#FFD84A" stroke="#E0A92A" stroke-width="2"/>' for x, y in ((0, -12), (11, -4), (7, 10), (-7, 10), (-11, -4)))
    + '<circle r="6" fill="#FFB13B"/></g>')
def tie(cx, cy, col='#FF6FA4'):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="13" ry="9" fill="{col}" stroke="#C94E7E" stroke-width="2.5"/>'

def pigtail(m):
    X = lambda v: f'{(384 - v) if m else v:g}'
    return (hp(f'M{X(76)} 196 C{X(36)} 214 {X(14)} 268 {X(22)} 330 C{X(28)} 380 {X(48)} 420 {X(60)} 436 C{X(66)} 404 {X(64)} 372 {X(76)} 340 '
               f'C{X(70)} 384 {X(80)} 410 {X(96)} 424 C{X(98)} 380 {X(90)} 330 {X(96)} 280 C{X(98)} 250 {X(96)} 220 {X(76)} 196 Z') +
            strands(f'M{X(56)} 240 C{X(38)} 290 {X(40)} 350 {X(56)} 410 M{X(80)} 260 C{X(70)} 300 {X(72)} 350 {X(80)} 390', .55) + tie(X(74), 206))

def braid(m):
    X = lambda v: (384 - v) if m else v
    segs = ''
    for i, (x, y) in enumerate(((86, 300), (90, 336), (94, 372), (98, 408), (102, 444))):
        segs += hp(f'M{X(x)} {y-22} C{X(x+24)} {y-20} {X(x+24)} {y+20} {X(x)} {y+22} C{X(x-24)} {y+20} {X(x-24)} {y-20} {X(x)} {y-22} Z')
        segs += strands(f'M{X(x-14)} {y-8} C{X(x-4)} {y} {X(x+6)} {y+6} {X(x+14)} {y+10}', .5)
    tuft = hp(f'M{X(102)} 470 C{X(86)} 480 {X(88)} 504 {X(96)} 512 C{X(100)} 500 {X(104)} 500 {X(108)} 512 C{X(116)} 504 {X(118)} 480 {X(102)} 470 Z')
    return segs + tuft + tie(X(102), 468)

PONY = ('M282 104 C338 98 366 158 360 236 C356 300 344 366 322 430 C312 446 298 440 300 424 C306 380 306 330 300 290 '
        'C296 236 296 186 274 140 Z')

BOY_SIDE = ('M60 214 C46 116 114 50 194 50 C274 50 340 114 324 214 C318 192 310 176 300 166 C276 150 246 138 220 118 '
            'C196 140 156 156 114 156 C98 170 80 190 72 212 Z')
BOY_SWOOP = ('M60 214 C48 120 116 52 194 52 C276 52 338 118 324 214 C318 196 310 182 298 172 C284 140 240 126 198 134 '
             'C160 142 120 168 98 198 C88 206 76 210 60 214 Z')
BOY_SPIKY = ('M62 214 C54 150 70 110 92 96 L84 62 L118 78 L124 40 L154 66 L172 28 L196 60 L222 30 L236 66 L268 44 L270 80 L304 72 '
             'L294 104 C318 130 328 170 322 214 C312 186 300 170 286 160 L270 178 L256 152 L238 174 L222 148 L202 172 L184 146 L166 172 '
             'L148 148 L130 170 L114 152 L100 172 C86 182 70 196 62 214 Z')
BOY_MESSY = ('M60 216 C46 140 80 76 130 58 C140 40 168 36 184 50 C200 30 236 34 246 54 C292 62 334 112 324 216 C318 190 310 176 300 168 '
             'C300 184 290 194 278 196 C282 182 280 168 272 160 C262 176 244 184 226 182 C234 170 234 158 230 150 C214 168 190 176 168 172 '
             'C178 162 182 150 180 140 C160 160 132 168 108 166 C116 158 118 150 116 144 C96 160 76 184 60 216 Z')

def curly_cap():
    import math
    out = ''
    pts = []
    for i in range(15):
        a = math.radians(196 - i * (212 / 14))
        pts.append((192 + 140 * math.cos(a), 168 - 124 * math.sin(a)))
    for x, y in pts:
        out += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="32" fill="{{H}}" stroke="{{HO}}" stroke-width="3"/>'
    for x in (104, 140, 176, 212, 248, 284):
        out += f'<circle cx="{x}" cy="{148 if x in (104, 284) else 140}" r="24" fill="{{H}}" stroke="{{HO}}" stroke-width="3"/>'
    out += f'<path d="M70 190 C64 110 120 56 192 56 C264 56 320 110 314 190 C300 160 270 150 192 150 C114 150 84 160 70 190 Z" fill="{{H}}"/>'
    out += strands('M120 90 c10 -10 22 -4 18 8 M180 74 c10 -10 22 -4 18 8 M240 88 c10 -10 22 -4 18 8 M150 116 c10 -10 22 -4 18 8 M214 112 c10 -10 22 -4 18 8', .6)
    return out

HAIR = {
    # id: (label, back, front)
    'long':     ('Long straight', hp(LONG_BACK, '{HD}') + LONG_LINES, part_front()),
    'topbun':   ('Top bun', '', bun(192, 44, 44) + tie(192, 84) + part_front()),
    'wavy':     ('Long waves', hp(WAVY_BACK, '{HD}') + WAVY_LINES, part_front()),
    'bangs':    ('Bob with bangs', hp(BOB_BACK, '{HD}'), hp(CAP_BANGS) + BANGS_LINES),
    'pigtails': ('Pigtails', pigtail(False) + pigtail(True), part_front()),
    'braids':   ('Braids', '', part_front() + braid(False) + braid(True)),
    'ponytail': ('Side ponytail', hp(PONY) + strands('M300 130 C340 170 344 260 330 340 M314 150 C330 220 326 300 316 380', .55), part_front() + tie(286, 122)),
    'buns':     ('Space buns', hp(LONG_BACK, '{HD}') + LONG_LINES, bun(100, 74, 46) + bun(284, 74, 46) + part_front() + FLOWER),
    'sidepart': ('Side part', '', hp(BOY_SIDE) + strands('M220 56 C220 80 220 100 220 118 M180 60 C168 90 150 120 126 146 M260 70 C280 100 296 130 304 164', .55) + shine('M130 86 C150 72 176 66 200 66')),
    'messy':    ('Messy', '', hp(BOY_MESSY) + strands('M150 70 C146 100 136 130 120 156 M210 52 C212 90 204 130 190 166 M266 80 C276 110 280 140 278 180', .55)),
    'spiky':    ('Spiky', '', hp(BOY_SPIKY) + strands('M124 96 L132 140 M172 60 L176 120 M222 62 L216 120 M268 92 L258 140', .5)),
    'wavyboy':  ('Curly', '', curly_cap()),
    'swoop':    ('Swoop', '', hp(BOY_SWOOP) + strands('M110 180 C150 140 200 128 260 136 M130 168 C170 140 220 138 280 150 M250 66 C276 90 296 120 306 160', .55) + shine('M130 92 C152 76 180 68 206 68')),
}

# ───────────────────────── clothes ─────────────────────────
def g(d, fill, line, w=3, extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{line}" stroke-width="{w}" {J}{extra}/>'
def ln(d, col, w=2.5, op=1, dash=None):
    da = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" opacity="{op}" stroke-linecap="round"{da}/>'
def dark(hexc, f=.78):
    h = hexc.lstrip('#'); r, gg, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return '#%02X%02X%02X' % (int(r*f), int(gg*f), int(b*f))
def light(hexc, f=.4):
    h = hexc.lstrip('#'); r, gg, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return '#%02X%02X%02X' % (int(r+(255-r)*f), int(gg+(255-gg)*f), int(b+(255-b)*f))

NECK = 'M162 340 C172 358 212 358 222 340'
def tee(c, extra='', sleeve_band=None):
    o = dark(c, .62)
    s = g(TEE_SHAPE, c, o) + ln(NECK, o, 3)
    s += ln('M122 408 C124 390 128 372 134 358 M262 408 C260 390 256 372 250 358', o, 2, .5)
    if sleeve_band:
        s += ln('M96 398 L122 404 M288 398 L262 404', sleeve_band, 7) + ln('M100 390 L124 396 M284 390 L260 396', sleeve_band, 3)
    return s + extra

HOOD_SHAPE = ('M126 350 C146 334 238 334 258 350 C280 368 292 400 300 434 C302 446 290 452 280 448 L266 444 L262 412 L264 486 '
              'C232 500 152 500 120 486 L122 412 L118 444 L104 448 C94 452 82 446 84 434 C92 400 104 368 126 350 Z')
def hoodie(c, deco=''):
    d, o = dark(c, .88), dark(c, .62)
    return (g('M150 338 C162 322 222 322 234 338 L228 356 C210 346 174 346 156 356 Z', d, o) + g(HOOD_SHAPE, c, o) +
            g('M84 432 C94 444 108 448 120 442 L118 456 C106 462 90 458 82 448 Z M300 432 C290 444 276 448 264 442 L266 456 C278 462 294 458 302 448 Z', d, o) +
            g('M120 474 C152 488 232 488 264 474 L264 492 C232 506 152 506 120 492 Z', d, o) +
            g('M150 428 L234 428 C240 444 242 460 240 472 L144 472 C142 460 144 444 150 428 Z', d, o) +
            g('M156 352 C170 374 214 374 228 352 C214 362 170 362 156 352 Z', d, o) +
            ln('M178 368 L178 404 M206 368 L206 404', '#FFFFFF', 5) +
            ln('M122 412 C126 380 132 364 140 356 M262 412 C258 380 252 364 244 356', o, 2.5, .6) + deco)

HEART = '<path d="M240 392 c-6 -8 -18 -2 -12 8 l12 10 l12 -10 c6 -10 -6 -16 -12 -8 Z" fill="#FFFFFF"/>'
def flower(x, y, r, petal, mid):
    return (f'<g transform="translate({x} {y})">' + ''.join(f'<circle r="{r}" cx="{dx*r:.1f}" cy="{dy*r:.1f}" fill="{petal}"/>' for dx, dy in ((0, -1.1), (1.05, -.35), (.65, .9), (-.65, .9), (-1.05, -.35))) +
            f'<circle r="{r*.7:.1f}" fill="{mid}"/></g>')

def puff_top(c):
    o = dark(c, .62)
    body = 'M132 352 C150 342 162 342 166 344 C174 360 210 360 218 344 C222 342 234 342 252 352 L262 480 C230 492 154 492 122 480 Z'
    return (g('M134 350 C104 346 90 372 96 396 C100 410 118 414 132 406 Z', c, o) + g('M250 350 C280 346 294 372 288 396 C284 410 266 414 252 406 Z', c, o) +
            g(body, c, o) + ln('M104 396 C112 406 124 408 132 404 M280 396 C272 406 260 408 252 404', o, 2.5, .7) +
            ln('M150 380 L150 476 M170 382 L170 480 M192 384 L192 482 M214 382 L214 480 M234 380 L234 476', o, 2, .35) + ln('M166 344 C174 360 210 360 218 344', o, 3))

def cami(c):
    o = dark(c, .62)
    return (ln('M150 376 L152 342 M234 376 L232 342', o, 7) + ln('M150 376 L152 342 M234 376 L232 342', c, 4) +
            g('M132 380 C160 368 224 368 252 380 L262 480 C230 492 154 492 122 480 Z', c, o) +
            '<path d="M178 378 c-8 -10 -20 0 -12 8 l12 10 l12 -10 c8 -8 -4 -18 -12 -8 Z" fill="#FFFFFF" opacity=".9"/>' +
            ln('M124 466 C154 476 230 476 260 466', o, 2, .5))

def smocked(c):
    o = dark(c, .62)
    s = tee(c)
    for y in (372, 388, 404):
        s += ln(f'M136 {y} q7 -5 14 0 q7 5 14 0 q7 -5 14 0 q7 5 14 0 q7 -5 14 0 q7 5 14 0 q7 -5 14 0 q7 5 14 0', o, 2, .55)
    s += g('M122 474 C154 486 230 486 262 474 L268 494 C254 504 242 494 230 504 C218 494 206 504 192 496 C178 504 166 494 154 504 C142 494 130 504 116 494 Z', c, o)
    return s

def overall_bib():
    c, o = '#7FCBA6', '#4E9A78'
    return (g('M146 382 L238 382 L242 470 L142 470 Z', c, o) + g('M162 404 L222 404 L220 440 L164 440 Z', dark(c, .9), o) +
            ln('M146 384 L136 346 M238 384 L248 346', o, 9) + ln('M146 384 L136 346 M238 384 L248 346', c, 5) +
            '<circle cx="150" cy="390" r="6" fill="#FFE07A" stroke="#C9A43A" stroke-width="2"/><circle cx="234" cy="390" r="6" fill="#FFE07A" stroke="#C9A43A" stroke-width="2"/>')

def pants(c, wide=False, stitch=None, cuff=True, pockets=False, waist=470):
    o = dark(c, .62)
    if wide:
        legs = f'M126 {waist} L258 {waist} C270 540 282 600 286 640 L206 644 L198 530 L186 530 L178 644 L98 640 C102 600 114 540 126 {waist} Z'
        cuffs = 'M98 622 L178 626 L178 652 L96 650 Z M206 626 L286 622 L288 650 L206 652 Z'
    else:
        legs = f'M126 {waist} L258 {waist} C264 530 270 590 274 640 L206 644 L198 530 L186 530 L178 644 L110 640 C114 590 120 530 126 {waist} Z'
        cuffs = 'M110 624 L178 626 L178 652 L108 650 Z M206 626 L274 624 L276 650 L206 652 Z'
    s = g(legs, c, o)
    if cuff: s += g(cuffs, light(c, .18), o)
    s += g(f'M126 {waist} L258 {waist} L259 {waist+18} L125 {waist+18} Z', dark(c, .92), o)
    if stitch:
        s += ln(f'M192 {waist+20} L192 528 M138 498 C146 516 162 518 172 508 M246 498 C238 516 222 518 212 508', stitch, 2, 1, '5 4')
    s += ln('M150 540 C152 580 156 600 160 620 M234 540 C232 580 228 600 224 620', o, 2, .35)
    if pockets:
        s += g('M112 556 L144 556 L146 596 L116 598 Z M272 556 L240 556 L238 596 L268 598 Z', dark(c, .9), o, 2.5)
        s += ln('M112 566 L144 566 M272 566 L240 566', o, 2, .7)
    return s

def leggings(c):
    o = dark(c, .62)
    return (g('M128 470 L256 470 C258 540 252 600 244 646 L204 648 L198 526 L186 526 L180 648 L140 646 C132 600 126 540 128 470 Z', c, o) +
            g('M128 470 L256 470 L256 486 L128 486 Z', dark(c, .9), o) + ln('M160 540 L164 630 M224 540 L220 630', light(c, .25), 3, .5))

def skirt(c):
    o = dark(c, .62)
    return (g('M128 466 L256 466 L288 568 C240 586 144 586 96 568 Z', c, o) +
            ln('M150 482 L132 576 M172 482 L164 582 M192 482 L192 584 M212 482 L220 582 M234 482 L252 576', o, 2.5, .5) +
            g('M128 466 L256 466 L258 484 L126 484 Z', dark(c, .9), o) +
            '<path d="M236 486 c-12 -10 -24 4 -10 10 c-14 6 -2 20 10 10 c12 10 24 -4 10 -10 c14 -6 2 -20 -10 -10 Z" fill="#FFE07A" stroke="#C9A43A" stroke-width="2"/>')

def sneaker(base, trim, sole, lace='#FFFFFF'):
    out = ''
    for cx in (152, 232):
        o = dark(trim, .7)
        out += g(f'M{cx-28} 648 C{cx-26} 632 {cx+26} 630 {cx+30} 648 C{cx+30} 656 {cx+34} 664 {cx+33} 678 L{cx-33} 678 C{cx-34} 664 {cx-32} 656 {cx-28} 648 Z', base, o)
        out += g(f'M{cx-34} 672 L{cx+34} 672 C{cx+34} 684 {cx+30} 688 {cx+24} 688 L{cx-24} 688 C{cx-30} 688 {cx-34} 684 {cx-34} 672 Z', sole, o)
        out += g(f'M{cx-22} 642 C{cx-10} 636 {cx+10} 636 {cx+22} 642 L{cx+18} 656 L{cx-18} 656 Z', trim, o)
        out += ln(f'M{cx-12} 646 L{cx+12} 646 M{cx-14} 652 L{cx+14} 652', lace, 2.5)
    return out

def maryjane(c):
    out = ''; o = dark(c, .62)
    for cx in (152, 232):
        out += g(f'M{cx-30} 656 C{cx-30} 644 {cx+30} 642 {cx+32} 660 C{cx+36} 676 {cx+30} 686 {cx+20} 686 L{cx-22} 686 C{cx-32} 686 {cx-36} 672 {cx-30} 656 Z', c, o)
        out += ln(f'M{cx-24} 652 C{cx-10} 644 {cx+10} 644 {cx+24} 652', o, 5) + f'<circle cx="{cx+18}" cy="650" r="4" fill="#FFE07A" stroke="{o}" stroke-width="1.5"/>'
        out += ln(f'M{cx-22} 674 C{cx-8} 680 {cx+8} 680 {cx+22} 674', light(c, .4), 3, .6)
    return out

def clog(c):
    out = ''; o = dark(c, .62)
    for cx in (152, 232):
        out += g(f'M{cx-32} 650 C{cx-30} 630 {cx+30} 630 {cx+32} 650 L{cx+34} 676 L{cx-34} 676 Z', c, o)
        out += g(f'M{cx-36} 674 L{cx+36} 674 L{cx+36} 688 L{cx-36} 688 Z', '#F5E6D3', '#B89C7C')
        for dx in (-14, 0, 14):
            out += f'<circle cx="{cx+dx}" cy="652" r="4" fill="{light(c, .5)}"/>'
    return out

def boots(c):
    out = ''; o = dark(c, .62)
    for cx in (152, 232):
        out += g(f'M{cx-24} 612 L{cx+24} 612 L{cx+26} 650 C{cx+36} 656 {cx+38} 672 {cx+34} 680 L{cx-34} 680 C{cx-36} 660 {cx-26} 646 {cx-24} 612 Z', c, o)
        out += g(f'M{cx-36} 676 L{cx+36} 676 C{cx+36} 686 {cx+32} 690 {cx+26} 690 L{cx-26} 690 C{cx-32} 690 {cx-36} 686 {cx-36} 676 Z', dark(c, .8), o)
        out += g(f'M{cx-26} 608 L{cx+26} 608 L{cx+26} 622 L{cx-26} 622 Z', light(c, .5), o)
    return out

def jacket(c, under='#FFFFFF', deco=''):
    o = dark(c, .62)
    s = g('M150 344 L234 344 L234 486 L150 486 Z', under, dark(under, .7))
    s += g(HOOD_SHAPE.replace('M126 350', 'M126 350'), c, o)
    s += g('M156 346 L182 420 L182 492 L150 492 Z', under, dark(under, .7))  # covers left opening (drawn after so the jacket looks open)
    s = (g(HOOD_SHAPE, c, o) + g('M164 344 C174 360 210 360 220 344 L208 494 L176 494 Z', under, dark(under, .7)) +
         ln('M164 344 L176 494 M220 344 L208 494', o, 3) +
         g('M84 432 C94 444 108 448 120 442 L118 456 C106 462 90 458 82 448 Z M300 432 C290 444 276 448 264 442 L266 456 C278 462 294 458 302 448 Z', dark(c, .9), o) +
         g('M150 340 L164 344 L172 384 L146 364 Z M234 340 L220 344 L212 384 L238 364 Z', light(c, .25), o) +
         ln('M122 412 C126 380 132 364 140 356 M262 412 C258 380 252 364 244 356', o, 2.5, .6) + deco)
    return s

STAR = '<path d="M246 402 l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2 Z" fill="#FFD84A" stroke="#C9A43A" stroke-width="1.5"/>'

GARMENTS = {
    # id: (kind, label, svg, over-svg)
    'pink-hoodie':  ('top', 'Pink hoodie', hoodie('#FF8FB8', HEART), ''),
    'puff-top':     ('top', 'Puff-sleeve top', puff_top('#C9A9F2'), ''),
    'cami':         ('top', 'Cami top', cami('#FFE58A'), ''),
    'smocked':      ('top', 'Ruffle top', smocked('#9FD8F5'), ''),
    'pocket-tee':   ('top', 'Pocket tee', tee('#FFFFFF', g('M214 386 L246 386 L246 420 L214 420 Z', '#F4F4F4', '#B0B0B8', 2.5) + ln('M214 394 L246 394', '#B0B0B8', 2)), ''),
    'floral':       ('top', 'Flower blouse', tee('#FFF4E6', flower(160, 392, 6, '#FF9DB8', '#FFD84A') + flower(222, 410, 6, '#FF9DB8', '#FFD84A') + flower(184, 448, 6, '#B89CF0', '#FFD84A') + flower(236, 460, 5, '#8FD3FF', '#FFD84A') + flower(144, 452, 5, '#8FD3FF', '#FFD84A')), ''),
    'bow-tee':      ('top', 'Bow tee', tee('#3C3550', '<path d="M192 360 c-12 -12 -26 -2 -14 8 c-12 10 2 20 14 8 c12 12 26 2 14 -8 c12 -10 -2 -20 -14 -8 Z" fill="#FF8FB8" stroke="#C94E7E" stroke-width="2"/>'), ''),
    'blue-hoodie':  ('top', 'Blue hoodie', hoodie('#7FB2F0', STAR), ''),
    'green-tee':    ('top', 'Striped tee', tee('#4FB89A', ''.join(g(f'M122 {y} L262 {y} L262 {y+14} L122 {y+14} Z', '#FFF6E0', '#FFF6E0', 0) for y in (378, 412, 446)) + g('M214 386 L246 386 L246 420 L214 420 Z', '#43A487', '#2E7A62', 2.5)), ''),
    'sport-tee':    ('top', 'Sport tee', tee('#FF7A6B', '<text x="192" y="440" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" stroke="#C9483C" stroke-width="2">7</text>', '#FFFFFF'), ''),
    'purple-jacket':('top', 'Purple jacket', jacket('#B49AF0', '#FFFFFF', flower(192, 420, 7, '#FF9DB8', '#FFD84A')), ''),
    'black-jacket': ('top', 'Star jacket', jacket('#3C3550', '#FFE58A', STAR.replace('M246 402', 'M262 402')), ''),
    'wide-jeans':   ('bottom', 'Wide jeans', pants('#6A97DA', wide=True, stitch='#B6CFF2'), ''),
    'leggings':     ('bottom', 'Leggings', leggings('#B784D9'), ''),
    'pleat-skirt':  ('bottom', 'Pleated skirt', skirt('#FFC94A'), ''),
    'jeans':        ('bottom', 'Jeans', pants('#6A97DA', stitch='#B6CFF2'), ''),
    'cargo':        ('bottom', 'Cargo pants', pants('#5FB894', pockets=True, cuff=True), ''),
    'overalls':     ('bottom', 'Overalls', pants('#7FCBA6', cuff=True, pockets=False), overall_bib()),
    'pink-pants':   ('bottom', 'Pink pants', pants('#FF9DC0', wide=True), ''),
    'mary-janes':   ('shoes', 'Mary Janes', maryjane('#FF6F91'), ''),
    'white-sneakers': ('shoes', 'White sneakers', sneaker('#FFFFFF', '#8FB8E8', '#E9EEF6'), ''),
    'pink-sneakers':  ('shoes', 'Pink sneakers', sneaker('#FFFFFF', '#FF8FB8', '#FF8FB8'), ''),
    'green-sneakers': ('shoes', 'Green sneakers', sneaker('#FFFFFF', '#4FB89A', '#E9EEF6'), ''),
    'clogs':        ('shoes', 'Clogs', clog('#B9A3F0'), ''),
    'boots':        ('shoes', 'Yellow boots', boots('#FFC94A'), ''),
}

# ───────────────────────── YunaVerse family pieces ─────────────────────────
def sweater(c, deco=''):
    """Crew-neck sweatshirt: long sleeves, ribbed cuffs and hem."""
    d, o = dark(c, .86), dark(c, .62)
    return (g(HOOD_SHAPE, c, o) +
            g('M84 432 C94 444 108 448 120 442 L118 456 C106 462 90 458 82 448 Z M300 432 C290 444 276 448 264 442 L266 456 C278 462 294 458 302 448 Z', d, o) +
            g('M120 474 C152 488 232 488 264 474 L264 492 C232 506 152 506 120 492 Z', d, o) +
            g('M156 342 C170 364 214 364 228 342 L222 340 C210 354 174 354 162 340 Z', d, o) +
            ln('M122 412 C126 380 132 364 140 356 M262 412 C258 380 252 364 244 356', o, 2.5, .6) + deco)

def raglan_tee(c, trim):
    """Tee with contrast raglan seams, neckline and sleeve bands."""
    o = dark(c, .7)
    return (tee(c, sleeve_band=trim) + ln('M162 342 C150 352 136 360 122 362 M222 342 C234 352 248 360 262 362', trim, 5) +
            ln('M162 340 C172 358 212 358 222 340', trim, 5))

def bunny_dress(c):
    """Long-sleeve party dress with a round white collar, little bunny face, bows and a ruffle hem."""
    d, o = dark(c, .9), dark(c, .62)
    collar = 'M150 342 C140 362 156 380 176 372 C184 368 190 360 192 354 C194 360 200 368 208 372 C228 380 244 362 234 342 C214 352 170 352 150 342 Z'
    s = g('M84 432 C94 444 108 448 120 442 L118 456 C106 462 90 458 82 448 Z M300 432 C290 444 276 448 264 442 L266 456 C278 462 294 458 302 448 Z', '#FFFFFF', '#C9B5BF')
    s += g('M128 350 C104 360 92 392 86 434 C96 446 110 448 122 440 L126 404 Z M256 350 C280 360 292 392 298 434 C288 446 274 448 262 440 L258 404 Z', c, o)
    s += g('M130 350 C150 338 234 338 254 350 L262 452 C276 500 290 550 298 586 C240 604 144 604 86 586 C94 550 108 500 122 452 Z', c, o)
    s += g('M86 584 C144 602 240 602 298 584 L302 600 C292 610 284 600 274 610 C264 600 254 612 242 604 C230 614 218 602 206 612 C196 602 188 612 178 604 C166 614 154 602 142 612 C130 602 120 612 110 604 C100 612 92 604 82 602 Z', '#FFF3F7', '#D9A9BC', 2.5)
    s += ln('M88 578 C146 594 238 594 296 578', '#FFFFFF', 3, .9)
    s += ln('M122 452 C152 462 232 462 262 452', o, 2.5, .6)
    s += g(collar, '#FFFFFF', '#C9B5BF', 2.5)
    # bunny face on the chest
    s += ('<g transform="translate(192 410)"><ellipse cx="-7" cy="-17" rx="5" ry="11" fill="#FFFFFF" stroke="#E7B4C6" stroke-width="2"/>'
          '<ellipse cx="7" cy="-17" rx="5" ry="11" fill="#FFFFFF" stroke="#E7B4C6" stroke-width="2"/>'
          '<ellipse cx="0" cy="0" rx="15" ry="13" fill="#FFFFFF" stroke="#E7B4C6" stroke-width="2"/>'
          '<circle cx="-5" cy="-1" r="2" fill="#5A3A40"/><circle cx="5" cy="-1" r="2" fill="#5A3A40"/>'
          '<ellipse cx="-9" cy="5" rx="3" ry="2" fill="#FFB8CC"/><ellipse cx="9" cy="5" rx="3" ry="2" fill="#FFB8CC"/></g>')
    for x in (146, 238):
        s += f'<g transform="translate({x} 448)"><path d="M0 0 c-10 -9 -20 1 -10 7 c-10 6 0 16 10 7 c10 9 20 -1 10 -7 c10 -6 0 -16 -10 -7 Z" fill="{light(c, .35)}" stroke="{o}" stroke-width="2"/><circle r="3" fill="{o}"/></g>'
    return s

def track_pants(c, stripe):
    """Loose track pants with side stripes and a drawstring."""
    s = pants(c, wide=True, cuff=False)
    s += ln('M130 488 C120 540 108 596 102 636 M254 488 C264 540 276 596 282 636', stripe, 5)
    s += ln('M184 474 L178 498 M200 474 L206 498', stripe, 2.5) + f'<ellipse cx="192" cy="478" rx="8" ry="4" fill="none" stroke="{stripe}" stroke-width="2.5"/>'
    return s

def cargo_shorts(c):
    o, d = dark(c, .62), dark(c, .88)
    s = g('M126 470 L258 470 C262 510 266 548 270 584 L202 588 L196 524 L188 524 L182 588 L114 584 C118 548 122 510 126 470 Z', c, o)
    s += g('M126 470 L258 470 L259 488 L125 488 Z', d, o)
    s += g('M110 528 L140 528 L142 566 L112 568 Z M274 528 L244 528 L242 566 L272 568 Z', d, o, 2.5) + ln('M110 538 L140 538 M274 538 L244 538', o, 2, .7)
    s += ln('M192 490 L192 522 M148 494 C154 506 166 508 174 500 M236 494 C230 506 218 508 210 500', o, 2, .5)
    return s

def wide_trousers(c):
    o = dark(c, .62)
    return (pants(c, wide=True, cuff=False) + ln('M160 492 C162 540 158 600 150 640 M224 492 C222 540 226 600 234 640', o, 2, .45) +
            g('M186 470 L198 470 L198 488 L186 488 Z', light(c, .3), o, 2))

def cardigan(c, under, stripe):
    """Open cardigan with buttons over a striped tee."""
    s = jacket(c, under)
    for y in range(362, 492, 14):
        f = (y - 344) / 150
        s += ln(f'M{164 + 12 * f + 3:.0f} {y} L{220 - 12 * f - 3:.0f} {y}', stripe, 4)
    s += ln('M164 344 L176 494 M220 344 L208 494', dark(c, .62), 3)
    for y in (392, 428, 464):
        s += f'<circle cx="{224 - (y - 344) / 150 * 12:.0f}" cy="{y}" r="5" fill="#A0764E" stroke="#6E4E30" stroke-width="2"/>'
    return s

def socks(frill=False):
    out = ''
    for cx in (152, 232):
        out += g(f'M{cx-18} 606 L{cx+18} 606 L{cx+20} 648 L{cx-20} 648 Z', '#FFFFFF', '#C9CCD6', 2.5)
        if frill:
            out += g(f'M{cx-22} 604 C{cx-16} 596 {cx-8} 610 {cx} 600 C{cx+8} 610 {cx+16} 596 {cx+22} 604 L{cx+20} 614 L{cx-20} 614 Z', '#FFFFFF', '#E3C2CF', 2)
            out += f'<g transform="translate({cx+10} 616)"><path d="M0 0 c-6 -6 -12 0 -6 4 c-6 4 0 10 6 4 c6 6 12 0 6 -4 c6 -4 0 -10 -6 -4 Z" fill="#FFB8CC" stroke="#E08AA8" stroke-width="1.5"/></g>'
        else:
            out += ln(f'M{cx-18} 614 L{cx+18} 614 M{cx-18} 620 L{cx+18} 620', '#D5D9E2', 2)
    return out

def bunny_clip(x, y):
    return (f'<g transform="translate({x} {y})"><ellipse cx="-6" cy="-14" rx="4.5" ry="10" fill="#FFC2D6" stroke="#D97A9E" stroke-width="2"/>'
            '<ellipse cx="6" cy="-14" rx="4.5" ry="10" fill="#FFC2D6" stroke="#D97A9E" stroke-width="2"/>'
            '<ellipse cx="0" cy="0" rx="13" ry="11" fill="#FFC2D6" stroke="#D97A9E" stroke-width="2"/>'
            '<circle cx="-4" cy="-1" r="1.8" fill="#5A3A40"/><circle cx="4" cy="-1" r="1.8" fill="#5A3A40"/></g>')

LOW_BUN = ('<circle cx="318" cy="268" r="38" fill="{H}" stroke="{HO}" stroke-width="3"/>' +
           strands('M290 252 C306 238 330 240 344 256 M294 278 C310 264 334 266 348 282', .6))
FACE_WISPS = strands('M84 214 C76 250 80 284 92 304 M300 214 C308 250 304 284 292 304', .8)

HAIR.update({
    'lowbun':    ('Low bun', LOW_BUN, part_front() + FACE_WISPS),
    'bunnybob':  ('Bob with bunny clip', hp(BOB_BACK, '{HD}'), hp(CAP_BANGS) + BANGS_LINES + bunny_clip(272, 132)),
})

GARMENTS.update({
    'red-hoodie':    ('top', 'Red hoodie', hoodie('#E8573F'), ''),
    'raglan-tee':    ('top', 'Sporty tee', raglan_tee('#FFFFFF', '#F28BB0'), ''),
    'royal-hoodie':  ('top', 'Cobalt hoodie', hoodie('#2F6BD9'), ''),
    'bunny-dress':   ('top', 'Bunny dress', bunny_dress('#F7A8C4'), ''),
    'cardigan':      ('top', 'Cozy cardigan', cardigan('#F2E6CF', '#FFFFFF', '#3C3550'), ''),
    'navy-sweater':  ('top', 'Navy sweater', sweater('#2C3352'), ''),
    'track-pants':   ('bottom', 'Track pants', track_pants('#2E2B33', '#F28BB0'), ''),
    'cargo-shorts':  ('bottom', 'Cargo shorts', cargo_shorts('#2F3340'), ''),
    'khaki-wide':    ('bottom', 'Wide trousers', wide_trousers('#D8C3A0'), ''),
    'red-sneakers':  ('shoes', 'Red sneakers', sneaker('#FFFFFF', '#E8573F', '#F1F1F1'), ''),
    'blue-sneakers': ('shoes', 'Blue sneakers', socks() + sneaker('#FFFFFF', '#2F6BD9', '#F1F1F1'), ''),
    'bow-shoes':     ('shoes', 'Bow shoes', socks(True) + maryjane('#F7A8C4'), ''),
    'cream-sneakers':('shoes', 'Cream sneakers', sneaker('#F7F1E6', '#CDB48C', '#EDE3D2', '#F7F1E6'), ''),
    'gray-sneakers': ('shoes', 'Gray sneakers', sneaker('#FFFFFF', '#6E7179', '#E9EEF6'), ''),
})

# ───────────────────────── grown-up build ─────────────────────────
# Grown-ups use the same head and the same outfits, re-drawn on a longer body: every point
# below the neck is moved by grow(), so all clothes still fit with no extra drawing.
# Bands: neck and head unchanged; chest/arms stretched; the hand/hip band kept rigid (hands
# stay hand-shaped); legs stretched; feet unchanged (just moved down).
ADULT_TORSO = (344, 440, 1.32)    # y from, y to, stretch
ADULT_LEGS = (500, 640, 1.5)
ADULT_WIDEN = 1.07
def _gy(y):
    a0, a1, ak = ADULT_TORSO; b0, b1, bk = ADULT_LEGS
    if y <= a0: return y
    if y <= a1: return a0 + (y - a0) * ak
    t = a0 + (a1 - a0) * ak
    if y <= b0: return t + (y - a1)
    t += b0 - a1
    if y <= b1: return t + (y - b0) * bk
    return t + (b1 - b0) * bk + (y - b1)
grow_y = _gy
ADULT_GROW = round(_gy(720) - 720)      # extra canvas height for grown-ups
def _gx(x, y):
    k = 1 + (ADULT_WIDEN - 1) * max(0, min(1, (y - 344) / 40))
    return 192 + (x - 192) * k
def _grow_pt(x, y): return _gx(x, y), _gy(y)

import re as _re
_NUM = r'-?\d*\.?\d+(?:e-?\d+)?'
def _grow_path(d):
    toks = _re.findall(r'[MLCQZHVmlcqzhv]|' + _NUM, d)
    out, i, cmd = [], 0, None
    cx = cy = sx = sy = 0.0
    def num():
        nonlocal i
        v = float(toks[i]); i += 1; return v
    f = lambda v: f'{v:.1f}'.rstrip('0').rstrip('.')
    while i < len(toks):
        t = toks[i]
        if _re.fullmatch('[A-Za-z]', t): cmd = t; i += 1
        if cmd in 'Zz':
            out.append('Z'); cx, cy = sx, sy; continue
        rel = cmd.islower(); C = cmd.upper()
        n = {'M': 1, 'L': 1, 'C': 3, 'Q': 2, 'H': 1, 'V': 1}[C]
        if C == 'H':
            x = num() + (cx if rel else 0); pts = [(x, cy)]; C = 'L'
        elif C == 'V':
            y = num() + (cy if rel else 0); pts = [(cx, y)]; C = 'L'
        else:
            pts = []
            for _ in range(n):
                x, y = num(), num()
                pts.append((x + cx, y + cy) if rel else (x, y))
        cx, cy = pts[-1]
        if C == 'M':
            sx, sy = cx, cy
            cmd = 'l' if rel else 'L'      # extra pairs after M are line-tos
        out.append(C + ' '.join(f(a) + ' ' + f(b) for a, b in (_grow_pt(*p) for p in pts)))
    return ' '.join(out)

def grow(svg):
    """Re-draw a body-space SVG snippet on the grown-up body."""
    out, depth_rigid, pos = [], 0, 0
    for m in _re.finditer(r'<(/?)(\w+)([^>]*?)(/?)>', svg):
        out.append(svg[pos:m.start()]); pos = m.end()
        close, tag, attrs, selfclose = m.groups()
        if close:
            if tag == 'g' and depth_rigid: depth_rigid -= 1
            out.append(m.group(0)); continue
        if depth_rigid:
            if tag == 'g' and not selfclose: depth_rigid += 1
            out.append(m.group(0)); continue
        tr = _re.search(r'transform="translate\((' + _NUM + r')[ ,](' + _NUM + r')\)"', attrs)
        if tr and tag == 'g':          # a little rigid group (flower, bow): move it, don't stretch it
            x, y = _grow_pt(float(tr.group(1)), float(tr.group(2)))
            attrs = attrs.replace(tr.group(0), f'transform="translate({x:.1f} {y:.1f})"')
            if not selfclose: depth_rigid += 1
        elif tag == 'path':
            attrs = _re.sub(r' d="([^"]*)"', lambda mm: f' d="{_grow_path(mm.group(1))}"', attrs)
        elif tag in ('circle', 'ellipse'):
            cxm = _re.search(r' cx="(' + _NUM + ')"', attrs); cym = _re.search(r' cy="(' + _NUM + ')"', attrs)
            if cxm and cym:
                x, y = _grow_pt(float(cxm.group(1)), float(cym.group(1)))
                attrs = attrs.replace(cxm.group(0), f' cx="{x:.1f}"').replace(cym.group(0), f' cy="{y:.1f}"')
        elif tag == 'text':
            xm = _re.search(r' x="(' + _NUM + ')"', attrs); ym = _re.search(r' y="(' + _NUM + ')"', attrs)
            x, y = _grow_pt(float(xm.group(1)), float(ym.group(1)))
            attrs = attrs.replace(xm.group(0), f' x="{x:.1f}"').replace(ym.group(0), f' y="{y:.1f}"')
        out.append(f'<{tag}{attrs}{selfclose}>')
    out.append(svg[pos:])
    return ''.join(out)
