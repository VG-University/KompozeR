import pdfplumber, json, os

os.chdir(r"c:\Users\giann\Documents\GitHub\KompozeR\ASW\Esempi Reports")

reports = {}
for i in range(1, 5):
    fname = f'report {i}.pdf'
    try:
        with pdfplumber.open(fname) as pdf:
            text = ''
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + '\n'
            reports[fname] = text
            print(f'report {i}: {len(text)} chars, {len(pdf.pages)} pages')
    except Exception as e:
        print(f'report {i}: ERROR {e}')

with open('_reports_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(reports, f, ensure_ascii=False)
print('Done')
