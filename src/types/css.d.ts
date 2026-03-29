// TypeScript 6.x requires explicit type declarations for CSS side-effect imports.
// This file declares all *.css files as valid modules so that imports like
// `import '@/styles/globals.css'` do not trigger TS2882.
declare module '*.css';
