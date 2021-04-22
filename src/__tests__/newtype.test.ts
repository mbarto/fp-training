import { Newtype, iso, prism, Concat } from "newtype-ts"
import { NonEmptyString } from "newtype-ts/lib/NonEmptyString"
import { isNonEmptyString } from "newtype-ts/lib/NonEmptyString"
import * as O from "fp-ts/lib/Option"

test("EUR", () => {
    interface EUR extends Newtype<{ readonly EUR: unique symbol }, number> {}

    // isoEUR: Iso<EUR, number>
    const isoEUR = iso<EUR>()

    // myamount: EUR
    const myamount = isoEUR.wrap(0.85)

    // n: number = 0.85
    const n = isoEUR.unwrap(myamount)

    function saveAmount(eur: EUR): void {
        // SAVE
    }

    // saveAmount(0.85) // static error: Argument of type '0.85' is not assignable to parameter of type 'EUR'
    saveAmount(myamount) // ok

    expect(n).toBe(0.85)
})

test("integer", () => {
    interface Integer
        extends Newtype<{ readonly Integer: unique symbol }, number> {}

    const isInteger = (n: number) => Number.isInteger(n)

    // prismInteger: Prism<number, Integer>
    const prismInteger = prism<Integer>(isInteger)

    const int = prismInteger.getOption(2)
    const float = prismInteger.getOption(2.5)

    function double(i: Integer): number {
        return prismInteger.reverseGet(i) * 2
    }

    // double(2) // static error: Argument of type '2' is not assignable to parameter of type 'Integer'
    expect(O.map(double)(int)).toStrictEqual(O.some(4))
    expect(O.map(double)(float)).toBe(O.none)
})

test("concat", () => {
    type String3 = Newtype<{ readonly String3: unique symbol }, string>
    type NonEmptyString3 = Concat<String3, NonEmptyString>

    function isNonEmptyString3(s: unknown): s is NonEmptyString3 {
        return typeof s === "string" && isNonEmptyString(s) && s.length <= 3
    }
    const prismNonEmptyString3 = prism<NonEmptyString3>(isNonEmptyString3)
    const s1 = prismNonEmptyString3.getOption("AAA")
    const s2 = prismNonEmptyString3.getOption("AAAA")
    const s3 = prismNonEmptyString3.getOption("")
    expect(s1).toStrictEqual(O.some("AAA"))
    expect(s2).toStrictEqual(O.none)
    expect(s3).toStrictEqual(O.none)
})
