const SCROLL_START_DELAY = 300;
class TextBanner extends HTMLElement {
  static get observedAttributes() {
    return ['text'];
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this._resizeObserver = new ResizeObserver(() => this._updateAnimation());

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          overflow: hidden;
        }

        .viewport {
          overflow: hidden;
          width: 100%;
        }

        .track {
          font-size: 16px;
          display: inline-block;
          white-space: nowrap;
          will-change: transform;
          color: #1eab55;

        }

        .track.scroll {
          animation: marquee var(--text-banner-duration, 12s) linear infinite;
          animation-delay: var(--text-banner-start-delay, 300ms);
          animation-fill-mode: both;

        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-1 * var(--scroll-distance, 0px)));
          }
        }
      </style>
      <div class="viewport">
        <div class="track"></div>
      </div>
    `;

    this._viewport = this.shadowRoot.querySelector('.viewport');
    this._track = this.shadowRoot.querySelector('.track');
  }

  connectedCallback() {
    this._render();
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    this._resizeObserver.disconnect();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'text' && oldValue !== newValue) {
      this._render();
    }
  }

  get text() {
    return this.getAttribute('text') ?? '';
  }

  set text(value) {
    this.setAttribute('text', value ?? '');
  }

  _render() {
    const content = this.text || this.textContent || '';
    this._track.textContent = content.trim();
    this._updateAnimation();
  }

  _updateAnimation() {
    const overflow = this._track.scrollWidth - this._viewport.clientWidth;

    if (overflow > 0) {
      const duration = Math.max(overflow / 20, 6);
      this._track.classList.add('scroll');
      this._track.style.setProperty('--scroll-distance', `${overflow}px`);
      this._track.style.setProperty('--text-banner-duration', `${duration}s`);
      this._track.style.setProperty('--text-banner-start-delay', `${SCROLL_START_DELAY}ms`);
      return;
    }

    this._track.classList.remove('scroll');
    this._track.style.removeProperty('--scroll-distance');
    this._track.style.removeProperty('--text-banner-duration');
    this._track.style.removeProperty('--text-banner-start-delay');
    this._track.style.transform = 'translateX(0)';
  }
}

customElements.define('text-banner', TextBanner);
