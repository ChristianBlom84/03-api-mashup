# Mashed
Mall för API mashup inlämning

Deployad version (uppdateras efter inlämning):
[Länk](http://u03.christianblom.se/)

## Mappstruktur och filer med förklaring
```bash
./
├── /.vscode/
│   └── settings.json            # Konfigurationsfil för Live Server pluginet till VSCode, säger till den att servera från mappen "public"
├── /src/                        # Huvudsaklig mapp, förkortning av "source" som syftar till källkod.
│   ├── /scss/                   # Mappen för Sass, denna används endast i den avancerade versionen (se nedan). Den går att bortse från.
│   │    ├── /utilities/         # Mapp för användbara mixins i Sass
│   │    │   └── _layout.scss    # Projektets reset, Denna görs om till CSS automatiskt vid ändringar och CSS:en hamnar i public/css/reset.css
│   │    ├── app.scss            # Projektets Sass, här läses de andra scss-filerna in. Denna görs om till CSS automatiskt vid ändringar och CSS:en hamnar i public/css/app.css
│   │    └── reset.scss          # Projektets reset, Denna görs om till CSS automatiskt vid ändringar och CSS:en hamnar i public/css/reset.css
│   └── /public/                 # Den publika mappen, denna är redo att användas av en webbserver.
│       ├── /css/                # Mapp för CSS, använd denna för CSS om du inte vill använda Sass.
│       ├── /js/                 # Mapp för JavaScript. Här skrivs din kod.
│       ├── favicon.ico          # "Favicon" en 16x16 pixlar stor bild som visar en liten ikon på en webbläsar-flik.
│       └── index.html           # Vår HTML-fil som laddas först av webbservern. Alla andra filer läses in härifrån.
├── .gitignore                   # Fil som säger till Git vad den *inte* ska versionshantera.
├── package.json                 # Fil som hanterar beroenden på annan kod i vårt projekt, rör ej denna fil.
└── README.md                    # Filen du läser i just nu.
```

### Kom igång (enkla versionen)
1. Öppna upp index.html och använd CTRL+SHIFT+P eller (⌘+SHIFT+P på Mac) och välj skriv sedan "Live:Server Open With Live Server" och tryck enter.
2. En tabb ska nu öppnas på http://127.0.0.1:5500/

**Notera**: Den enkla versionen har endast stöd för CSS så ändra i filerna i `css` för att se ändringar.

### Kom igång (den lite mer avancerade versionen)
1. Ställ dig i roten på detta projekt och skriv `npm install`
2. När det kommandot är klart skriv `npm start`
3. En tabb ska nu öppnas på http://localhost:3000/
4. Du kan nu ändra i både JavaScript-filer, Sass-filer och så kommer sidan att laddas om automatiskt. (Ändringar i HTML kräver refresh)

* Tips: Öppnar du nu en tabb till http://localhost:3001/ får du tillgång till Browsersyncs gränssnitt. Detta verktyg hjälper dig hålla kolla på vilka enheter som besöker sidan och vilka som ska laddas om beroende på ändringar. Detta är väldigt användbart om du ska testa på externa enheter. För att prova, använd länken som listas under "External" på din mobila enhet. Om du provar att ändra i t.ex. din JS-fil så kommer både webbläsaren lokalt att ladda om, såväl som din mobila enhet.

**Notera**: När du är klar med uppgiften ladda endast upp innehållet i mappen `src/public` till Bineros `public_html` katalog.
