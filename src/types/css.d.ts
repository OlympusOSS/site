// CSS module declarations for TypeScript 6.0+ compatibility
// TypeScript 6.0 introduced TS2882, which requires explicit type declarations
// for side-effect imports of .css files (import "./foo.css").
// See: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/

declare module "*.css" {
  const styles: { [className: string]: string };
  export default styles;
}
