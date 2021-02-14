/* eslint-env node */
/**
 * For typescript compile, there are 2 different approach
 * - All in babel, which means:
 *   - no tsc and tslib at all
 *     - u can still use tsc --noEmit as 'tslint'
 *   - use @babel/preset-typescript to transpile typescript
 *   - More flexibility in babel feature
 *   - Loosing some typescript feature and type check
 *     - Industry practice is using prettier eslint to fill the type check part.
 *   - https://segmentfault.com/a/1190000021695864
 *
 * - tsc approach
 *   - use tsc + tslib to compile
 *   - all typescript feature support
 *   - complexity comes when we need cusotmization, possibly we have to do
 *     tsc + babel
 *   - How to use ES6 module with a proper tsconfig.json is still a question
 *     mark, the ES6 import will be processed by tsc too with tsconfig.target
 *     to ES5/ES3 and may cause double transpile side effect.
 *
 * - rollup + tsc + JSX + preserve problem
 *   - For tsc, when we set jsx:preserve, the tsc will leave the JSX as it is,
 *     convert *.tsx to *.jsx, and hoping some downstream processor will handle
 *     it.
 *   - At tsconfig, better to set target as ES6 since we will have follow up
 *     transpile.
 *   - At rollup + tsc layer, hack below is needed:
 *     // https://rollupjs.org/guide/en/#acorninjectplugins
 *     // required when try to export ES6 code without babel/bubble
 *     import acornJSX from 'acorn-jsx';
 *     export default {
 *         ...
 *         acornInjectPlugins: [ acornJSX( ) ]
 *     }
 *   - At rollup + babel layer, setup a follow-up transpiler after tsc:
 *     // https://github.com/znck/example-functional-rollup-plugin-vue/blob/master/rollup.config.js
 *     // tested, working. Buble has issue with vue3
 *     buble( {
 *         objectAssign: 'Object.assign',
 *         jsx: 'h'
 *     } ),
 *     // not tested, alternative.
 *     babel( {
 *         extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs']
 *         presets: [ '@babel/preset-react' ]
 *     } ),
 *
 *  - For watch limit see below. If u are in docker env do it in docker app machine
 *    https://github.com/gatsbyjs/gatsby/issues/11406
 */
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

const contentBase = '../../docs';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const extensions = [ '.js', '.jsx', '.ts', '.tsx' ];

export default {
    input: 'src/main.ts',
    output: {
        file: `${contentBase}/bundle.js`,
        format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: true
    },
    plugins: [
        alias( {
            entries: [ {
                find: /^@\/(.*)$/,
                replacement: `${path.resolve( process.cwd(), 'src' )}/$1`
            } ]
        } ),
        postcss( {
            extract: false,
            modules: true,
            use: [ 'sass' ]
        } ),
        resolve( {
            mainFields: [ 'module', 'main', 'jsnext:main', 'browser' ],
            extensions
        } ), // tells Rollup how to find date-fns in node_modules
        babel( {
            exclude: 'node_modules/**',
            presets: [
                [ '@babel/preset-env', {
                    targets: {
                        // browsers: [ 'last 2 versions', 'ie >= 11' ]
                        browsers: [ 'last 1 chrome versions' ]
                    }
                } ],
                // https://github.com/facebook/create-react-app/blob/f5c3bdb65480f93b2d4a4c2f3214fc50753de434/packages/babel-preset-react-app/create.js
                [ '@babel/preset-react', {
                    // pragma: 'this.$createElement'
                    // align with vue
                    pragma: 'h.createElement',
                    pragmaFrag: 'h.Fragment',
                    // has side effect in non-react practice like vue
                    // development: !production
                    useBuiltIns: true
                } ],
                // https://github.com/babel/babel/issues/11851#issuecomment-661834064
                [ '@babel/preset-typescript', { onlyRemoveTypeImports: true } ]
            ],
            plugins: [
                // https://juejin.im/post/6844904190213390343
                [
                    'const-enum'
                ],
                [
                    'auto-import', {
                        declarations: [
                            { members: [ 'h' ], path: '@/vDom' }
                        ]
                    }
                ]
            ],
            babelHelpers: 'bundled',
            extensions
        } ),
        commonjs( { // converts date-fns to ES modules
            // special setup for react
            // https://zh4ui.net/post/2018-12-23-rollup-typescript-react/
            // https://github.com/rollup/rollup-plugin-commonjs/issues/211
            // above is not required after @rollup/commonjs@13
        } ),
        // https://github.com/rollup/rollup/issues/487
        replace( {
            'process.env.NODE_ENV': JSON.stringify( production ? 'production' : 'development' )
        } ),
        production && terser(), // minify, but only in production
        !production && serve( {
            contentBase,
            host: '0.0.0.0',
            port: 8080
        } )
    ],
    // https://github.com/Upstatement/react-router-guards/pull/14
    context: 'null',
    moduleContext: 'null'
    /*
    onwarn:  warning => {
       // Skip certain warnings

       // should intercept ... but doesn't in some rollup versions
       if ( warning.code === 'THIS_IS_UNDEFINED' ) { return; }

        // console.warn everything else
        console.warn( warning.message );
    }
    */
};
