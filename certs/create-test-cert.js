const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 开始生成Electron测试证书...\n');

// 创建证书目录
const certDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

try {
  // 1. 生成私钥
  console.log('1. 生成RSA私钥...');
  execSync('openssl genrsa -out certs/private.key 2048', { stdio: 'inherit' });
  
  // 2. 生成证书签名请求
  console.log('\n2. 生成证书签名请求...');
  const csrCommand = 'openssl req -new -key certs/private.key -out certs/certificate.csr -subj "/C=CN/ST=Beijing/L=Beijing/O=My Company/OU=IT Department/CN=My Electron App/emailAddress=admin@myapp.com"';
  execSync(csrCommand, { stdio: 'inherit' });
  
  // 3. 生成自签名证书(PEM)
  console.log('\n3. 生成PEM证书...');
  execSync('openssl x509 -req -days 365 -in certs/certificate.csr -signkey certs/private.key -out certs/certificate.pem', { stdio: 'inherit' });
  
  // 4. 生成PFX证书
  console.log('\n4. 生成PFX证书...');
  execSync('openssl pkcs12 -export -out certs/certificate.pfx -inkey certs/private.key -in certs/certificate.pem -password pass:123456', { stdio: 'inherit' });
  
  console.log('\n✅ 证书生成完成！');
  console.log('\n📁 生成的文件:');
  console.log('   📄 certs/private.key      - 私钥文件');
  console.log('   📄 certs/certificate.csr  - 证书签名请求');
  console.log('   📄 certs/certificate.pem  - PEM证书文件');
  console.log('   📄 certs/certificate.pfx  - PFX证书文件');
  console.log('\n🔑 PFX证书密码: 123456');
  console.log('\n⚠️  注意: 这是测试证书，仅用于开发环境！');
  
} catch (error) {
  console.error('❌ 证书生成失败:', error.message);
  console.log('\n请确保:');
  console.log('1. 已安装OpenSSL并添加到系统PATH');
  console.log('2. 以管理员权限运行此脚本');
}