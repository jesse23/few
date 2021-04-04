import marked from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { defineComponent } from '@/vDom';

interface MarkdownOptions {
    path: string;
}

marked.setOptions( {
    langPrefix: 'language-',
    highlight: function( code, lang ) {
        return hljs.highlight( lang, code ).value;
    }
} );
hljs.initHighlightingOnLoad();

const MarkdownComponent = defineComponent<MarkdownOptions>( {
    name: 'MarkdownView',
    init: () => null,
    actions: {
        createDomComponent: async( { path, ref } ): Promise<void> => {
            const content = await ( await fetch( path ) ).text();
            ref.el.innerHTML = marked( content );
        }
    },
    mount: ( { createDomComponent } ) => createDomComponent(),
    view: ( { ref } ) =>
        <div ref={ref( 'el' )}></div>
} );

export default defineComponent( {
    name: 'MarkdownViewExample',
    view: () => <MarkdownComponent path='main.md'></MarkdownComponent>
} );

