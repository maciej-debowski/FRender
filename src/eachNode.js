function inv(tree, callback) {
    if(!tree.children) return;
    var index = 0;
    for(var node of tree.children) {
        tree.children[index] = callback(node);
        inv(node.children)
        index++;
    }
}

export function eachNode(tree, callback) {
    inv(tree, callback)
}