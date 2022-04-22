// Data for FRender

const data = {
    name: "world",
    animals: ["lion", "zebra"],
    num: 1,
    changeName() {
        this.name = "lol"
    },
    changeName2() {
        this.name = "xd"
    },
    printArray(array) {
        return array.join(" ")
    },
    add(num) {
        this.num += num
    }
} 

setTimeout(() => {
    data.changeName()
}, 1000)

window.frender_data = data