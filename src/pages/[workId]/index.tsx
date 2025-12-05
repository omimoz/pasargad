import { Card, Divider, Flex, Tag, Typography, Button, message } from 'antd';
import { useParams } from 'react-router-dom';
import usePosts from '../../hooks/usePosts';
import type { Work } from '../../services/posts/type';
import TextArea from 'antd/es/input/TextArea';
import { useState } from 'react';
import { updatePost } from '../../db/indexDB';
import { queryClient } from "../../libs/react-query";
import { ClockCircleOutlined } from '@ant-design/icons';

const SingleWorkItem = () => {
  const { workId } = useParams();
  const { items, updatePostAsync, isUpdating, isOnline } = usePosts();

  const [newDesc, setNewDesc] = useState("");
  const item: Work | undefined = items.find((i) => Number(i.id) === Number(workId));

  if (!item) return <div>Item not found</div>;

  const handleAddDescription = async () => {
    if (!newDesc.trim()) {
      message.warning("Please enter a description");
      return;
    }
    // eslint-disable-next-line react-hooks/purity
    const time = Date.now().toString();
    const updatedPost: Work = {
      ...item,
      description: [...item.description, newDesc],
      lastModified: time,
      pendingSync: isOnline ? 0 : 1
    };

    if (!isOnline) {
      // ذخیره در IndexedDB
      await updatePost(updatedPost);

      // آپدیت کش React Query → UI فوری آپدیت می‌شود
      queryClient.setQueryData(['posts'], (old: Work[] | undefined) => {
        if (!old) return [updatedPost];
        return old.map(p => p.id == updatedPost.id ? updatedPost : p);
      });

      message.info("Saved offline. Will sync when online.");
      setNewDesc("");
      return;
    }

    // وقتی آنلاین باشیم → مستقیم API
    await updatePostAsync(updatedPost, {
      onSuccess: () => {
        message.success("Description saved");
        setNewDesc("");
      },
      onError: () => {
        message.error("Failed to save");
      }
    });
  };


  function renderTitle(work: Work) {
    return (
      <Flex align='center' justify='space-between'>
        <Typography.Title level={3}>{work.title}</Typography.Title>
        <div>
          <Tag color="blue">{work.type}</Tag>
          <Tag color="default" icon={<ClockCircleOutlined />}>{work.time}</Tag>
          {(work.pendingSync === 1) && (
            <Tag color="orange">Pending Sync</Tag>
          )}
        </div>
      </Flex>
    );
  }

  return (
    <Card title={renderTitle(item)}>
      {item.description.map((desc, index) => (
        <p key={index}>{desc}</p>
      ))}

      <Divider style={{ borderColor: 'blue' }}>Add new description</Divider>

      <TextArea
        rows={4}
        value={newDesc}
        onChange={(e) => setNewDesc(e.target.value)}
        placeholder="Enter description..."
      />

      <Button
        type="primary"
        onClick={handleAddDescription}
        loading={isUpdating}
        style={{ marginTop: 10 }}
      >
        Submit
      </Button>
    </Card>
  );
};

export default SingleWorkItem;
