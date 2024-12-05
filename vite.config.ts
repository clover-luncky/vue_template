import { defineConfig } from 'vite'
import path from 'node:path'
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Unocss from 'unocss/vite'
import Markdown from 'vite-plugin-vue-markdown'
import Shiki from 'markdown-it-shiki'
import LinkAttributes from 'markdown-it-link-attributes'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import WebfontDownload from 'vite-plugin-webfont-dl'
import VueDevTools from 'vite-plugin-vue-devtools'
import generateSitemap from 'vite-ssg-sitemap'

export default defineConfig({
    resolve: {
        alias: {
            '~/': `${path.resolve(__dirname, 'src')}/`
        }
    },
    plugins: [
        VueMacros({
            plugins: {
                vue: Vue({
                    include: [/\.vue$/, /\.md$/]
                })
            }
        }),
        Pages({
            extensions: ['vue', 'md']
        }),
        Layouts(),
        AutoImport({
            imports: ['vue', 'vue-router', 'vue-i18n', '@vueuse/head', '@vueuse/core'],
            dts: 'src/auto-imports.d.ts',
            dirs: ['src/composables', 'src/stores'],
            vueTemplate: true
        }),
        Components({
            extensions: ['vue', 'md'],
            include: [/\.vue$/, /\.md$/],
            dts: 'src/components.d.ts'
        }),
        Unocss(),
        Markdown({
            wrapperClasses: 'prose prose-sm m-auto text-left',
            headEnabled: true,
            markdownItSetup(md) {
                md.use(Shiki, {
                    theme: {
                        light: 'vitesse-light',
                        dark: 'vitesse-dark'
                    }
                });
                md.use(LinkAttributes, {
                    matcher: (link: string) => /^https?:\/\//.test(link),
                    attrs: {
                        target: '_blank',
                        rel: 'noopener'
                    }
                })
            }
        }),
        VueI18n({
            runtimeOnly: true,
            compositionOnly: true,
            fullInstall: true,
            include: [path.resolve(__dirname, 'locales/**')]
        }),
        WebfontDownload(),
        VueDevTools()
    ],
    ssr: {
        // SSG Vue-i18n workaround
        noExternal: [/vue-i18n/]
    },
    ssgOptions: {
        script: 'async',
        formatting: 'minify',
        crittersOptions: {
            reduceInlineStyles: false
        },
        onFinished() {
            generateSitemap()
        }
    }
})