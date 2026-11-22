// Vite plugin for apps that build their pages from this package. It inlines prepaint.js into
// each page's <head>, straight after <meta charset>, so the saved appearance is on the root
// before any stylesheet loads. A page can mark the spot with <!-- Shared appearance prepaint -->.
import {readFileSync} from 'node:fs';

const marker = '<!-- Shared appearance prepaint -->';

export function prepaint() {
  const script = `<script>${readFileSync(new URL('./prepaint.js', import.meta.url), 'utf8').trim()}</script>`;
  const insertAfter = (html, tag) => html.replace(tag, () => `${tag}${script}`);
  return {
    name: 'design-system-prepaint',
    transformIndexHtml(html) {
      if (html.includes(marker)) return html.replace(marker, () => script);
      const anchor = html.match(/<meta charset[^>]*>/i) || html.match(/<head(?:\s[^>]*)?>/i);
      if (!anchor) throw new Error('design-system prepaint: the page has no <head>.');
      const result = insertAfter(html, anchor[0]);
      // Styles that come first would paint before the appearance is known.
      if (/<link[^>]+stylesheet|<style/i.test(result.slice(0, result.indexOf(script)))) throw new Error('design-system prepaint: a stylesheet comes before <meta charset>.');
      return result;
    },
  };
}

export default prepaint;
