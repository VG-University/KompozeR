import pdfplumber, json, os

ds_dir = r"c:\Users\giann\Documents\GitHub\KompozeR\DS"
output = {}

for fname in sorted(os.listdir(ds_dir)):
    if fname.endswith(".pdf"):
        path = os.path.join(ds_dir, fname)
        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
        output[fname] = text
        print(f"OK: {fname} ({len(text)} chars)")

# LAB subfolder
lab_dir = os.path.join(ds_dir, "LAB")
for fname in sorted(os.listdir(lab_dir)):
    if fname.endswith(".pdf"):
        path = os.path.join(lab_dir, fname)
        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
        output["LAB/" + fname] = text
        print(f"OK: LAB/{fname} ({len(text)} chars)")

with open(os.path.join(ds_dir, "_ds_extracted.json"), "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("\nDone. Total files:", len(output))
