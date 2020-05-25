import Vue from 'vue'

/** @type Object{string: Promise<Element>} */
const cache = {} as any;

/**
 * Remove false attrs
 * @param {Object} attrs
 */
function filterAttrs(attrs:any) {
    return Object.keys(attrs).reduce((result:any, key:any) => {
        if (attrs[key] !== false && attrs[key] !== null && attrs[key] !== undefined) {
            result[key] = attrs[key];
        }
        return result;
    }, {});
}



//@ts-ignore
const InlineSvg = Vue.extend({
    name: 'InlineSvg',
    inheritAttrs: false,
    render(createElement:any) {
        if (!(<any>this).isLoaded) {
            return null;
        }
        return createElement(
            'svg',
            {
                on: (<any>this).$listeners,
                attrs: Object.assign((<any>this).initialAttrs, filterAttrs((<any>this).$attrs)),
                domProps: {
                    innerHTML: (<any>this).initialContent,
                },
            },
        );
    },
    props: {
        src: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            isLoaded: false,
            initialAttrs: {},
            initialContent: '',
        };
    },
    watch: <any>{
        src(newValue:any) {
            // re-generate inline svg
            (<any>this).inline(newValue);
        },
    },
    mounted() {
        // generate inline svg
        (<any>this).inline((<any>this).src);
    },
    methods: {
        /**
         * Replace image with loaded svg
         * @param {string} src
         */
        inline(src:any) {
            // fill cache by src with promise
            if (!cache[src]) {
                // notify svg is unloaded
                if ((<any>this).isLoaded) {
                    (<any>this).isLoaded = false;
                    (<any>this).$emit('unloaded');
                }
                // download
                cache[src] = (<any>this).download(src);
            }

            // inline svg when cached promise resolves
            cache[src]
                .then((svg:any) => {
                    // copy attrs
                    (<any>this).initialAttrs = {};
                    const attrs = svg.attributes;
                    for (let i = attrs.length - 1; i >= 0; i--) {
                        (<any>this).initialAttrs[attrs[i].name] = attrs[i].value;
                    }
                    // copy inner html
                    (<any>this).initialContent = svg.innerHTML;
                    // render svg element
                    (<any>this).isLoaded = true;
                    // notify
                    (<any>this).$emit('loaded');
                })
                .catch((err:any) => {
                    // remove cached rejected promise so next image can try load again
                    delete cache[src];
                    (<any>this).$emit('error', err);
                });
        },

        /**
         * Get the contents of the SVG
         * @param {string} url
         * @returns {Promise<Element>}
         */
        download(url:any) {
            return new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();


                request.open('GET', url, true);

                request.onload = function requestOnload() {
                    if (request.status >= 200 && request.status < 400) {
                        try {
                            // Setup a parser to convert the response to text/xml in order for it to be manipulated and changed
                            const parser = new DOMParser();
                            const result = parser.parseFromString(request.responseText, 'text/xml');
                            const svgEl = result.getElementsByTagName('svg')[0];
                            if (svgEl) {
                                resolve(svgEl);
                            } else {
                                reject(new Error('Loaded file is not valid SVG"'));
                            }
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error('Error loading SVG'));
                    }
                };

                request.onerror = reject;
                request.send();
            });
        },
    },
});


export default  InlineSvg;
