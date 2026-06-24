# Project Definition

Documentazione tecnica completa di KompozeR in LaTeX, allineata all'implementazione reale del repository.

## Struttura

- `main.tex`: entrypoint del documento.
- `sections/`: capitoli tematici (scoping, architettura, backend, frontend, endpoint, CAD, test, deployment, conclusioni).

## Compilazione

Eseguire dalla cartella `Project Definition`:

```bash
pdflatex -interaction=nonstopmode main.tex
```

Oppure con latexmk:

```bash
latexmk -pdf main.tex
```

## Nota di allineamento

Il contenuto e' stato costruito partendo dai file in `utilities/`, ma verificato contro il codice reale in `kompozer/backend`, `kompozer/frontend` e `kompozer/e2e`.
