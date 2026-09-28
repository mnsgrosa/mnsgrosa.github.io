# Design System — mnsgrosa.github.io

> **Fonte da verdade para qualquer mudança de UI.** Leia este arquivo antes de
> editar `src/styles/`, `src/layouts/` ou componentes visuais. O subagente
> `design-reviewer` audita diffs contra esta spec.

## Identidade

Blog pessoal **escuro, mono-forward e editorial**, paleta **Gruvbox Dark**
(dark-only — o site não tem modo claro e não vai ter). Fundo em papel `bg0`,
texto quente `fg1`, um único acento laranja `#fe8019` que carrega links,
navegação ativa e o foco de teclado. Hierarquia sustentada por **tamanho**,
**peso** e **régua**, não por cor decorativa: fora da paleta, nenhuma cor.

A voz tipográfica é de terminal: títulos em JetBrains Mono 700, corpo em Inter,
código em JetBrains Mono. Sem itálico em heading — ênfase se faz com peso, cor
ou sublinhado.

---

## Paleta de tokens (Gruvbox Dark)

Os **valores hex são a fonte da verdade**. O slot Gruvbox é referência.

| Papel | Hex | Slot Gruvbox |
|-------|-----|--------------|
| Fundo principal (papel) | `#282828` | `bg0` |
| Card / painel / TOC / output | `#32302f` | `bg0_s` |
| Superfície elevada (input, chip, código) | `#3c3836` | `bg1` |
| Bordas / separadores | `#504945` | `bg2` |
| Texto principal (tinta) | `#ebdbb2` | `fg1` |
| Texto secundário / resumos / legendas | `#d5c4a1` | `fg2` |
| Metadados (data, tempo, copyright) | `#a89984` | `fg4` |
| Link / destaque ativo / foco | `#fe8019` | `orange` |
| Link visitado | `#d3869b` | `purple` |
| Chrome de bloco de código (`--output-foreground`) | `#83a598` | `aqua` |

### Regras de uso da cor

1. **`#fe8019` (orange) é o único acento.** Links, item de nav ativo, anel de
   `:focus-visible`, borda de `blockquote`, `.post-list`. Nada mais.
2. **`#d3869b` (purple) é reservado a link visitado.** Só aparece via
   `--accent-soft` / `--link-visited`. Não use em chip, tag, badge ou ícone.
   (Por isso as tags passaram a usar `--tag-foreground`.)
3. **`#83a598` (aqua) é chrome de bloco de código.** Reservado a
   `--output-foreground`, agrupado ao `<pre>`/`.output`.
4. **Tag/chip é metadado, não acento:** `--tag-foreground` (`fg2`).
5. Superfície de código é **`bg1 #3c3836`**, um degrau acima do papel, para o
   bloco ler como painel e não sumir no fundo.

---

## Tipografia

| Papel | Família | Token |
|-------|---------|-------|
| Corpo de texto | Inter Variable | `--font-body` |
| Headings `h1`–`h6` | JetBrains Mono Variable | `--font-display` |
| Logotipo (`.brand`) | JetBrains Mono Variable | `--font-display` |
| Código (`code`, `pre`) | JetBrains Mono Variable | `--font-mono` |

- **As fontes são carregadas de `@fontsource-variable/*`** (self-hosted,
  importadas em `src/layouts/BaseLayout.astro`). Nenhuma requisição externa de
  fonte, nenhum `<link>` para Google Fonts. As folhas importadas são
  `inter/wght.css` e `jetbrains-mono/wght.css`: eixo `wght`, estilo normal,
  todos os subsets com `unicode-range`, então um leitor pt-br baixa só
  latin / latin-ext.
- Corpo de texto: **alinhado à esquerda** (não justificado). Justificar com a
  Inter nessa medida criava rios e esticava títulos de cargo no portfolio.
- Headings: **sempre romanos** (`font-style: normal`) e **700**. Hierarquia por
  tamanho: `h1` 2em → `h2` 1.65em → `h3` 1.3em → `h4` 1.1em.
- `h2` dentro do conteúdo tem régua inferior `bg2` (`--border-general`) — a
  régua é separador, **não** acento.
- `strong` = 600, `th` = 500 (ajustes da Inter).
- Medida do **shell**: 68vw, 62vw acima de 1150px, teto de 1200px acima de
  1600px — essas larguras continuam em `body` e não mudam.
- `line-height` do corpo: 1.62.

### Medida do texto corrido (prose-only)

