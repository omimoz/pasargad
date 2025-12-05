import { List } from "antd"
import type { ListProps } from "./types"
import ListItem from "./item"
import { style } from "./style"
import HeaderList from "./header-list"

const WorkList = ({ items, loading, filterItems, onFilter }: ListProps) => {
    return (
        <List
            className={style}
            loading={loading}
            header={<HeaderList filters={filterItems} onFilter={onFilter} />}
            bordered
            dataSource={items}
            renderItem={(item) => (
                <ListItem item={item} loading={loading} />
            )}
        />
    )
}

export default WorkList