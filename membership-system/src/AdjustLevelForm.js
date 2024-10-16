import React, { useState } from 'react';
import { Button, InputNumber } from 'antd';

const AdjustLevelForm = ({ member, updateMemberLevel }) => {
  const [level, setLevel] = useState(member?.level || 1);

  const handleSubmit = () => {
    updateMemberLevel(member.id, level);
  };

  return (
    <div>
      <p>會員等級：</p>
      <InputNumber min={1} max={5} value={level} onChange={(value) => setLevel(value)} />
      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleSubmit}>
          調整等級
        </Button>
      </div>
    </div>
  );
};

export default AdjustLevelForm;
