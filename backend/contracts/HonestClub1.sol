// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract HonestClub1 {
    address public clubMaster;
    Member[] public members;
    uint private nextId = 1;
    uint8 public constant MAX_LEVEL = 5;
    bytes32 public staticKey; // 靜態密鑰
    bytes32 public dynamicKey; // 動態密鑰

    struct Member {
        uint id;
        string name;
        string email;
        bool signIn;
        uint8 level;
        uint registerTime;
        address memberAddress;
    }

    event MemberAdded(string name, string email);
    event MemberRemoved(uint id);
    event MemberLevelAdjusted(uint id, uint8 newLevel);
    event MemberSignedIn(uint id);
    event ResetSignIn();

    constructor() {
        clubMaster = msg.sender;
        staticKey = keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender));
        dynamicKey = staticKey;
    }

    modifier onlyMaster() {
        require(msg.sender == clubMaster, "Sender is not the club master");
        _;
    }

    modifier enoughMaster(uint id) {
        require(id < members.length, "Invalid member id");
        _;
    }

    function add_member(string memory name, string memory email) public onlyMaster {
        require(members.length < 20, "Member limit reached");
        members.push(Member(nextId, name, email, false, 1, block.timestamp, msg.sender));
        nextId++;
        // 更新動態密鑰：加上隨機數種子
        dynamicKey = keccak256(abi.encodePacked(dynamicKey));
        emit MemberAdded(name, email); // 發送事件通知前端
    }

    function how_many_members() public view returns (uint) {
        return members.length;
    }

    function remove_member(uint id) public onlyMaster enoughMaster(id) {
        require(id < members.length, "Invalid member ID");  // 確保 ID 合法
        for (uint256 i = id; i < members.length - 1; i++) {
            members[i] = members[i + 1];  // 將後續的會員往前移動
            members[i].id--;
        }
        nextId--;
        members.pop();  // 刪除最後一個重複的會員
        dynamicKey = keccak256(abi.encodePacked(dynamicKey, block.timestamp, block.prevrandao));
        emit MemberRemoved(id);
    }

    function adjustLevel(uint id, uint8 newLevel) public onlyMaster enoughMaster(id) {
        require(newLevel > 0 && newLevel <= MAX_LEVEL, "Invalid level");
        members[id].level = newLevel;
        emit MemberLevelAdjusted(id, newLevel); // 發送事件通知前端
    }

    function signInMember(uint id) public enoughMaster(id) {
        require(msg.sender == clubMaster || msg.sender == members[id].memberAddress, "Only the member or club master can sign in");
        members[id].signIn = true;
        emit MemberSignedIn(id); // 發送事件通知前端
    }

    function resetSignIn() public onlyMaster {
        for (uint256 i = 0; i < members.length; i++) {
            members[i].signIn = false;  // 將每個會員的簽到狀態重置為 false
        }
        emit ResetSignIn(); // 發送事件通知前端
    }

    function getAllMembers() public view returns (Member[] memory) {
        return members;
    }

    // 獲取當前密鑰
    function getKeys() public view returns (bytes32, bytes32) {
        return (staticKey, dynamicKey);
    }
}
