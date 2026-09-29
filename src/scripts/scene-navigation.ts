// Progressive enhancement: the server-rendered page is always a complete
// document. Only a roomy, motion-enabled desktop gets the rotating camera.
class SceneNavigator extends HTMLElement {
  cleanup?: () => void;

  connectedCallback() {
    if (this.cleanup) return;
    const panels = [...this.querySelectorAll<HTMLElement>('.scene-panel')];
    const links = [...this.querySelectorAll<HTMLAnchorElement>('.scene-links a')];
    const ring = this.querySelector<HTMLElement>('.scene-ring')!;
    const viewport = this.querySelector<HTMLElement>('.scene-viewport')!;
    const controls = this.querySelector<HTMLElement>('.scene-controls')!;
    const previous = this.querySelector<HTMLButtonElement>('[data-previous]')!;
    const next = this.querySelector<HTMLButtonElement>('[data-next]')!;
    const mode = this.querySelector<HTMLButtonElement>('[data-mode]')!;
    const status = this.querySelector<HTMLOutputElement>('.scene-status')!;
    const media = matchMedia('(min-width: 64rem) and (min-height: 42rem) and (hover: hover) and (prefers-reduced-motion: no-preference)');
    const abort = new AbortController();
    const { signal } = abort;
    let enabled = false;
    let pageMode = false;
    try { pageMode = sessionStorage.getItem('home-view') === 'page'; } catch { /* Storage is optional. */ }
    let index = 0;
    let timer = 0;
    let lastWheel = -Infinity;
    let wheelSum = 0;
    const duration = () => parseFloat(getComputedStyle(this).getPropertyValue('--dur-scene')) || 500;
    const targetIndex = (hash: string) => {
      if (!hash || hash === '#main') return 0;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return -1; }
      return panels.findIndex(panel => panel === target || (target && panel.contains(target)));
    };
    const finish = () => {
      clearTimeout(timer);
      this.dataset.moving = 'false';
      panels.forEach(panel => delete panel.dataset.leaving);
    };
    const show = (to: number, historyMode: 'push' | 'replace' | 'none' = 'replace', focus = false, animate = true) => {
      if (to < 0 || to >= panels.length) return;
      const old = index;
      const active = document.activeElement;
      const moveFocus = focus || (to !== old && active instanceof HTMLElement && panels[old].contains(active));
      finish();
      const changed = old !== to;
      index = to;
      this.dataset.index = String(index);
      // One calm vertical slide between scenes: no rotation, no perspective, so
      // the page never reads as a spinning cube.
      ring.style.setProperty('--scene-y', `${index * 100}%`);
      if (animate && changed) {
        panels[old].dataset.leaving = 'true';
        this.dataset.moving = 'true';
        timer = window.setTimeout(finish, duration() + 40);
      }
      panels[index].inert = false;
      panels[index].removeAttribute('aria-hidden');
      panels[index].dataset.active = 'true';
      if (changed) panels[index].scrollTop = 0;
      if (moveFocus) panels[index].focus({ preventScroll: true });
      panels.forEach((panel, i) => {
        if (i === index) return;
        panel.inert = true;
        panel.setAttribute('aria-hidden', 'true');
        delete panel.dataset.active;
      });
      links.forEach((link, i) => {
        if (i === index) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
      previous.disabled = index === 0;
      next.disabled = index === panels.length - 1;
      status.textContent = `${index + 1} / ${panels.length} · ${links[index].textContent}`;
      if (historyMode !== 'none' && location.hash !== links[index].hash) {
        // Keep the article map's history state; both enhancements share it.
        history[historyMode === 'push' ? 'pushState' : 'replaceState'](history.state, '', links[index].hash);
      }
    };
    const disable = (restorePosition = true) => {
      finish();
      enabled = false;
      this.dataset.enabled = 'false';
      document.body.classList.remove('scene-active');
      panels.forEach(panel => {
        panel.inert = false;
        panel.removeAttribute('aria-hidden');
        panel.removeAttribute('tabindex');
        delete panel.dataset.active;
      });
      links.forEach(link => link.removeAttribute('aria-current'));
      mode.textContent = 'Use scene view';
      if (restorePosition) panels[index].scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    const syncMode = () => {
      controls.hidden = !media.matches;
      const wanted = media.matches && !pageMode;
      if (wanted === enabled) return;
      if (!wanted) { disable(); return; }
      enabled = true;
      this.dataset.enabled = 'true';
      document.body.classList.add('scene-active');
      // The first frame must not animate, or a deep link would slide in from
      // the top of the page instead of simply starting where it was asked to.
      this.dataset.instant = 'true';
      panels.forEach((panel, i) => {
        panel.setAttribute('tabindex', '-1');
        panel.style.setProperty('--panel-index', String(i));
      });
      const selected = targetIndex(location.hash);
      index = selected >= 0 ? selected : index;
      this.style.setProperty('--scene-y', `${index * 100}%`);
      show(index, 'none', false, false);
      requestAnimationFrame(() => requestAnimationFrame(() => delete this.dataset.instant));
      mode.textContent = 'Use page scroll';
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    const followHash = () => {
      if (!enabled) return;
      const selected = targetIndex(location.hash);
      if (selected >= 0) show(selected, 'none', true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    document.addEventListener('click', event => {
      if (!enabled || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target || anchor.origin !== location.origin || anchor.pathname !== location.pathname || !anchor.hash) return;
      const selected = targetIndex(anchor.hash);
      if (selected < 0) return;
      event.preventDefault();
      show(selected, 'push', true);
    }, { signal });
    previous.addEventListener('click', () => show(index - 1, 'push'), { signal });
    next.addEventListener('click', () => show(index + 1, 'push'), { signal });
    mode.addEventListener('click', () => {
      pageMode = !pageMode;
      try { sessionStorage.setItem('home-view', pageMode ? 'page' : 'rotate'); } catch { /* Storage is optional. */ }
      syncMode();
    }, { signal });
    document.addEventListener('keydown', event => {
      if (!enabled || event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const target = event.target as Element;
      if (target.closest('a, button, input, textarea, select, [contenteditable], knowledge-map')) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1), 'push', true);
    }, { signal });
    // Inner scrolling wins. Turning only happens at its boundary, with a fresh
    // gesture, so a reader cannot skip the bottom of a long experience entry.
    document.addEventListener('wheel', event => {
      if (!enabled || event.defaultPrevented || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const now = performance.now();
      const fresh = now - lastWheel > 180;
      lastWheel = now;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
      if (!delta) return;
      // A wheel over the chrome (not the panel) still belongs to the scene.
      let el: Element | null = event.target instanceof Element ? event.target : null;
      if (!el?.closest('.scene-panel')) el = panels[index];
      while (el && el !== document.body) {
        if (el instanceof HTMLElement && /(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1) {
          const room = delta > 0 ? el.scrollHeight - el.clientHeight - el.scrollTop > 1 : el.scrollTop > 1;
          if (room) { wheelSum = 0; return; }
        }
        el = el.parentElement;
      }
      event.preventDefault();
      if (this.dataset.moving === 'true') { wheelSum = 0; return; }
      if (fresh || Math.sign(delta) !== Math.sign(wheelSum)) wheelSum = 0;
      // Discard the inertial tail of an inner scroll or a previous turn.
      if (!fresh && wheelSum === 0) return;
      wheelSum += delta;
      if (Math.abs(wheelSum) < 60) return;
      show(index + Math.sign(wheelSum));
      wheelSum = 0;
    }, { passive: false, signal });
    window.addEventListener('hashchange', followHash, { signal });
    window.addEventListener('popstate', followHash, { signal });
    media.addEventListener('change', syncMode, { signal });
    this.cleanup = () => { abort.abort(); disable(false); this.cleanup = undefined; };
    syncMode();
    if (!enabled) this.dataset.enabled = 'false';
  }

  disconnectedCallback() { this.cleanup?.(); }
}

if (!customElements.get('scene-navigator')) customElements.define('scene-navigator', SceneNavigator);
