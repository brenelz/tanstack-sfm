import * as fs from "node:fs";
import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { revalidate } from "../lib/sfm";

export const countQueryOptions = queryOptions({
    queryKey: ['count'],
    queryFn: () => getCount(),
});

const updateCount = createServerFn({ method: 'POST' }).handler(() => {
    const count = JSON.parse(fs.readFileSync("count.txt", "utf8"));

    fs.writeFileSync("count.txt", String(parseInt(count) + 1));

    return revalidate([countQueryOptions as any]);
})

export const getCount = createServerFn().handler(async () => {
    return JSON.parse(fs.readFileSync("count.txt", "utf8"));
})

export const Route = createFileRoute('/sfm')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data: count } = useSuspenseQuery(countQueryOptions)
    const { mutate } = useMutation({
        mutationFn: () => updateCount()
    })
    return <div className="text-center">
        <p>{count}</p>
        <button onClick={() => mutate()}>Update Count</button>
    </div>
}
