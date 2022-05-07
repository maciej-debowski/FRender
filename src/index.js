/**
 * 
 * Frender.js v1.1.0
 * A fast rendering ui liblary for javascript
 * @author Maciej Dębowski
 * @version 1.1.0
 * @license MIT
 */

import { frenderError } from './error.js';
import { createTree } from './createTree.js';
import { getStateBinders } from './getStateBinders.js';
import { createCSSScopes } from './createCSSScopes.js';
import { prefixScopes } from './prefixScopes.js'
import { eachNode } from './eachNode.js'

window.frender_data = window.frender_data || {};
if(frender_data) window.frender_data = frender_data;

var alphabet = "abcdefghijklmnopqrstuvwxyz", highAlphabet = alphabet.toUpperCase();

function setFocusFixed( elm ){
    if( !elm ) return;

    var savedTabIndex = elm.getAttribute('tabindex')
    elm.setAttribute('tabindex', '0')
    elm.focus()
    elm.setAttribute('tabindex', savedTabIndex)
}

function setCursorPos(input, start, end) {
    if (arguments.length < 3) end = start;
    if ("selectionStart" in input) {
        setTimeout(function() {
            input.selectionStart = start;
            input.selectionEnd = end;
        }, 1);
    }
    else if (input.createTextRange) {
        var rng = input.createTextRange();
        rng.moveStart("character", start);
        rng.collapse();
        rng.moveEnd("character", end - start);
        rng.select();
    }
}

var components = window.frender_components.map(function(x) { 
    var y = new x(); 
    y.id = parseInt(Math.random() * 160000000000).toString(16);
    return y;
});
var componentsInstances = [];

function replaceState(item) {
    return item.replace(/@[A-Za-z_$\[\]\"\'\(\)\!\:\.\,]+/g, function(x, y) {
        return "window.frender_data." + x.replace("@", "");
    });
}

function render(tree, basicContent, root) {
    var init = Date.now();
    var focus_id = 0;

    // Getting state

    eachNode(tree, function(element) {
        var existingElement = document.querySelector("[data-frender-id='" + element.id + "']");

        element.isChecked = existingElement.checked;
        element.isSelected = existingElement.selected;
        element.value = existingElement.value;
        element.isDisabled = existingElement.disabled;
        element.selectionStart = existingElement.selectionStart;
        element.selectionEnd = existingElement.selectionEnd;
        element.selectedIndex = existingElement.selectedIndex;
        element.width = existingElement.getBoundingClientRect().width
        element.height = existingElement.getBoundingClientRect().height
        element.style = existingElement.style.cssText
        element.classList = existingElement.classList

        if(existingElement.tagName == 'TEXTAREA') element.inner = existingElement.value;
        else element.inner = existingElement.innerHTML

        if(existingElement == document.activeElement) focus_id = element.id;

        return element
    })

    // Reseting to basic

    root.innerHTML = basicContent;

    // Previous states

    eachNode(tree, function(element) {
        var existingElement = document.querySelector("[data-frender-id='" + element.id + "']");

        existingElement.setAttribute("value", element.value);
        element.isChecked && existingElement.setAttribute("checked", "");
        element.isSelected && existingElement.setAttribute("selected", "");
        element.isDisabled && existingElement.setAttribute("disabled", "");
        element.isFocused && existingElement.focus();
        if(element.selectedIndex) existingElement.selectedIndex = element.selectedIndex;

        document.querySelector("[data-frender-id='" + element.id + "']").innerHTML = element.type == 'TEXTAREA' ? element.value : element.inner
        existingElement.style.width = element.width
        existingElement.style.height = element.height
        existingElement.style.cssText = element.style
        existingElement.classList = element.classList

        existingElement.setAttribute("onclick", "focus_id = '" + element.id + "'");

        if(element.id == focus_id) {
            setTimeout(function() {
                setFocusFixed(document.querySelector("[data-frender-id='" + element.id + "']"))
                //document.querySelector("[data-frender-id='" + element.id + "']").selectionStart = element.selectionStart;
                //document.querySelector("[data-frender-id='" + element.id + "']").selectionEnd = element.selectionEnd;
                setCursorPos(document.querySelector("[data-frender-id='" + element.id + "']"), element.selectionStart, element.selectionEnd)
            }, 10)
            
            //setFocusFixed(document.querySelector("[data-frender-id='" + element.id + "']"))
        }

        return element
    })
    
    // Other

    window.frender_components_data = {};

    var compontents_instance_old = componentsInstances;
    componentsInstances = [];
    
    for(var component of components) {
        var componentName = component.name;
        var css = component.scopedCSS;
        var render = component.render;
        var matches = root.querySelectorAll(componentName);
        
        for(var componentItem of matches) {

            var id = parseInt(Math.random() * 160000000000).toString(16);
            var parentId = componentItem.getAttribute("data-frender-id") || ""

            if(compontents_instance_old.length > 0) {
                var old_instance = compontents_instance_old.find(function(x) {
                    return x.parentId == parentId
                })

                id = old_instance.id;
            }

            //window.frender_components_data[id] = component.data();

            for(var [a, b] of Object.entries(component.data())) {
                if(!window.frender_data["comp_" + id + "_" + a]) window.frender_data["comp_" + id + "_" + a] = b;
            }

            componentsInstances.push({
                name: componentName,
                css: css,
                id: id,
                parentId: parentId,
            });

            componentItem.setAttribute("data-component", id);
            componentItem.setAttribute("data-component-class-id", component.id)
            componentItem.innerHTML = prefixScopes(render(), "comp_" + id + "_");

            for(var _ of componentItem.querySelectorAll("*")) { _.setAttribute("data-frender-id", parseInt(Math.random() * 160000000000).toString(16)); }
        }
    }

    tree = createTree(root);

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
                } catch(err) { console.log(err); }

                continue;
            }

            for(var real of vars) {
                var evaluated = eval(
                    replaceState(real.split("{{").join("").split("}}").join(""))//, parentComponentId
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
                el.addEventListener(eventName, function (event) {
                    var callbackName = (b.value);
                    var fullcallback = "";
                    if(callbackName[callbackName.length - 1] == ")") fullcallback = "(function() {" + "window.frender_data." +  callbackName + "})()";
                    else fullcallback = "(function() {" + "window.frender_data." +  callbackName + "($)})()";

                    fullcallback = fullcallback.replace(/\$/g, "'" + event.target.getAttribute("data-component-scope") + "'");
                    eval(fullcallback)
                })
            }
        }
    }

    console.log("%c[frender]", "color: #09f;", (Date.now() - init) + "ms to render");
}

document.addEventListener("DOMContentLoaded", function() {
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

    createCSSScopes(components);

    setInterval(function() {
        if(_old_data != JSON.stringify(_current_data)) {
            render(tree, basic, element);
        }
        
        _old_data = JSON.stringify(_current_data);
        _current_data = window.frender_data;
    }, 15)

    render(tree, basic, element);
});