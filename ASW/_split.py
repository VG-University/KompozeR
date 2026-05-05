import json, os

base = r'c:\Users\giann\Documents\GitHub\KompozeR\ASW'
out_dir = os.path.join(base, '_txt')
os.makedirs(out_dir, exist_ok=True)

with open(os.path.join(base, '_extracted.json'), encoding='utf-8') as f:
    data = json.load(f)

for name, text in data.items():
    safe = name.replace(' ', '_').replace('/', '_')
    with open(os.path.join(out_dir, safe + '.txt'), 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'Written: {safe}.txt')
print('Done.')
