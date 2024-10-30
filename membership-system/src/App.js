import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import MemberList from './MemberList';
import MemberForm from './MemberForm';
import { Modal, Button } from 'antd'; // 引入 Modal 和 Button
import './App.css';

// 部署後的智能合約地址
const CONTRACT_ADDRESS = '0x177D7B2A23D674160F20C26aca30d0031DA3d6f6';
// 合約的 ABI
const CONTRACT_ABI = [
    "constructor()",
    "function add_member(string name, string email) public",
    "function how_many_members() public view returns (uint256)",
    "function remove_member(uint256 id) public",
    "function adjustLevel(uint256 id, uint8 newLevel) public",
    "function signInMember(uint256 id) public",
    "function resetSignIn() public",
    "function getAllMembers() public view returns (tuple(uint id, string name, string email, bool signIn, uint8 level, uint registerTime, address memberAddress)[])",
    "event MemberAdded(string name, string email)",
    "event MemberRemoved(uint256 id)",
    "event MemberLevelAdjusted(uint256 id, uint8 newLevel)",
    "event MemberSignedIn(uint256 id)",
    "event ResetSignIn()"
];

// Infura 配置信息
const INFURA_PROJECT_ID = process.env.INFURA_API_KEY;
const INFURA_URL = `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`;

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [members, setMembers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制模態框顯示
  const [staticKey, setStaticKey] = useState('');
  const [dynamicKey, setDynamicKey] = useState('');

  // 初始化 ethers.js，連接到 MetaMask 或 Infura
  useEffect(() => {
    const initBlockchain = async () => {
      let provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);  // v6 中使用 BrowserProvider
      } else {
        provider = new ethers.JsonRpcProvider(INFURA_URL); // 使用 Infura 作為後備
      }

      const signer = await provider.getSigner(); // 明確使用 await 來獲取 signer
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer); // 初始化合約
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
    };

    initBlockchain();
    fetchKeys();
    
  }, []);

  const fetchKeys = async () => {
    const response = await axios.get('http://localhost:5000/api/keys');
    setStaticKey(response.data.static_key);
    setDynamicKey(response.data.dynamic_key);
  };

  // 獲取會員列表
  const fetchMembers = async () => {
    try {
      const members = await contract.getAllMembers(); // 使用合約中的 getAllMembers 方法
      console.log(members); // 確認抓取到的會員資料
      const formattedMembers = members.map(member => ({
        id: Number(member.id),
        name: member.name,
        email: member.email,
        level: Number(member.level),
        signIn: member.signIn,
        registrationDate: new Date(Number(member.registerTime) * 1000).toLocaleDateString(),
      }));
      setMembers(formattedMembers); // 設定格式化後的會員資料
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchMembers(); // 合約初始化後立即獲取會員列表
    }
  }, [contract]);

  // 打開模態框
  const showModal = () => {
    setIsModalVisible(true);
  };

  // 關閉模態框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 會員簽到
  const toggleCheckIn = async (id) => {
    try {
      const tx = await contract.signInMember(id - 1);  // 調用合約的簽到函數
      await tx.wait();  // 等待交易完成
      fetchMembers();   // 簽到後重新獲取會員列表
    } catch (error) {
      console.error("Error signing in member:", error);
    }
  };

  // 添加會員
  const addMember = async (member) => {
    try {
      const tx = await contract.add_member(member.name, member.email);
      await tx.wait(); // 等待交易完成
      console.log("Transaction confirmed");
      await axios.post('http://localhost:5000/api/member/add');  // 更新動態 Key
      fetchKeys(); // 刷新密鑰顯示
      fetchMembers();  // 成功後重新獲取會員列表
      setIsModalVisible(false); // 成功後關閉模態框
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  // 更新會員等級
  const updateMemberLevel = async (id, level) => {
    try {
      const tx = await contract.adjustLevel(id - 1, level);
      await tx.wait(); // 等待交易完成
      fetchMembers();  // 成功後重新獲取會員列表
    } catch (error) {
      console.error("Error updating member level:", error);
    }
  };

  // 重置所有會員簽到
  const resetSignIn = async () => {
    try {
      const tx = await contract.resetSignIn();  // 調用合約的重置簽到函數
      await tx.wait();  // 等待交易完成
     fetchMembers();   // 重置簽到後重新獲取會員列表
   } catch (error) {
      console.error("Error resetting sign-ins:", error);
   }
  };

  // 刪除會員
  const deleteMember = async (id) => {
    try {
      const tx = await contract.remove_member(id - 1);  // 確保這裡傳遞的是會員的索引值，根據合約邏輯，id - 1
      await tx.wait();  // 等待交易完成
      await axios.delete('http://localhost:5000/api/member/delete');  // 更新動態 Key
      fetchKeys(); // 刷新密鑰顯示
      fetchMembers();   // 刪除後重新獲取會員列表
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };


  return (
    <div className="app-container">
      <h1>會員資料管理系統</h1>
      <MemberList
        members={members}
        toggleCheckIn={toggleCheckIn}
        updateMemberLevel={updateMemberLevel}
        deleteMember={deleteMember}
      />
      <div className="center-button">
        <Button type="primary" onClick={showModal}>新增會員</Button>
        <Button type="danger" onClick={resetSignIn} style={{ marginLeft: '10px' }}>重置簽到</Button>
      </div>
      <div class="key-display">
        <p>靜態 Key: {staticKey}</p>
        <p>動態 Key: {dynamicKey}</p>
      </div>
      <Modal
        title="新增會員"
        open={isModalVisible}
        footer={null}
        onCancel={handleCancel}
      >
        <MemberForm addMember={addMember} />
      </Modal>
    </div>
  );
};

export default App;
