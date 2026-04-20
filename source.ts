import { docs, meta } from "./.source/server";
import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";

const s = toFumadocsSource(docs, meta);

export const source = loader(s, {
  baseUrl: "/docs",
});
