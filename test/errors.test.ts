import testServer from "../.jest/server"
import { or, rule } from "../src/guards"

describe("error handling", () => {
  it("should handle the error and not use guards error handling", async () => {
    const { graphql } = await server()

    const { errors, data } = await graphql(`
      query {
        testing
      }
    `)

    expect(data).toEqual({ testing: null })
    expect(errors).toBeDefined()
    expect(errors[0].message).toEqual("THIS WILL ALWAYS FAIL")
  })
})

const alwaysFail = async () => {
  throw new Error("THIS WILL ALWAYS FAIL")
}

const ruleThatShouldNotBeCalled = rule()(
  async () => {
    return "SHOULD NEVER BE CALLED" 
  }
)

const server = () => {
  return testServer({
    extensions: [
      () => ({
        typeDefs: `
        type Query {
          testing: String
        }
      `,
        resolvers: {
          Query: {
            testing: () => {
              throw new Error("FROM QUERY")
            },
          },
        },
        middleware: [alwaysFail],
        guards: {
          Query: {
            testing: ruleThatShouldNotBeCalled
          }
        }
      }),
    ],
  })
}