O corpo do artigo fica dentro de `<main>`, que só é renderizado pela rota de
slug (`src/pages/[section]/[slug].astro`). Acima de 1150px **a coluna do artigo**
— o wrapper `.article` que envolve `#single-header` + TOC + `<main>` — recebe
`max-width: 58ch` com `margin-inline: auto`. **O shell, o grid de cards da home
e o grid do portfolio mantêm a largura atual**; só o artigo estreita. O hero do
artigo **não** está dentro de `.article`: é um irmão colocado ANTES dele (o slot
da rota tem `<body>` como raiz), então ele ocupa a largura do shell, não a coluna.

Os três — `#single-header`, o TOC e o `<main>` — são irmãos, não filhos: limitar
apenas o `<main>` centralizava a prosa e deixava o h1 na borda esquerda do shell
(1600px: h1 em x≈192, primeiro parágrafo em x≈497). Por isso `.article` e `main`
entram na **mesma** regra — mesma largura e mesmo eixo. O header do site continua
na largura do shell, e **o hero do artigo também**: banner largo sobre coluna
estreita, com o título abaixo do banner. É a composição escolhida.

`58ch` e não `65–75ch`: a unidade `ch` é o avanço do glifo `0` (10.09px na
Inter 16px), que é ~1.23x o avanço médio do texto corrido real (7.94px). A faixa
de **65–75 characteres** equivale, portanto, a 53–61ch. Com `58ch` a medida
medida fica em ~70–71 caracteres por linha tanto em 1150px quanto em 1600px+.
Abaixo de 1150px o cap não se aplica e a medida é a de hoje.

Medida verificada (contagem renderizada, via `Range.getClientRects()`, não por
chute): 320px 31.4 cc/l · 375px 38.0 · 414px 41.3 · 768px 62.0 · 1150px 70.0 ·
1600px 71.1.

### Override registrado — `h4` não é mais itálico

A versão anterior deste arquivo especificava `h4 = normal + itálico`. **Essa
regra foi removida.** Heading itálico é um tell de slop e reprova o gate de
italício do Hallmark. Ênfase em heading se faz com peso, cor ou sublinhado,
nunca com `font-style: italic`. Ver `src/styles/main.css` (bloco `h4`).

---

## Hierarquia visual

| Nível | Elemento | Cor |
|-------|----------|-----|
| 1 | Título grande de página | `fg1` |
| 2 | Título de post | `fg1` |
| 3 | Corpo de texto / resumos | `fg1` / `fg2` |
| 4 | Metadados (data, tempo, copyright) | `fg4` |
| — | Acento (link, nav ativo, foco) | `orange` |

> **Régua de acento sob o título N1:** especificada, **não implementada** —
> nenhum `h1` tem `border` hoje. Se for adicionada, a cor é `--accent`.

---

## Regras por elemento

### Links
- Padrão / ativo: `orange` (`--link` / `--accent`), `text-decoration: none`.
- `:hover`: `text-decoration: underline` — a mudança é a própria linha.
  Em nav e filtros o hover troca a cor para `orange`.
- `:active`: `--text` (`fg1`).
- `:visited`: `purple` (`--link-visited`) — nunca igual ao não-visitado.
- `:focus-visible`: anel estático de 2px em `--accent`, `outline-offset: 2px`,
  `border-radius: 2px`. **Nunca animado.** Contraste do anel sobre o papel:
  6.86:1.

### Cabeçalho / navegação
- `.site-header` com régua inferior `bg2`. Logo (`.brand`): `fg1`, família
  `--font-display` (JetBrains Mono), peso 700 herdado do `bold`; a 1.15em ele lê
  mais leve que um título de post (h1 a 2em). Hover → `orange`.
- Links de contato e de menu: `fg2`; hover → `orange` com sublinhado.
- Nenhum rótulo de nav quebra em duas linhas (`white-space: nowrap`); abaixo de
  480px os grupos são compactados, não quebrados.

### Títulos de página + subtítulos
- Título: `fg1`, JetBrains Mono 700.
- `#subtitle`: `fg2` (`--text-dim`).

### Página inicial / lista de posts
- Rótulo de seção / título do post: `fg1`. Resumo: `fg2`. Metadados: `fg4`.
- Chip de tag: `--tag-foreground` (`fg2`) — **não** usar acento em tag. O chip é
  uma **caixa** (`--surface` `bg1` + hairline `--border-general` `bg2`), tanto na
  lista quanto no card da home: a caixa é o que faz a tag ler como objeto.
- Filtro de categoria ativo: fundo `orange`, texto `--background`.

#### Card de post (home) — anatomia

O card é um **painel** cuja capa sangra até as bordas do painel:

