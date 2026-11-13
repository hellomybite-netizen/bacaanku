import { renderMarkdown } from '../src/lib/markdown.mjs';
import assert from 'node:assert/strict';

const nasty = renderMarkdown('Halo **dunia**\n\n<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n[klik](javascript:alert(1))\n\n![lokal](/media/articles/a.jpg)\n\n![luar](https://example.com/a.jpg)');
assert.equal(nasty.html.includes('<script'), false);
assert.equal(nasty.html.includes('onerror'), false);
assert.equal(nasty.html.includes('javascript:'), false);
assert.match(nasty.html, /<strong>dunia<\/strong>/);
assert.match(nasty.html, /src="\/media\/articles\/a.jpg"/);
assert.match(nasty.html, /src="https:\/\/example.com\/a.jpg"/);
assert.ok(nasty.minutes >= 1);

const heading = renderMarkdown('# Judul\n\n## Bagian');
assert.equal(heading.html.includes('<h1'), false);
assert.match(heading.html, /<h2>/);
console.log('markdown sanitizer lolos');
