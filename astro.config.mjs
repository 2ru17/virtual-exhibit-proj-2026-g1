import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import icon from "astro-icon";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    integrations: [mdx(), react(), icon()],
    site: "https://2ru17.github.io",
    base: "/virtual-exhibit-proj-2026-g1/",

    vite: {
        plugins: [tailwindcss()],
    },
});
