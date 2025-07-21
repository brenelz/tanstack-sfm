import * as fs from "node:fs";
import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { revalidate } from "../lib/sfm";


export const todosQueryOptions = queryOptions({
    queryKey: ['todos'],
    queryFn: () => getTodos(),
});

const updateTodo = createServerFn({ method: 'POST' }).handler(() => {
    const todos = JSON.parse(fs.readFileSync("data.json", "utf8"));
    todos[0].title = `New Todo ` + Math.random();

    fs.writeFileSync("data.json", JSON.stringify(todos));

    return revalidate([todosQueryOptions as any]);
})


export const getTodos = createServerFn().handler(async () => {
    return JSON.parse(fs.readFileSync("data.json", "utf8"));
})


export const Route = createFileRoute('/sfm')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data: todos } = useSuspenseQuery(todosQueryOptions)
    const { mutate } = useMutation({
        mutationFn: () => updateTodo()
    })
    return <div>
        {JSON.stringify(todos)}
        <button onClick={() => mutate()}>Update Todo</button>
    </div>
}
