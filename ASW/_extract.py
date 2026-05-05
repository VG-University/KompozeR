import pdfplumber, os, json

base = r'c:\Users\giann\Documents\GitHub\KompozeR\ASW'
files = [
    'lezione1_intro.pdf',
    'lezione1_soluzioni_architetturali.pdf',
    'lezione2_browser.pdf',
    'lezione3_serverweb_mvc.pdf',
    'lezione4_introMEAN.pdf',
    'lezione4_metodologie_design.pdf',
    'lezione5_metodologie_sviluppo_testing.pdf',
    'lezione7_spa.pdf',
    'lezione8_vue.pdf',
    'lezione9_typescript.pdf',
    'lezione10_css_flexbox.pdf',
    'lezione10_scss_sass.pdf',
    'lezione11_angular.pdf',
    'ASW24-25 - Mongo_Nodejs_in_containers.pdf',
    'sus-web-dev.pdf',
]
reports_dir = os.path.join(base, 'Esempi Reports')
report_files = ['report 1.pdf', 'report 2.pdf', 'report 3.pdf', 'report 4.pdf']

results = {}
for f in files:
    path = os.path.join(base, f)
    txt = []
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    txt.append(t)
        results[f] = '\n'.join(txt)
        print(f'OK: {f} ({len(results[f])} chars)')
    except Exception as e:
        results[f] = ''
        print(f'ERR: {f} -> {e}')

for f in report_files:
    path = os.path.join(reports_dir, f)
    txt = []
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    txt.append(t)
        results[f] = '\n'.join(txt)
        print(f'OK: {f} ({len(results[f])} chars)')
    except Exception as e:
        results[f] = ''
        print(f'ERR: {f} -> {e}')

with open(os.path.join(base, '_extracted.json'), 'w', encoding='utf-8') as out:
    json.dump(results, out, ensure_ascii=False)
print('Done.')
