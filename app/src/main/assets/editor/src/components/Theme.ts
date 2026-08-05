//
export function Theme(t : string) {
    if (t=="dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        applyThemeToStatusbar(t);
    } else {
        document.documentElement.removeAttribute("data-theme");
        applyThemeToStatusbar(t);
    }
    localStorage.setItem("app-theme", t);
}

export function applyThemeToStatusbar(theme: string) {
    if ((window as any).AndroidBridge) {
        (window as any).AndroidBridge.applyTheme(theme)
    }
}