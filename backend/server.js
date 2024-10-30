const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let static_key = crypto.randomBytes(32).toString('hex');
let dynamic_key = static_key;

function hashKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
}

function updateKeyOnAdd() {
    dynamic_key = hashKey(dynamic_key + crypto.randomBytes(16).toString('hex'));
}

function updateKeyOnDelete() {
    dynamic_key = hashKey(dynamic_key);
}

app.get('/api/keys', (req, res) => {
    res.json({ static_key, dynamic_key });
});

app.post('/api/member/add', (req, res) => {
    updateKeyOnAdd(); // 更新 dynamic_key
    res.json({ message: 'Member added', dynamic_key });
});

app.delete('/api/member/delete', (req, res) => {
    updateKeyOnDelete(); // 更新 dynamic_key
    res.json({ message: 'Member deleted', dynamic_key });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
