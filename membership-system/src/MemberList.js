import React from 'react';
import { Table, Space, Rate, Switch } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const MemberList = ({ members, deleteMember, toggleCheckIn, updateMemberLevel }) => {
  const columns = [
    {
      title: '簽到狀態',
      key: 'signIn',
      dataIndex: 'signIn',
      width: 120,
      render: (signIn, record) => (
        <Switch
          checked={signIn}
          onChange={() => toggleCheckIn(record.id)}  // 調用傳遞的 toggleCheckIn 函數
          checkedChildren="已簽到"
          unCheckedChildren="未簽到"
        />
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '會員姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '註冊時間',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '會員等級',
      dataIndex: 'level',
      key: 'level',
      width: 180,
      render: (level, record) => (
        <Rate
          value={level}
          onChange={(value) => updateMemberLevel(record.id, value)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <DeleteOutlined
            onClick={() => deleteMember(record.id)}
            style={{ color: 'red', cursor: 'pointer' }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={members.map(member => ({ ...member, key: member.id }))}
        pagination={{ pageSize: 7 }}
      />
    </div>
  );
};

export default MemberList;
