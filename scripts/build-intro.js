// Compila assets/intro-cover.jsx -> assets/intro-cover.js (JS plano).
// Así el navegador no descarga Babel (~3 MB, desde unpkg.com) para mostrar la
// portada: index.html carga el .js ya compilado.
//
// Uso (después de editar intro-cover.jsx):
//   npm install --no-save @babel/core @babel/preset-react
//   node scripts/build-intro.js
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const src = path.join(__dirname, '..', 'assets', 'intro-cover.jsx');
const out = path.join(__dirname, '..', 'assets', 'intro-cover.js');

const result = babel.transformFileSync(src, {
  // "classic" = React.createElement (el runtime del sitio le pasa React como
  // argumento; el modo automático agregaría un import que no existe acá).
  presets: [['@babel/preset-react', { runtime: 'classic', development: false }]],
  comments: false,
  babelrc: false,
  configFile: false,
});

const header = '// GENERADO desde intro-cover.jsx — no editar a mano.\n// Regenerar con: node scripts/build-intro.js\n';
fs.writeFileSync(out, header + result.code + '\n');
console.log('OK ->', path.relative(process.cwd(), out), (result.code.length / 1024).toFixed(1) + ' KB');
