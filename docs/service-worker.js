if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return s[e]||(r=new Promise((async r=>{if("document"in self){const s=document.createElement("script");s.src=e,document.head.appendChild(s),s.onload=r}else importScripts(e),r()}))),r.then((()=>{if(!s[e])throw new Error(`Module ${e} didn’t register its module`);return s[e]}))},r=(r,s)=>{Promise.all(r.map(e)).then((e=>s(1===e.length?e[0]:e)))},s={require:Promise.resolve(r)};self.define=(r,i,n)=>{s[r]||(s[r]=Promise.resolve().then((()=>{let s={};const a={uri:location.origin+r.slice(1)};return Promise.all(i.map((r=>{switch(r){case"exports":return s;case"module":return a;default:return e(r)}}))).then((e=>{const r=n(...e);return s.default||(s.default=r),s}))})))}}define("./service-worker.js",["./workbox-a7bb3469"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"config.json",revision:"ed46efbd519bffba034b769330adec44"},{url:"favicon.ico",revision:"ada50a01184d8e31fb61c68d2b88f8d9"},{url:"images/chance_bonus_1.png",revision:"56479e99c1558739effd8030498b284d"},{url:"images/chance_bonus_2.png",revision:"67866c8aca412074d8b12b3c8a55cf03"},{url:"images/chance_bonus_3.png",revision:"23c84967cd4641b49fe0286ad0f84e85"},{url:"images/dressia_gauge_1.png",revision:"bbfb56fba1d32042f2482f9799bfc52c"},{url:"images/dressia_gauge_2.png",revision:"bbf8c5d97a5180cee1733707d48cc050"},{url:"images/dressia_gauge_3.png",revision:"0c9da46e7798bc91e368ad949993071d"},{url:"index.html",revision:"e573745e82cd0b5e7da213da53a27e67"},{url:"logo128.png",revision:"1e731a13d411e9218f0da9d0756087ce"},{url:"logo512.png",revision:"1f5a708ba174d7b7a6a045ebeb84585a"},{url:"main.js",revision:"437e19d72537918fb7b97b3326104207"},{url:"manifest.json",revision:"74e722cbfc1c73e762d3f17972dfe5a1"}],{}),e.registerRoute(/.*aikatsu.com\/.*/,new e.CacheFirst({cacheName:"cdn-s3",plugins:[new e.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3,purgeOnQuotaError:!0}),new e.CacheableResponsePlugin({statuses:[0,200]})]}),"GET")}));
//# sourceMappingURL=service-worker.js.map
