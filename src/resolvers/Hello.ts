import { Query, Resolver } from "type-graphql";

@Resolver()
export default class HelloResolver {
    @Query((returns) => String)
    hello() {
        // fake async in this example
        return "hello";
    }
}
