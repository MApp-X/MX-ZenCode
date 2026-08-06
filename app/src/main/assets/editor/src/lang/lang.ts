// src/lang/lang.ts
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { xml } from '@codemirror/lang-xml'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'

export function getLanguageExtension(filename: string) {
  const ext = filename.split('.').pop()?.toLocaleLowerCase() || '';

  switch (ext) {
    case 'js':
      return javascript();
    case 'jsx':
      return javascript({ jsx: true });
    case 'mjs':
      return javascript();
    case 'cjs':
      return javascript();
    case 'ts':
      return javascript({ typescript: true });
    case 'tsx':
      return javascript({ typescript: true, jsx: true });


    case 'html':
      return html();
    case 'htm':
      return html();
    case 'xhtml':
      return html();
    case 'xht':
      return html();
    case 'shtml':
      return html();
    case 'shtm':
      return html();


    case 'svg':
      return xml();
    case 'svgz':
      return xml();
    case 'xml':
      return xml();
    case 'xsl':
      return xml();
    case 'xslt':
      return xml();
    case 'xsd':
      return xml();
    case 'dtd':
      return xml();


    case 'css':
      return css();
    case 'scss':
      return css();
    case 'sass':
      return css();
    case 'less':
      return css();
    case 'styl':
      return css();


    case 'json':
      return json();
    case 'json5':
      return json();
    case 'jsonc':
      return json();
    case "jsonl":
      return json();


    case 'markdown':
      return markdown();
    case 'md':
      return markdown();
    case 'mdown':
      return markdown();
    case 'mkdn':
      return markdown();
    case 'mdwn':
      return markdown();
    default:
      return [];
  }
}