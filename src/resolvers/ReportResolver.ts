import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';

import { Article, User } from '../entities';
import { checkAuth } from '../middleware/session';
import { IMyContext } from '../types/context';
import { showError } from '../utils';
import { In } from 'typeorm';
import Report from '../entities/Report';
import { ReportMutationResponse } from '../types/response';

@Resolver(() => Report)
export default class ReportResolver {
    @FieldResolver(() => User)
    async user(
        @Root() root: Report,
        @Ctx() { dataLoaders: { userLoader } }: IMyContext,
    ) {
        return await userLoader.load(root.userId);
    }

    @FieldResolver(() => Article)
    async article(
        @Root() root: Report,
        @Ctx() { dataLoaders: { articleLoader } }: IMyContext,
    ) {
        return await articleLoader.load(root.articleId);
    }

    @Mutation(() => ReportMutationResponse)
    @UseMiddleware(checkAuth)
    async report(
        @Arg('articleId') articleId: string,
        @Ctx() { req }: IMyContext,
    ): Promise<ReportMutationResponse> {
        try {
            const existingReport = await Report.findOne({
                where: { articleId, userId: req.session.userId },
            });

            const existingArticle = await Article.findOne({
                where: { id: articleId },
            });

            if (!existingArticle) {
                return {
                    code: 400,
                    success: false,
                    message: 'Article not found',
                };
            }

            existingArticle.reportsCount = existingArticle.reportsCount + 1;
            await existingArticle.save();

            if (existingReport) {
                return {
                    code: 400,
                    success: false,
                    message: 'You have already reported this article',
                };
            }

            const newReport = Report.create({
                articleId,
                userId: req.session.userId,
            });

            return {
                code: 200,
                success: true,
                message: 'report successfully',
                report: await newReport.save(),
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Mutation(() => ReportMutationResponse)
    @UseMiddleware(checkAuth)
    async cancelReport(
        @Arg('articleIds', () => [String]) articleIds: string[],
        @Ctx() { req }: IMyContext,
    ): Promise<ReportMutationResponse> {
        try {
            await Report.delete({
                articleId: In(articleIds),
                userId: req.session.userId,
            });

            return {
                code: 200,
                success: true,
                message: 'Report removed successfully',
            };
        } catch (error) {
            return showError(error);
        }
    }

    @Query(() => [Report], { nullable: true })
    @UseMiddleware(checkAuth)
    async reports(@Ctx() { req }: IMyContext): Promise<Report[] | null> {
        try {
            const reports = await Report.find({
                where: { userId: req.session.userId },
                relations: ['article'],
            });

            return reports;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    @Query(() => Number, { nullable: true })
    async countReportsForArticle(
        @Arg('articleId') articleId: string,
    ): Promise<number | null> {
        try {
            const count = await Report.count({
                where: { articleId },
            });

            return count;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
