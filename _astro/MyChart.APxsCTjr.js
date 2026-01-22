import{r as a}from"./index.C7o2Wufa.js";var l={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var x=Symbol.for("react.transitional.element"),c=Symbol.for("react.fragment");function d(n,r,e){var o=null;if(e!==void 0&&(o=""+e),r.key!==void 0&&(o=""+r.key),"key"in r){e={};for(var i in r)i!=="key"&&(e[i]=r[i])}else e=r;return r=e.ref,{$$typeof:x,type:n,key:o,ref:r!==void 0?r:null,props:e}}s.Fragment=c;s.jsx=d;s.jsxs=d;l.exports=s;var t=l.exports;function p(){const[n,r]=a.useState(0);return console.log("MyChart component script is running in the browser!"),t.jsxs("div",{style:{padding:"2rem",border:"2px dashed #007bff",textAlign:"center"},children:[t.jsx("h2",{children:"My Interactive Chart Component"}),t.jsx("p",{children:"This is a React component rendered by Astro."}),t.jsx("p",{children:"The JavaScript for this component was not loaded until you saw it."}),t.jsxs("div",{style:{marginTop:"1rem"},children:[t.jsxs("p",{children:["Current count: ",t.jsx("strong",{children:n})]}),t.jsx("button",{onClick:()=>r(n+1),children:"Increment Count"})]})]})}export{p as default};
