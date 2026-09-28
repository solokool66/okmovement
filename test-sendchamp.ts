import * as https from 'https';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.SENDCHAMP_PUBLIC_KEY;
const data = JSON.stringify({
  recipient: "2347038052104",
  message: "Test message",
  sender: "Sendchamp",
  type: "text"
});

const options = {
  hostname: 'api.sendchamp.com',
  port: 443,
  path: '/api/v1/whatsapp/message/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log("Response:", body));
});

req.on('error', (e) => console.error("Error:", e));
req.write(data);
req.end();
