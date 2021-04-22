import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import { Do } from "fp-ts-contrib/Do"

test("do", () => {
    const f = (a: string, b: number, c: boolean): string =>
        a + String(b) + (c ? "true" : "false")

    expect(
        Do(O.option)
            .bind("a", O.of("s"))
            .bind("b", O.of(1))
            .bind("c", O.of(true))
            .return(({ a, b, c }) => f(a, b, c)),
    ).toEqual(O.some("s1true"))
})

test("do none", () => {
    const f = (a: string, b: number, c: boolean): string =>
        a + String(b) + (c ? "true" : "false")

    expect(
        Do(O.option)
            .bind("a", O.of("s"))
            .bind("b", O.of(1))
            .bind("c", O.none)
            .return(({ a, b, c }) => f(a, b, c)),
    ).toEqual(O.none)
})

test("bind", () => {
    const f = (a: string, b: number, c: boolean): string =>
        a + String(b) + (c ? "true" : "false")

    expect(
        pipe(
            O.bindTo("a")(O.of("s")),
            O.bind("b", () => O.of(1)),
            O.bind("c", () => O.of(true)),
            O.map(({ a, b, c }) => f(a, b, c)),
        ),
    ).toEqual(O.some("s1true"))
})

test("bind none", () => {
    const f = (a: string, b: number, c: boolean): string =>
        a + String(b) + (c ? "true" : "false")

    expect(
        pipe(
            O.bindTo("a")(O.of("s")),
            O.bind("b", () => O.of(1)),
            O.bind("c", () => O.none),
            O.map(({ a, b, c }) => f(a, b, c)),
        ),
    ).toEqual(O.none)
})