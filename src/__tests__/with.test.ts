import { Lens } from "monocle-ts"

type Person = {
    name: string
    address: {
        street: string
        city: string
    }
    hobbies?: string[]
}

const person: Person = {
    name: "Steve",
    address: {
        street: "country road",
        city: "Denver",
    },
    hobbies: ["Gardening", "Cooking"],
}

test("lens 1", () => {
    const nameLens = new Lens<Person, string>(
        (person) => person.name,
        (name) => (person) => ({ ...person, name }),
    )

    const newPerson = nameLens.modify((_) => "Jane")(person)
    expect(newPerson.name).toBe("Jane")
})

test("lens 2", () => {
    const withProp = Lens.fromPath<Person>()

    const anotherPerson = withProp(["address", "city"]).modify(
        (_) => "Houston",
    )(person)
    expect(anotherPerson.address.city).toBe("Houston")
})
