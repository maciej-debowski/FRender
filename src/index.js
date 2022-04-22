/**
 * 
 * Frender.js v1.0.0
 * A fast rendering ui liblary for javascript
 * @author Maciej Dębowski
 * @version 1.0.0
 * @license MIT
 */

import { frenderError } from './error.js';
import { createTree } from './createTree.js';
import { getStateBinders } from './getStateBinders.js';

window.frender_data = window.frender_data || {};
if(frender_data) window.frender_data = frender_data;

var alphabet = "abcdefghijklmnopqrstuvwxyz", highAlphabet = alphabet.toUpperCase();

function replaceState(item) {
    return item.replace(/@[A-Za-z_$\[\]\"\'\(\)\!\:\.\,]+/g, function(x, y) {
        return "window.frender_data." + x.replace("@", "");
    });
}

function render(tree, basicContent, root) {
    root.innerHTML = basicContent;   

    getStateBinders(tree, function(full, parent) {

        for(var realFull of full) {
            var realParent = document.querySelector("[data-frender-id='" + parent.id + "']");
            var regex = new RegExp(
                (realFull.split("{{").join("").split("}}").join("")).split("").map(x => (alphabet.indexOf(x) == -1 && highAlphabet.indexOf(x) == -1 ? '\\' + x : x)).join(""), 
            "g")


            var vars = realParent.innerHTML.match(regex)
            if(!vars) {
                try {
                    realParent.innerHTML = realParent.innerHTML.replace(realFull, eval(
                        realFull.split("{{").join("").split("}}").join("")
                    ))
                } catch(err) {}

                continue;
            }

            for(var real of vars) {
                var evaluated = eval(
                    replaceState(real.split("{{").join("").split("}}").join(""))
                );

                realParent.innerHTML = realParent.innerHTML.replace("{{" + real + "}}", evaluated);
            }
        }
    })

    for(var el of root.querySelectorAll("*")) {
        for(let [a, b] of Object.entries(el.attributes)) {
            var name = b.name.split("=")[0];
            if(name[0] == "f" && name[1] == "-") {
                var eventName = name.slice(2, name.length);
                el.addEventListener(eventName, function () {
                    var callbackName = (b.value);
                    var fullcallback = "";
                    if(callbackName[callbackName.length - 1] == ")") fullcallback = "(function() {" + "window.frender_data." +  callbackName + "})()";
                    else fullcallback = "(function() {" + "window.frender_data." +  callbackName + "()})()";
                    eval(fullcallback)
                })
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    var init = Date.now();
    var element = document.querySelector("[frender-app]");
    if(!element) {
        return frenderError("[frender-app] is not found");
    }

    element.setAttribute("data-frender-id", parseInt(Math.random() * 160000000000).toString(16));
    for(var el of element.querySelectorAll("*")) {
        el.setAttribute("data-frender-id", parseInt(Math.random() * 160000000000).toString(16));
    }

    var basic = element.outerHTML;
    var tree = createTree(element);

    var _current_data = window.frender_data;
    var _old_data = JSON.stringify(_current_data);

    setInterval(function() {
        if(_old_data != JSON.stringify(_current_data)) {
            render(tree, basic, element);
        }
        
        _old_data = JSON.stringify(_current_data);
        _current_data = window.frender_data;
    }, 15)

    render(tree, basic, element);
    console.log("%c[frender]", "color: #09f;", (Date.now() - init) + "ms to render");
});