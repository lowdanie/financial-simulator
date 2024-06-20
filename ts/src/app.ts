import { Person } from "./person"

let person: Person = {
    name: "John",
    birthday: new Date("1990-05-20")
};

console.log(`${person.name}'s birthday is ${person.birthday.toDateString}`);
