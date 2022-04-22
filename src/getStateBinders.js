function inv(tree, callback) {
    var regex = /\{\{ [ !"#$%&\'()*+,-./0123456789:<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\\\]^_`abcdefghijklmnopqrstuvwxyz|~ ]+ \}\}/gim
    
    var matched = tree.nonScript.match(regex);
    if(matched) {
        callback(matched, tree);
    }

    for (var node of tree.children) {
        inv(node, callback);
    }
}

export function getStateBinders(tree, callback) {
    inv(tree, callback)
}