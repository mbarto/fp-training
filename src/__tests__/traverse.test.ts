import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as E from "fp-ts/Either"
import * as A from "fp-ts/Array"

type Fun = (n: number) => O.Option<number>
const f: Fun = (n) => (n !== 0 ? O.some(10.0 / n) : O.none)
test("array traverse some", () => {
    expect(pipe([1, 2, 3], A.traverse(O.option)(f))).toEqual(
        O.some([10, 5, 10 / 3]),
    )
})

test("array traverse none", () => {
    expect(pipe([0, 1, 2, 3], A.traverse(O.option)(f))).toEqual(O.none)
})

test("either sequence", () => {
    const o = O.of(1)
    const eo: E.Either<string, O.Option<number>> = E.of(o)
    const sequenced = pipe(
        eo,
        E.map((n: O.Option<number>) => O.map((on: number) => on * 2)(n)),
        E.sequence(O.option),
    )
    expect(sequenced).toStrictEqual(O.some(E.of(2)))
})

test("either traverse", () => {
    const o = O.of(1)
    const eo: E.Either<string, O.Option<number>> = E.of(o)
    const sequenced = E.traverse(O.option)((a: O.Option<number>) =>
        O.map((n: number) => n * 2)(a),
    )(eo)
    expect(sequenced).toStrictEqual(O.some(E.of(2)))
})
