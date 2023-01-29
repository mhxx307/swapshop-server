import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
    @Query((returns) => String)
    hello() {
        // fake async in this example
        return "hello";
    }
}
