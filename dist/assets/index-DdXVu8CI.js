var at=r=>{throw TypeError(r)};var Be=(r,t,e)=>t.has(r)||at("Cannot "+e);var d=(r,t,e)=>(Be(r,t,"read from private field"),e?e.call(r):t.get(r)),k=(r,t,e)=>t.has(r)?at("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(r):t.set(r,e),y=(r,t,e,n)=>(Be(r,t,"write to private field"),n?n.call(r,e):t.set(r,e),e),c=(r,t,e)=>(Be(r,t,"access private method"),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=e(i);fetch(i.href,s)}})();class It extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){if(this.shadowRoot.children.length>0)return;const t=localStorage.getItem("memeplexes-username"),e=t?`
        <div class="auth-menu">
          <button
            class="auth-button auth-button-logged-in"
            id="auth-menu-button"
            type="button"
            aria-haspopup="true"
            aria-expanded="false"
          >${t}</button>
          <div class="auth-dropdown" id="auth-dropdown" hidden>
            <button class="auth-dropdown-button" id="settings-button" type="button">Settings</button>
                        <button class="auth-dropdown-button" id="my-memes-button" type="button">My Memes</button>

            <button class="auth-dropdown-button" id="logout-button" type="button">Logout</button>
          </div>
        </div>
      `:'<button class="auth-button" id="login-button" type="button">Login</button>';this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: inline-flex;
          align-items: center;
        }

        .auth-button {
          border: none;
          background: rgba(17, 17, 17, 0.94);
          color: white;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .auth-menu {
          position: relative;
        }

        .auth-button-logged-in {
          color: rgba(255, 255, 255, 0.8);
        }

        .auth-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 100%;
          padding: 6px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(17, 17, 17, 0.98);
          box-sizing: border-box;
        }

        .auth-dropdown[hidden] {
          display: none;
        }

        .auth-dropdown-button {
          width: 100%;
          border: none;
          background: transparent;
          color: white;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }

        @media (max-width: 767px) {
          .auth-button {
            padding: 10px 14px;
          }
        }
      </style>
      ${e}
    `;const n=this.shadowRoot.querySelector("#login-button");n&&n.addEventListener("click",()=>{window.location.href=this.authUrl});const i=this.shadowRoot.querySelector("#logout-button"),s=this.shadowRoot.querySelector("#my-memes-button"),o=this.shadowRoot.querySelector("#auth-menu-button"),l=this.shadowRoot.querySelector("#auth-dropdown");s&&s.addEventListener("click",()=>{const a=localStorage.getItem("memeplexes-username");a&&(window.location.href=`?c=${encodeURIComponent(a)}`)}),o&&l&&(o.addEventListener("click",()=>{const a=!l.hidden;l.hidden=a,o.setAttribute("aria-expanded",String(!a))}),this.shadowRoot.addEventListener("click",a=>{!a.composedPath().includes(o)&&!a.composedPath().includes(l)&&(l.hidden=!0,o.setAttribute("aria-expanded","false"))})),i&&i.addEventListener("click",()=>{localStorage.removeItem("memeplexes-username"),window.location.reload()})}get authUrl(){return this.getAttribute("auth-url")||"/api/meme/login"}}customElements.get("auth-menu")||customElements.define("auth-menu",It);let _t="https://api.memeplexes.com/api/meme/uploads",Ot="https://m.marak.com/";const Tt=[".DS_Store",".git",".gitignore",".gitattributes",".gitmodules",".gitkeep",".npmignore",".npmrc",".yarnignore",".yarnrc",".editorconfig",".eslint"],Ft=[".git","node_modules"];function lt(){}function qt(r){let t=r.filePath||r.webkitRelativePath||r.name||"";return t.startsWith("/")&&(t=t.substring(1)),t}function zt(r){const t=r.split("/").filter(Boolean),e=t[t.length-1];return Tt.includes(e)?!0:t.some(n=>Ft.includes(n))}class Pt{constructor({uploadsEndpoint:t=_t,filesBaseUrl:e=Ot,qtokenid:n="",me:i=""}={}){this.uploadsEndpoint=t,this.filesBaseUrl=e,this.qtokenid=n,this.me=i}setAuth({qtokenid:t=this.qtokenid,me:e=this.me}={}){return this.qtokenid=t,this.me=e,this}async uploadFile(t,e=lt){const n=qt(t);if(!n||zt(n))return null;const i=t.size,s=new URLSearchParams({v:"6",fileName:n,fileSize:String(i),userFolder:this.me,qtokenid:this.qtokenid,me:this.me}),o=await fetch(`${this.uploadsEndpoint}/generate-signed-url?${s.toString()}`);if(!o.ok)throw new Error(`Failed to get signed URL: ${await o.text()}`);const{signedUrl:l}=await o.json();console.log(`PUTTING Received signed URL for ${n}: ${l}`);const a=await fetch(l,{method:"PUT",headers:{"Content-Type":t.type||"application/octet-stream"},body:t});if(!a.ok)throw new Error(`HTTP error during file upload: ${await a.text()}`);return e({file:t,filePath:n,uploaded:i,total:i}),console.log(`File uploaded successfully: ${n}`),`${this.filesBaseUrl}/${encodeURIComponent(this.me)}/${n}`}async uploadFiles(t,e=lt){if(!(t!=null&&t.length))return[];const n=[];for(const i of t){const s=await this.uploadFile(i,e);s&&n.push(s)}return n}async removeFile(t){const e=new URLSearchParams({v:"6",prefix:t,me:this.me,qtokenid:this.qtokenid,userFolder:this.me,depth:"6"}),n=`${this.uploadsEndpoint}/deleteFiles?${e.toString()}`;console.log("fetching delete url",n);try{const i=await fetch(n);if(!i.ok)throw new Error(`Failed to delete file: ${await i.text()}`);return t}catch(i){console.error("Error deleting file:",i)}}}class Rt extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.selectedFile=null,this.isUploading=!1,this.progressValue=0,this.statusText="",this.isDragActive=!1,this.handleBackdropClick=this.handleBackdropClick.bind(this),this.handleEscape=this.handleEscape.bind(this),this.handleFilePickerClick=this.handleFilePickerClick.bind(this),this.handleInputChange=this.handleInputChange.bind(this),this.handleDrop=this.handleDrop.bind(this),this.handleDragOver=this.handleDragOver.bind(this),this.handleDragEnter=this.handleDragEnter.bind(this),this.handleDragLeave=this.handleDragLeave.bind(this),this.handleUpload=this.handleUpload.bind(this)}connectedCallback(){this.hasAttribute("hidden")||(this.hidden=!0),this.shadowRoot.children.length===0&&this.render()}disconnectedCallback(){document.removeEventListener("keydown",this.handleEscape)}open(){this.hidden=!1,this.render(),document.addEventListener("keydown",this.handleEscape)}close(){this.isUploading||(this.hidden=!0,this.isDragActive=!1,document.removeEventListener("keydown",this.handleEscape),this.render())}render(){var o,l,a,p,b,f,_,w,C;const t=this.isDragActive?"dropzone active":"dropzone",e=this.selectedFile?this.selectedFile.name:"Drop an image here or browse from your device.",n=this.selectedFile?`${Math.round(this.selectedFile.size/1024)} KB`:"PNG, JPG, GIF, WEBP",i=this.isUploading?`Uploading ${this.progressValue}%`:this.statusText||"Ready to upload",s=this.isUploading?"Uploading...":"Upload meme";this.shadowRoot.innerHTML=`
      <style>
        :host {
          position: fixed;
          inset: 0;
          z-index: 3000;
        }

        [hidden] {
          display: none !important;
        }

        .backdrop {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(7, 10, 8, 0.76);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .panel {
          width: min(100%, 520px);
          display: grid;
          gap: 18px;
          padding: 22px;
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(24, 27, 24, 0.98), rgba(12, 13, 12, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
          color: white;
        }

        .header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 16px;
        }

        .title {
          margin: 0;
          font-size: 22px;
          line-height: 1.1;
        }

        .subtitle {
          margin: 6px 0 0;
          color: rgba(255, 255, 255, 0.66);
          font-size: 14px;
          line-height: 1.5;
        }

        .close-button,
        .picker-button,
        .upload-button {
          border: 0;
          cursor: pointer;
          font: inherit;
        }

        .close-button {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
        }

        .dropzone {
          display: grid;
          gap: 14px;
          padding: 26px;
          border-radius: 20px;
          border: 1px dashed rgba(30, 171, 85, 0.4);
          background: rgba(30, 171, 85, 0.08);
          transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
        }

        .dropzone.active {
          border-color: rgba(30, 171, 85, 0.9);
          background: rgba(30, 171, 85, 0.16);
          transform: scale(1.01);
        }

        .dropzone-copy {
          display: grid;
          gap: 6px;
        }

        .dropzone-title {
          font-size: 16px;
          font-weight: 700;
        }

        .dropzone-meta {
          color: rgba(255, 255, 255, 0.66);
          font-size: 13px;
        }

        .picker-button,
        .upload-button {
          min-height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          font-weight: 700;
        }

        .picker-button {
          justify-self: start;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .progress {
          display: grid;
          gap: 8px;
        }

        .progress-track {
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
        }

        .progress-bar {
          height: 10px;
          width: ${this.progressValue}%;
          background: linear-gradient(90deg, #1eab55, #75e59e);
          transition: width 160ms ease;
        }

        .progress-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
        }

        .actions {
          display: flex;
          justify-content: flex-end;
        }

        .upload-button {
          background: linear-gradient(180deg, rgba(30, 171, 85, 0.95), rgba(18, 120, 56, 1));
          color: #041109;
        }

        .upload-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 767px) {
          .panel {
            padding: 18px;
            border-radius: 20px;
          }

          .dropzone {
            padding: 20px;
          }

          .actions {
            justify-content: stretch;
          }

          .upload-button {
            width: 100%;
          }
        }
      </style>
      <div class="backdrop" ${this.hidden?"hidden":""}>
        <section class="panel" role="dialog" aria-modal="true" aria-labelledby="upload-panel-title">
          <div class="header">
            <div>
              <h2 class="title" id="upload-panel-title">Upload a meme</h2>
              <p class="subtitle">Drag and drop an image or choose a file to start the upload.</p>
            </div>
            <button class="close-button" id="close-button" type="button" aria-label="Close upload panel">✕</button>
          </div>
          <div class="${t}" id="dropzone">
            <div class="dropzone-copy">
              <div class="dropzone-title">${e}</div>
              <div class="dropzone-meta">${n}</div>
            </div>
            <button class="picker-button" id="picker-button" type="button">Choose file</button>
            <input id="file-input" type="file" accept="image/*" hidden />
          </div>
          <div class="progress">
            <div class="progress-track" aria-hidden="true">
              <div class="progress-bar"></div>
            </div>
            <div class="progress-label" aria-live="polite">${i}</div>
          </div>
          <div class="actions">
            <button class="upload-button" id="upload-button" type="button" ${this.selectedFile?"":"disabled"}>
              ${s}
            </button>
          </div>
        </section>
      </div>
    `,(o=this.shadowRoot.querySelector(".backdrop"))==null||o.addEventListener("click",this.handleBackdropClick),(l=this.shadowRoot.querySelector("#close-button"))==null||l.addEventListener("click",()=>this.close()),(a=this.shadowRoot.querySelector("#picker-button"))==null||a.addEventListener("click",this.handleFilePickerClick),(p=this.shadowRoot.querySelector("#file-input"))==null||p.addEventListener("change",this.handleInputChange),(b=this.shadowRoot.querySelector("#dropzone"))==null||b.addEventListener("drop",this.handleDrop),(f=this.shadowRoot.querySelector("#dropzone"))==null||f.addEventListener("dragover",this.handleDragOver),(_=this.shadowRoot.querySelector("#dropzone"))==null||_.addEventListener("dragenter",this.handleDragEnter),(w=this.shadowRoot.querySelector("#dropzone"))==null||w.addEventListener("dragleave",this.handleDragLeave),(C=this.shadowRoot.querySelector("#upload-button"))==null||C.addEventListener("click",this.handleUpload)}handleBackdropClick(t){t.target===t.currentTarget&&this.close()}handleEscape(t){t.key==="Escape"&&this.close()}handleFilePickerClick(){var t;(t=this.shadowRoot.querySelector("#file-input"))==null||t.click()}handleInputChange(t){const[e]=t.target.files||[];this.setSelectedFile(e||null)}handleDragEnter(t){t.preventDefault(),this.isDragActive=!0,this.render()}handleDragOver(t){t.preventDefault(),this.isDragActive||(this.isDragActive=!0,this.render())}handleDragLeave(t){t.currentTarget.contains(t.relatedTarget)||(this.isDragActive=!1,this.render())}handleDrop(t){var n;t.preventDefault(),this.isDragActive=!1;const[e]=((n=t.dataTransfer)==null?void 0:n.files)||[];this.setSelectedFile(e||null)}setSelectedFile(t){this.selectedFile=t&&t.type.startsWith("image/")?t:null,this.progressValue=0,this.statusText=this.selectedFile?"File selected":"Please choose an image file.",this.render()}async handleUpload(){if(!(!this.selectedFile||this.isUploading)){this.isUploading=!0,this.progressValue=0,this.statusText="Preparing upload...",this.render();try{const t=localStorage.getItem("memeplexes-username")||"",e=localStorage.getItem("access_token")||"",n=new Pt({me:t,qtokenid:e}),i=[this.selectedFile];let s=0;const o=p=>String(p||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9._-]+/g,"-").replace(/-+/g,"-").replace(/^[-._]+|[-._]+$/g,"")||"file",l=p=>{const b=(p==null?void 0:p.name)||"file",f=b.lastIndexOf("."),_=f>0,w=_?b.slice(0,f):b,C=_?b.slice(f+1):"",E=o(w),S=o(C).replace(/-/g,""),L=S?`${E}.${S}`:E,O=typeof p.webkitRelativePath=="string"?p.webkitRelativePath:"",z=O?O.split("/").filter(Boolean).map((Q,oe,Z)=>oe===Z.length-1?L:o(Q)).join("/"):"",U=new File([p],L,{type:p.type,lastModified:p.lastModified});return Object.defineProperty(U,"filePath",{value:z||L,configurable:!0}),z&&Object.defineProperty(U,"webkitRelativePath",{value:z,configurable:!0}),U};i[0]=l(this.selectedFile);const a=await n.uploadFiles(i,({total:p=0,uploaded:b=0})=>{const f=p>0?b/p:1,w=(s/i.length+f/i.length)*100;this.progressValue=Math.max(1,Math.min(99,Math.round(w))),this.statusText="Uploading...",this.render()});if(s=a.length,console.log("Uploaded URLs:",a),!a.length)throw new Error("Upload failed");this.progressValue=100,this.statusText="Upload complete",this.selectedFile=null,this.render(),window.setTimeout(()=>this.close(),300)}finally{this.isUploading=!1;const t=this.shadowRoot.querySelector("#file-input");t&&(t.value=""),this.render()}}}}customElements.get("upload-panel")||customElements.define("upload-panel",Rt);class $t extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.handleOpenPanel=this.handleOpenPanel.bind(this)}connectedCallback(){var t;this.shadowRoot.children.length===0&&(this.shadowRoot.innerHTML=`
        <style>
          :host {
            display: inline-flex;
            align-items: center;
          }

          .upload-button {
            display: none;
            border: 1px solid rgba(30, 171, 85, 0.35);
            background: linear-gradient(180deg, rgba(30, 171, 85, 0.22), rgba(18, 18, 18, 0.96));
            color: #dffbe8;
            padding: 12px 18px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            border-radius: 999px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
            transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
          }

          .upload-button:hover {
            border-color: rgba(30, 171, 85, 0.6);
            background: linear-gradient(180deg, rgba(30, 171, 85, 0.32), rgba(18, 18, 18, 0.98));
          }

          .upload-button:active {
            transform: translateY(1px);
          }

          @media (max-width: 767px) {
            .upload-button {
              padding: 10px 14px;
            }
          }
        </style>
        <button class="upload-button" id="upload-button" type="button">Upload</button>
      `),(t=this.shadowRoot.querySelector("#upload-button"))==null||t.addEventListener("click",this.handleOpenPanel)}disconnectedCallback(){var t;(t=this.shadowRoot.querySelector("#upload-button"))==null||t.removeEventListener("click",this.handleOpenPanel)}handleOpenPanel(){if(!localStorage.getItem("memeplexes-username")){window.location.href=this.authUrl;return}this.getOrCreatePanel().open()}getOrCreatePanel(){let t=document.querySelector("upload-panel");return t||(t=document.createElement("upload-panel"),document.body.appendChild(t)),t.setAttribute("auth-url",this.authUrl),t}get authUrl(){return this.getAttribute("auth-url")||"/api/meme/login"}}customElements.get("upload-button")||customElements.define("upload-button",$t);let Ne="/api/meme/login";Ne="http://localhost:8888/api/meme/login";class Ut extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){if(this.shadowRoot.children.length>0)return;const t=this.getAttribute("aria-label")||"Feed controls";this.shadowRoot.innerHTML=`
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
        <upload-button auth-url="${Ne}"></upload-button>
        <auth-menu auth-url="${Ne}"></auth-menu>
      </div>
    `}get totalMemesElement(){var t;return((t=this.shadowRoot)==null?void 0:t.querySelector("[data-page-topbar-total-memes]"))||null}get searchInput(){var t;return((t=this.shadowRoot)==null?void 0:t.querySelector("search-bar-tags#search-input"))||null}get homeButton(){return this.sidebarToggleButton}get sidebarToggleButton(){var t;return((t=this.shadowRoot)==null?void 0:t.querySelector("#sidebar-visibility-toggle"))||null}get toggleButton(){var t;return((t=this.shadowRoot)==null?void 0:t.querySelector("#view-toggle"))||null}}customElements.get("page-topbar")||customElements.define("page-topbar",Ut);function jt({searchInput:r,initialQuery:t}){if(!r||r.dataset.rainbowPromptInitialized)return;r.dataset.rainbowPromptInitialized="true";const e=document.createElement("style");e.textContent=`
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
  `,document.head.append(e);const n=()=>{r.classList.remove("meme-rainbow-prompt"),r.removeEventListener("input",i)},i=()=>{r.value!==t&&n()};r.classList.add("meme-rainbow-prompt"),r.addEventListener("input",i)}var q,A,I,V,W,v,Pe,Re,ht,pt,N,Ve,K,mt;class Dt extends HTMLElement{constructor(){super();k(this,v);k(this,q);k(this,A,[]);k(this,I,"");k(this,V,"");k(this,W,null);y(this,q,this.attachShadow({mode:"open"})),c(this,v,ht).call(this)}static get observedAttributes(){return["placeholder","initial-query","disabled"]}connectedCallback(){y(this,V,this.getAttribute("initial-query")||""),d(this,V)&&(c(this,v,Re).call(this,d(this,V)),requestAnimationFrame(()=>{const e=d(this,q).querySelector(".container");e&&jt({searchInput:e,initialQuery:d(this,V)})})),c(this,v,pt).call(this)}disconnectedCallback(){clearTimeout(d(this,W))}attributeChangedCallback(e,n,i){if(n!==i){if(e==="placeholder"){const s=d(this,q).querySelector("input");s&&(s.placeholder=i||"Search...")}if(e==="initial-query"&&this.isConnected&&(y(this,V,i||""),c(this,v,Re).call(this,d(this,V))),e==="disabled"){const s=d(this,q).querySelector("input");s&&(s.disabled=i!==null)}}}get value(){return[...d(this,A),d(this,I).trim()].filter(Boolean).join(" ")}set value(e){c(this,v,Re).call(this,e||"")}get words(){return[...d(this,A)]}addWord(e){const n=e.trim();n&&!d(this,A).includes(n)&&(d(this,A).push(n),y(this,I,""),c(this,v,N).call(this),c(this,v,K).call(this))}removeWord(e){const n=d(this,A).indexOf(e);n>-1&&(d(this,A).splice(n,1),y(this,I,""),c(this,v,N).call(this),c(this,v,K).call(this))}clear(){y(this,A,[]),y(this,I,""),c(this,v,N).call(this),c(this,v,K).call(this)}}q=new WeakMap,A=new WeakMap,I=new WeakMap,V=new WeakMap,W=new WeakMap,v=new WeakSet,Pe=function(e){return e.split(/\s+/).map(n=>n.trim()).filter(n=>n.length>0)},Re=function(e){y(this,A,c(this,v,Pe).call(this,e||"")),y(this,I,""),c(this,v,N).call(this)},ht=function(){d(this,q).innerHTML=`
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
    `},pt=function(){const e=d(this,q).querySelector(".container"),n=d(this,q).querySelector("input"),i=()=>{clearTimeout(d(this,W)),y(this,W,setTimeout(()=>{c(this,v,K).call(this)},500))};e.addEventListener("click",s=>{(s.target===e||s.target.classList.contains("tags-container"))&&n.focus()}),n.addEventListener("input",s=>{if(y(this,I,s.target.value),d(this,I).endsWith(" ")){const o=c(this,v,Pe).call(this,d(this,I));y(this,A,[...new Set([...d(this,A),...o])]),y(this,I,""),n.value="",c(this,v,N).call(this),c(this,v,K).call(this);return}i()}),n.addEventListener("keydown",s=>{if(s.key==="Backspace"&&d(this,I)===""&&d(this,A).length>0&&(clearTimeout(d(this,W)),s.preventDefault(),d(this,A).pop(),c(this,v,N).call(this),c(this,v,K).call(this)),s.key==="Enter"){if(clearTimeout(d(this,W)),s.preventDefault(),d(this,I).trim()){const o=d(this,I).trim();d(this,A).includes(o)||d(this,A).push(o),y(this,I,""),n.value="",c(this,v,N).call(this)}c(this,v,mt).call(this)}s.key==="Escape"&&(y(this,I,""),n.value="",n.blur())}),n.addEventListener("paste",s=>{s.preventDefault(),clearTimeout(d(this,W));const o=(s.clipboardData||window.clipboardData).getData("text"),l=c(this,v,Pe).call(this,o);y(this,A,[...new Set([...d(this,A),...l])]),y(this,I,""),n.value="",c(this,v,N).call(this),c(this,v,K).call(this)})},N=function(){const e=d(this,q).querySelector(".tags-container"),n=d(this,q).querySelector(".hidden-input"),i=d(this,q).querySelector('input[type="text"]');e.innerHTML="",d(this,A).forEach(s=>{const o=document.createElement("span");o.className="tag",o.setAttribute("role","button"),o.setAttribute("aria-label",`Remove ${s}`),o.setAttribute("tabindex","0"),o.innerHTML=`
        <span class="tag-text" title="${c(this,v,Ve).call(this,s)}">${c(this,v,Ve).call(this,s)}</span>
        <span class="tag-remove">x</span>
      `,o.addEventListener("click",l=>{l.stopPropagation(),this.removeWord(s)}),o.addEventListener("keydown",l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),this.removeWord(s))}),e.appendChild(o)}),n.value=this.value,this.setAttribute("value",this.value),i&&i.value!==d(this,I)&&(i.value=d(this,I))},Ve=function(e){const n=document.createElement("div");return n.textContent=e,n.innerHTML},K=function(){this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0,detail:{value:this.value,words:this.words}}))},mt=function(){this.dispatchEvent(new CustomEvent("submit",{bubbles:!0,composed:!0,detail:{value:this.value,words:this.words,inputValue:this.inputValue}}))};customElements.get("search-bar-tags")||customElements.define("search-bar-tags",Dt);function Bt(r){let t=0;for(let e=0;e<r.length;e+=1)t=(t<<5)-t+r.charCodeAt(e),t|=0;return Math.abs(t)}function Ht(r){return String(r).trim().split(/\s+/).filter(Boolean).slice(0,2).map(t=>t.charAt(0).toUpperCase()).join("")||"?"}function Nt(r){var i,s,o,l,a,p,b,f;const t=(o=(s=(i=r.avatarUrl)!=null?i:r.avatar_url)!=null?s:r.profileImage)!=null?o:r.profile_image;if(t)return t;const e=(f=(b=(p=(a=(l=r.email)!=null?l:r.emailAddress)!=null?a:r.username)!=null?p:r.handle)!=null?b:r.name)!=null?f:"",n=String(e).trim().toLowerCase();return n?`https://www.gravatar.com/avatar/${encodeURIComponent(n)}?d=robohash&s=80`:""}class Vt extends HTMLElement{constructor(){super(),this._cleanup=[]}disconnectedCallback(){for(const t of this._cleanup.splice(0))t()}setup(t){var b;const e=(b=t==null?void 0:t.name)!=null?b:"Unknown author",n=Nt(t!=null?t:{}),i=Ht(e),s=Bt(String(e))%360;this.replaceChildren(),Object.assign(this.style,{display:"inline-flex",alignItems:"center",minWidth:"0"});const o=document.createElement("button");o.type="button",Object.assign(o.style,{display:"inline-flex",alignItems:"center",gap:"8px",minWidth:"0",padding:"0",border:"0",background:"transparent",color:"inherit",cursor:"pointer",textAlign:"left"});const l=document.createElement("span");if(Object.assign(l.style,{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"24px",height:"24px",flex:"0 0 24px",borderRadius:"999px",overflow:"hidden",background:`hsl(${s} 48% 38%)`,color:"#fff",fontSize:"10px",fontWeight:"700"}),n){const f=document.createElement("img");f.src=n,f.alt=`${e} avatar`,Object.assign(f.style,{width:"100%",height:"100%",display:"block",objectFit:"cover"}),f.addEventListener("error",()=>{l.replaceChildren(),l.textContent=i},{once:!0}),l.appendChild(f)}else l.textContent=i;const a=document.createElement("span");a.textContent=e,Object.assign(a.style,{minWidth:"0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}),o.appendChild(l),o.appendChild(a);const p=f=>{f.stopPropagation(),this.dispatchEvent(new CustomEvent("creator-card:filter",{bubbles:!0,composed:!0,detail:{author:e,creator:e}}))};return o.addEventListener("click",p),this._cleanup.push(()=>o.removeEventListener("click",p)),this.appendChild(o),this}}customElements.get("creator-card")||customElements.define("creator-card",Vt);class Wt extends HTMLElement{constructor(){super(),this._button=null,this._panel=null,this._count=0,this._onClick=t=>{t.stopPropagation(),this.togglePanel()}}setup(t,e=null){var i,s;typeof t=="object"&&t!==null&&(e=(i=t.panel)!=null?i:e,t=t.commentsCount),this._count=Number.isFinite(Number(t))?Number(t):0,this.attachPanel(e),(s=this._button)==null||s.removeEventListener("click",this._onClick),this.replaceChildren(),this.setAttribute("aria-expanded","false"),Object.assign(this.style,{display:"inline-flex"});const n=document.createElement("button");return n.type="button",n.textContent=`💬 ${this._count}`,n.setAttribute("aria-expanded","false"),Object.assign(n.style,{border:"1px solid rgba(255, 255, 255, 0.18)",borderRadius:"999px",background:"rgba(255, 255, 255, 0.06)",color:"white",padding:"8px 12px",cursor:"pointer",fontSize:"13px",lineHeight:"1"}),this._button=n,n.addEventListener("click",this._onClick),this.appendChild(n),this}attachPanel(t){return this._panel=t!=null?t:null,this}togglePanel(t){if(!this._panel)return;const e=typeof t=="boolean"?t:this.getAttribute("aria-expanded")!=="true";this.setAttribute("aria-expanded",String(e)),this._panel.setOpen(e)}closePanel(){this.togglePanel(!1)}setAttribute(t,e){var n;super.setAttribute(t,e),t==="aria-expanded"&&((n=this._button)==null||n.setAttribute(t,e))}}customElements.get("comments-button")||customElements.define("comments-button",Wt);const ze="http://localhost:8888/api/meme";function gt(r){return(Array.isArray(r)?r:Array.isArray(r==null?void 0:r.comments)?r.comments:Array.isArray(r==null?void 0:r.data)?r.data:[]).map(e=>{var i,s,o,l,a,p,b,f,_,w,C,E;if(typeof e=="string")return{author:"Anonymous",body:e};if(!e||typeof e!="object")return null;const n=(l=(o=(s=(i=e.body)!=null?i:e.comment)!=null?s:e.text)!=null?o:e.content)!=null?l:e.message;return n?{author:(_=(f=(b=(p=(a=e.author)!=null?a:e.username)!=null?p:e.user)!=null?b:e.creator)!=null?f:e.name)!=null?_:"Anonymous",body:n,createdAt:(E=(C=(w=e.createdAt)!=null?w:e.created_at)!=null?C:e.date)!=null?E:e.timestamp}:null}).filter(Boolean)}async function Qt(r){var i;const t=(i=r==null?void 0:r.checksum)!=null?i:r==null?void 0:r.hash,e=r==null?void 0:r.filename,n=[];t&&(n.push(`${ze}/comments?hash=${encodeURIComponent(t)}`),n.push(`${ze}/comments?checksum=${encodeURIComponent(t)}`),n.push(`${ze}/${encodeURIComponent(t)}/comments`)),e&&n.push(`${ze}/comments?filename=${encodeURIComponent(e)}`);for(const s of n)try{const o=await fetch(s);if(!o.ok)continue;const l=await o.json(),a=gt(l);if(Array.isArray(a))return a}catch(o){}return[]}var $,bt,ee;class Gt extends HTMLElement{constructor(){super();k(this,$);this._meme=null,this._comments=[],this._detailsText="",this._loaded=!1,this._loadingPromise=null}connectedCallback(){this.childNodes.length||c(this,$,ee).call(this)}setup({meme:e,comments:n=[],detailsText:i=""}={}){return this._meme=e!=null?e:null,this._comments=gt(n),this._detailsText=i,c(this,$,ee).call(this),this}setOpen(e){this.style.opacity=e?"1":"0",this.style.transform=e?"translateY(0)":"translateY(6px)",this.style.pointerEvents=e?"auto":"none",e&&c(this,$,bt).call(this)}}$=new WeakSet,bt=async function(){return this._loaded||this._loadingPromise?this._loadingPromise:this._comments.length>0?(this._loaded=!0,c(this,$,ee).call(this),Promise.resolve(this._comments)):(c(this,$,ee).call(this,"Loading comments..."),this._loadingPromise=Qt(this._meme).then(e=>(this._comments=e,this._loaded=!0,c(this,$,ee).call(this),e)).catch(()=>(this._loaded=!0,c(this,$,ee).call(this,"Comments unavailable right now."),[])).finally(()=>{this._loadingPromise=null}),this._loadingPromise)},ee=function(e=""){if(this.replaceChildren(),Object.assign(this.style,{position:"absolute",right:"0",bottom:"48px",width:"280px",maxHeight:"280px",overflowY:"auto",padding:"12px",borderRadius:"14px",background:"rgba(18, 18, 18, 0.96)",border:"1px solid rgba(255, 255, 255, 0.08)",color:"rgba(255, 255, 255, 0.82)",fontSize:"12px",lineHeight:"1.45",opacity:this.style.opacity||"0",transform:this.style.transform||"translateY(6px)",pointerEvents:this.style.pointerEvents||"none",transition:"opacity 160ms ease, transform 160ms ease"}),this._detailsText){const i=document.createElement("p");i.textContent=this._detailsText,Object.assign(i.style,{margin:"0 0 10px",color:"rgba(255, 255, 255, 0.68)"}),this.appendChild(i)}if(e){const i=document.createElement("p");i.textContent=e,i.setAttribute("aria-live","polite"),Object.assign(i.style,{margin:"0"}),this.appendChild(i);return}if(!this._comments.length){const i=document.createElement("p");i.textContent="No comments yet.",Object.assign(i.style,{margin:"0"}),this.appendChild(i);return}const n=document.createElement("div");Object.assign(n.style,{display:"flex",flexDirection:"column",gap:"10px"});for(const i of this._comments){const s=document.createElement("article");Object.assign(s.style,{paddingTop:"10px",borderTop:"1px solid rgba(255, 255, 255, 0.08)"});const o=document.createElement("div");o.textContent=i.author,Object.assign(o.style,{fontWeight:"600",color:"white",marginBottom:"4px"});const l=document.createElement("p");if(l.textContent=i.body,Object.assign(l.style,{margin:"0"}),s.appendChild(o),i.createdAt){const a=document.createElement("div");a.textContent=String(i.createdAt),Object.assign(a.style,{fontSize:"11px",color:"rgba(255, 255, 255, 0.52)",marginBottom:"4px"}),s.appendChild(a)}s.appendChild(l),n.appendChild(s)}this.appendChild(n)};customElements.get("comments-panel")||customElements.define("comments-panel",Gt);function Kt(r){return r.replace(/\.[^.]+$/,"").split(/[._-]+/).map(t=>t.trim()).filter(Boolean).map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}function Yt(r){var n,i,s;const t=(s=(i=(n=r.created_at)!=null?n:r.uploaded_date)!=null?i:r.createdAt)!=null?s:r.date;if(!t)return"Unknown date";const e=new Date(t);return Number.isNaN(e.getTime())?String(t):new Intl.DateTimeFormat(void 0,{month:"short",day:"numeric",year:"numeric"}).format(e)}function Xt(){let r=document.querySelector("[data-meme-modal]");if(r)return{modal:r,image:r.querySelector("img"),caption:r.querySelector("[data-meme-modal-caption]")};r=document.createElement("div"),r.setAttribute("data-meme-modal","true"),Object.assign(r.style,{position:"fixed",inset:"0",display:"none",alignItems:"center",justifyContent:"center",padding:"24px",background:"rgba(0, 0, 0, 0.82)",zIndex:"9999"});const t=document.createElement("div");Object.assign(t.style,{position:"relative",maxWidth:"min(96vw, 1200px)",maxHeight:"92vh",display:"flex",flexDirection:"column",gap:"10px"});const e=document.createElement("button");e.type="button",e.textContent="Close",Object.assign(e.style,{alignSelf:"flex-end",border:"1px solid rgba(255, 255, 255, 0.25)",borderRadius:"999px",background:"rgba(255, 255, 255, 0.1)",color:"#fff",padding:"8px 14px",cursor:"pointer"});const n=document.createElement("img");Object.assign(n.style,{maxWidth:"100%",maxHeight:"calc(92vh - 56px)",borderRadius:"16px",objectFit:"contain",background:"#111"});const i=document.createElement("div");i.setAttribute("data-meme-modal-caption","true"),Object.assign(i.style,{color:"rgba(255, 255, 255, 0.86)",fontSize:"14px",textAlign:"center"});const s=()=>{r.style.display="none",n.removeAttribute("src"),i.textContent=""};return e.addEventListener("click",s),r.addEventListener("click",o=>{o.target===r&&s()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&r.style.display!=="none"&&s()}),t.appendChild(e),t.appendChild(n),t.appendChild(i),r.appendChild(t),document.body.appendChild(r),{modal:r,image:n,caption:i}}var re,We,ft;class Jt extends HTMLElement{constructor(){super();k(this,re);this._metadata=null,this._options=null,this._state=null,this._cleanup=[],this._elements={}}connectedCallback(){this._metadata&&this._options&&!this._state&&c(this,re,We).call(this)}disconnectedCallback(){c(this,re,ft).call(this)}setup(e,n){return this._metadata=typeof e=="string"?{filename:e,checksum:e}:e,this._options=n,this.isConnected&&!this._state&&c(this,re,We).call(this),this}}re=new WeakSet,We=function(){var be,fe,ve,ye,xe,we,Ye,Xe,Je,Ze,et,tt,nt,it,st,rt,ot;let{searchInput:e,requestSearch:n,viewState:i,autoVoteMs:s,voteForMeme:o,mediaObserver:l}=this._options;e=(be=document.querySelector("page-topbar"))==null?void 0:be.searchInput;const a=this._metadata,p=a.filename,b=p.replace(/\.[^.]+$/,"").split(/[._-]+/).map(M=>M.trim()).filter(Boolean),f=(fe=a.title)!=null?fe:Kt(p),_=(xe=(ye=(ve=a.creator)!=null?ve:a.uploader)!=null?ye:a.uploadedBy)!=null?xe:"Unknown author",w=Yt(a),C=(Je=(Xe=(we=a.commentsCount)!=null?we:a.commentCount)!=null?Xe:(Ye=a.comments)==null?void 0:Ye.length)!=null?Je:b.length,E=(Ze=a.description)!=null?Ze:`File: ${p}`;this.className="meme",Object.assign(this.style,{position:"relative",display:"flex",flexDirection:"column",minHeight:"460px",height:"460px",overflow:"hidden",borderRadius:"20px",border:"1px solid rgba(255, 255, 255, 0.08)",background:"linear-gradient(180deg, rgba(35, 35, 35, 0.98), rgba(18, 18, 18, 0.98))",boxShadow:"0 18px 44px rgba(0, 0, 0, 0.28)"}),this.replaceChildren();const S=document.createElement("div");S.className="media-shell media-placeholder",Object.assign(S.style,{position:"relative",flex:"1",minHeight:"0",margin:"0 16px 16px",borderRadius:"18px",overflow:"hidden",background:"#1a1a1a"});const L=document.createElement("div");Object.assign(L.style,{position:"absolute",left:"28px",right:"28px",bottom:"88px",padding:"12px 14px",borderRadius:"14px",background:"rgba(0, 0, 0, 0.72)",color:"rgba(255, 255, 255, 0.88)",fontSize:"12px",lineHeight:"1.45",opacity:"0",transform:"translateY(8px)",transition:"opacity 160ms ease, transform 160ms ease",pointerEvents:"none",zIndex:"2"}),L.textContent=E;const O=document.createElement("div");O.className="meme-footer",Object.assign(O.style,{display:"flex",flexDirection:"column",gap:"12px",padding:"0 16px 16px"});const z=document.createElement("div");z.textContent=f,Object.assign(z.style,{color:"#fff",fontSize:"17px",fontWeight:"700",lineHeight:"1.3",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"});const U=document.createElement("div");Object.assign(U.style,{display:"flex",justifyContent:"space-between",gap:"12px",fontSize:"12px",color:"rgba(255, 255, 255, 0.6)"});const J=document.createElement("creator-card").setup({name:_,username:(tt=(et=a.creator_username)!=null?et:a.username)!=null?tt:a.handle,email:(nt=a.creator_email)!=null?nt:a.email,avatarUrl:(rt=(st=(it=a.creator_avatar_url)!=null?it:a.creatorAvatarUrl)!=null?st:a.avatar_url)!=null?rt:a.avatarUrl}),Q=M=>{M.stopPropagation(),this.dispatchEvent(new CustomEvent("meme-card:author-filter",{bubbles:!0,composed:!0,detail:{author:_}}))};J.addEventListener("creator-card:filter",Q),this._cleanup.push(()=>J.removeEventListener("creator-card:filter",Q));const oe=document.createElement("span");oe.textContent=w,U.appendChild(J),U.appendChild(oe);const Z=document.createElement("div");Object.assign(Z.style,{display:"flex",flexWrap:"nowrap",gap:"8px",overflowX:"auto",scrollbarWidth:"none"});for(const M of b){const R=document.createElement("button");R.type="button",R.textContent=M,Object.assign(R.style,{border:"1px solid rgba(255, 255, 255, 0.16)",borderRadius:"999px",background:"rgba(255, 255, 255, 0.06)",color:"white",padding:"5px 10px",cursor:"pointer",fontSize:"12px",lineHeight:"1.2",flex:"0 0 auto"});const qe=()=>{const Ee=e.value.trim().split(/\s+/).filter(Boolean);Ee.includes(M)||Ee.push(M),n==null||n({query:Ee.join(" ")})};R.addEventListener("click",qe),this._cleanup.push(()=>R.removeEventListener("click",qe)),Z.appendChild(R)}const G=document.createElement("div");Object.assign(G.style,{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"12px"});const B=document.createElement("div");Object.assign(B.style,{position:"relative",display:"inline-flex",alignItems:"center",gap:"8px"});const ue={border:"1px solid rgba(255, 255, 255, 0.18)",borderRadius:"999px",background:"rgba(255, 255, 255, 0.06)",color:"white",padding:"8px 12px",cursor:"pointer",fontSize:"14px",lineHeight:"1",transition:"opacity 160ms ease, transform 160ms ease, background 160ms ease"},j=Number((ot=a.votes)!=null?ot:0),Fe=Number.isFinite(j)?j:0,F=document.createElement("button");F.type="button",F.textContent="👎",F.setAttribute("aria-label",`Downvote ${p}`),Object.assign(F.style,ue);const P=document.createElement("button");P.type="button",P.textContent="👍",P.setAttribute("aria-label",`Upvote ${p}`),Object.assign(P.style,ue);const H=document.createElement("span");H.textContent=String(Fe),Object.assign(H.style,{minWidth:"2ch",color:"rgba(255, 255, 255, 0.88)",fontSize:"14px",fontWeight:"700",lineHeight:"1",textAlign:"center"});const h=()=>{const M=i.get(this);M&&o(M,-1)&&(M.votes-=1,H.textContent=String(M.votes))},u=()=>{const M=i.get(this);M&&o(M,1)&&(M.votes+=1,H.textContent=String(M.votes))};F.addEventListener("click",h),P.addEventListener("click",u),this._cleanup.push(()=>F.removeEventListener("click",h)),this._cleanup.push(()=>P.removeEventListener("click",u));const g=document.createElement("div");Object.assign(g.style,{position:"relative",display:"flex",justifyContent:"flex-end"});const x=document.createElement("comments-panel").setup({meme:a,comments:a.comments,detailsText:`${E} • ${C} comments`}),ae=document.createElement("comments-button").setup({commentsCount:C,panel:x}),he=M=>{this.contains(M.target)||ae.closePanel()},pe=()=>{L.style.opacity="1",L.style.transform="translateY(0)"},me=()=>{L.style.opacity="0",L.style.transform="translateY(8px)"},ge=M=>{if(M.target.closest("button, comments-button, comments-panel"))return;const R=this.querySelector(".media-shell img");if(!(R!=null&&R.src))return;const{modal:qe,image:Ee,caption:At}=Xt();Ee.src=R.src,At.textContent=f,qe.style.display="flex"};document.addEventListener("click",he),this.addEventListener("mouseenter",pe),this.addEventListener("mouseleave",me),this.addEventListener("click",ge),this._cleanup.push(()=>document.removeEventListener("click",he)),this._cleanup.push(()=>this.removeEventListener("mouseenter",pe)),this._cleanup.push(()=>this.removeEventListener("mouseleave",me)),this._cleanup.push(()=>this.removeEventListener("click",ge)),g.appendChild(ae),B.appendChild(F),B.appendChild(H),B.appendChild(P),g.appendChild(x),G.appendChild(B),G.appendChild(g),O.appendChild(z),O.appendChild(U),O.appendChild(Z),O.appendChild(G),this.appendChild(S),this.appendChild(O),this._elements={commentsButton:ae,commentsPanel:x,downvoteButton:F,hoverInfo:L,placeholder:S,upvoteButton:P,voteWrap:B},this._state={...a,container:this,file:p,upvoteButton:P,downvoteButton:F,voteCountLabel:H,voteWrap:B,votes:Fe,remainingMs:s,visibleSince:null,timerId:null,voted:!1,loaded:!1},i.set(this,this._state),l.observe(this)},ft=function(){for(const e of this._cleanup.splice(0))e()};customElements.get("meme-card")||customElements.define("meme-card",Jt);var Me,Ae,ce,Ie;class Zt extends HTMLElement{constructor(){super(...arguments);k(this,Me,()=>{this.classList.add("is-hovered")});k(this,Ae,()=>{this.classList.remove("is-hovered")});k(this,ce,()=>{const e=this.getAttribute("href");e&&window.open(e,"_blank","noopener,noreferrer")});k(this,Ie,e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),d(this,ce).call(this))})}connectedCallback(){if(this.dataset.initialized!=="true"){if(this.dataset.initialized="true",this.classList.add("is-interactive"),this.setAttribute("role","link"),this.setAttribute("tabindex","0"),this.setAttribute("aria-label",this.getAttribute("aria-label")||"Open meme-client on GitHub"),!this.querySelector("img")){const e=document.createElement("img");e.src=this.getAttribute("src")||"./assets/liberty-octocat-github-256.png",e.alt="",e.setAttribute("aria-hidden","true"),this.appendChild(e)}this.addEventListener("mouseenter",d(this,Me)),this.addEventListener("mouseleave",d(this,Ae)),this.addEventListener("click",d(this,ce)),this.addEventListener("keydown",d(this,Ie))}}disconnectedCallback(){this.removeEventListener("mouseenter",d(this,Me)),this.removeEventListener("mouseleave",d(this,Ae)),this.removeEventListener("click",d(this,ce)),this.removeEventListener("keydown",d(this,Ie))}}Me=new WeakMap,Ae=new WeakMap,ce=new WeakMap,Ie=new WeakMap;customElements.define("floating-octocat",Zt);function en(r,t){const e=r.querySelector(".media-shell");if(!e||e.classList.contains("media-placeholder"))return;const n=e.querySelector("video");if(n)n.pause(),n.src="",n.load();else{const l=e.querySelector("img");l&&(l.src="")}const i=e.offsetHeight;e.remove(),t.loaded=!1;const s=document.createElement("div");s.className="media-shell media-placeholder",Object.assign(s.style,{position:"relative",flex:"1",minHeight:"0",margin:"0 16px 16px",height:i>0?`${i}px`:"200px",borderRadius:"18px",overflow:"hidden",background:"#1a1a1a"});const o=r.querySelector(".meme-footer");o?r.insertBefore(s,o):r.appendChild(s)}function tn(r,t,e){var l;const n=t.file;let i=r.querySelector(".media-shell");if(i&&i.classList.contains("media-placeholder")&&(i.remove(),i=null),i)return;i=document.createElement("div"),i.className="media-shell",Object.assign(i.style,{position:"relative",flex:"1",minHeight:"0",borderRadius:"18px 18px 0 0",overflow:"hidden",background:"#111",display:"flex",alignItems:"center",justifyContent:"center"});let s;if(n.endsWith(".mp4")||n.endsWith(".webm")||n.endsWith(".mov")){s=document.createElement("video");const a=e+n,p=(l=n.split(".").pop())==null?void 0:l.toLowerCase();s.src=a,s.autoplay=!0,s.loop=!0,s.muted=!0,s.defaultMuted=!0,s.playsInline=!0,s.controls=!0,s.preload="metadata",s.setAttribute("muted",""),s.setAttribute("playsinline",""),s.setAttribute("webkit-playsinline",""),p==="mp4"&&s.setAttribute("type","video/mp4"),p==="webm"&&s.setAttribute("type","video/webm"),p==="mov"&&s.setAttribute("type","video/quicktime"),Object.assign(s.style,{maxWidth:"100%",maxHeight:"100%",width:"auto",height:"auto",background:"#111"});const b=()=>{const f=s.play();f&&typeof f.catch=="function"&&f.catch(()=>{s.controls=!0})};s.addEventListener("loadedmetadata",b,{once:!0}),s.addEventListener("canplay",b,{once:!0})}else{const a=document.createElement("div");a.className="image-shell",Object.assign(a.style,{width:"100%",height:"100%"}),s=document.createElement("img"),s.src=e+n,Object.assign(s.style,{width:"100%",height:"100%",objectFit:"cover",cursor:"zoom-in",display:"block"});const p=()=>a.classList.add("is-loaded"),b=()=>a.classList.add("is-error");s.complete&&s.naturalWidth>0?p():(s.addEventListener("load",p,{once:!0}),s.addEventListener("error",b,{once:!0})),a.appendChild(s),i.appendChild(a)}s.parentNode||i.appendChild(s),s.tagName==="VIDEO"&&requestAnimationFrame(()=>{const a=s.play();a&&typeof a.catch=="function"&&a.catch(()=>{s.controls=!0})});const o=r.querySelector(".meme-footer");o?r.insertBefore(i,o):r.appendChild(i),t.loaded=!0}function nn({files:r,feed:t,initialQuery:e,onRequestSearch:n,castMemeVote:i,ejectMedia:s,injectMedia:o}){const l=document.querySelector("#search-input");let a="http://localhost:8787/memes/";a="https://m.marak.com/";const p=15,b=3333,f="600px",_=40,w=h=>h.map(u=>{var x,ae,he,pe,me,ge,be,fe,ve,ye,xe;if(typeof u=="string"){const we=u.lastIndexOf(".");return{filename:u,checksum:u,size:null,extension:we>=0?u.slice(we):"",votes:0,creator:"Unknown",created_at:null,tags:[]}}if(!(u!=null&&u.filename))return null;const g=u.filename.lastIndexOf(".");return{filename:u.filename,checksum:(x=u.checksum)!=null?x:u.filename,size:(ae=u.size)!=null?ae:null,created_at:(be=(ge=(me=(pe=(he=u.created_at)!=null?he:u.uploadedAt)!=null?pe:u.uploaded_date)!=null?me:u.createdAt)!=null?ge:u.date)!=null?be:null,creator:(fe=u.creator)!=null?fe:"Unknown",tags:(ve=u.tags)!=null?ve:[],extension:(ye=u.extension)!=null?ye:g>=0?u.filename.slice(g):"",votes:(xe=u.votes)!=null?xe:0}}).filter(u=>u==null?void 0:u.filename),C=w(r);let E=C,S=0,L=!1;const O=new Set,z=new WeakMap,U=new IntersectionObserver(h=>{h[0].isIntersecting&&!L&&F()},{rootMargin:"200px",threshold:0}),J=new IntersectionObserver(h=>{h.forEach(u=>{const g=u.target,x=z.get(g);x&&(u.isIntersecting?x.loaded||o(g,x,a):x.loaded&&s(g,x))})},{rootMargin:`${f} 0px`,threshold:0});function Q(h,u){h.visibleSince!==null&&(clearTimeout(h.timerId),h.timerId=null,h.remainingMs-=u-h.visibleSince,h.visibleSince=null)}function oe(h,u){h.voted||h.visibleSince!==null||(h.visibleSince=u,h.timerId=setTimeout(()=>ue(h,!0),Math.max(0,h.remainingMs)))}function Z(h){const u=z.get(h);if(!u)return;Q(u,performance.now()),G.unobserve(h),J.unobserve(h);const g=h.querySelector(".media-shell");if(g){const x=g.querySelector("video");x&&(x.pause(),x.src="",x.load()),g.remove()}u.loaded=!1}window.cleanupMemeState=Z;const G=new IntersectionObserver(h=>{const u=performance.now();for(const g of h){const x=z.get(g.target);!x||x.voted||(g.isIntersecting&&g.intersectionRatio>=.6?oe(x,u):Q(x,u))}},{threshold:[.6]});function B(h,u){if(!h)return;const g=document.createElement("span");g.textContent=u>0?"+1":"-1",Object.assign(g.style,{position:"absolute",left:"50%",bottom:"50%",transform:"translate(-50%, 0)",color:u>0?"#7CFFB2":"#FF9A9A",fontSize:"16px",fontWeight:"700",opacity:"1",pointerEvents:"none",transition:"transform 500ms ease, opacity 500ms ease"}),h.appendChild(g),requestAnimationFrame(()=>{g.style.transform="translate(-50%, -24px)",g.style.opacity="0"}),g.addEventListener("transitionend",()=>g.remove(),{once:!0})}function ue(h,u=1){var x;const g=(x=h.checksum)!=null?x:h.file;return O.has(g)?!1:(h.voted=!0,Q(h,performance.now()),G.unobserve(h.container),O.add(g),i(h,u),h.upvoteButton&&(h.upvoteButton.disabled=!0,h.upvoteButton.style.opacity="0",h.upvoteButton.style.transform="scale(0.9)",h.upvoteButton.style.pointerEvents="none"),h.downvoteButton&&(h.downvoteButton.disabled=!0,h.downvoteButton.style.opacity="0",h.downvoteButton.style.transform="scale(0.9)",h.downvoteButton.style.pointerEvents="none"),B(h.voteWrap,u),!0)}let j=document.querySelector("#infinite-scroll-sentinel");j||(j=document.createElement("div"),j.id="infinite-scroll-sentinel",j.style.height="10px",j.style.width="100%",t.insertAdjacentElement("afterend",j)),U.observe(j);function Fe(h,u){return document.createElement("meme-card").setup(h,u)}function F(){if(L||S>=E.length)return;L=!0;const h=document.createDocumentFragment(),u=Math.min(S+p,E.length);for(;S<u;S++){const g=E[S],x=Fe(g,{searchInput:l,requestSearch:n,viewState:z,autoVoteMs:b,voteForMeme:ue,autoVoteObserver:G,mediaObserver:J});h.appendChild(x)}t.appendChild(h),P(),L=!1}function P(){const h=t.children;if(h.length<=_)return;const u=h.length-_;for(let g=0;g<u;g++){const x=h[0];typeof window.cleanupMemeState=="function"&&window.cleanupMemeState(x),x.remove()}}const H=h=>{var g;const u=(g=h.detail)==null?void 0:g.author;u&&(n==null||n({creator:u}))};return t.addEventListener("meme-card:author-filter",H),e&&l&&(l.value=e),F(),{appendFiles(h){const u=w(h);if(!u.length)return console.log("[meme-feed] appendFiles skipped empty batch"),0;const g=E===C;return C.push(...u),g||E.push(...u),console.log("[meme-feed] appendFiles appended batch",{receivedCount:h.length,normalizedCount:u.length,targetWasAliased:g,allFilesLength:C.length,filteredFilesLength:E.length}),u.length},destroy(){t.removeEventListener("meme-card:author-filter",H)}}}let D="http://localhost:8888/api/meme";D="https://meme-server.cloudflare1973.workers.dev/api/meme";function je(r,t){console.log(`[api] ${r} response:`,t)}function Oe(r,t,e){console.error(`[api] ${r} failed:`,{error:t,...e})}async function Te(r,t){if(!r.ok)throw new Error(`${t} request failed with status ${r.status}`);return r.json()}async function vt(r,t){try{const e=await fetch(r),n=await Te(e,t);if(je(t,n),!(n!=null&&n.success)||!Array.isArray(n.memes))throw new Error(`${t} returned an invalid payload`);return n.memes}catch(e){return Oe(t,e,{url:r}),[]}}async function sn(r,t){try{const e=await fetch(r),n=await Te(e,t);if(je(t,n),!(n!=null&&n.success)||!Array.isArray(n.tags))throw new Error(`${t} returned an invalid payload`);return n.tags=n.tags.filter(i=>!["the","this","of","my","is","you"].includes(i.name.toLowerCase())),n.tags}catch(e){throw Oe(t,e,{url:r}),e}}async function rn(r,t){try{const e=await fetch(r),n=await Te(e,t);if(je(t,n),!(n!=null&&n.success)||!Array.isArray(n.creators))throw new Error(`${t} returned an invalid payload`);return n.creators}catch(e){throw Oe(t,e,{url:r}),e}}function on({query:r="",creator:t="",limit:e=10,offset:n=0}){const i=new URLSearchParams({limit:String(e),offset:String(n)});return r&&i.set("q",r),t&&i.set("c",t),vt(`${D}/search?${i.toString()}`,"searchMemes")}function an(){return vt(`${D}/top`,"getTopMemes")}function ln({limit:r=10,window:t="24h"}={}){return sn(`${D}/trending-tags?limit=${encodeURIComponent(r)}&window=${encodeURIComponent(t)}`,"getTrendingTags")}function dn({limit:r=10}={}){return rn(`${D}/creators/top?limit=${encodeURIComponent(r)}`,"getTopCreators")}async function De(r,t,e){var n,i;try{const s=await fetch(r),o=await Te(s,t);console.log(`[api] ${t} response:`,o);const l=(i=(n=o==null?void 0:o[e])!=null?n:o==null?void 0:o.total)!=null?i:o==null?void 0:o.count;if(!(o!=null&&o.success)||typeof l!="number")throw new Error(`${t} returned an invalid payload`);return l}catch(s){return Oe(t,s,{url:r}),null}}function cn(){return De(`${D}/total`,"getTotalMemes","memes")}function un(){return De(`${D}/creators/total`,"getTotalCreators","creators")}function hn(){return De(`${D}/votes/daily`,"getDailyVotes","votes")}function pn(){return De(`${D}/voters/active`,"getActiveVoters","active")}async function mn(r,t){const e=`${D}/vote`,n={hash:r==null?void 0:r.checksum,value:t};console.log("[api] castMemeVote request:",n);try{const i=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),s=await Te(i,"castMemeVote");if(je("castMemeVote",s),!(s!=null&&s.success))throw new Error("castMemeVote returned an unsuccessful response");return s}catch(i){return Oe("castMemeVote",i,{url:e,payload:n}),null}}const gn=({getObserver:r,loadMoreMemes:t,setObserver:e})=>{const n=()=>{var o;const i=document.querySelector("#infinite-scroll-sentinel");if(!i){requestAnimationFrame(n);return}(o=r())==null||o.disconnect();const s=new IntersectionObserver(l=>{var a;(a=l[0])!=null&&a.isIntersecting&&t()},{rootMargin:"1000px 0px 1200px 0px",threshold:0});e(s),s.observe(i)};return n},bn=({attachInfiniteScrollObserver:r,getTopMemes:t,initialCreator:e,initialQuery:n,initializeFeed:i,searchMemes:s,searchPageSize:o,state:l})=>Promise.all([s({query:l.activeCreator?"":n,creator:l.activeCreator,limit:o,offset:0}),t()]).then(([a,p])=>{var f,_;console.log("Initial search results:",a),console.log("Top memes:",p);const b=new Map(p.map(({hash:w,votes:C})=>[w,C]));l.activeFeedMode="hot",l.activeQuery=n,l.activeCreator=e,l.searchOffset=o,l.isLoadingMore=!1,a.sort((w,C)=>{var L,O;const E=b.get((L=w.checksum)!=null?L:w.filename),S=b.get((O=C.checksum)!=null?O:C.filename);return E===void 0?S===void 0?0:1:S===void 0?-1:S-E});for(let w=0;w<a.length;){const C=b.get((f=a[w].checksum)!=null?f:a[w].filename);let E=w+1;for(;E<a.length&&b.get((_=a[E].checksum)!=null?_:a[E].filename)===C;)E+=1;for(let S=E-1;S>w;S-=1){const L=w+Math.floor(Math.random()*(S-w+1)),O=a[S];a[S]=a[L],a[L]=O}w=E}l.hasMoreMemes=a.length===o,l.defaultHotFiles=[...a],console.log("Sorted and randomized search results:",a),i({files:a}),r()}),fn="https://github.com/buddypond/meme-client";let yt="http://localhost:8888";yt="https://meme-server.cloudflare1973.workers.dev";const xt=10,Se="sidebar-hidden",dt="meme-feed-sidebar-hidden",ct="meme-client:search-location-change";class vn{constructor(t){this.api=t}search({query:t="",creator:e="",limit:n=xt,offset:i=0}){return this.api.searchMemes({query:t,creator:e,limit:n,offset:i})}getTopMemes(...t){return this.api.getTopMemes(...t)}vote(...t){return this.api.castMemeVote(...t)}}class yn{constructor(t){this.state={...t}}get(t){return this.state[t]}set(t){Object.assign(this.state,t)}toLegacyState(){return new Proxy({},{get:(t,e)=>this.state[e],set:(t,e,n)=>(this.state[e]=n,!0)})}}class xn{constructor({feed:t,sideMenu:e,searchInput:n,floatingOctocat:i,searchPageSize:s=xt,apiOrigin:o=yt,githubUrl:l=fn}){this.feed=t,this.sideMenu=e,this.searchInput=n,this.floatingOctocat=i,this.searchPageSize=s,this.apiOrigin=o,this.githubUrl=l,this.api=new vn({searchMemes:on,getTopMemes:an,castMemeVote:mn}),this.memeFeedInstance=null,this.infiniteScrollObserver=null,this.attachInfiniteScrollObserver=null,this.lastAppliedLocationKey=null,this.activeSearchRequest=0;const{initialCreator:a,initialQuery:p}=this.getInitialFilters();this.initialCreator=a,this.initialQuery=p,this.store=new yn({activeCreator:a,activeFeedMode:"hot",activeQuery:p,defaultHotFiles:[],hasMoreMemes:!0,isLoadingMore:!1,searchOffset:s})}init(){this.configureExternalLinks(),this.configureSearchInput(),this.configureSidebar(),this.configureInfiniteScroll(),this.bindEvents(),this.applySearchFromLocation({force:!0})}getInitialFilters(){const t=new URLSearchParams(window.location.search),e=t.get("c")||"",n=e||t.get("q")||"";return{initialCreator:e,initialQuery:n}}configureExternalLinks(){var t;(t=this.floatingOctocat)==null||t.setAttribute("href",this.githubUrl)}configureSearchInput(){if(!this.searchInput)return;this.searchInput.setAttribute("initial-query",this.initialQuery),this.searchInput.value=this.initialQuery;const t=()=>{var e,n;return(n=(e=this.searchInput)==null?void 0:e.focus)==null?void 0:n.call(e)};if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",t,{once:!0});return}t()}configureSidebar(){if(!this.sideMenu)return;const t=document.createElement("style");t.textContent=`
      @media (min-width: 768px) {
        side-menu {
          transition: transform 180ms ease, opacity 180ms ease;
        }

        body.${Se} {
          padding-left: 0;
        }

        body.${Se} .search-shell {
          left: 0;
        }

        body.${Se} side-menu {
          transform: translateX(calc(var(--side-menu-width, 250px) * -1));
          opacity: 0;
          pointer-events: none;
        }
      }
    `,document.head.appendChild(t);const e=document.querySelector("page-topbar"),n=e==null?void 0:e.homeButton,i=e==null?void 0:e.sidebarToggleButton;if(!n||!i)return;const s=l=>{i.setAttribute("aria-label",l?"Show sidebar":"Hide sidebar"),i.setAttribute("aria-pressed",String(!l))},o=l=>{const a=window.innerWidth>=768&&l;document.body.classList.toggle(Se,a),a&&(this.sideMenu.open=!1,document.body.classList.remove("menu-open")),s(a),this.persistSidebarHidden(l)};n.addEventListener("click",()=>{this.updateSearchLocation({query:"",creator:""})}),i.addEventListener("click",()=>{const l=!document.body.classList.contains(Se);o(l)}),window.addEventListener("resize",()=>{o(this.getInitialSidebarHiddenState())}),o(this.getInitialSidebarHiddenState())}bindEvents(){var e,n,i;const t=s=>{const o=Array.isArray(s)?s.join(" "):String(s||"");this.updateSearchLocation({query:o,creator:""})};(e=this.searchInput)==null||e.addEventListener("change",s=>{var o;((o=s==null?void 0:s.detail)==null?void 0:o.value)!==void 0&&t(s.detail.words)}),(n=this.searchInput)==null||n.addEventListener("submit",s=>{var o;((o=s==null?void 0:s.detail)==null?void 0:o.value)!==void 0&&t(s.detail.value)}),(i=this.feed)==null||i.addEventListener("meme-client:navigate-search",s=>{this.updateSearchLocation(s.detail||{})}),window.addEventListener("popstate",()=>{this.applySearchFromLocation({force:!0})}),window.addEventListener(ct,()=>{this.applySearchFromLocation()})}configureInfiniteScroll(){this.attachInfiniteScrollObserver=gn({getObserver:()=>this.infiniteScrollObserver,loadMoreMemes:()=>this.loadMoreMemes(),setObserver:t=>{this.infiniteScrollObserver=t}})}loadInitialFeed({query:t="",creator:e=""}={}){const n=++this.activeSearchRequest;bn({attachInfiniteScrollObserver:this.attachInfiniteScrollObserver,getTopMemes:(...i)=>this.api.getTopMemes(...i),initialCreator:e,initialQuery:e||t,initializeFeed:({files:i,initialQueryValue:s})=>{n===this.activeSearchRequest&&this.initializeFeed({files:i,initialQueryValue:s})},searchMemes:i=>this.api.search(i),searchPageSize:this.searchPageSize,state:this.store.toLegacyState()})}resetRenderedFeed(){var t,e;Array.from(((t=this.feed)==null?void 0:t.children)||[]).forEach(n=>{var i;return(i=window.cleanupMemeState)==null?void 0:i.call(window,n)}),(e=this.feed)==null||e.replaceChildren()}initializeFeed({files:t,initialQueryValue:e=this.initialQuery}){var n,i;return(i=(n=this.memeFeedInstance)==null?void 0:n.destroy)==null||i.call(n),this.resetRenderedFeed(),this.memeFeedInstance=nn({files:t,feed:this.feed,initialQuery:e,onRequestSearch:s=>this.updateSearchLocation(s),castMemeVote:(...s)=>this.api.vote(...s),ejectMedia:en,injectMedia:tn}),this.memeFeedInstance}getActiveFilters(){const t=new URLSearchParams(window.location.search),e=t.get("c")||"";return{query:e?"":t.get("q")||"",creator:e}}updateSearchQueryParam(t){this.updateSearchLocation({query:t,creator:""})}getLocationKey({query:t,creator:e}){return JSON.stringify({query:t||"",creator:e||""})}syncSearchInputValue(t){!this.searchInput||this.searchInput.value===t||(this.searchInput.value=t)}updateSearchLocation({query:t="",creator:e=""}){const n=t.trim(),i=e.trim(),s=new URL(window.location.href),o=s.search;if(n?s.searchParams.set("q",n):s.searchParams.delete("q"),i?s.searchParams.set("c",i):s.searchParams.delete("c"),s.search===o){this.applySearchFromLocation();return}window.history.replaceState({},"",`${s.pathname}${s.search}${s.hash}`),window.dispatchEvent(new CustomEvent(ct))}async runSearch(t){var s;const e=++this.activeSearchRequest,n=t.trim();this.store.set({activeCreator:"",activeFeedMode:"hot",activeQuery:n,hasMoreMemes:!0,isLoadingMore:!1});const i=await this.api.search({query:n,creator:"",limit:this.searchPageSize,offset:0});e===this.activeSearchRequest&&(this.store.set({hasMoreMemes:i.length===this.searchPageSize,searchOffset:i.length}),this.initializeFeed({files:i,initialQueryValue:n}),(s=this.attachInfiniteScrollObserver)==null||s.call(this))}async runCreatorSearch(t){var s;const e=++this.activeSearchRequest,n=t.trim();this.store.set({activeCreator:n,activeFeedMode:"hot",activeQuery:"",hasMoreMemes:!0,isLoadingMore:!1});const i=await this.api.search({query:"",creator:n,limit:this.searchPageSize,offset:0});e===this.activeSearchRequest&&(this.store.set({hasMoreMemes:i.length===this.searchPageSize,searchOffset:i.length}),this.initializeFeed({files:i,initialQueryValue:n}),(s=this.attachInfiniteScrollObserver)==null||s.call(this))}applySearchFromLocation({force:t=!1}={}){const e=this.getActiveFilters(),n=this.getLocationKey(e);if(!(!t&&n===this.lastAppliedLocationKey)){if(this.lastAppliedLocationKey=n,this.syncSearchInputValue(e.creator||e.query),e.creator){this.runCreatorSearch(e.creator);return}if(e.query){this.runSearch(e.query);return}this.loadInitialFeed(e)}}async loadMoreMemes(){var t,e,n;if(!(this.store.get("activeFeedMode")!=="hot"||this.store.get("isLoadingMore")||!this.store.get("hasMoreMemes"))){this.store.set({isLoadingMore:!0});try{const{query:i,creator:s}=this.getActiveFilters(),o=this.store.get("searchOffset");console.log("[meme-client] loadMoreMemes requesting page",{query:i,creator:s,limit:this.searchPageSize,offset:o});const l=await this.api.search({query:i,creator:s,limit:this.searchPageSize,offset:o}),a=(n=(e=(t=this.memeFeedInstance)==null?void 0:t.appendFiles)==null?void 0:e.call(t,l))!=null?n:0,p=o+a;console.log("[meme-client] loadMoreMemes received page",{requestedOffset:o,receivedCount:l.length,appendedCount:a,nextOffset:p}),this.store.set({hasMoreMemes:l.length===this.searchPageSize,searchOffset:p})}finally{this.store.set({isLoadingMore:!1})}}}readStoredSidebarHidden(){try{return window.localStorage.getItem(dt)}catch(t){return null}}persistSidebarHidden(t){try{window.localStorage.setItem(dt,String(t))}catch(e){}}getInitialSidebarHiddenState(){const t=this.readStoredSidebarHidden();return t!==null?t==="true":window.location.search.includes("immersive=1")||window.location.search.includes("sidebar=hidden")||window.MEME_CLIENT_HIDE_SIDEBAR===!0}}const wt=new URLSearchParams(window.location.search),He=wt.get("token"),Qe=wt.get("accountName");console.log("Received accountName:",Qe);Qe&&localStorage.setItem("memeplexes-username",Qe);He&&(localStorage.setItem("access_token",He),console.log("Logged in with token:",He));var ut;const wn=new xn({feed:document.querySelector("#feed"),sideMenu:document.querySelector("#side-menu"),searchInput:(ut=document.querySelector("page-topbar"))==null?void 0:ut.searchInput,floatingOctocat:document.querySelector("floating-octocat")});wn.init();var Ue,Et;class En extends HTMLElement{constructor(){super(...arguments);k(this,Ue)}connectedCallback(){this.dataset.initialized!=="true"&&(this.dataset.initialized="true",this.classList.add("feed-topbar"),this.setAttribute("aria-label","Feed stats"),this.innerHTML=`
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
    `,c(this,Ue,Et).call(this))}}Ue=new WeakSet,Et=async function(){var f;const e=this.querySelector("#total-memes"),n=(f=document.querySelector("page-topbar"))==null?void 0:f.totalMemesElement,i=this.querySelector("#total-creators"),s=this.querySelector("#votes-today"),o=this.querySelector("#active-now"),[l,a,p,b]=await Promise.all([cn(),un(),hn(),pn()]);e&&typeof l=="number"&&(e.textContent=l.toLocaleString()),n&&typeof l=="number"&&(n.textContent=l.toLocaleString()),i&&typeof a=="number"&&(i.textContent=a.toLocaleString()),s&&typeof p=="number"&&(s.textContent=p.toLocaleString()),o&&typeof b=="number"&&(o.textContent=b.toLocaleString())};customElements.define("feed-topbar",En);var T,te,ne,Y,X,ie,se,_e,m,ke,Ge,$e,le,de,Ke,St,kt,Ct,Lt,Mt,Ce,Le;class Sn extends HTMLElement{constructor(){super();k(this,m);k(this,T);k(this,te,!1);k(this,ne,[]);k(this,Y,[]);k(this,X,!1);k(this,ie,"");k(this,se,"");k(this,_e,!1);y(this,T,this.attachShadow({mode:"open"})),c(this,m,Le).call(this)}static get observedAttributes(){return["title","open","toggle-label","menu-label"]}connectedCallback(){c(this,m,de).call(this),c(this,m,ke).call(this),c(this,m,Ke).call(this)}attributeChangedCallback(){c(this,m,Le).call(this),c(this,m,de).call(this),c(this,m,ke).call(this)}get open(){return d(this,te)}set open(e){const n=!!e;y(this,te,n),this.toggleAttribute("open",n),c(this,m,de).call(this)}close(){d(this,te)&&(this.open=!1,this.dispatchEvent(new CustomEvent("side-menu-toggle",{detail:{open:!1},bubbles:!0})))}}T=new WeakMap,te=new WeakMap,ne=new WeakMap,Y=new WeakMap,X=new WeakMap,ie=new WeakMap,se=new WeakMap,_e=new WeakMap,m=new WeakSet,ke=function(){var e,n,i,s,o,l;(e=d(this,T).querySelector("[data-side-menu-toggle]"))==null||e.addEventListener("click",()=>{this.open=!0,this.dispatchEvent(new CustomEvent("side-menu-toggle",{detail:{open:!0},bubbles:!0}))}),(n=d(this,T).querySelector("[data-side-menu-close]"))==null||n.addEventListener("click",()=>{this.close()}),(i=d(this,T).querySelector("[data-side-menu-backdrop]"))==null||i.addEventListener("click",()=>{this.close()}),(s=d(this,T).querySelector("[data-trending-tags-retry]"))==null||s.addEventListener("click",()=>{c(this,m,Ke).call(this,{force:!0})}),(o=d(this,T).querySelector("[data-trending-tags-list]"))==null||o.addEventListener("click",a=>{const p=a.target.closest("[data-trending-tag]");p&&c(this,m,St).call(this,p.dataset.trendingTag||"")}),(l=d(this,T).querySelector("slot"))==null||l.addEventListener("slotchange",()=>{c(this,m,Ge).call(this),c(this,m,le).call(this)}),c(this,m,Ge).call(this),c(this,m,le).call(this)},Ge=function(){c(this,m,$e).call(this).forEach(e=>{e.dataset.sideMenuBound!=="true"&&(e.dataset.sideMenuBound="true",e.addEventListener("click",()=>{c(this,m,$e).call(this).forEach(n=>n.toggleAttribute("data-active",n===e)),c(this,m,le).call(this),this.close()}))})},$e=function(){const e=d(this,T).querySelector("slot");return e?e.assignedElements({flatten:!0}).filter(n=>n.matches("[data-side-menu-item]")):[]},le=function(){c(this,m,$e).call(this).forEach(e=>{e.classList.toggle("is-active",e.hasAttribute("data-active"))})},de=function(){var n,i;const e=this.hasAttribute("open");y(this,te,e),(n=d(this,T).querySelector("[data-side-menu-toggle]"))==null||n.setAttribute("aria-expanded",String(e)),(i=d(this,T).querySelector("[data-side-menu-backdrop]"))==null||i.toggleAttribute("hidden",!e)},Ke=async function({force:e=!1}={}){if(!(d(this,X)||d(this,_e)&&!e)){y(this,X,!0),y(this,ie,""),y(this,se,""),c(this,m,Le).call(this),c(this,m,ke).call(this),c(this,m,de).call(this),c(this,m,le).call(this);try{const[n,i]=await Promise.allSettled([ln(),dn()]);n.status==="fulfilled"?y(this,ne,n.value):(y(this,ne,[]),y(this,ie,n.reason instanceof Error?n.reason.message:"Unable to load trending tags.")),i.status==="fulfilled"?y(this,Y,i.value):(y(this,Y,[]),y(this,se,i.reason instanceof Error?i.reason.message:"Unable to load top creators.")),y(this,_e,!0)}finally{if(y(this,X,!1),!this.isConnected)return;c(this,m,Le).call(this),c(this,m,ke).call(this),c(this,m,de).call(this),c(this,m,le).call(this)}}},St=function(e){var s;const n=e.trim();if(!n)return;const i=(s=document.querySelector("page-topbar"))==null?void 0:s.searchInput;if(i){if(typeof i.addWord=="function")i.addWord(n);else{const l=String(i.value||"").trim().split(/\s+/).filter(Boolean);l.includes(n)||l.push(n),i.value=l.join(" ")}i.dispatchEvent(new CustomEvent("submit",{bubbles:!0,composed:!0,detail:{value:i.value}})),this.close()}},kt=function(e){const n=e.trim();if(!n)return;const i=document.querySelector("#feed");i&&(i.dispatchEvent(new CustomEvent("meme-client:navigate-search",{bubbles:!0,composed:!0,detail:{creator:n}})),this.close())},Ct=function(){return d(this,X)?'<p class="trending-tags-status" role="status">Loading trending tags...</p>':d(this,ie)?`
        <div class="trending-tags-feedback">
          <p class="trending-tags-error" role="alert">${c(this,m,Ce).call(this,d(this,ie))}</p>
          <button class="trending-tags-retry" data-trending-tags-retry type="button">Retry</button>
        </div>
      `:d(this,ne).length?`
      <div class="trending-tags-list" data-trending-tags-list>
        ${d(this,ne).map(e=>{const n=typeof(e==null?void 0:e.name)=="string"?e.name.trim():"",i=Number(e==null?void 0:e.meme_count)||0;return n?`
            <button class="trending-tag" data-trending-tag="${c(this,m,Ce).call(this,n)}" type="button">
              <span class="trending-tag-name">#${c(this,m,Ce).call(this,n)}</span>
              <span class="trending-tag-count">+${i}</span>
            </button>
          `:""}).join("")}
      </div>
    `:'<p class="trending-tags-status">No trending tags yet.</p>'},Lt=function(){return d(this,X)?'<p class="trending-tags-status" role="status">Loading top creators...</p>':d(this,se)?`<p class="trending-tags-error" role="alert">${c(this,m,Ce).call(this,d(this,se))}</p>`:d(this,Y).length?`
      <div class="trending-tags-list">
        ${d(this,Y).map((e,n)=>{const i=typeof(e==null?void 0:e.creator)=="string"?e.creator.trim():"",s=Number(e==null?void 0:e.meme_count)||0;return i?`
            <div class="trending-tag">
              <div data-top-creator-card="${n}"></div>
              <span class="trending-tag-count">+${s}</span>
            </div>
          `:""}).join("")}
      </div>
    `:'<p class="trending-tags-status">No top creators yet.</p>'},Mt=function(){d(this,T).querySelectorAll("[data-top-creator-card]").forEach(e=>{var l,a,p,b;const n=Number(e.getAttribute("data-top-creator-card")),i=d(this,Y)[n],s=typeof(i==null?void 0:i.creator)=="string"?i.creator.trim():"";if(!s)return;const o=document.createElement("creator-card").setup({name:s,username:(l=i==null?void 0:i.username)!=null?l:i==null?void 0:i.handle,email:i==null?void 0:i.email,avatarUrl:(b=(p=(a=i==null?void 0:i.avatar_url)!=null?a:i==null?void 0:i.avatarUrl)!=null?p:i==null?void 0:i.profile_image)!=null?b:i==null?void 0:i.profileImage});o.addEventListener("creator-card:filter",f=>{f.stopPropagation(),c(this,m,kt).call(this,s)}),e.replaceChildren(o)})},Ce=function(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")},Le=function(){const e=this.getAttribute("title")||"Menu",n=this.getAttribute("toggle-label")||`Open ${e.toLowerCase()}`,i=this.getAttribute("menu-label")||e;d(this,T).innerHTML=`
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
            ${c(this,m,Ct).call(this)}
          </section>
          <section class="trending-tags-panel" id="top-creators" aria-labelledby="top-creators-heading">
            <p class="trending-tags-heading" id="top-creators-heading">Top Creators</p>
            ${c(this,m,Lt).call(this)}
          </section>
        </div>
      </nav>
    `,c(this,m,Mt).call(this)};customElements.define("side-menu",Sn);
