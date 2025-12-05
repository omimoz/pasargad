import { Flex, List, Skeleton, Tag } from 'antd'
import type { ListItemProps } from './types'
import { useNavigate } from 'react-router-dom'
import { EditOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
const { Title } = Typography;
const Item = ({ item, loading }: ListItemProps) => {

    const navigate = useNavigate()

    const actions: React.ReactNode[] = [
        <Tag color="default" icon={<ClockCircleOutlined />}>{item.time}</Tag>
    ];

    return (
        <List.Item actions={actions} className='list-item' onClick={() => navigate(`/${item.id}`, { state: item })} >
            <Skeleton title={false} loading={loading} active>
                <List.Item.Meta
                    title={
                        <Flex gap="small" align="center" justify='start'>
                            <Flex gap="small" align="center" wrap>

                                <Title level={4}>{item.title}</Title>
                                <Tag color="blue">{item.type}</Tag>
                            </Flex>
                            {item.lastModified && item.lastModified > item.created && <Tag color="orange"><EditOutlined /></Tag>}
                        </Flex>}
                    description={item.description?.[0]}
                />
            </Skeleton>
        </List.Item>
    )
}

export default Item