| Parte | Regra |
|-------|-------|
| Painel `.post-card` | fundo `--card` (`bg0_s`), hairline 1px `--border-general` (`bg2`), raio 12px, **sem padding** — o painel não tem moldura interna |
| Capa `.post-card-media` / `.post-card-image` | **sangra até as bordas internas do painel** (a única folga é a hairline de 1px), raio `11px 11px 0 0` = 12px do painel menos a hairline (senão os cantos retos vazariam para fora da curva), `aspect-ratio: 16 / 10`, `object-fit: cover` |
| Texto `.post-card-body` | carrega o inset que antes era do painel: `padding: 1rem` nas laterais e no fundo, e `padding-top: 0.9rem` quando existe capa acima (`.post-card-media + .post-card-body`). Sem capa, 1rem nos quatro lados |
| Meta `.post-card-meta` | ícones inline SVG (calendário · relógio) em volta de `data` — em-dash — `tempo de leitura`; cor `--text-faded` (`fg4`), 0.8em |
| Título `.post-card-title` | o **maior** elemento do card: 1.35em (21.6px) em `--font-display`, clamp de 2 linhas, `fg1` |
| Resumo `.post-card-excerpt` | `--text-dim` (`fg2`) 0.9em, clamp de 3 linhas |
| Rodapé `.post-card-footer` | **alinhado à esquerda** (`justify-content: flex-start`) com os chips em caixa; `margin-top: auto` mantém os cards de uma linha com a mesma altura |

- **O by-line não existe**: sem avatar, sem “by Matheus”. A linha de chips é a
  única coisa no rodapé, e ela fica à esquerda.
- **Os ícones são geometria, não cor:** `<svg>` inline com `viewBox="0 0 16 16"`,
  `aria-hidden="true"`, caixa de 1em e `stroke: currentColor` declarado no CSS —
  a cor continua vindo de `--text-faded`. Nenhum conjunto de ícones, nenhum
  asset remoto.
- **Um único link focável por card:** o link do título. A capa é um link com
  `tabindex="-1"` e `aria-hidden="true"` (atalho de mouse, fora da ordem de
  tabulação e da árvore de acessibilidade).
- **A sobreposição de gradiente da capa foi removida.** Ela existia para
  dissolver uma imagem que sangrava no papel. Quem separa a capa do papel é a
  própria hairline do painel — a capa sangra até ela, e o `--card` só permanece
  tingido atrás da metade de texto. O degradê não volta.
- **Painel vs. papel é hairline, não cor:** `--card` `#32302f` sobre
  `--background` `#282828` dá só 1.12:1 de luminância — o painel **não** se separa
  por preenchimento. Quem separa é a hairline `--border-general` (`bg2`):
  1.67:1 contra o papel e 1.49:1 contra o painel. Não “conserte” isso inventando
  cor fora da rampa — reforce a hairline, não o preenchimento.
- **A capa zera a margem global de `img`.** `src/styles/images.css` tem
  `img { margin: 0.8em 0 }` (12.8px em cima e embaixo, para imagens de prosa). A
  capa é `height: 100%`, então essa margem não vira espaçamento: ela empurra a
  imagem para baixo dentro da caixa `16 / 10` — deixando uma faixa nua de
  `--card` acima dela — e corta os mesmos 12.8px embaixo, que o `overflow: hidden`
  esconde. Daí o `margin: 0` em `.post-card-image`. Qualquer imagem que precise
  ficar colada na borda de um container tem que zerar essa margem (o
  `.post-hero` já a sobrescreve via `margin: 0 0 1.2rem`).

### Portfolio / experiência
- Card de experiência: fundo `bg0_s`, borda `bg2`.
- Cargo: `fg1` 700. Empresa: `fg2`. Período: `fg4`.
- Card de repositório (`gh-card img`): borda `bg2` mais o filtro
  `invert(0.9) hue-rotate(180deg)` — o asset do gh-card.dev é claro e é
  invertido para assentar no escuro. Filtro é comportamento do componente, não
  token.

### Código
- Superfície: `bg1 #3c3836`, borda `bg2`, raio 3px no bloco e 5% no inline.
- Números de linha (`.ln`) e o botão de copiar usam `fg2` sobre `bg1`: 6.76:1.
- Tema Shiki: **Gruvbox Dark (medium)**, vendorizado em
  `src/lib/shiki-gruvbox-dark.mjs` e ligado em `astro.config.mjs`. É o único
  tema — o site é dark-only.
