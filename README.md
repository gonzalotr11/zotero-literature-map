# Zotero Literature Map

An open-source, browser-based tool for transforming Zotero CSV exports into transparent, conceptually coded literature maps.

[Español](#español) · [English](#english)

## Español

### ¿Qué problema resuelve?

Zotero organiza referencias, pero una revisión académica también necesita mostrar cómo se relacionan los artículos con teorías, exposiciones, mecanismos, resultados y funciones argumentales. Zotero Literature Map separa cuidadosamente dos operaciones:

1. **Descripción automática:** metadatos, años, fuentes, DOI, resúmenes y etiquetas.
2. **Interpretación sustantiva:** una matriz de codificación humana, explícita y revisable.

La herramienta no usa modelos externos ni envía archivos a un servidor. Todo el procesamiento ocurre en el navegador.

### Uso rápido

1. En Zotero, selecciona una colección.
2. Haz clic derecho y elige **Exportar colección**.
3. Selecciona **CSV** y guarda el archivo.
4. Abre el sitio y selecciona **Importar CSV de Zotero**.
5. Para construir el mapa conceptual, descarga la plantilla de codificación, complétala y usa **Añadir coding.csv**.

### Ejecutar localmente

```bash
git clone https://github.com/YOUR-USERNAME/zotero-literature-map.git
cd zotero-literature-map
python -m http.server 8000
```

Luego abre `http://localhost:8000`. No se necesita instalación de paquetes.

### Archivos de entrada

#### Exportación de Zotero

Se reconocen los nombres estándar de columnas de Zotero, entre ellos:

- `Key`
- `Item Type`
- `Publication Year`
- `Author`
- `Title`
- `Publication Title`
- `DOI`
- `Url`
- `Abstract Note`
- `Manual Tags` y `Automatic Tags`

#### Matriz de codificación

`coding.csv` se enlaza preferentemente mediante `Key` y, como respaldo, mediante el título normalizado. Los campos sustantivos están documentados en [`data/codebook.csv`](data/codebook.csv).

### Principio metodológico

Una similitud textual, una mediación estadística y un mecanismo causal identificado no son equivalentes. Por eso la herramienta distingue:

- **Mencionado:** el artículo propone un proceso.
- **Asociado:** las variables covarían.
- **Modelado:** el proceso aparece como mediador, moderador o componente estructural.
- **Identificado:** el diseño respalda una interpretación causal defendible.

Consulta la [guía de codificación](docs/coding-guide.es.md) y las [limitaciones metodológicas](docs/methodological-notes.es.md).

### Ejemplo ELPI

El botón **Cargar ejemplo ELPI** utiliza diez referencias seleccionadas de una biblioteca sobre condiciones económicas y desarrollo infantil. Los textos descriptivos del ejemplo son paráfrasis breves; no se distribuyen PDFs ni resúmenes editoriales completos.

### Publicar con GitHub Pages

El repositorio incluye un flujo automático. En GitHub:

1. Abre **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions**.
3. Envía cambios a la rama `main`.

### Privacidad

Los archivos elegidos mediante el navegador se procesan localmente. Aun así, cualquier archivo incluido dentro de un repositorio público será visible públicamente. Revisa notas, rutas locales y otros campos antes de publicar ejemplos.

## English

### Purpose

Zotero Literature Map converts a Zotero CSV export into an interactive evidence map while keeping metadata extraction separate from substantive interpretation.

- **Descriptive mode** works directly from Zotero metadata.
- **Substantive mode** joins an explicit, editable `coding.csv` file.
- Processing is local to the browser; no bibliography is uploaded.
- No build system or runtime dependency is required.

### Quick start

1. Export a Zotero collection as CSV.
2. Import it into the app.
3. Download and complete the coding template if a conceptual map is needed.
4. Import `coding.csv` and explore clusters, mechanisms, outcomes, and evidence quality.

See the Spanish documentation for the current detailed methodological guide. English documentation contributions are welcome.

## Contributing

Issues and pull requests are welcome. Please keep new coding dimensions optional and document any substantive assumptions.

## License

MIT License. See [`LICENSE`](LICENSE).

## Citation

If you use the tool in teaching or research, cite the repository version or release used. A `CITATION.cff` file is included for software citation.
