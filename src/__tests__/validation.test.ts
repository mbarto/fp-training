import { iso, Newtype } from "newtype-ts"
import { PositiveInteger } from "newtype-ts/lib/PositiveInteger"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { sequenceT } from "fp-ts/lib/Apply"
import { pipe } from "fp-ts/lib/function"
import { getSemigroup, NonEmptyArray } from "fp-ts/lib/NonEmptyArray"

// DTO
type UserDto = {
    firstName: string
    lastName: string
    age: number
    sex: string
}

// DOMAIN
export type Gender = "M" | "F" | "X"

export interface FirstName
    extends Newtype<{ readonly FirstName: unique symbol }, string> {}
export interface LastName
    extends Newtype<{ readonly LastName: unique symbol }, string> {}

export const firstNameIso = iso<FirstName>()
export const lastNameIso = iso<LastName>()

type User = {
    firstName: FirstName
    lastName: LastName
    age: PositiveInteger
    gender: Gender
}

type SimpleValidation = (e: UserDto) => E.Either<string, UserDto>

const fieldsNotEmpty: SimpleValidation = (e) => {
    return e.firstName && e.lastName && e.age && e.sex
        ? E.right(e)
        : E.left("Not all required fields were filled in.")
}

const validateGender: SimpleValidation = (e) => {
    return e.sex === "M" || e.sex === "F" || e.sex === "X"
        ? E.right(e)
        : E.left(`Received an invalid sex ${e.sex}`)
}

const validateAge: SimpleValidation = (e) => {
    return e.age >= 18 && e.age < 150
        ? E.right(e)
        : E.left(`Received an invalid age of ${e.age}`)
}

type Validation = (e: UserDto) => E.Either<NonEmptyArray<string>, UserDto>
const fieldsNotEmptyV: Validation = (e) => {
    return e.firstName && e.lastName && e.age && e.sex
        ? E.right(e)
        : E.left(["Not all required fields were filled in."])
}

const validateAgeV: Validation = (e) => {
    return e.age >= 18 && e.age < 150
        ? E.right(e)
        : E.left([`Received an invalid age of ${e.age}`])
}

const validateGenderV: Validation = (e) => {
    return e.sex === "M" || e.sex === "F" || e.sex === "X"
        ? E.right(e)
        : E.left([`Received an invalid sex ${e.sex}`])
}
const applyValidation = sequenceT(E.getValidation(getSemigroup<string>()))

test("simple validation", () => {
    const user: UserDto = {
        firstName: "Mauro",
        lastName: "Bartolomeoli",
        age: 48,
        sex: "M",
    }
    const validated = pipe(
        user,
        fieldsNotEmpty,
        E.chain(validateAge),
        E.chain(validateGender),
    )
    expect(E.getOrElse((_) => "bad")(E.map((_) => "good")(validated))).toBe(
        "good",
    )
})

test("simple validation not valid", () => {
    const user: UserDto = {
        firstName: "",
        lastName: "Bartolomeoli",
        age: 48,
        sex: "M",
    }
    const validated = pipe(
        user,
        fieldsNotEmpty,
        E.chain(validateAge),
        E.chain(validateGender),
    )
    expect(E.getOrElse((e) => e)(E.map((_) => "good")(validated))).toBe(
        "Not all required fields were filled in.",
    )
})

test("simple validation multiple errors", () => {
    const user: UserDto = {
        firstName: "",
        lastName: "Bartolomeoli",
        age: 48,
        sex: "UNKWNOWN",
    }
    const validated = pipe(
        user,
        fieldsNotEmpty,
        E.chain(validateAge),
        E.chain(validateGender),
    )
    expect(E.getOrElse((e) => e)(E.map((_) => "good")(validated))).toBe(
        "Not all required fields were filled in.",
    )
})

test("using applicative", () => {
    const user: UserDto = {
        firstName: "Mauro",
        lastName: "Bartolomeoli",
        age: 48,
        sex: "M",
    }

    const validated = pipe(
        user,
        (e) =>
            applyValidation(
                fieldsNotEmptyV(e),
                validateAgeV(e),
                validateGenderV(e),
            ),
        E.map(([first]) => first),
    )
    expect(E.getOrElse((_) => "bad")(E.map((_) => "good")(validated))).toBe(
        "good",
    )
})

test("using applicative multiple errors", () => {
    const user: UserDto = {
        firstName: "",
        lastName: "Bartolomeoli",
        age: 48,
        sex: "UNKNOWN",
    }

    const validated = pipe(
        user,
        (e) =>
            applyValidation(
                fieldsNotEmptyV(e),
                validateAgeV(e),
                validateGenderV(e),
            ),
        E.map(([first]) => first),
    )
    expect(
        E.getOrElse((e) => e)(E.map((_) => "good")(validated)),
    ).toStrictEqual([
        "Not all required fields were filled in.",
        "Received an invalid sex UNKNOWN",
    ])
})
