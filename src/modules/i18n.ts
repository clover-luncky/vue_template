import { createI18n, type Locale } from 'vue-i18n'
import { UserModule } from '~/types'


const i18n = createI18n({
    legacy: false,
    locale: '',
    messages: {}
})

const localesMap = Object.fromEntries(
    Object.entries(import.meta.glob('../../locales/*.yml')).map(([path, loadLocale]) => [
        path.match(/\/([\w-]+)\.yml$/)?.[1],
        loadLocale
    ])
) as Record<Locale, () => Promise<{ default: Record<string, string> }>>

export const availableLocales = Object.keys(localesMap)

const loadedLanguages: string[] = []

function setI18nLanguage(lang: Locale) {
    i18n.global.locale.value = lang as any
    if(typeof document !== 'undefined') {
        document.querySelector('html')?.setAttribute('lang', lang)
    }
    return lang
}

export async function loadLanguageAsync(lang: string): Promise<Locale> {
    if(i18n.global.locale.value === lang || loadedLanguages.includes(lang)) {
        return setI18nLanguage(lang)
    }

    const messages = await localesMap[lang]()
    i18n.global.setLocaleMessage(lang, messages.default)
    loadedLanguages.push(lang)
    return setI18nLanguage(lang)
}

export const install: UserModule = ({ app }) => {
    app.use(i18n)
    loadLanguageAsync('en')
}