const fs = require('fs');
const fetch = global.fetch || require('node-fetch');
const FormData = require('form-data');

(async () => {
  try {
    const url = 'http://localhost:3000/api/admin/upload-product';
    const fd = new FormData();
    fd.append('type', 'content');
    fd.append('section', 'home_welcome');
    fd.append('html', '<p>Test content</p>');
    fd.append('password', 'EmmanuelMusic2024!');

    const res = await fetch(url, { method: 'POST', body: fd });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Error:', err);
  }
})();