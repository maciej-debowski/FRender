// Data for FRender

class HelloComponent {
    constructor() {}

    name = "HelloComponent"
    scopedCSS = `.heading { color: red; }`;
    data() {
        return {
            name: "World",
            changeName(scope) {
                this[scope + "name"] = "You"
            }
        }
    }

    render() {
        return `<div>
            <h1 class="heading">Hello, {{ @name }} !</h1>
            <button f-click="changeName($)">Change name</button>
        </div>`;
    }
}

const data = {
    animals: ["lion", "zebra"],
    num: 1,
    printArray(array) {
        return array.join(" ")
    },
    add(num) {
        this.num += num
    }
} 

window.frender_data = data
window.frender_components = [ HelloComponent ]