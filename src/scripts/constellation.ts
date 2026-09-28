type Subject = { id: string; title: string; count: number; x: number; y: number };
type Article = { id: string; title: string; url: string; subject: string; x: number; y: number };
type Graph = { subjects: Subject[]; articles: Article[]; edges: { source: string; target: string }[] };
type View = { selected: string; x: number; y: number; zoom: number };
const NS = 'http://www.w3.org/2000/svg';
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
function svg<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number> = {}) {
  const el = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  return el;
}
function label(text: string, y: number) {
  const el = svg('text', { y, 'text-anchor': 'middle', 'aria-hidden': 'true' });
  const words = text.split(/\s+/);
  const lines: string[] = [''];
  for (const word of words) {
    if ((lines.at(-1)!.length + word.length) > 24 && lines.at(-1)) lines.push('');
    lines[lines.length - 1] += `${lines.at(-1) ? ' ' : ''}${word}`;
  }
  lines.slice(0, 3).forEach((line, index) => {
    const span = svg('tspan', { x: 0, dy: index ? 20 : 0 });
    span.textContent = index === 2 && lines.length > 3 ? `${line}…` : line;
    el.append(span);
  });
  return el;
}

class KnowledgeMap extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    try { this.initialize(); }
    catch (error) {
      console.error('Constellation unavailable:', error);
      this.querySelectorAll<HTMLElement>('.map-toolbar, .map-viewport, .map-hint, .map-legend').forEach(el => el.hidden = true);
      this.querySelectorAll<HTMLElement>('.topic-articles, .map-fallback').forEach(el => el.hidden = false);
      this.querySelectorAll<HTMLButtonElement>('.topic-toggle').forEach(el => { el.disabled = true; el.setAttribute('aria-expanded', 'true'); });
      this.querySelector('.map-fallback')!.textContent = 'The map could not load. Use the topic links to keep reading.';
      this.dataset.state = 'error';
    }
  }
  disconnectedCallback() { this.cleanup?.(); }
  cleanup?: () => void;
  initialize() {
    const graph: Graph = JSON.parse(this.querySelector('[data-graph]')!.textContent!);
    const currentId = this.dataset.current || '';
    const key = `constellation:${this.dataset.key}`;
    const surface = this.querySelector<SVGSVGElement>('.world-svg')!;
    const viewport = this.querySelector<HTMLElement>('.map-viewport')!;
    const camera = this.querySelector<SVGGElement>('[data-camera]')!;
    const status = this.querySelector<HTMLElement>('.map-status')!;
    const buttons = [...this.querySelectorAll<HTMLButtonElement>('[data-subject]')];
    const abort = new AbortController();
    const { signal } = abort;
    if (currentId) {
      const neighbors = graph.articles.filter(article => article.id !== currentId);
      graph.articles.forEach(article => {
        if (article.id === currentId) { article.x = 0; article.y = 0; return; }
        const angle = -Math.PI / 2 + neighbors.indexOf(article) * Math.PI * 2 / neighbors.length;
        article.x = Math.cos(angle) * 185;
        article.y = Math.sin(angle) * 185;
      });
    }
    let view: View = { selected: '', x: 0, y: 0, zoom: 1 };
    let width = 1, height = 1;
    const saved = history.state?.[key];
    if (saved && typeof saved.selected === 'string' && [saved.x, saved.y, saved.zoom].every(Number.isFinite)) {
      view = { selected: graph.subjects.some(s => s.id === saved.selected) ? saved.selected : '', x: saved.x, y: saved.y, zoom: clamp(saved.zoom, .45, 2) };
    }
    const persist = () => {
      try { history.replaceState({ ...history.state, [key]: view }, ''); } catch { /* Navigation remains usable if history writes are blocked. */ }
    };
    const updateCamera = (save = true) => {
      const nodes = currentId ? graph.articles : [...graph.subjects, ...graph.articles];
      view.x = clamp(view.x, Math.min(0, ...nodes.map(n => n.x)) - 350, Math.max(0, ...nodes.map(n => n.x)) + 350);
      view.y = clamp(view.y, Math.min(0, ...nodes.map(n => n.y)) - 350, Math.max(0, ...nodes.map(n => n.y)) + 350);
      camera.setAttribute('transform', `translate(${width / 2} ${height / 2}) scale(${view.zoom}) translate(${-view.x} ${-view.y})`);
      this.querySelector('[data-zoom]')!.textContent = `${Math.round(view.zoom * 100)}%`;
      this.querySelector<HTMLButtonElement>('[data-action="in"]')!.disabled = view.zoom >= 2;
      this.querySelector<HTMLButtonElement>('[data-action="out"]')!.disabled = view.zoom <= .45;
      if (save) persist();
    };
    const choose = (id: string, moveFocus = false) => {
      const subject = graph.subjects.find(s => s.id === id)!;
      view.selected = view.selected === id ? '' : id;
      view.x = subject.x; view.y = subject.y;
      view.zoom = view.selected ? clamp(Math.min(width / 660, height / 580), .45, 1) : 1;
      render();
      if (moveFocus) surface.querySelector<SVGElement>(`[data-node-subject="${id}"]`)?.focus({ preventScroll: true });
    };
    const render = () => {
      camera.replaceChildren();
      const subjects = new Map(graph.subjects.map(s => [s.id, s]));
      const articles = new Map(graph.articles.map(a => [a.id, a]));
      const lines = svg('g', { 'aria-hidden': 'true', class: 'map-lines' });
      const renderedEdges = new Set<string>();
      for (const edge of graph.edges) {
        const from = articles.get(edge.source)!;
        const to = articles.get(edge.target)!;
        const a = currentId || from.subject === view.selected ? from : subjects.get(from.subject)!;
        const b = currentId || to.subject === view.selected ? to : subjects.get(to.subject)!;
        if (a.id === b.id) continue;
        const aggregate = a !== from || b !== to;
        const edgeKey = `${a.id}>${b.id}`;
        if (renderedEdges.has(edgeKey)) continue;
        renderedEdges.add(edgeKey);
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const start = { x: a.x + Math.cos(angle) * 28, y: a.y + Math.sin(angle) * 28 };
        const end = { x: b.x - Math.cos(angle) * 32, y: b.y - Math.sin(angle) * 32 };
        const line = svg('path', { d: `M${start.x},${start.y} L${end.x},${end.y}`, class: aggregate ? 'graph-edge aggregate-edge' : 'graph-edge' });
        const title = svg('title'); title.textContent = `${from.title} → ${to.title}${aggregate ? ' (collapsed island)' : ''}`; line.append(title);
        lines.append(line);
        lines.append(svg('path', { class: 'edge-arrow', d: `M${end.x - Math.cos(angle - .5) * 10},${end.y - Math.sin(angle - .5) * 10} L${end.x},${end.y} L${end.x - Math.cos(angle + .5) * 10},${end.y - Math.sin(angle + .5) * 10}` }));
      }
      if (!currentId) for (const article of graph.articles.filter(a => a.subject === view.selected)) {
        const subject = subjects.get(article.subject)!;
        lines.append(svg('path', { d: `M${subject.x},${subject.y} L${article.x},${article.y}`, class: 'membership-edge' }));
      }
      camera.append(lines);
      if (!currentId) for (const subject of graph.subjects) {
        const selected = view.selected === subject.id;
        const group = svg('g', { transform: `translate(${subject.x} ${subject.y})`, role: 'button', tabindex: '0', 'aria-label': `${selected ? 'Close' : 'Open'} ${subject.title}, ${subject.count} articles`, 'aria-expanded': String(selected), 'data-node-subject': subject.id, class: 'subject-node' });
        group.append(svg('circle', { r: 47, class: 'subject-orbit' }), svg('circle', { r: 30, class: 'subject-core' }));
        const count = svg('text', { 'text-anchor': 'middle', dy: '0.35em', 'aria-hidden': 'true', class: 'node-count' }); count.textContent = String(subject.count);
        group.append(count, label(subject.title, 76));
        group.addEventListener('click', () => choose(subject.id, true));
        group.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(subject.id, true); }
        });
        camera.append(group);
      }
      for (const article of graph.articles.filter(a => currentId || a.subject === view.selected)) {
        const active = article.id === currentId;
        const anchor = svg('a', { href: article.url, transform: `translate(${article.x} ${article.y})`, class: `article-node${active ? ' is-current' : ''}`, 'aria-label': `${article.title}${active ? ', current article' : ''}` });
        if (active) anchor.setAttribute('aria-current', 'page');
        const title = svg('title'); title.textContent = article.title;
        anchor.append(title, svg('circle', { r: 24, class: 'node-hit' }), svg('circle', { r: active ? 11 : 7, class: 'node-dot' }), label(article.title, 42));
        camera.append(anchor);
      }
      buttons.forEach(button => {
        const expanded = !!currentId || button.dataset.subject === view.selected;
        button.setAttribute('aria-expanded', String(expanded));
        const list = document.getElementById(button.getAttribute('aria-controls')!);
        if (list) list.hidden = !expanded;
      });
      const selected = subjects.get(view.selected);
      status.textContent = currentId ? 'Follow an arrow to a linked article. Lists below separate links and backlinks.' : selected ? `${selected.title} open · ${selected.count} articles. Select an article to read.` : 'Choose an island to find an article.';
      updateCamera();
    };
    this.querySelectorAll<HTMLElement>('.map-toolbar, .map-viewport, .map-hint, .map-legend').forEach(el => el.hidden = false);
    this.querySelector<HTMLElement>('.map-fallback')!.hidden = true;
    buttons.forEach(button => {
      button.disabled = !!currentId;
      button.addEventListener('click', () => choose(button.dataset.subject!), { signal });
    });
    this.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'in' || action === 'out') view.zoom = clamp(view.zoom + (action === 'in' ? .15 : -.15), .45, 2);
      if (action === 'reset') {
        const subject = graph.subjects.find(s => s.id === view.selected);
        view.x = currentId ? 0 : subject?.x || 0; view.y = currentId ? 0 : subject?.y || 0;
        view.zoom = currentId || view.selected ? clamp(Math.min(width / 660, height / 580), .45, 1) : 1;
      }
      if (action === 'left') view.x -= 80 / view.zoom;
      if (action === 'right') view.x += 80 / view.zoom;
      if (action === 'up') view.y -= 80 / view.zoom;
      if (action === 'down') view.y += 80 / view.zoom;
      updateCamera();
    }, { signal }));
    let drag: { id: number; x: number; y: number } | undefined;
    surface.addEventListener('pointerdown', event => {
      if (event.button !== 0 || (event.target as Element).closest('a, [role="button"]')) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      surface.setPointerCapture(event.pointerId);
      surface.classList.add('is-dragging');
    }, { signal });
    surface.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      view.x -= (event.clientX - drag.x) / view.zoom;
      view.y -= (event.clientY - drag.y) / view.zoom;
      drag.x = event.clientX; drag.y = event.clientY;
      updateCamera(false);
    }, { signal });
    const stopDrag = () => { drag = undefined; surface.classList.remove('is-dragging'); persist(); };
    surface.addEventListener('pointerup', stopDrag, { signal });
    surface.addEventListener('pointercancel', stopDrag, { signal });
    surface.addEventListener('lostpointercapture', stopDrag, { signal });
    // Keep browser pinch/scroll behavior. Explicit buttons own graph zoom.
    const resize = new ResizeObserver(() => {
      width = viewport.clientWidth; height = viewport.clientHeight;
      surface.setAttribute('viewBox', `0 0 ${width} ${height}`);
      updateCamera();
    });
    width = viewport.clientWidth; height = viewport.clientHeight;
    surface.setAttribute('viewBox', `0 0 ${width} ${height}`);
    if (currentId && !saved) view.zoom = clamp(Math.min(width / 660, height / 580), .45, 1);
    resize.observe(viewport);
    this.cleanup = () => { abort.abort(); resize.disconnect(); delete this.dataset.ready; };
    render();
    this.dataset.ready = 'true';
    this.dataset.state = 'ready';
  }
}
if (!customElements.get('knowledge-map')) customElements.define('knowledge-map', KnowledgeMap);
