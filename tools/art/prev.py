import sys, subprocess, os
sys.path.insert(0, os.path.dirname(__file__))
from parts import *
SKINS = ['#FAD5B8', '#F3BE97', '#DDA071', '#A8693F']
HAIRC = {'darkbrown': '#6B3D26', 'black': '#2E2628', 'blonde': '#E8BC70', 'pink': '#F496BE', 'lavender': '#AC8EE6', 'ginger': '#D46E3A', 'brown': '#8A5A3A', 'blue': '#6092E0'}
EYEC = {'brown': '#7A4424', 'green': '#3F8A55', 'blue': '#3F7FCC', 'hazel': '#967837', 'gray': '#7C8792', 'purple': '#8B5CC4'}

def tokens(d, uid='x'):
    s = SKINS[d['tone']]; h = HAIRC[d['hairColor']]; e = EYEC[d['eyes']]; t = d.get('tee', '#FFFFFF'); b = d.get('shorts', '#FFFFFF')
    return {'S': s, 'SD': dark(s, .86), 'SO': dark(s, .62), 'H': h, 'HD': dark(h, .82), 'HO': dark(h, .55), 'HL': light(h, .4),
            'E': e, 'EL': light(e, .35), 'ED': dark(e, .5), 'EDD': dark(e, .7), 'T': t, 'TO': dark(t, .7), 'B': b, 'BO': dark(b, .7), 'U': uid}
def paint(svg, tok):
    import re
    return re.sub(r'\{(\w+)\}', lambda m: tok[m.group(1)], svg)

def compose(d, expr='happy'):
    hb, hf = ('', '') if not d.get('hair') else HAIR[d['hair']][1:]
    G = lambda k: GARMENTS[d[k]] if d.get(k) else None
    parts = DEFS + hb + BODY
    if not d.get('bottom'): parts += BASIC_SHORTS
    if not d.get('top'): parts += BASIC_TEE
    for k in ('shoes', 'bottom', 'top'):
        if G(k): parts += G(k)[2]
    if G('bottom') and G('bottom')[3]: parts += G('bottom')[3]
    parts += HEAD + face(d['face'], expr) + hf
    return paint(parts, tokens(d))

def svgdoc(inner, w=384, h=780, vb='0 -60 384 780', bg='#EAF4FF'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}"><rect x="-1000" y="-1000" width="3000" height="3000" fill="{bg}"/>{inner}</svg>'

def sheet(cells, cols, cw, ch, out):
    rows = (len(cells) + cols - 1) // cols
    W, H = cols * cw, rows * ch
    body = ''.join(f'<svg x="{(i%cols)*cw}" y="{(i//cols)*ch}" width="{cw}" height="{ch}" viewBox="{vb}">{inner}</svg>' for i, (inner, vb) in enumerate(cells))
    doc = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="#EAF4FF"/>{body}</svg>'
    p = out.replace('.png', '.svg'); open(p, 'w').write(doc)
    subprocess.run(['python3', os.path.join(os.path.dirname(__file__), 'shot.py'), os.path.abspath(p), os.path.abspath(out), str(W), str(H)], check=True)

if __name__ == "__main__":
    D = os.path.dirname(os.path.abspath(__file__))
    looks = [
        dict(tone=1, face='girl', hair='buns', hairColor='darkbrown', eyes='brown', top='pink-hoodie', bottom='jeans', shoes='pink-sneakers'),
        dict(tone=3, face='boy', hair='messy', hairColor='black', eyes='brown', top='green-tee', bottom='overalls', shoes='green-sneakers'),
        dict(tone=2, face='girl', hair='long', hairColor='pink', eyes='green', top='cami', bottom='pleat-skirt', shoes='boots'),
        dict(tone=0, face='girl', hair='braids', hairColor='blonde', eyes='blue', top='puff-top', bottom='leggings', shoes='mary-janes'),
        dict(tone=1, face='boy', hair='spiky', hairColor='brown', eyes='hazel', top='blue-hoodie', bottom='cargo', shoes='white-sneakers'),
        dict(tone=2, face='girl', hair='bangs', hairColor='black', eyes='brown', top='purple-jacket', bottom='pink-pants', shoes='clogs'),
        dict(tone=3, face='girl', hair='pigtails', hairColor='lavender', eyes='purple', top='floral', bottom='wide-jeans', shoes='white-sneakers'),
        dict(tone=0, face='boy', hair='wavyboy', hairColor='ginger', eyes='gray', top='black-jacket', bottom='jeans', shoes='boots'),
    ]
    sheet([(compose(d), '0 -60 384 780') for d in looks], 4, 300, 609, os.path.join(D, 'looks.png'))
    fc = [(compose(dict(looks[0], top=None), e), '30 -40 324 400') for e in EXPRS] + [(compose(dict(looks[1], top=None), e), '30 -40 324 400') for e in EXPRS]
    sheet(fc, 8, 180, 222, os.path.join(D, 'faces.png'))
    hc = [(compose(dict(tone=1, face='girl' if k not in ('sidepart','messy','spiky','wavyboy','swoop') else 'boy', hair=k, hairColor='darkbrown', eyes='brown', top=None, bottom=None, shoes=None)), '0 -60 384 620') for k in HAIR]
    sheet(hc, 7, 200, 323, os.path.join(D, 'hair.png'))
    gc = [(compose(dict(tone=1, face='girl', hair=None, hairColor='darkbrown', eyes='brown', **{GARMENTS[k][0]: k})), '0 -60 384 780') for k in GARMENTS]
    sheet(gc, 9, 170, 345, os.path.join(D, 'garments.png'))
