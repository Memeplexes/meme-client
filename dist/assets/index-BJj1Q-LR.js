var st=r=>{throw TypeError(r)};var Ue=(r,t,e)=>t.has(r)||st("Cannot "+e);var c=(r,t,e)=>(Ue(r,t,"read from private field"),e?e.call(r):t.get(r)),w=(r,t,e)=>t.has(r)?st("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(r):t.set(r,e),b=(r,t,e,n)=>(Ue(r,t,"write to private field"),n?n.call(r,e):t.set(r,e),e),d=(r,t,e)=>(Ue(r,t,"access private method"),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=e(i);fetch(i.href,s)}})();class Ct extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){if(this.shadowRoot.children.length>0)return;const t=this.getAttribute("aria-label")||"Feed controls";this.shadowRoot.innerHTML=`
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1002;
          display: flex;
          justify-content: center;
          pointer-events: none;
          box-sizing: border-box;
        }

        .page-topbar-inner {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(17, 17, 17, 0.94);
          box-sizing: border-box;
          pointer-events: auto;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .page-topbar-count {
          min-width: 0;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding-left: 8px;
          gap: 14px;
        }

        .page-topbar-count-value {
          font-size: 14px;
          font-weight: 700;
          line-height: 1;
          color: #1eab55;
        }

        .page-topbar-count-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.6);
        }

        .sidebar-controls {
          display: inline-flex;
          align-items: stretch;
          overflow: hidden;
          border-radius: 999px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .sidebar-visibility-toggle {
          border: 0;
          background: transparent;
          color: white;
          font-size: 12px;
          cursor: pointer;
        }

        .sidebar-visibility-toggle:hover {
          /* background: rgba(255, 255, 255, 0.08); */
        }

        .sidebar-visibility-toggle {
          position: relative;
          min-width: 96px;
          padding: 12px 16px 12px 52px;
          text-align: left;
        }

        .sidebar-visibility-toggle::before,
        .sidebar-visibility-toggle::after {
          content: "";
          position: absolute;
          top: 14px;
          bottom: 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
        }

        .sidebar-visibility-toggle::before {
          left: 12px;
          width: 8px;
        }

        .sidebar-visibility-toggle::after {
          left: 24px;
          width: 10px;
          opacity: 0.5;
        }

        .search-box {
          width: min(100%, 700px);
          margin: 0 auto;
          pointer-events: auto;
        }

        .search-box search-bar-tags {
          display: block;
          width: 100%;
          box-sizing: border-box;
        }

        .view-toggle {
          border: none;
          background: rgba(17, 17, 17, 0.94);
          color: #1eab55;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        @media (max-width: 767px) {
          :host {
            left: 0;
            padding: 10px 10px 0;
          }

          .page-topbar-inner {
            padding: 10px 12px;
          }

          .page-topbar-count {
            display: none;
          }

          .page-topbar-count-value {
            font-size: 20px;
          }

          .sidebar-controls {
            display: none;
          }
          .search-box {
            padding-left: 8px;
          }


          .view-toggle {
            padding: 10px 14px;
          }
        }
      </style>
      <div class="page-topbar-inner" role="group" aria-label="${t}">
        <div class="sidebar-controls" aria-label="Sidebar controls" role="group">
          <button class="sidebar-visibility-toggle" id="sidebar-visibility-toggle" type="button" aria-controls="side-menu">Menu</button>
        </div>
        <div class="page-topbar-count">
          <strong class="page-topbar-count-value" data-page-topbar-total-memes>--</strong>
          <span class="page-topbar-count-label">Memes</span>
        </div>
        <label class="search-box" for="search-input">
          <search-bar-tags id="search-input" placeholder="Search..." initial-query=""></search-bar-tags>
        </label>
        <button class="view-toggle" id="view-toggle" type="button" aria-pressed="false" data-grid-view-label="▦ Grid" data-list-view-label="☰ List">▦ Grid</button>
      </div>
    `}get totalMemesElement(){var t;return((t=this.shadowRoot)==null?void 0:t.querySelector("[data-page-topbar-total-memes]"))||null}get searchInput(){var t;return((t=this.shadowRoot)==null?void 0:t.querySelector("search-bar-tags#search-input"))||null}get homeButton(){return this.sidebarToggleButton}get sidebarToggleButton(){var t;return((t=this.shadowRoot)==null?void 0:t.querySelector("#sidebar-visibility-toggle"))||null}get toggleButton(){var t;return((t=this.shadowRoot)==null?void 0:t.querySelector("#view-toggle"))||null}}customElements.get("page-topbar")||customElements.define("page-topbar",Ct);function Lt({searchInput:r,initialQuery:t}){if(!r||r.dataset.rainbowPromptInitialized)return;r.dataset.rainbowPromptInitialized="true";const e=document.createElement("style");e.textContent=`
    @property --meme-rainbow-angle {
      syntax: "<angle>";
      inherits: false;
      initial-value: 0deg;
    }

    @keyframes meme-rainbow-spin {
      to {
        --meme-rainbow-angle: 360deg;
      }
    }

    @keyframes meme-rainbow-shimmer {
      0%, 100% {
        filter: saturate(1) brightness(1);
      }
      50% {
        filter: saturate(1.25) brightness(1.12);
      }
    }

    .meme-rainbow-prompt {
      border: 2px solid transparent !important;
      background-image:
        linear-gradient(rgb(15 23 42), rgb(15 23 42)),
        conic-gradient(
          from var(--meme-rainbow-angle),
          #ff4d6d,
          #ff9e00,
          #ffe600,
          #5bff98,
          #4dd2ff,
          #7a5cff,
          #ff4d6d
        ) !important;
      background-origin: border-box;
      background-clip: padding-box, border-box !important;
      box-shadow:
        0 0 0 1px rgb(255 255 255 / 0.12),
        0 0 18px rgb(255 77 109 / 0.28),
        0 0 30px rgb(77 210 255 / 0.22) !important;
      animation:
        meme-rainbow-spin 2.6s linear infinite,
        meme-rainbow-shimmer 1.8s ease-in-out infinite !important;
    }
  `,document.head.append(e);const n=()=>{r.classList.remove("meme-rainbow-prompt"),r.removeEventListener("input",i)},i=()=>{r.value!==t&&n()};r.classList.add("meme-rainbow-prompt"),r.addEventListener("input",i)}var q,k,M,D,N,f,ze,$e,lt,ct,U,De,Q,dt;class kt extends HTMLElement{constructor(){super();w(this,f);w(this,q);w(this,k,[]);w(this,M,"");w(this,D,"");w(this,N,null);b(this,q,this.attachShadow({mode:"open"})),d(this,f,lt).call(this)}static get observedAttributes(){return["placeholder","initial-query","disabled"]}connectedCallback(){b(this,D,this.getAttribute("initial-query")||""),c(this,D)&&(d(this,f,$e).call(this,c(this,D)),requestAnimationFrame(()=>{const e=c(this,q).querySelector(".container");e&&Lt({searchInput:e,initialQuery:c(this,D)})})),d(this,f,ct).call(this)}disconnectedCallback(){clearTimeout(c(this,N))}attributeChangedCallback(e,n,i){if(n!==i){if(e==="placeholder"){const s=c(this,q).querySelector("input");s&&(s.placeholder=i||"Search...")}if(e==="initial-query"&&this.isConnected&&(b(this,D,i||""),d(this,f,$e).call(this,c(this,D))),e==="disabled"){const s=c(this,q).querySelector("input");s&&(s.disabled=i!==null)}}}get value(){return[...c(this,k),c(this,M).trim()].filter(Boolean).join(" ")}set value(e){d(this,f,$e).call(this,e||"")}get words(){return[...c(this,k)]}addWord(e){const n=e.trim();n&&!c(this,k).includes(n)&&(c(this,k).push(n),b(this,M,""),d(this,f,U).call(this),d(this,f,Q).call(this))}removeWord(e){const n=c(this,k).indexOf(e);n>-1&&(c(this,k).splice(n,1),b(this,M,""),d(this,f,U).call(this),d(this,f,Q).call(this))}clear(){b(this,k,[]),b(this,M,""),d(this,f,U).call(this),d(this,f,Q).call(this)}}q=new WeakMap,k=new WeakMap,M=new WeakMap,D=new WeakMap,N=new WeakMap,f=new WeakSet,ze=function(e){return e.split(/\s+/).map(n=>n.trim()).filter(n=>n.length>0)},$e=function(e){b(this,k,d(this,f,ze).call(this,e||"")),b(this,M,""),d(this,f,U).call(this)},lt=function(){c(this,q).innerHTML=`
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .container {
          margin: 6px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          padding-left: 10px;
          background: rgba(0, 0, 0, 1);
          border: 2px solid rgb(51 65 85);
          border-radius: 12px;
          min-height: 36px;
          cursor: text;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .container:focus-within {
          border-color: #1eab55;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .container:hover:not(:focus-within) {
          border-color: rgb(71 85 105);
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: linear-gradient(135deg, rgb(51 65 85), rgb(30 41 59));
          border: 1px solid rgb(71 85 105);
          border-radius: 6px;
          font-size: 14px;
          color: rgb(226 232 240);
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
          white-space: nowrap;
        }

        .tag:hover {
          background: linear-gradient(135deg, rgb(239 68 68), rgb(220 38 38));
          border-color: rgb(239 68 68);
          transform: scale(1.02);
        }

        .tag:active {
          transform: scale(0.98);
        }

        .tag-text {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tag-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          font-size: 12px;
          line-height: 1;
          color: rgba(255, 255, 255, 0.7);
          transition: background 0.15s;
        }

        .tag:hover .tag-remove {
          background: rgba(255, 255, 255, 0.25);
          color: white;
        }

        input {
          flex: 1;
          min-width: 100px;
          padding: 4px 0;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: rgb(226 232 240);
          font-family: inherit;
        }

        input::placeholder {
          color: rgb(100 116 139);
        }

        input:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .hidden-input {
          position: absolute;
          left: -9999px;
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 767px) {
          .container {
            margin-left: 64px;
          }
      }
      </style>

      <div class="container" part="container">
        <div class="tags-container" part="tags-container"></div>
        <input
          type="text"
          part="input"
          placeholder="${this.getAttribute("placeholder")||"Search..."}"
        />
      </div>

      <input
        type="hidden"
        class="hidden-input"
        name="${this.getAttribute("name")||"search"}"
      />
    `},ct=function(){const e=c(this,q).querySelector(".container"),n=c(this,q).querySelector("input"),i=()=>{clearTimeout(c(this,N)),b(this,N,setTimeout(()=>{d(this,f,Q).call(this)},500))};e.addEventListener("click",s=>{(s.target===e||s.target.classList.contains("tags-container"))&&n.focus()}),n.addEventListener("input",s=>{if(b(this,M,s.target.value),c(this,M).endsWith(" ")){const a=d(this,f,ze).call(this,c(this,M));b(this,k,[...new Set([...c(this,k),...a])]),b(this,M,""),n.value="",d(this,f,U).call(this),d(this,f,Q).call(this);return}i()}),n.addEventListener("keydown",s=>{if(s.key==="Backspace"&&c(this,M)===""&&c(this,k).length>0&&(clearTimeout(c(this,N)),s.preventDefault(),c(this,k).pop(),d(this,f,U).call(this),d(this,f,Q).call(this)),s.key==="Enter"){if(clearTimeout(c(this,N)),s.preventDefault(),c(this,M).trim()){const a=c(this,M).trim();c(this,k).includes(a)||c(this,k).push(a),b(this,M,""),n.value="",d(this,f,U).call(this)}d(this,f,dt).call(this)}s.key==="Escape"&&(b(this,M,""),n.value="",n.blur())}),n.addEventListener("paste",s=>{s.preventDefault(),clearTimeout(c(this,N));const a=(s.clipboardData||window.clipboardData).getData("text"),o=d(this,f,ze).call(this,a);b(this,k,[...new Set([...c(this,k),...o])]),b(this,M,""),n.value="",d(this,f,U).call(this),d(this,f,Q).call(this)})},U=function(){const e=c(this,q).querySelector(".tags-container"),n=c(this,q).querySelector(".hidden-input"),i=c(this,q).querySelector('input[type="text"]');e.innerHTML="",c(this,k).forEach(s=>{const a=document.createElement("span");a.className="tag",a.setAttribute("role","button"),a.setAttribute("aria-label",`Remove ${s}`),a.setAttribute("tabindex","0"),a.innerHTML=`
        <span class="tag-text" title="${d(this,f,De).call(this,s)}">${d(this,f,De).call(this,s)}</span>
        <span class="tag-remove">x</span>
      `,a.addEventListener("click",o=>{o.stopPropagation(),this.removeWord(s)}),a.addEventListener("keydown",o=>{(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),this.removeWord(s))}),e.appendChild(a)}),n.value=this.value,this.setAttribute("value",this.value),i&&i.value!==c(this,M)&&(i.value=c(this,M))},De=function(e){const n=document.createElement("div");return n.textContent=e,n.innerHTML},Q=function(){this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:{value:this.value,words:this.words}}))},dt=function(){this.dispatchEvent(new CustomEvent("submit",{bubbles:!0,composed:!0,detail:{value:this.value,words:this.words,inputValue:this.inputValue}}))};customElements.get("search-bar-tags")||customElements.define("search-bar-tags",kt);function Mt(r){let t=0;for(let e=0;e<r.length;e+=1)t=(t<<5)-t+r.charCodeAt(e),t|=0;return Math.abs(t)}function At(r){return String(r).trim().split(/\s+/).filter(Boolean).slice(0,2).map(t=>t.charAt(0).toUpperCase()).join("")||"?"}function _t(r){var i,s,a,o,l,g,x,y;const t=(a=(s=(i=r.avatarUrl)!=null?i:r.avatar_url)!=null?s:r.profileImage)!=null?a:r.profile_image;if(t)return t;const e=(y=(x=(g=(l=(o=r.email)!=null?o:r.emailAddress)!=null?l:r.username)!=null?g:r.handle)!=null?x:r.name)!=null?y:"",n=String(e).trim().toLowerCase();return n?`https://www.gravatar.com/avatar/${encodeURIComponent(n)}?d=robohash&s=80`:""}class It extends HTMLElement{constructor(){super(),this._cleanup=[]}disconnectedCallback(){for(const t of this._cleanup.splice(0))t()}setup(t){var x;const e=(x=t==null?void 0:t.name)!=null?x:"Unknown author",n=_t(t!=null?t:{}),i=At(e),s=Mt(String(e))%360;this.replaceChildren(),Object.assign(this.style,{display:"inline-flex",alignItems:"center",minWidth:"0"});const a=document.createElement("button");a.type="button",Object.assign(a.style,{display:"inline-flex",alignItems:"center",gap:"8px",minWidth:"0",padding:"0",border:"0",background:"transparent",color:"inherit",cursor:"pointer",textAlign:"left"});const o=document.createElement("span");if(Object.assign(o.style,{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"24px",height:"24px",flex:"0 0 24px",borderRadius:"999px",overflow:"hidden",background:`hsl(${s} 48% 38%)`,color:"#fff",fontSize:"10px",fontWeight:"700"}),n){const y=document.createElement("img");y.src=n,y.alt=`${e} avatar`,Object.assign(y.style,{width:"100%",height:"100%",display:"block",objectFit:"cover"}),y.addEventListener("error",()=>{o.replaceChildren(),o.textContent=i},{once:!0}),o.appendChild(y)}else o.textContent=i;const l=document.createElement("span");l.textContent=e,Object.assign(l.style,{minWidth:"0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}),a.appendChild(o),a.appendChild(l);const g=y=>{y.stopPropagation(),this.dispatchEvent(new CustomEvent("creator-card:filter",{bubbles:!0,composed:!0,detail:{author:e,creator:e}}))};return a.addEventListener("click",g),this._cleanup.push(()=>a.removeEventListener("click",g)),this.appendChild(a),this}}customElements.get("creator-card")||customElements.define("creator-card",It);class Ot extends HTMLElement{constructor(){super(),this._button=null,this._panel=null,this._count=0,this._onClick=t=>{t.stopPropagation(),this.togglePanel()}}setup(t,e=null){var i,s;typeof t=="object"&&t!==null&&(e=(i=t.panel)!=null?i:e,t=t.commentsCount),this._count=Number.isFinite(Number(t))?Number(t):0,this.attachPanel(e),(s=this._button)==null||s.removeEventListener("click",this._onClick),this.replaceChildren(),this.setAttribute("aria-expanded","false"),Object.assign(this.style,{display:"inline-flex"});const n=document.createElement("button");return n.type="button",n.textContent=`💬 ${this._count}`,n.setAttribute("aria-expanded","false"),Object.assign(n.style,{border:"1px solid rgba(255, 255, 255, 0.18)",borderRadius:"999px",background:"rgba(255, 255, 255, 0.06)",color:"white",padding:"8px 12px",cursor:"pointer",fontSize:"13px",lineHeight:"1"}),this._button=n,n.addEventListener("click",this._onClick),this.appendChild(n),this}attachPanel(t){return this._panel=t!=null?t:null,this}togglePanel(t){if(!this._panel)return;const e=typeof t=="boolean"?t:this.getAttribute("aria-expanded")!=="true";this.setAttribute("aria-expanded",String(e)),this._panel.setOpen(e)}closePanel(){this.togglePanel(!1)}setAttribute(t,e){var n;super.setAttribute(t,e),t==="aria-expanded"&&((n=this._button)==null||n.setAttribute(t,e))}}customElements.get("comments-button")||customElements.define("comments-button",Ot);const je="http://localhost:8888/api/meme";function ut(r){return(Array.isArray(r)?r:Array.isArray(r==null?void 0:r.comments)?r.comments:Array.isArray(r==null?void 0:r.data)?r.data:[]).map(e=>{var i,s,a,o,l,g,x,y,F,S,_,E;if(typeof e=="string")return{author:"Anonymous",body:e};if(!e||typeof e!="object")return null;const n=(o=(a=(s=(i=e.body)!=null?i:e.comment)!=null?s:e.text)!=null?a:e.content)!=null?o:e.message;return n?{author:(F=(y=(x=(g=(l=e.author)!=null?l:e.username)!=null?g:e.user)!=null?x:e.creator)!=null?y:e.name)!=null?F:"Anonymous",body:n,createdAt:(E=(_=(S=e.createdAt)!=null?S:e.created_at)!=null?_:e.date)!=null?E:e.timestamp}:null}).filter(Boolean)}async function Tt(r){var i;const t=(i=r==null?void 0:r.checksum)!=null?i:r==null?void 0:r.hash,e=r==null?void 0:r.filename,n=[];t&&(n.push(`${je}/comments?hash=${encodeURIComponent(t)}`),n.push(`${je}/comments?checksum=${encodeURIComponent(t)}`),n.push(`${je}/${encodeURIComponent(t)}/comments`)),e&&n.push(`${je}/comments?filename=${encodeURIComponent(e)}`);for(const s of n)try{const a=await fetch(s);if(!a.ok)continue;const o=await a.json(),l=ut(o);if(Array.isArray(l))return l}catch(a){}return[]}var $,pt,Y;class qt extends HTMLElement{constructor(){super();w(this,$);this._meme=null,this._comments=[],this._detailsText="",this._loaded=!1,this._loadingPromise=null}connectedCallback(){this.childNodes.length||d(this,$,Y).call(this)}setup({meme:e,comments:n=[],detailsText:i=""}={}){return this._meme=e!=null?e:null,this._comments=ut(n),this._detailsText=i,d(this,$,Y).call(this),this}setOpen(e){this.style.opacity=e?"1":"0",this.style.transform=e?"translateY(0)":"translateY(6px)",this.style.pointerEvents=e?"auto":"none",e&&d(this,$,pt).call(this)}}$=new WeakSet,pt=async function(){return this._loaded||this._loadingPromise?this._loadingPromise:this._comments.length>0?(this._loaded=!0,d(this,$,Y).call(this),Promise.resolve(this._comments)):(d(this,$,Y).call(this,"Loading comments..."),this._loadingPromise=Tt(this._meme).then(e=>(this._comments=e,this._loaded=!0,d(this,$,Y).call(this),e)).catch(()=>(this._loaded=!0,d(this,$,Y).call(this,"Comments unavailable right now."),[])).finally(()=>{this._loadingPromise=null}),this._loadingPromise)},Y=function(e=""){if(this.replaceChildren(),Object.assign(this.style,{position:"absolute",right:"0",bottom:"48px",width:"280px",maxHeight:"280px",overflowY:"auto",padding:"12px",borderRadius:"14px",background:"rgba(18, 18, 18, 0.96)",border:"1px solid rgba(255, 255, 255, 0.08)",color:"rgba(255, 255, 255, 0.82)",fontSize:"12px",lineHeight:"1.45",opacity:this.style.opacity||"0",transform:this.style.transform||"translateY(6px)",pointerEvents:this.style.pointerEvents||"none",transition:"opacity 160ms ease, transform 160ms ease"}),this._detailsText){const i=document.createElement("p");i.textContent=this._detailsText,Object.assign(i.style,{margin:"0 0 10px",color:"rgba(255, 255, 255, 0.68)"}),this.appendChild(i)}if(e){const i=document.createElement("p");i.textContent=e,i.setAttribute("aria-live","polite"),Object.assign(i.style,{margin:"0"}),this.appendChild(i);return}if(!this._comments.length){const i=document.createElement("p");i.textContent="No comments yet.",Object.assign(i.style,{margin:"0"}),this.appendChild(i);return}const n=document.createElement("div");Object.assign(n.style,{display:"flex",flexDirection:"column",gap:"10px"});for(const i of this._comments){const s=document.createElement("article");Object.assign(s.style,{paddingTop:"10px",borderTop:"1px solid rgba(255, 255, 255, 0.08)"});const a=document.createElement("div");a.textContent=i.author,Object.assign(a.style,{fontWeight:"600",color:"white",marginBottom:"4px"});const o=document.createElement("p");if(o.textContent=i.body,Object.assign(o.style,{margin:"0"}),s.appendChild(a),i.createdAt){const l=document.createElement("div");l.textContent=String(i.createdAt),Object.assign(l.style,{fontSize:"11px",color:"rgba(255, 255, 255, 0.52)",marginBottom:"4px"}),s.appendChild(l)}s.appendChild(o),n.appendChild(s)}this.appendChild(n)};customElements.get("comments-panel")||customElements.define("comments-panel",qt);function Ft(r){return r.replace(/\.[^.]+$/,"").split(/[._-]+/).map(t=>t.trim()).filter(Boolean).map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}function jt(r){var n,i,s;const t=(s=(i=(n=r.created_at)!=null?n:r.uploaded_date)!=null?i:r.createdAt)!=null?s:r.date;if(!t)return"Unknown date";const e=new Date(t);return Number.isNaN(e.getTime())?String(t):new Intl.DateTimeFormat(void 0,{month:"short",day:"numeric",year:"numeric"}).format(e)}function zt(){let r=document.querySelector("[data-meme-modal]");if(r)return{modal:r,image:r.querySelector("img"),caption:r.querySelector("[data-meme-modal-caption]")};r=document.createElement("div"),r.setAttribute("data-meme-modal","true"),Object.assign(r.style,{position:"fixed",inset:"0",display:"none",alignItems:"center",justifyContent:"center",padding:"24px",background:"rgba(0, 0, 0, 0.82)",zIndex:"9999"});const t=document.createElement("div");Object.assign(t.style,{position:"relative",maxWidth:"min(96vw, 1200px)",maxHeight:"92vh",display:"flex",flexDirection:"column",gap:"10px"});const e=document.createElement("button");e.type="button",e.textContent="Close",Object.assign(e.style,{alignSelf:"flex-end",border:"1px solid rgba(255, 255, 255, 0.25)",borderRadius:"999px",background:"rgba(255, 255, 255, 0.1)",color:"#fff",padding:"8px 14px",cursor:"pointer"});const n=document.createElement("img");Object.assign(n.style,{maxWidth:"100%",maxHeight:"calc(92vh - 56px)",borderRadius:"16px",objectFit:"contain",background:"#111"});const i=document.createElement("div");i.setAttribute("data-meme-modal-caption","true"),Object.assign(i.style,{color:"rgba(255, 255, 255, 0.86)",fontSize:"14px",textAlign:"center"});const s=()=>{r.style.display="none",n.removeAttribute("src"),i.textContent=""};return e.addEventListener("click",s),r.addEventListener("click",a=>{a.target===r&&s()}),document.addEventListener("keydown",a=>{a.key==="Escape"&&r.style.display!=="none"&&s()}),t.appendChild(e),t.appendChild(n),t.appendChild(i),r.appendChild(t),document.body.appendChild(r),{modal:r,image:n,caption:i}}var te,Ne,ht;class $t extends HTMLElement{constructor(){super();w(this,te);this._metadata=null,this._options=null,this._state=null,this._cleanup=[],this._elements={}}connectedCallback(){this._metadata&&this._options&&!this._state&&d(this,te,Ne).call(this)}disconnectedCallback(){d(this,te,ht).call(this)}setup(e,n){return this._metadata=typeof e=="string"?{filename:e,checksum:e}:e,this._options=n,this.isConnected&&!this._state&&d(this,te,Ne).call(this),this}}te=new WeakSet,Ne=function(){var ge,fe,be,ve,ye,xe,Qe,Ke,Ge,Ye,Xe,Je,Ze,et,tt,nt,it;let{searchInput:e,requestSearch:n,viewState:i,autoVoteMs:s,voteForMeme:a,mediaObserver:o}=this._options;e=(ge=document.querySelector("page-topbar"))==null?void 0:ge.searchInput;const l=this._metadata,g=l.filename,x=g.replace(/\.[^.]+$/,"").split(/[._-]+/).map(C=>C.trim()).filter(Boolean),y=(fe=l.title)!=null?fe:Ft(g),F=(ye=(ve=(be=l.creator)!=null?be:l.uploader)!=null?ve:l.uploadedBy)!=null?ye:"Unknown author",S=jt(l),_=(Ge=(Ke=(xe=l.commentsCount)!=null?xe:l.commentCount)!=null?Ke:(Qe=l.comments)==null?void 0:Qe.length)!=null?Ge:x.length,E=(Ye=l.description)!=null?Ye:`File: ${g}`;this.className="meme",Object.assign(this.style,{position:"relative",display:"flex",flexDirection:"column",minHeight:"460px",height:"460px",overflow:"hidden",borderRadius:"20px",border:"1px solid rgba(255, 255, 255, 0.08)",background:"linear-gradient(180deg, rgba(35, 35, 35, 0.98), rgba(18, 18, 18, 0.98))",boxShadow:"0 18px 44px rgba(0, 0, 0, 0.28)"}),this.replaceChildren();const L=document.createElement("div");L.className="media-shell media-placeholder",Object.assign(L.style,{position:"relative",flex:"1",minHeight:"0",margin:"0 16px 16px",borderRadius:"18px",overflow:"hidden",background:"#1a1a1a"});const A=document.createElement("div");Object.assign(A.style,{position:"absolute",left:"28px",right:"28px",bottom:"88px",padding:"12px 14px",borderRadius:"14px",background:"rgba(0, 0, 0, 0.72)",color:"rgba(255, 255, 255, 0.88)",fontSize:"12px",lineHeight:"1.45",opacity:"0",transform:"translateY(8px)",transition:"opacity 160ms ease, transform 160ms ease",pointerEvents:"none",zIndex:"2"}),A.textContent=E;const I=document.createElement("div");I.className="meme-footer",Object.assign(I.style,{display:"flex",flexDirection:"column",gap:"12px",padding:"0 16px 16px"});const W=document.createElement("div");W.textContent=y,Object.assign(W.style,{color:"#fff",fontSize:"17px",fontWeight:"700",lineHeight:"1.3",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"});const ne=document.createElement("div");Object.assign(ne.style,{display:"flex",justifyContent:"space-between",gap:"12px",fontSize:"12px",color:"rgba(255, 255, 255, 0.6)"});const ie=document.createElement("creator-card").setup({name:F,username:(Je=(Xe=l.creator_username)!=null?Xe:l.username)!=null?Je:l.handle,email:(Ze=l.creator_email)!=null?Ze:l.email,avatarUrl:(nt=(tt=(et=l.creator_avatar_url)!=null?et:l.creatorAvatarUrl)!=null?tt:l.avatar_url)!=null?nt:l.avatarUrl}),se=C=>{C.stopPropagation(),this.dispatchEvent(new CustomEvent("meme-card:author-filter",{bubbles:!0,composed:!0,detail:{author:F}}))};ie.addEventListener("creator-card:filter",se),this._cleanup.push(()=>ie.removeEventListener("creator-card:filter",se));const Te=document.createElement("span");Te.textContent=S,ne.appendChild(ie),ne.appendChild(Te);const ce=document.createElement("div");Object.assign(ce.style,{display:"flex",flexWrap:"nowrap",gap:"8px",overflowX:"auto",scrollbarWidth:"none"});for(const C of x){const z=document.createElement("button");z.type="button",z.textContent=C,Object.assign(z.style,{border:"1px solid rgba(255, 255, 255, 0.16)",borderRadius:"999px",background:"rgba(255, 255, 255, 0.06)",color:"white",padding:"5px 10px",cursor:"pointer",fontSize:"12px",lineHeight:"1.2",flex:"0 0 auto"});const Fe=()=>{const we=e.value.trim().split(/\s+/).filter(Boolean);we.includes(C)||we.push(C),n==null||n({query:we.join(" ")})};z.addEventListener("click",Fe),this._cleanup.push(()=>z.removeEventListener("click",Fe)),ce.appendChild(z)}const V=document.createElement("div");Object.assign(V.style,{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"12px"});const P=document.createElement("div");Object.assign(P.style,{position:"relative",display:"inline-flex",alignItems:"center",gap:"8px"});const de={border:"1px solid rgba(255, 255, 255, 0.18)",borderRadius:"999px",background:"rgba(255, 255, 255, 0.06)",color:"white",padding:"8px 12px",cursor:"pointer",fontSize:"14px",lineHeight:"1",transition:"opacity 160ms ease, transform 160ms ease, background 160ms ease"},R=Number((it=l.votes)!=null?it:0),qe=Number.isFinite(R)?R:0,T=document.createElement("button");T.type="button",T.textContent="👎",T.setAttribute("aria-label",`Downvote ${g}`),Object.assign(T.style,de);const j=document.createElement("button");j.type="button",j.textContent="👍",j.setAttribute("aria-label",`Upvote ${g}`),Object.assign(j.style,de);const B=document.createElement("span");B.textContent=String(qe),Object.assign(B.style,{minWidth:"2ch",color:"rgba(255, 255, 255, 0.88)",fontSize:"14px",fontWeight:"700",lineHeight:"1",textAlign:"center"});const p=()=>{const C=i.get(this);C&&a(C,-1)&&(C.votes-=1,B.textContent=String(C.votes))},u=()=>{const C=i.get(this);C&&a(C,1)&&(C.votes+=1,B.textContent=String(C.votes))};T.addEventListener("click",p),j.addEventListener("click",u),this._cleanup.push(()=>T.removeEventListener("click",p)),this._cleanup.push(()=>j.removeEventListener("click",u));const m=document.createElement("div");Object.assign(m.style,{position:"relative",display:"flex",justifyContent:"flex-end"});const v=document.createElement("comments-panel").setup({meme:l,comments:l.comments,detailsText:`${E} • ${_} comments`}),re=document.createElement("comments-button").setup({commentsCount:_,panel:v}),ue=C=>{this.contains(C.target)||re.closePanel()},pe=()=>{A.style.opacity="1",A.style.transform="translateY(0)"},he=()=>{A.style.opacity="0",A.style.transform="translateY(8px)"},me=C=>{if(C.target.closest("button, comments-button, comments-panel"))return;const z=this.querySelector(".media-shell img");if(!(z!=null&&z.src))return;const{modal:Fe,image:we,caption:St}=zt();we.src=z.src,St.textContent=y,Fe.style.display="flex"};document.addEventListener("click",ue),this.addEventListener("mouseenter",pe),this.addEventListener("mouseleave",he),this.addEventListener("click",me),this._cleanup.push(()=>document.removeEventListener("click",ue)),this._cleanup.push(()=>this.removeEventListener("mouseenter",pe)),this._cleanup.push(()=>this.removeEventListener("mouseleave",he)),this._cleanup.push(()=>this.removeEventListener("click",me)),m.appendChild(re),P.appendChild(T),P.appendChild(B),P.appendChild(j),m.appendChild(v),V.appendChild(P),V.appendChild(m),I.appendChild(W),I.appendChild(ne),I.appendChild(ce),I.appendChild(V),this.appendChild(L),this.appendChild(I),this._elements={commentsButton:re,commentsPanel:v,downvoteButton:T,hoverInfo:A,placeholder:L,upvoteButton:j,voteWrap:P},this._state={...l,container:this,file:g,upvoteButton:j,downvoteButton:T,voteCountLabel:B,voteWrap:P,votes:qe,remainingMs:s,visibleSince:null,timerId:null,voted:!1,loaded:!1},i.set(this,this._state),o.observe(this)},ht=function(){for(const e of this._cleanup.splice(0))e()};customElements.get("meme-card")||customElements.define("meme-card",$t);var ke,Me,le,Ae;class Rt extends HTMLElement{constructor(){super(...arguments);w(this,ke,()=>{this.classList.add("is-hovered")});w(this,Me,()=>{this.classList.remove("is-hovered")});w(this,le,()=>{const e=this.getAttribute("href");e&&window.open(e,"_blank","noopener,noreferrer")});w(this,Ae,e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),c(this,le).call(this))})}connectedCallback(){if(this.dataset.initialized!=="true"){if(this.dataset.initialized="true",this.classList.add("is-interactive"),this.setAttribute("role","link"),this.setAttribute("tabindex","0"),this.setAttribute("aria-label",this.getAttribute("aria-label")||"Open meme-client on GitHub"),!this.querySelector("img")){const e=document.createElement("img");e.src=this.getAttribute("src")||"./assets/liberty-octocat-github-256.png",e.alt="",e.setAttribute("aria-hidden","true"),this.appendChild(e)}this.addEventListener("mouseenter",c(this,ke)),this.addEventListener("mouseleave",c(this,Me)),this.addEventListener("click",c(this,le)),this.addEventListener("keydown",c(this,Ae))}}disconnectedCallback(){this.removeEventListener("mouseenter",c(this,ke)),this.removeEventListener("mouseleave",c(this,Me)),this.removeEventListener("click",c(this,le)),this.removeEventListener("keydown",c(this,Ae))}}ke=new WeakMap,Me=new WeakMap,le=new WeakMap,Ae=new WeakMap;customElements.define("floating-octocat",Rt);function Ht(r,t){const e=r.querySelector(".media-shell");if(!e||e.classList.contains("media-placeholder"))return;const n=e.querySelector("video");if(n)n.pause(),n.src="",n.load();else{const o=e.querySelector("img");o&&(o.src="")}const i=e.offsetHeight;e.remove(),t.loaded=!1;const s=document.createElement("div");s.className="media-shell media-placeholder",Object.assign(s.style,{position:"relative",flex:"1",minHeight:"0",margin:"0 16px 16px",height:i>0?`${i}px`:"200px",borderRadius:"18px",overflow:"hidden",background:"#1a1a1a"});const a=r.querySelector(".meme-footer");a?r.insertBefore(s,a):r.appendChild(s)}function Pt(r,t,e){const n=t.file;let i=r.querySelector(".media-shell");if(i&&i.classList.contains("media-placeholder")&&(i.remove(),i=null),i)return;i=document.createElement("div"),i.className="media-shell",Object.assign(i.style,{position:"relative",flex:"1",minHeight:"0",borderRadius:"18px 18px 0 0",overflow:"hidden",background:"#111",display:"flex",alignItems:"center",justifyContent:"center"});let s;if(n.endsWith(".mp4")||n.endsWith(".webm")||n.endsWith(".mov"))s=document.createElement("video"),s.src=e+n,s.autoplay=!0,s.loop=!0,s.muted=!0,s.playsInline=!0,s.controls=!0,s.preload="metadata",Object.assign(s.style,{maxWidth:"100%",maxHeight:"100%",width:"auto",height:"auto",background:"#111"});else{const o=document.createElement("div");o.className="image-shell",Object.assign(o.style,{width:"100%",height:"100%"}),s=document.createElement("img"),s.src=e+n,Object.assign(s.style,{width:"100%",height:"100%",objectFit:"cover",cursor:"zoom-in",display:"block"});const l=()=>o.classList.add("is-loaded"),g=()=>o.classList.add("is-error");s.complete&&s.naturalWidth>0?l():(s.addEventListener("load",l,{once:!0}),s.addEventListener("error",g,{once:!0})),o.appendChild(s),i.appendChild(o)}s.parentNode||i.appendChild(s);const a=r.querySelector(".meme-footer");a?r.insertBefore(i,a):r.appendChild(i),t.loaded=!0}function Bt({files:r,feed:t,initialQuery:e,onRequestSearch:n,castMemeVote:i,ejectMedia:s,injectMedia:a}){const o=document.querySelector("#search-input");let l="http://localhost:8787/memes/";l="https://m.marak.com/";const g=15,x=3333,y="600px",F=40,S=p=>p.map(u=>{var v,re,ue,pe,he,me,ge,fe,be,ve,ye;if(typeof u=="string"){const xe=u.lastIndexOf(".");return{filename:u,checksum:u,size:null,extension:xe>=0?u.slice(xe):"",votes:0,creator:"Unknown",created_at:null,tags:[]}}if(!(u!=null&&u.filename))return null;const m=u.filename.lastIndexOf(".");return{filename:u.filename,checksum:(v=u.checksum)!=null?v:u.filename,size:(re=u.size)!=null?re:null,created_at:(ge=(me=(he=(pe=(ue=u.created_at)!=null?ue:u.uploadedAt)!=null?pe:u.uploaded_date)!=null?he:u.createdAt)!=null?me:u.date)!=null?ge:null,creator:(fe=u.creator)!=null?fe:"Unknown",tags:(be=u.tags)!=null?be:[],extension:(ve=u.extension)!=null?ve:m>=0?u.filename.slice(m):"",votes:(ye=u.votes)!=null?ye:0}}).filter(u=>u==null?void 0:u.filename),_=S(r);let E=_,L=0,A=!1;const I=new Set,W=new WeakMap,ne=new IntersectionObserver(p=>{p[0].isIntersecting&&!A&&T()},{rootMargin:"200px",threshold:0}),ie=new IntersectionObserver(p=>{p.forEach(u=>{const m=u.target,v=W.get(m);v&&(u.isIntersecting?v.loaded||a(m,v,l):v.loaded&&s(m,v))})},{rootMargin:`${y} 0px`,threshold:0});function se(p,u){p.visibleSince!==null&&(clearTimeout(p.timerId),p.timerId=null,p.remainingMs-=u-p.visibleSince,p.visibleSince=null)}function Te(p,u){p.voted||p.visibleSince!==null||(p.visibleSince=u,p.timerId=setTimeout(()=>de(p,!0),Math.max(0,p.remainingMs)))}function ce(p){const u=W.get(p);if(!u)return;se(u,performance.now()),V.unobserve(p),ie.unobserve(p);const m=p.querySelector(".media-shell");if(m){const v=m.querySelector("video");v&&(v.pause(),v.src="",v.load()),m.remove()}u.loaded=!1}window.cleanupMemeState=ce;const V=new IntersectionObserver(p=>{const u=performance.now();for(const m of p){const v=W.get(m.target);!v||v.voted||(m.isIntersecting&&m.intersectionRatio>=.6?Te(v,u):se(v,u))}},{threshold:[.6]});function P(p,u){if(!p)return;const m=document.createElement("span");m.textContent=u>0?"+1":"-1",Object.assign(m.style,{position:"absolute",left:"50%",bottom:"50%",transform:"translate(-50%, 0)",color:u>0?"#7CFFB2":"#FF9A9A",fontSize:"16px",fontWeight:"700",opacity:"1",pointerEvents:"none",transition:"transform 500ms ease, opacity 500ms ease"}),p.appendChild(m),requestAnimationFrame(()=>{m.style.transform="translate(-50%, -24px)",m.style.opacity="0"}),m.addEventListener("transitionend",()=>m.remove(),{once:!0})}function de(p,u=1){var v;const m=(v=p.checksum)!=null?v:p.file;return I.has(m)?!1:(p.voted=!0,se(p,performance.now()),V.unobserve(p.container),I.add(m),i(p,u),p.upvoteButton&&(p.upvoteButton.disabled=!0,p.upvoteButton.style.opacity="0",p.upvoteButton.style.transform="scale(0.9)",p.upvoteButton.style.pointerEvents="none"),p.downvoteButton&&(p.downvoteButton.disabled=!0,p.downvoteButton.style.opacity="0",p.downvoteButton.style.transform="scale(0.9)",p.downvoteButton.style.pointerEvents="none"),P(p.voteWrap,u),!0)}let R=document.querySelector("#infinite-scroll-sentinel");R||(R=document.createElement("div"),R.id="infinite-scroll-sentinel",R.style.height="10px",R.style.width="100%",t.insertAdjacentElement("afterend",R)),ne.observe(R);function qe(p,u){return document.createElement("meme-card").setup(p,u)}function T(){if(A||L>=E.length)return;A=!0;const p=document.createDocumentFragment(),u=Math.min(L+g,E.length);for(;L<u;L++){const m=E[L],v=qe(m,{searchInput:o,requestSearch:n,viewState:W,autoVoteMs:x,voteForMeme:de,autoVoteObserver:V,mediaObserver:ie});p.appendChild(v)}t.appendChild(p),j(),A=!1}function j(){const p=t.children;if(p.length<=F)return;const u=p.length-F;for(let m=0;m<u;m++){const v=p[0];typeof window.cleanupMemeState=="function"&&window.cleanupMemeState(v),v.remove()}}const B=p=>{var m;const u=(m=p.detail)==null?void 0:m.author;u&&(n==null||n({creator:u}))};return t.addEventListener("meme-card:author-filter",B),e&&o&&(o.value=e),T(),{appendFiles(p){const u=S(p);if(!u.length)return console.log("[meme-feed] appendFiles skipped empty batch"),0;const m=E===_;return _.push(...u),m||E.push(...u),console.log("[meme-feed] appendFiles appended batch",{receivedCount:p.length,normalizedCount:u.length,targetWasAliased:m,allFilesLength:_.length,filteredFilesLength:E.length}),u.length},destroy(){t.removeEventListener("meme-card:author-filter",B)}}}let H="http://localhost:8888/api/meme";H="https://meme-server.cloudflare1973.workers.dev/api/meme";function Pe(r,t){console.log(`[api] ${r} response:`,t)}function Ie(r,t,e){console.error(`[api] ${r} failed:`,{error:t,...e})}async function Oe(r,t){if(!r.ok)throw new Error(`${t} request failed with status ${r.status}`);return r.json()}async function mt(r,t){try{const e=await fetch(r),n=await Oe(e,t);if(Pe(t,n),!(n!=null&&n.success)||!Array.isArray(n.memes))throw new Error(`${t} returned an invalid payload`);return n.memes}catch(e){return Ie(t,e,{url:r}),[]}}async function Ut(r,t){try{const e=await fetch(r),n=await Oe(e,t);if(Pe(t,n),!(n!=null&&n.success)||!Array.isArray(n.tags))throw new Error(`${t} returned an invalid payload`);return n.tags=n.tags.filter(i=>!["the","this","of","my","is","you"].includes(i.name.toLowerCase())),n.tags}catch(e){throw Ie(t,e,{url:r}),e}}async function Dt(r,t){try{const e=await fetch(r),n=await Oe(e,t);if(Pe(t,n),!(n!=null&&n.success)||!Array.isArray(n.creators))throw new Error(`${t} returned an invalid payload`);return n.creators}catch(e){throw Ie(t,e,{url:r}),e}}function Nt({query:r="",creator:t="",limit:e=10,offset:n=0}){const i=new URLSearchParams({limit:String(e),offset:String(n)});return r&&i.set("q",r),t&&i.set("c",t),mt(`${H}/search?${i.toString()}`,"searchMemes")}function Wt(){return mt(`${H}/top`,"getTopMemes")}function Vt({limit:r=10,window:t="24h"}={}){return Ut(`${H}/trending-tags?limit=${encodeURIComponent(r)}&window=${encodeURIComponent(t)}`,"getTrendingTags")}function Qt({limit:r=10}={}){return Dt(`${H}/creators/top?limit=${encodeURIComponent(r)}`,"getTopCreators")}async function Be(r,t,e){var n,i;try{const s=await fetch(r),a=await Oe(s,t);console.log(`[api] ${t} response:`,a);const o=(i=(n=a==null?void 0:a[e])!=null?n:a==null?void 0:a.total)!=null?i:a==null?void 0:a.count;if(!(a!=null&&a.success)||typeof o!="number")throw new Error(`${t} returned an invalid payload`);return o}catch(s){return Ie(t,s,{url:r}),null}}function Kt(){return Be(`${H}/total`,"getTotalMemes","memes")}function Gt(){return Be(`${H}/creators/total`,"getTotalCreators","creators")}function Yt(){return Be(`${H}/votes/daily`,"getDailyVotes","votes")}function Xt(){return Be(`${H}/voters/active`,"getActiveVoters","active")}async function Jt(r,t){const e=`${H}/vote`,n={hash:r==null?void 0:r.checksum,value:t};console.log("[api] castMemeVote request:",n);try{const i=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),s=await Oe(i,"castMemeVote");if(Pe("castMemeVote",s),!(s!=null&&s.success))throw new Error("castMemeVote returned an unsuccessful response");return s}catch(i){return Ie("castMemeVote",i,{url:e,payload:n}),null}}const Zt=({getObserver:r,loadMoreMemes:t,setObserver:e})=>{const n=()=>{var a;const i=document.querySelector("#infinite-scroll-sentinel");if(!i){requestAnimationFrame(n);return}(a=r())==null||a.disconnect();const s=new IntersectionObserver(o=>{var l;(l=o[0])!=null&&l.isIntersecting&&t()},{rootMargin:"1000px 0px 1200px 0px",threshold:0});e(s),s.observe(i)};return n},en=({attachInfiniteScrollObserver:r,getTopMemes:t,initialCreator:e,initialQuery:n,initializeFeed:i,searchMemes:s,searchPageSize:a,state:o})=>Promise.all([s({query:o.activeCreator?"":n,creator:o.activeCreator,limit:a,offset:0}),t()]).then(([l,g])=>{var y,F;console.log("Initial search results:",l),console.log("Top memes:",g);const x=new Map(g.map(({hash:S,votes:_})=>[S,_]));o.activeFeedMode="hot",o.activeQuery=n,o.activeCreator=e,o.searchOffset=a,o.isLoadingMore=!1,l.sort((S,_)=>{var A,I;const E=x.get((A=S.checksum)!=null?A:S.filename),L=x.get((I=_.checksum)!=null?I:_.filename);return E===void 0?L===void 0?0:1:L===void 0?-1:L-E});for(let S=0;S<l.length;){const _=x.get((y=l[S].checksum)!=null?y:l[S].filename);let E=S+1;for(;E<l.length&&x.get((F=l[E].checksum)!=null?F:l[E].filename)===_;)E+=1;for(let L=E-1;L>S;L-=1){const A=S+Math.floor(Math.random()*(L-S+1)),I=l[L];l[L]=l[A],l[A]=I}S=E}o.hasMoreMemes=l.length===a,o.defaultHotFiles=[...l],console.log("Sorted and randomized search results:",l),i({files:l}),r()}),tn="https://github.com/buddypond/meme-client";let gt="http://localhost:8888";gt="https://meme-server.cloudflare1973.workers.dev";const ft=10,Ee="sidebar-hidden",rt="meme-feed-sidebar-hidden",at="meme-client:search-location-change";class nn{constructor(t){this.api=t}search({query:t="",creator:e="",limit:n=ft,offset:i=0}){return this.api.searchMemes({query:t,creator:e,limit:n,offset:i})}getTopMemes(...t){return this.api.getTopMemes(...t)}vote(...t){return this.api.castMemeVote(...t)}}class sn{constructor(t){this.state={...t}}get(t){return this.state[t]}set(t){Object.assign(this.state,t)}toLegacyState(){return new Proxy({},{get:(t,e)=>this.state[e],set:(t,e,n)=>(this.state[e]=n,!0)})}}class rn{constructor({feed:t,sideMenu:e,searchInput:n,floatingOctocat:i,searchPageSize:s=ft,apiOrigin:a=gt,githubUrl:o=tn}){this.feed=t,this.sideMenu=e,this.searchInput=n,this.floatingOctocat=i,this.searchPageSize=s,this.apiOrigin=a,this.githubUrl=o,this.api=new nn({searchMemes:Nt,getTopMemes:Wt,castMemeVote:Jt}),this.memeFeedInstance=null,this.infiniteScrollObserver=null,this.attachInfiniteScrollObserver=null,this.lastAppliedLocationKey=null,this.activeSearchRequest=0;const{initialCreator:l,initialQuery:g}=this.getInitialFilters();this.initialCreator=l,this.initialQuery=g,this.store=new sn({activeCreator:l,activeFeedMode:"hot",activeQuery:g,defaultHotFiles:[],hasMoreMemes:!0,isLoadingMore:!1,searchOffset:s})}init(){this.configureExternalLinks(),this.configureSearchInput(),this.configureSidebar(),this.configureInfiniteScroll(),this.bindEvents(),this.applySearchFromLocation({force:!0})}getInitialFilters(){const t=new URLSearchParams(window.location.search),e=t.get("c")||"",n=e||t.get("q")||"";return{initialCreator:e,initialQuery:n}}configureExternalLinks(){var t;(t=this.floatingOctocat)==null||t.setAttribute("href",this.githubUrl)}configureSearchInput(){if(!this.searchInput)return;this.searchInput.setAttribute("initial-query",this.initialQuery),this.searchInput.value=this.initialQuery;const t=()=>{var e,n;return(n=(e=this.searchInput)==null?void 0:e.focus)==null?void 0:n.call(e)};if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",t,{once:!0});return}t()}configureSidebar(){if(!this.sideMenu)return;const t=document.createElement("style");t.textContent=`
      @media (min-width: 768px) {
        side-menu {
          transition: transform 180ms ease, opacity 180ms ease;
        }

        body.${Ee} {
          padding-left: 0;
        }

        body.${Ee} .search-shell {
          left: 0;
        }

        body.${Ee} side-menu {
          transform: translateX(calc(var(--side-menu-width, 250px) * -1));
          opacity: 0;
          pointer-events: none;
        }
      }
    `,document.head.appendChild(t);const e=document.querySelector("page-topbar"),n=e==null?void 0:e.homeButton,i=e==null?void 0:e.sidebarToggleButton;if(!n||!i)return;const s=o=>{i.setAttribute("aria-label",o?"Show sidebar":"Hide sidebar"),i.setAttribute("aria-pressed",String(!o))},a=o=>{const l=window.innerWidth>=768&&o;document.body.classList.toggle(Ee,l),l&&(this.sideMenu.open=!1,document.body.classList.remove("menu-open")),s(l),this.persistSidebarHidden(o)};n.addEventListener("click",()=>{this.updateSearchLocation({query:"",creator:""})}),i.addEventListener("click",()=>{const o=!document.body.classList.contains(Ee);a(o)}),window.addEventListener("resize",()=>{a(this.getInitialSidebarHiddenState())}),a(this.getInitialSidebarHiddenState())}bindEvents(){var e,n,i;const t=s=>{const a=Array.isArray(s)?s.join(" "):String(s||"");this.updateSearchLocation({query:a,creator:""})};(e=this.searchInput)==null||e.addEventListener("change",s=>{var a;((a=s==null?void 0:s.detail)==null?void 0:a.value)!==void 0&&t(s.detail.words)}),(n=this.searchInput)==null||n.addEventListener("submit",s=>{var a;((a=s==null?void 0:s.detail)==null?void 0:a.value)!==void 0&&t(s.detail.value)}),(i=this.feed)==null||i.addEventListener("meme-client:navigate-search",s=>{this.updateSearchLocation(s.detail||{})}),window.addEventListener("popstate",()=>{this.applySearchFromLocation({force:!0})}),window.addEventListener(at,()=>{this.applySearchFromLocation()})}configureInfiniteScroll(){this.attachInfiniteScrollObserver=Zt({getObserver:()=>this.infiniteScrollObserver,loadMoreMemes:()=>this.loadMoreMemes(),setObserver:t=>{this.infiniteScrollObserver=t}})}loadInitialFeed({query:t="",creator:e=""}={}){const n=++this.activeSearchRequest;en({attachInfiniteScrollObserver:this.attachInfiniteScrollObserver,getTopMemes:(...i)=>this.api.getTopMemes(...i),initialCreator:e,initialQuery:e||t,initializeFeed:({files:i,initialQueryValue:s})=>{n===this.activeSearchRequest&&this.initializeFeed({files:i,initialQueryValue:s})},searchMemes:i=>this.api.search(i),searchPageSize:this.searchPageSize,state:this.store.toLegacyState()})}resetRenderedFeed(){var t,e;Array.from(((t=this.feed)==null?void 0:t.children)||[]).forEach(n=>{var i;return(i=window.cleanupMemeState)==null?void 0:i.call(window,n)}),(e=this.feed)==null||e.replaceChildren()}initializeFeed({files:t,initialQueryValue:e=this.initialQuery}){var n,i;return(i=(n=this.memeFeedInstance)==null?void 0:n.destroy)==null||i.call(n),this.resetRenderedFeed(),this.memeFeedInstance=Bt({files:t,feed:this.feed,initialQuery:e,onRequestSearch:s=>this.updateSearchLocation(s),castMemeVote:(...s)=>this.api.vote(...s),ejectMedia:Ht,injectMedia:Pt}),this.memeFeedInstance}getActiveFilters(){const t=new URLSearchParams(window.location.search),e=t.get("c")||"";return{query:e?"":t.get("q")||"",creator:e}}updateSearchQueryParam(t){this.updateSearchLocation({query:t,creator:""})}getLocationKey({query:t,creator:e}){return JSON.stringify({query:t||"",creator:e||""})}syncSearchInputValue(t){!this.searchInput||this.searchInput.value===t||(this.searchInput.value=t)}updateSearchLocation({query:t="",creator:e=""}){const n=t.trim(),i=e.trim(),s=new URL(window.location.href),a=s.search;if(n?s.searchParams.set("q",n):s.searchParams.delete("q"),i?s.searchParams.set("c",i):s.searchParams.delete("c"),s.search===a){this.applySearchFromLocation();return}window.history.replaceState({},"",`${s.pathname}${s.search}${s.hash}`),window.dispatchEvent(new CustomEvent(at))}async runSearch(t){var s;const e=++this.activeSearchRequest,n=t.trim();this.store.set({activeCreator:"",activeFeedMode:"hot",activeQuery:n,hasMoreMemes:!0,isLoadingMore:!1});const i=await this.api.search({query:n,creator:"",limit:this.searchPageSize,offset:0});e===this.activeSearchRequest&&(this.store.set({hasMoreMemes:i.length===this.searchPageSize,searchOffset:i.length}),this.initializeFeed({files:i,initialQueryValue:n}),(s=this.attachInfiniteScrollObserver)==null||s.call(this))}async runCreatorSearch(t){var s;const e=++this.activeSearchRequest,n=t.trim();this.store.set({activeCreator:n,activeFeedMode:"hot",activeQuery:"",hasMoreMemes:!0,isLoadingMore:!1});const i=await this.api.search({query:"",creator:n,limit:this.searchPageSize,offset:0});e===this.activeSearchRequest&&(this.store.set({hasMoreMemes:i.length===this.searchPageSize,searchOffset:i.length}),this.initializeFeed({files:i,initialQueryValue:n}),(s=this.attachInfiniteScrollObserver)==null||s.call(this))}applySearchFromLocation({force:t=!1}={}){const e=this.getActiveFilters(),n=this.getLocationKey(e);if(!(!t&&n===this.lastAppliedLocationKey)){if(this.lastAppliedLocationKey=n,this.syncSearchInputValue(e.creator||e.query),e.creator){this.runCreatorSearch(e.creator);return}if(e.query){this.runSearch(e.query);return}this.loadInitialFeed(e)}}async loadMoreMemes(){var t,e,n;if(!(this.store.get("activeFeedMode")!=="hot"||this.store.get("isLoadingMore")||!this.store.get("hasMoreMemes"))){this.store.set({isLoadingMore:!0});try{const{query:i,creator:s}=this.getActiveFilters(),a=this.store.get("searchOffset");console.log("[meme-client] loadMoreMemes requesting page",{query:i,creator:s,limit:this.searchPageSize,offset:a});const o=await this.api.search({query:i,creator:s,limit:this.searchPageSize,offset:a}),l=(n=(e=(t=this.memeFeedInstance)==null?void 0:t.appendFiles)==null?void 0:e.call(t,o))!=null?n:0,g=a+l;console.log("[meme-client] loadMoreMemes received page",{requestedOffset:a,receivedCount:o.length,appendedCount:l,nextOffset:g}),this.store.set({hasMoreMemes:o.length===this.searchPageSize,searchOffset:g})}finally{this.store.set({isLoadingMore:!1})}}}readStoredSidebarHidden(){try{return window.localStorage.getItem(rt)}catch(t){return null}}persistSidebarHidden(t){try{window.localStorage.setItem(rt,String(t))}catch(e){}}getInitialSidebarHiddenState(){const t=this.readStoredSidebarHidden();return t!==null?t==="true":window.location.search.includes("immersive=1")||window.location.search.includes("sidebar=hidden")||window.MEME_CLIENT_HIDE_SIDEBAR===!0}}var ot;const an=new rn({feed:document.querySelector("#feed"),sideMenu:document.querySelector("#side-menu"),searchInput:(ot=document.querySelector("page-topbar"))==null?void 0:ot.searchInput,floatingOctocat:document.querySelector("floating-octocat")});an.init();var He,bt;class on extends HTMLElement{constructor(){super(...arguments);w(this,He)}connectedCallback(){this.dataset.initialized!=="true"&&(this.dataset.initialized="true",this.classList.add("feed-topbar"),this.setAttribute("aria-label","Feed stats"),this.innerHTML=`
      <div class="feed-stat" style="display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 0.75rem;">
        <span class="feed-stat-icon" aria-hidden="true">🖼️</span>
        <div class="feed-stat-content" style="display: grid; gap: 0.125rem;">
          <strong class="feed-stat-value" id="total-memes">--</strong>
          <span class="feed-stat-label">Total Memes</span>
        </div>
      </div>
      <div class="feed-stat" style="display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 0.75rem;">
        <span class="feed-stat-icon" aria-hidden="true">🧑‍🎨</span>
        <div class="feed-stat-content" style="display: grid; gap: 0.125rem;">
          <strong class="feed-stat-value" id="total-creators">--</strong>
          <span class="feed-stat-label">Total Creators</span>
        </div>
      </div>
      <div class="feed-stat" style="display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 0.75rem;">
        <span class="feed-stat-icon" aria-hidden="true">🗳️</span>
        <div class="feed-stat-content" style="display: grid; gap: 0.125rem;">
          <strong class="feed-stat-value" id="votes-today">--</strong>
          <span class="feed-stat-label">Votes Today</span>
        </div>
      </div>
      <div class="feed-stat" style="display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 0.75rem;">
        <span class="feed-stat-icon" aria-hidden="true">🔥</span>
        <div class="feed-stat-content" style="display: grid; gap: 0.125rem;">
          <strong class="feed-stat-value" id="active-now">--</strong>
          <span class="feed-stat-label">Active Now</span>
        </div>
      </div>
    `,d(this,He,bt).call(this))}}He=new WeakSet,bt=async function(){var y;const e=this.querySelector("#total-memes"),n=(y=document.querySelector("page-topbar"))==null?void 0:y.totalMemesElement,i=this.querySelector("#total-creators"),s=this.querySelector("#votes-today"),a=this.querySelector("#active-now"),[o,l,g,x]=await Promise.all([Kt(),Gt(),Yt(),Xt()]);e&&typeof o=="number"&&(e.textContent=o.toLocaleString()),n&&typeof o=="number"&&(n.textContent=o.toLocaleString()),i&&typeof l=="number"&&(i.textContent=l.toLocaleString()),s&&typeof g=="number"&&(s.textContent=g.toLocaleString()),a&&typeof x=="number"&&(a.textContent=x.toLocaleString())};customElements.define("feed-topbar",on);var O,X,J,K,G,Z,ee,_e,h,Se,We,Re,ae,oe,Ve,vt,yt,xt,wt,Et,Ce,Le;class ln extends HTMLElement{constructor(){super();w(this,h);w(this,O);w(this,X,!1);w(this,J,[]);w(this,K,[]);w(this,G,!1);w(this,Z,"");w(this,ee,"");w(this,_e,!1);b(this,O,this.attachShadow({mode:"open"})),d(this,h,Le).call(this)}static get observedAttributes(){return["title","open","toggle-label","menu-label"]}connectedCallback(){d(this,h,oe).call(this),d(this,h,Se).call(this),d(this,h,Ve).call(this)}attributeChangedCallback(){d(this,h,Le).call(this),d(this,h,oe).call(this),d(this,h,Se).call(this)}get open(){return c(this,X)}set open(e){const n=!!e;b(this,X,n),this.toggleAttribute("open",n),d(this,h,oe).call(this)}close(){c(this,X)&&(this.open=!1,this.dispatchEvent(new CustomEvent("side-menu-toggle",{detail:{open:!1},bubbles:!0})))}}O=new WeakMap,X=new WeakMap,J=new WeakMap,K=new WeakMap,G=new WeakMap,Z=new WeakMap,ee=new WeakMap,_e=new WeakMap,h=new WeakSet,Se=function(){var e,n,i,s,a,o;(e=c(this,O).querySelector("[data-side-menu-toggle]"))==null||e.addEventListener("click",()=>{this.open=!0,this.dispatchEvent(new CustomEvent("side-menu-toggle",{detail:{open:!0},bubbles:!0}))}),(n=c(this,O).querySelector("[data-side-menu-close]"))==null||n.addEventListener("click",()=>{this.close()}),(i=c(this,O).querySelector("[data-side-menu-backdrop]"))==null||i.addEventListener("click",()=>{this.close()}),(s=c(this,O).querySelector("[data-trending-tags-retry]"))==null||s.addEventListener("click",()=>{d(this,h,Ve).call(this,{force:!0})}),(a=c(this,O).querySelector("[data-trending-tags-list]"))==null||a.addEventListener("click",l=>{const g=l.target.closest("[data-trending-tag]");g&&d(this,h,vt).call(this,g.dataset.trendingTag||"")}),(o=c(this,O).querySelector("slot"))==null||o.addEventListener("slotchange",()=>{d(this,h,We).call(this),d(this,h,ae).call(this)}),d(this,h,We).call(this),d(this,h,ae).call(this)},We=function(){d(this,h,Re).call(this).forEach(e=>{e.dataset.sideMenuBound!=="true"&&(e.dataset.sideMenuBound="true",e.addEventListener("click",()=>{d(this,h,Re).call(this).forEach(n=>n.toggleAttribute("data-active",n===e)),d(this,h,ae).call(this),this.close()}))})},Re=function(){const e=c(this,O).querySelector("slot");return e?e.assignedElements({flatten:!0}).filter(n=>n.matches("[data-side-menu-item]")):[]},ae=function(){d(this,h,Re).call(this).forEach(e=>{e.classList.toggle("is-active",e.hasAttribute("data-active"))})},oe=function(){var n,i;const e=this.hasAttribute("open");b(this,X,e),(n=c(this,O).querySelector("[data-side-menu-toggle]"))==null||n.setAttribute("aria-expanded",String(e)),(i=c(this,O).querySelector("[data-side-menu-backdrop]"))==null||i.toggleAttribute("hidden",!e)},Ve=async function({force:e=!1}={}){if(!(c(this,G)||c(this,_e)&&!e)){b(this,G,!0),b(this,Z,""),b(this,ee,""),d(this,h,Le).call(this),d(this,h,Se).call(this),d(this,h,oe).call(this),d(this,h,ae).call(this);try{const[n,i]=await Promise.allSettled([Vt(),Qt()]);n.status==="fulfilled"?b(this,J,n.value):(b(this,J,[]),b(this,Z,n.reason instanceof Error?n.reason.message:"Unable to load trending tags.")),i.status==="fulfilled"?b(this,K,i.value):(b(this,K,[]),b(this,ee,i.reason instanceof Error?i.reason.message:"Unable to load top creators.")),b(this,_e,!0)}finally{if(b(this,G,!1),!this.isConnected)return;d(this,h,Le).call(this),d(this,h,Se).call(this),d(this,h,oe).call(this),d(this,h,ae).call(this)}}},vt=function(e){var s;const n=e.trim();if(!n)return;const i=(s=document.querySelector("page-topbar"))==null?void 0:s.searchInput;if(i){if(typeof i.addWord=="function")i.addWord(n);else{const o=String(i.value||"").trim().split(/\s+/).filter(Boolean);o.includes(n)||o.push(n),i.value=o.join(" ")}i.dispatchEvent(new CustomEvent("submit",{bubbles:!0,composed:!0,detail:{value:i.value}})),this.close()}},yt=function(e){const n=e.trim();if(!n)return;const i=document.querySelector("#feed");i&&(i.dispatchEvent(new CustomEvent("meme-client:navigate-search",{bubbles:!0,composed:!0,detail:{creator:n}})),this.close())},xt=function(){return c(this,G)?'<p class="trending-tags-status" role="status">Loading trending tags...</p>':c(this,Z)?`
        <div class="trending-tags-feedback">
          <p class="trending-tags-error" role="alert">${d(this,h,Ce).call(this,c(this,Z))}</p>
          <button class="trending-tags-retry" data-trending-tags-retry type="button">Retry</button>
        </div>
      `:c(this,J).length?`
      <div class="trending-tags-list" data-trending-tags-list>
        ${c(this,J).map(e=>{const n=typeof(e==null?void 0:e.name)=="string"?e.name.trim():"",i=Number(e==null?void 0:e.meme_count)||0;return n?`
            <button class="trending-tag" data-trending-tag="${d(this,h,Ce).call(this,n)}" type="button">
              <span class="trending-tag-name">#${d(this,h,Ce).call(this,n)}</span>
              <span class="trending-tag-count">+${i}</span>
            </button>
          `:""}).join("")}
      </div>
    `:'<p class="trending-tags-status">No trending tags yet.</p>'},wt=function(){return c(this,G)?'<p class="trending-tags-status" role="status">Loading top creators...</p>':c(this,ee)?`<p class="trending-tags-error" role="alert">${d(this,h,Ce).call(this,c(this,ee))}</p>`:c(this,K).length?`
      <div class="trending-tags-list">
        ${c(this,K).map((e,n)=>{const i=typeof(e==null?void 0:e.creator)=="string"?e.creator.trim():"",s=Number(e==null?void 0:e.meme_count)||0;return i?`
            <div class="trending-tag">
              <div data-top-creator-card="${n}"></div>
              <span class="trending-tag-count">+${s}</span>
            </div>
          `:""}).join("")}
      </div>
    `:'<p class="trending-tags-status">No top creators yet.</p>'},Et=function(){c(this,O).querySelectorAll("[data-top-creator-card]").forEach(e=>{var o,l,g,x;const n=Number(e.getAttribute("data-top-creator-card")),i=c(this,K)[n],s=typeof(i==null?void 0:i.creator)=="string"?i.creator.trim():"";if(!s)return;const a=document.createElement("creator-card").setup({name:s,username:(o=i==null?void 0:i.username)!=null?o:i==null?void 0:i.handle,email:i==null?void 0:i.email,avatarUrl:(x=(g=(l=i==null?void 0:i.avatar_url)!=null?l:i==null?void 0:i.avatarUrl)!=null?g:i==null?void 0:i.profile_image)!=null?x:i==null?void 0:i.profileImage});a.addEventListener("creator-card:filter",y=>{y.stopPropagation(),d(this,h,yt).call(this,s)}),e.replaceChildren(a)})},Ce=function(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")},Le=function(){const e=this.getAttribute("title")||"Menu",n=this.getAttribute("toggle-label")||`Open ${e.toLowerCase()}`,i=this.getAttribute("menu-label")||e;c(this,O).innerHTML=`
      <style>
        :host {
          --side-menu-width: 250px;
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 1000;
          width: var(--side-menu-width);
        }

        .side-menu-toggle,
        .side-menu-backdrop {
          display: none;
        }

        .side-menu {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 1000;
          width: var(--side-menu-width);
          /* padding: calc(28px + env(safe-area-inset-top)) 20px 24px; */
          padding-top: calc(28px + env(safe-area-inset-top));
          box-sizing: border-box;
          background: #171717;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow: hidden;
        }

        .side-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .side-menu-title {
          margin: 0;
          font-size: 14px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
        }

        .side-menu-list {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 0px;
          overflow-y: auto;
        }

        .trending-tags-panel {
          margin-top: 8px;
          padding-top: 8px;
        }

        .trending-tags-panel + .trending-tags-panel {
          margin-top: 0;
        }

        .trending-tags-heading {
          margin: 0 0 12px;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.52);
          margin-left: 8px;
        }

        .trending-tags-status,
        .trending-tags-error {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.7);
        }

        .trending-tags-feedback {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .trending-tags-error {
          color: #ffb4b4;
        }

        .trending-tags-retry {
          align-self: flex-start;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
        }

        .trending-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .trending-tag {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          border: none;
          background: none;
          color: #d3d3d3;
          padding: 8px 12px;
          font: inherit;
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
        }

        .trending-tag:hover,
        .trending-tag:focus-visible {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.24);
          transform: translateY(-1px);
          outline: none;
        }

        .trending-tag-name {
          font-size: 14px;
        }

        .trending-tag-count {
          min-width: 24px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.28);
          padding: 2px 8px;
          font-size: 12px;
          text-align: center;
          color: #4ade80;
        }

        ::slotted([data-side-menu-item]) {
          /* border: 1px solid rgba(255, 255, 255, 0.08); */
          /* background: rgba(255, 255, 255, 0.04); */
          color: #979797;
          text-decoration: none;
          padding: 14px 16px;
          font-size: 17px;
        }

        ::slotted([data-side-menu-item]):hover,
        ::slotted([data-side-menu-item]:focus-visible) {
          /* background: rgba(255, 255, 255, 0.08); */
          color: #d3d3d3;
          outline: none;
        }

        ::slotted([data-side-menu-item].is-active) {
          background: #172920;
          color: #1eab55;
          font-weight: 700;
        }

        .side-menu-close {
          display: none;
        }

        @media (max-width: 767px) {
          :host {
            width: 0;
            z-index: 1004;
          }

          .side-menu-toggle {
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 1003;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 999px;
            background: rgba(24, 24, 24, 0.94);
            color: white;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          .side-menu-backdrop {
            position: fixed;
            inset: 0;
            z-index: 1003;
            background: rgba(0, 0, 0, 0.5);
          }

          .side-menu {
            z-index: 1004;
            width: min(82vw, 320px);
            transform: translateX(-100%);
            transition: transform 180ms ease;
            box-shadow: 14px 0 40px rgba(0, 0, 0, 0.45);
          }

          .side-menu-close {
            display: block;
            border: 0;
            background: transparent;
            color: white;
            font-size: 30px;
            line-height: 1;
            padding: 0;
            cursor: pointer;
          }

          :host([open]) .side-menu {
            transform: translateX(0);
          }

          :host([open]) .side-menu-backdrop {
            display: block;
          }
        }
      </style>

      <button
        class="side-menu-toggle"
        data-side-menu-toggle
        type="button"
        aria-label="${n}"
        aria-controls="side-menu-panel"
        aria-expanded="false"
      >☰</button>
      <div class="side-menu-backdrop" data-side-menu-backdrop hidden></div>
      <nav class="side-menu" id="side-menu-panel" aria-label="${i}">
        <div class="side-menu-header">
          <p class="side-menu-title">${e}</p>
          <button class="side-menu-close" data-side-menu-close type="button" aria-label="Close ${e.toLowerCase()}">×</button>
        </div>
        <div class="side-menu-list">
          <slot></slot>
          <section class="trending-tags-panel" aria-labelledby="trending-tags-heading">
            <p class="trending-tags-heading" id="trending-tags-heading">Trending Tags</p>
            ${d(this,h,xt).call(this)}
          </section>
          <section class="trending-tags-panel" id="top-creators" aria-labelledby="top-creators-heading">
            <p class="trending-tags-heading" id="top-creators-heading">Top Creators</p>
            ${d(this,h,wt).call(this)}
          </section>
        </div>
      </nav>
    `,d(this,h,Et).call(this)};customElements.define("side-menu",ln);
