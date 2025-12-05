import usePosts from "../../hooks/usePosts"
import Show from "../../components/Show"
import WorkList from "../../components/work-list"
import { filterItems } from "../../util/constants"

const Home = () => {
    const { items, isPending, isLoading, isError, handleFilter } = usePosts()
    return (
        <Show>
            <Show.When isTrue={isError}>
                <div>Something went wrong</div>
            </Show.When>
            <Show.Else>
                <WorkList
                    filterItems={filterItems}
                    onFilter={handleFilter}
                    items={items}
                    loading={isPending || isLoading}
                />
            </Show.Else>
        </Show>
    )
}

export default Home