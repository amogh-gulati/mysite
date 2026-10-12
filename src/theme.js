// Overrides the static palette in index.css with colors derived from what I've
// been watching and listening to (see scripts/personal.mjs).
const vars = (colors) => Object.entries(colors).map(([k, v]) => `--${k}: ${v};`).join(' ');

export const applyPersonalTheme = (theme) => {
    if (!theme || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.id = 'personal-theme';
    style.textContent = `
:root { ${vars(theme.light)} }
@media (prefers-color-scheme: dark) { :root { ${vars(theme.dark)} } }`;
    document.head.appendChild(style);
};