- O papel do tema (`#282828`) é elevado a `bg1` por `colorReplacements` **no
  objeto do tema** (não em `shikiConfig`, que o schema do Astro descarta), e
  `--code-background` repete `#3c3836` para o `code` inline e o botão de copiar.
- Bloco `.output`: fundo `bg0_s`, texto `aqua` (`--output-foreground`).

### Tabelas
- Cabeçalho `bg0_s`, linhas em `bg0` (o papel), divisórias `bg2`.
- Abaixo de 760px a tabela rola dentro do próprio container, nunca empurra a
  página.

### Contraste (AA, 4.5:1 para texto normal)

Contra o papel `bg0 #282828`: `fg1` 10.75:1 · `fg2` 8.59:1 · `fg4` 5.30:1 ·
`orange` 5.84:1 · `purple` 5.37:1 · `aqua` 5.48:1. **Todos passam.**

Contra a superfície de código `bg1 #3c3836`, os tokens que de fato são pintados
lá passam: `fg1` 8.45:1 · `fg2` 6.76:1 · `orange` 4.59:1. `fg4` (4.17:1),
`purple` (4.23:1) e `aqua` (4.31:1) ficam abaixo de 4.5:1 **sobre `bg1`**, mas
nunca são renderizados nessa superfície: `fg4` só aparece sobre o papel ou sobre
`bg0_s`, e `purple`/`aqua` só sobre `bg0_s` (`--output-foreground` no bloco
`.output`, cujo fundo é `bg0_s #32302f` → 4.88:1). A regra é: **cada par
texto/fundo real precisa passar**, não cada token contra todos os fundos.

Pares **novos** do card de post da home (medidos no CSS computado do navegador
sobre `/`, não estimados):

| Par | Razão |
|-----|-------|
| Título `fg1` sobre o painel `bg0_s` | 9.57:1 |
| Resumo `fg2` sobre o painel `bg0_s` | 7.65:1 |
| Chip `fg2` sobre a caixa `bg1` | 6.76:1 |
| Meta `fg4` (data, tempo, em-dash, ícones) sobre o painel `bg0_s` | 4.72:1 |

Todos ≥ 4.5:1. As superfícies decorativas (painel `bg0_s` sobre papel 1.12:1;
caixa do chip `bg1` sobre painel `bg0_s` 1.13:1) são separação visual por
hairline, não contraste de texto — a hairline `bg2` contra o papel é 1.67:1.

### Imagens / galeria
- Bordas `bg2`, raio 8px; hero de artigo com raio 12px.
- Galeria usa `flex-basis: min(440px, 100%)` (e `min(290px, 100%)` na de três)
  e `min-width: 0` — nenhum item força a página a ficar mais larga que a
  viewport.

### Rodapé / data de último commit
- `#gitinfo-date`: `--text-faded` (`fg4`), mantendo o itálico — itálico de
  **corpo** é permitido, só heading é que não pode. Sem `filter: opacity()`:
  a cor vem do token, não de um filtro aplicado por cima dele.

---

## Responsivo

- `overflow-x: clip` em `html` **e** `body` — nunca `hidden` (que criaria um
  scroll container e quebraria `position: sticky`).
- Tracks de grid com imagem usam `minmax(min(280px, 100%), 1fr)` /
  `minmax(min(260px, 100%), 1fr)`: encolhem até a largura do container em 320px.
- **Grade de cards da home (`.post-grid`): track de tamanho FIXO acima de
  1150px.** Abaixo disso é uma coluna única que preenche o container
  (`minmax(0, 1fr)`). Acima de 1150px:
  `repeat(auto-fill, min(var(--card-width), 100%))` + `justify-content: start`,
  com **um** token de papel: `--card-width: 340px` (`src/styles/main.css`).
  - O token é único de propósito: 340px mantém **2 colunas em 1150px** (container
    ~713px) e **3 em 1600px** (1200px). Encher os 1600px exigiria ~386px, o que
    colapsaria os 1150px para uma coluna só.
  - Consequência: **sobram ~140px à direita da última track em 1600px** e ~13px
    em 1150px. Isso é o desenho escolhido (cartão de tamanho uniforme, alinhado
    à esquerda, folga à direita), não um bug — não “conserte” alargando a track
    por breakpoint.
  - `min(var(--card-width), 100%)` (e não o token puro) é a guarda que impede
    overflow em container estreito. **É a exceção documentada ao gate 50 do
    Hallmark** (`minmax(0, 1fr)` em track com imagem): os cards da home são
    image-bearing e **não** podem colapsar, então abaixo de 1150px vale a forma
    `minmax(0, 1fr)` e acima dela o tamanho fixo é deliberado. Portfolio e
    galerias continuam com `minmax(…)`, sem exceção.
