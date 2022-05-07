function Node(element, parentNode) {
    this.element = element;
    this.nonScript = (element.tag != "script") ? element.innerText : "";
    this.children = getElementChildren(element);
    this.id = element.getAttribute("data-frender-id")
    this.componentId = element.getAttribute("data-component")
    this.parent = parentNode//element.parentNode.getAttribute("data-frender-id") || "";
    this.type = element.tagName
}

function getElementChildren(element) {
    if(!element) return [];
    var children = [];
    for (var i = 0; i < element.childNodes.length; i++) {
        var child = element.childNodes[i];
        if (child.nodeType == 1) {
            children.push(new Node(child, element));
        }
    }
    return children;
}

export function createTree(element) {
    var tree = new Node(element, null);

    return tree;
}