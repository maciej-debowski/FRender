export function prefixScopes(text, prefix) {
    var regex = /\{\{ [ !"#$%&\'()*+,-./0123456789:<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\\\]^_`abcdefghijklmnopqrstuvwxyz|~ ]+ \}\}/gim
    var matched = text.match(regex);
    if (matched) {
        for (var match of matched) {
            var newMatch = match.replace("@", "window.frender_data." + prefix);
            text = text.replace(match, newMatch);
        }
    }

    var eventRegex = /f-[A-Za-z]+="/gim
    var eventMatched = text.match(eventRegex);
    if (eventMatched) {
        for(var match of eventMatched) {
            var newMatch = match.replace('"', "\"" + prefix);
            text = text.replace(match, 'data-component-scope="' + prefix + '"' + newMatch);
        }

    }

    return text;
}