# Design System — mnsgrosa.github.io

> **Fonte da verdade para qualquer mudança de UI.** Leia este arquivo antes de
> editar `src/styles/`, `src/layouts/` ou componentes visuais. O subagente
> `design-reviewer` audita diffs contra esta spec.

## Identidade

Blog pessoal **escuro, limpo e moderno**, paleta **Catppuccin Mocha** (dark-only).
Texto claro sobre fundo escuro, alta legibilidade, hierarquia visual preservada.
Minimalista e editorial — sem cor "decorativa" fora da paleta.

---

## Paleta de tokens (Catppuccin Mocha)

Os **valores hex são a fonte da verdade**. Nomes Catppuccin entre parênteses
são referência.

| Papel | Hex | Nome Catppuccin |
|-------|-----|-----------------|
| Fundo principal | `#1e1e2e` | Base |
| Barra superior / fundo mais escuro | `#11111b` | Crust |
| Card / fundo de painel | `#181825` | Mantle |
| Superfície (fundo de code, th) | `#313244` | Surface0 |
| Inputs / superfícies de formulário | `#45475a` | Surface1 |
| Bordas / linhas de separação | `#585b70` | Surface2 |
| Texto principal | `#cdd6f4` | Text |
| Texto secundário / resumos | `#a6adc8` | Subtext0 |
| Placeholder | `#bac2de` | Subtext1 |
| Metadados (data, tempo, autor, copyright) | `#6c7086` | Overlay0 |
| Links / destaque ativo / sotaque de título | `#74c7ec` | Sapphire |
| Acento suave (tags, link visitado) | `#cba6f7` | Mauve |

> Nota: no brief, os rótulos `Subtext0`/`Subtext1` vieram trocados em relação ao
> Catppuccin canônico. Os **hex** acima estão corretos: secundário = `#a6adc8`,
> placeholder = `#bac2de`. Siga os hex, não os rótulos.

---

## Tipografia

- Família: **Inter** (fallback: `-apple-system`, `BlinkMacSystemFont`, `Roboto`,
  `Helvetica`, sans-serif).
- Corpo de texto: **justificado**.
- Headings (`h1`–`h6`): **nunca** justificados — sempre `text-align: left`.
- Pesos: `h1`/`h2` = `normal`; `h3` = `700`; `h4` = `normal` + itálico.
- `strong` = 600, `th` = 500 (ajustes do Inter).

---

## Hierarquia visual

| Nível | Elemento | Cor |
|-------|----------|-----|
| 1 | Títulos grandes de página, linha de sotaque sob título | `Text` + sotaque `Sapphire` |
| 2 | Títulos de postagem | `Text` |
| 3 | Corpo de texto; resumos | `Text` / `Subtext0` |
| 4 | Metadados (data, tempo, autor, copyright) | `Overlay0` |

---

## Regras por elemento

### Links
- Link padrão / ativo: `Sapphire` (`--link` / `--accent`).
- Link visitado: `Mauve` (`--accent-soft`) — mantém a distinção do não-visitado.

### Cabeçalho / navegação
- Barra superior (se houver): fundo `Crust`; o resto do header: `Base`.
- Logo: `Text`.
- Links de menu inativos: `Subtext0`. Link ativo: `Sapphire`.
- Ícones (busca, lua/tema): `Text`.

### Títulos de página + breadcrumbs
- Título principal: `Text`.
- Linha de sotaque sob o **título de página (N1)**: `Sapphire` (substitui
  qualquer sotaque coral). Aplicada só ao título principal, não a todos os headings.
- Sublinhado de `h2` (dentro do conteúdo): separador `Surface2` — **não** Sapphire.
- Breadcrumbs: inativo `Overlay0`; ícones/separadores `Sapphire`.

### Página inicial / lista de posts
- Título da seção ("Recent posts"): `Text`.
- Título do post: `Text`.
- Resumo: `Subtext0`.
- Metadados (data, tempo, autor): `Overlay0`.
- Tags: `--accent-soft` (`Mauve`) sobre fundo `Surface0`/`Surface1`.
- Imagens de capa: manter tom cinza frio/escuro sutil de Catppuccin.

### Sobre / escritores
- Fotos: manter coloridas originais.
- Texto descritivo: `Text`.
- Títulos de escritores: `Text`; parágrafos: `Subtext0`.

### Arquivo / lista por ano
- Títulos de ano: `Text`.
- Linhas de separação: `Surface1` ou `Surface2`.
- Datas/títulos de post: `Overlay0` / `Text`.

### Contato / formulário / rodapé
- Texto: `Text`.
- Links de contato (e-mail, telefone): `Sapphire`.
- Inputs: fundo `Surface1`; placeholder `Subtext1`.
- Botão de envio ("Send" + ícone): fundo `Sapphire`, texto `Base`.
- Copyright: `Overlay0`.

## Regras negativas (nunca)

1. **Nunca** usar cor hardcoded (hex/rgb/nome) fora do bloco `:root` — toda cor
   nova vira um token.
2. **Nunca** introduzir cor fora da paleta acima.
3. **Nunca** justificar heading (`text-align: justify` em `h1`–`h6`).
4. **Nunca** trocar a família de fonte (é Inter, e ponto).
5. **Nunca** criar estilo inline/solto em vez de classe em `src/styles/`.
6. **Nunca** usar sotaque coral no lugar de `Sapphire` para links/destaques.
7. **Nunca** deixar placeholder de formulário sem cor `Subtext1` (não herdar
   `Text` por descuido).

---

## Checklist de review (usado pelo `design-reviewer`)

- [ ] Toda cor nova é um token em `:root` (sem hex solto).
- [ ] Papéis corretos: link/destaque=`Sapphire`, metadados=`Overlay0`,
      bordas=`Surface2`, texto=`Text`, secundário=`Subtext0`.
- [ ] Tipografia: Inter; corpo justificado; headings não justificados.
- [ ] Hierarquia respeitada (N1 > N2 > N3 > N4).
- [ ] Botão de envio: fundo `Sapphire`, texto `Base`.
- [ ] Inputs `Surface1` + placeholder `Subtext1`.
- [ ] Nenhuma regra negativa violada.
