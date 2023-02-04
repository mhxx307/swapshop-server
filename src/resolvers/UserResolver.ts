import { Arg, Mutation, Resolver } from 'type-graphql';
import { User } from '../entities/User';
import * as argon2 from 'argon2';

@Resolver()
export default class UserResolver {
    @Mutation((returns) => User, { nullable: true })
    async register(
        @Arg('email') email: string,
        @Arg('username') username: string,
        @Arg('password') password: string,
        @Arg('address') address: string
    ) {
        try {
            const existUser = await User.findOneBy({ username });
            if (existUser) return null;

            const hashPassword = await argon2.hash(password);

            const newUser = User.create({
                username,
                password: hashPassword,
                email,
                address,
            });

            return await User.save(newUser);
        } catch (error) {
            console.log(error);
        }
    }
}
