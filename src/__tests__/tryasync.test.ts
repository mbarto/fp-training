import { pipe } from "fp-ts/lib/function"
import * as TE from "fp-ts/lib/TaskEither"
import * as E from "fp-ts/Either"
import fetch, { Response } from "node-fetch"

test("fetch ok", async () => {
    const loadStatus = TE.tryCatch(
        () => fetch("https://httpstat.us/200"),
        E.toError,
    )
    const getText = (resp: Response) =>
        TE.tryCatch(() => resp.text(), E.toError)
    const result = await pipe(
        loadStatus,
        TE.chain(() => loadStatus),
        TE.chain(getText),
    )()
    expect(E.getOrElse((_) => "ERROR")(result)).toBe("200 OK")
})

test("fetch error", async () => {
    const loadStatus = TE.tryCatch(
        () => fetch("https://httpstat.us/200"),
        E.toError,
    )
    const getText = (resp: Response) =>
        TE.tryCatch(() => resp.json(), E.toError)
    const result = await pipe(loadStatus, TE.chain(getText))()
    expect(E.getOrElse((_) => "ERROR")(result)).toBe("ERROR")
})
