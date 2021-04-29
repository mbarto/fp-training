import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as A from "fp-ts/Apply"

test("ap", () => {
    const f = (a: string) => (b: number) => (c: boolean): string =>
        a + String(b) + (c ? "true" : "false")

    expect(
        pipe(O.of(f), O.ap(O.of("s")), O.ap(O.of(1)), O.ap(O.of(true))),
    ).toEqual(O.some("s1true"))
})

test("sequence", () => {
    const f = (a: string, b: number, c: boolean): string =>
        a + String(b) + (c ? "true" : "false")

    const optionSequenceT = A.sequenceT(O.option)

    expect(
        pipe(
            optionSequenceT(O.of("s"), O.of(1), O.of(true)),
            O.map(([a, b, c]) => f(a, b, c)),
        ),
    ).toEqual(O.some("s1true"))
})
