export function createCSSScopes(components) {

    for(var component of components) {
        var id = component.id;
        var css = component.scopedCSS;

        document.head.innerHTML += '<style id="style-' + id + '"> ' + css + ' </style>'
    }

}