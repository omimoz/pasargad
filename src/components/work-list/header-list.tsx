import { Button, Flex, Popover, Radio, Typography } from 'antd'
import type { HeaderListProps } from './types'

const HeaderList = ({ filters = [], onFilter }: HeaderListProps) => {
    const renderContent = (
        <Radio.Group vertical >
            {filters.map((filter) => (
                <Radio
                    onClick={() => onFilter(filter.value, filter.label)}
                    value={`${filter.value}-${filter.label}`}
                    key={`${filter.value}-${filter.label}`}
                >
                    {filter.label} - {filter.value}
                </Radio>
            ))}
        </Radio.Group>
    )

    return (
        <Flex justify="space-between" align="center">
            <Typography.Title level={3}>Work List</Typography.Title>

            <Popover content={renderContent} title="Filters" trigger="click">
                <Button type="primary">Filter</Button>
            </Popover>
        </Flex>
    )
}

export default HeaderList
