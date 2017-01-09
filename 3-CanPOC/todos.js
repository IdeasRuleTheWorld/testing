var Todo = can.Construct.extend({}, {
    description: 'Something to do.',
    author: 'Unknown',
    allowedToEdit: function () {
        return true;
    },
    completed: false
});

console.log(new Todo());


/* Observables*/

var person = new can.Observe({
    name: "name",
    age: 25
})

person.bind("change", function (a, b, c, d, e) {
    console.log(arguments);
    debugger;
});

person.bind("name", function (a, b, c) {
    debugger;
})

person.attr("name", "Vamsi");
person.attr("age", "Vamsi");
person.removeAttr("name");