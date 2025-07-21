
import { createMiddleware } from "@tanstack/react-start";
import type { QueryOptions } from "@tanstack/react-query";

export function revalidate(queryOptions: Array<QueryOptions>) {
    return {
        action: 'revalidate',
        queryOptions
    }
}
export const singleFlightMiddleware = createMiddleware({ type: 'function' }).server(async (ctx) => {
    const res = await ctx.next();
    if (res.result && res.result.action === 'revalidate') {

        const singleFlightData = await Promise.all(res.result.queryOptions.map(async (queryOptions) => {
            const data = await queryOptions.queryFn();
            return { queryKey: queryOptions.queryKey, data };
        }));
        res.sendContext = {
            singleFlightData
        };
    }
    return res;
}).client(async (ctx) => {
    const res = await ctx.next();
    if (res.context.singleFlightData) {
        res.context.singleFlightData.forEach(({ queryKey, data }) => {
            ctx.router.options.context.queryClient.setQueryData(queryKey, data);
        });
    }
    return res;
})