- Larguras de referência verificadas: 320 / 375 / 414 / 768 px.
- **Hero do artigo (`.post-hero`) — banner de largura total.** Ele é um irmão
  ANTES de `.article` em `src/pages/[section]/[slug].astro`, então `width: 100%`
  significa a largura do **shell** — mais largo que a coluna de 58ch, com o `h1`
  e a meta ABAIXO do banner. `object-fit: cover` faz a fonte retrato preencher a
  horizontal e cortar a vertical (o pedido: "preencher deitado, não em pé").
  Proporção `3 / 2` abaixo de 760px — em 320px dá 288×192, enquanto um 21:9 fixo
  ali seria uma tira de ~123px — e `21 / 9` de 760px para cima, com teto
  `max-height: 42vh` para que uma viewport muito larga não transforme o banner
  numa faixa que enche a tela. Raio 12px, hairline `bg2`.
- `@media (prefers-reduced-motion: reduce)` zera animações e transições e
  desliga o scroll suave (`src/styles/main.css`).

---

## Regras negativas (nunca)

1. **Nunca** usar cor hardcoded (hex/rgb/nome) fora do bloco `:root` — toda cor
   nova vira um token. Exceção única e documentada: o bloco anti-flicker inline
   em `src/layouts/BaseLayout.astro` e o `<meta name="theme-color">`.
2. **Nunca** introduzir cor fora da paleta acima.
3. **Nunca** usar itálico em `h1`–`h6` (`font-style: italic` em heading).
4. **Nunca** justificar corpo de texto nem heading (`text-align: justify`).
5. **Nunca** usar `orange` para link visitado, nem `purple` para qualquer coisa
   que não seja link visitado, nem `aqua` fora do chrome de código.
6. **Nunca** usar acento em chip/tag.
7. **Nunca** trocar a família de fonte (Inter no corpo, JetBrains Mono em
   headings e código).
8. **Nunca** criar estilo inline/solto em vez de classe em `src/styles/`.
9. **Nunca** carregar fonte de origem externa (Google Fonts ou CDN): as fontes
   são self-hosted via `@fontsource-variable/*`.
10. **Nunca** autorar cor de texto com `filter` (`opacity()`, `brightness()`,
   qualquer filtro que altere cor). Um filtro é cor não-token: ele escapa do
   `:root`, quebra o contraste calculado e some do design system. A cor de um
   texto vem sempre de um token — se precisa parecer mais discreto, escolha um
   token mais discreto (`fg4`), não um filtro sobre outro token.
   > **Nota:** `src/styles/post_meta.css` tinha `filter: brightness(80%)` em
   > `#tags a` e `#tags a:visited`. Ambas foram **removidas** por serem CSS
   > morto: os chips de tag são `<li class="tag-chip">` sem âncora
   > (`src/pages/[section]/[slug].astro`), e nenhuma página construída em
   > `dist/` contém `<a>` dentro de `#tags`. O único `filter` restante no
   > projeto é o `invert()`/`hue-rotate()` sobre a **imagem** do logo em
   > `src/components/widgets/GithubRepoCard.astro` — decoração de imagem, não
   > cor de texto, portanto fora desta regra.

---

## Checklist de review (usado pelo `design-reviewer`)

- [ ] Toda cor nova é um token em `:root` (sem hex solto fora do anti-flicker).
- [ ] Papéis corretos: link/acento=`orange`, visitado=`purple`, metadados=`fg4`,
      bordas=`bg2`, texto=`fg1`, secundário=`fg2`, tags=`fg2`.
- [ ] `--accent-soft` só é referenciado por `--link-visited`.
- [ ] `overflow-x: clip` em `html` e `body` (nunca `hidden`).
- [ ] Tracks de grid com imagem usam `minmax(min(…, 100%), 1fr)`. **Exceção
      documentada:** `.post-grid` acima de 1150px usa track fixa
      `--card-width` (ver “Card de post (home)” e a seção Responsivo).
- [ ] Tipografia: Inter no corpo, JetBrains Mono 700 nos headings, corpo
      alinhado à esquerda, **nenhum heading itálico**.
- [ ] Hierarquia respeitada (N1 > N2 > N3 > N4).
- [ ] `:focus-visible` presente e não animado.
- [ ] `prefers-reduced-motion` respeitado.
- [ ] Nenhum texto tem a cor autorada por `filter: opacity()`.
- [ ] Nenhuma regra negativa violada.
