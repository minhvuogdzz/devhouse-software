/**
 * HTML & Text email templates for Dev House Software
 */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates notification email for Dev House internal team
 */
export function buildContactNotificationEmail({ contactDoc, serviceName }) {
  const name = escapeHtml(contactDoc.name);
  const email = escapeHtml(contactDoc.email);
  const phone = escapeHtml(contactDoc.phone || 'Chưa cung cấp');
  const company = escapeHtml(contactDoc.company || 'Không có');
  const service = escapeHtml(serviceName || 'Tư vấn chung');
  const budget = escapeHtml(contactDoc.budget || 'Thỏa thuận');
  const timeline = escapeHtml(contactDoc.timeline || 'Linh hoạt');
  const preferredMethod = escapeHtml(contactDoc.preferredContactMethod || 'email');
  const message = escapeHtml(contactDoc.message || '');
  const ip = escapeHtml(contactDoc.meta?.ip || 'N/A');
  const locale = escapeHtml(contactDoc.meta?.locale || 'vi');
  const sentAt = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const subject = `[Dev House Contact] ${contactDoc.subject || contactDoc.name} (${locale.toUpperCase()})`;

  const text = [
    `=== YÊU CẦU LIÊN HỆ TƯ VẤN MỚI ===`,
    `Thời gian: ${sentAt}`,
    `Họ tên khách hàng: ${contactDoc.name}`,
    `Email: ${contactDoc.email}`,
    `Số điện thoại: ${contactDoc.phone || 'N/A'}`,
    `Công ty: ${contactDoc.company || 'N/A'}`,
    `Dịch vụ quan tâm: ${serviceName || 'N/A'}`,
    `Ngân sách: ${contactDoc.budget || 'N/A'}`,
    `Tiến độ mong muốn: ${contactDoc.timeline || 'N/A'}`,
    `Phương thức liên hệ ưu tiên: ${contactDoc.preferredContactMethod || 'email'}`,
    `Ngôn ngữ web: ${locale}`,
    `Địa chỉ IP: ${ip}`,
    ``,
    `--- NỘI DUNG YÊU CẦU ---`,
    contactDoc.message,
    `==================================`,
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 24px 12px; color: #1e293b; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: #ffffff; padding: 28px 24px; text-align: left; }
    .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 24px; }
    .table-info { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .table-info td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .table-info td.label { width: 35%; color: #64748b; font-weight: 500; }
    .table-info td.val { width: 65%; color: #0f172a; font-weight: 600; }
    .message-box { background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
    .btn-wrap { text-align: center; margin: 28px 0 16px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; box-shadow: 0 2px 6px rgba(37,99,235,0.25); }
    .footer { background: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Dev House Software — Yêu Cầu Tư Vấn Mới</h1>
      <p>Khách hàng vừa gửi thông tin liên hệ từ website</p>
    </div>
    <div class="body">
      <table class="table-info">
        <tr>
          <td class="label">Khách hàng:</td>
          <td class="val">${name}</td>
        </tr>
        <tr>
          <td class="label">Email:</td>
          <td class="val"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
        </tr>
        <tr>
          <td class="label">Số điện thoại:</td>
          <td class="val"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td>
        </tr>
        <tr>
          <td class="label">Công ty / Tổ chức:</td>
          <td class="val">${company}</td>
        </tr>
        <tr>
          <td class="label">Dịch vụ quan tâm:</td>
          <td class="val">${service}</td>
        </tr>
        <tr>
          <td class="label">Ngân sách dự kiến:</td>
          <td class="val">${budget}</td>
        </tr>
        <tr>
          <td class="label">Tiến độ mong muốn:</td>
          <td class="val">${timeline}</td>
        </tr>
        <tr>
          <td class="label">Hình thức liên hệ:</td>
          <td class="val">${preferredMethod}</td>
        </tr>
      </table>

      <div style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 8px;">Nội dung tin nhắn / yêu cầu:</div>
      <div class="message-box">${message}</div>

      <div class="btn-wrap">
        <a href="mailto:${email}?subject=Re:%20Dev%20House%20Software%20-%20T%C6%B0%20v%E1%BA%A5n%20d%E1%BB%8Bch%20v%E1%BB%A5" class="btn">Phản hồi khách hàng ngay</a>
      </div>
    </div>
    <div class="footer">
      Thời gian gửi: ${sentAt} (Giờ VN) &bull; IP: ${ip} &bull; Ngôn ngữ: ${locale.toUpperCase()}<br>
      Dev House Software Co., Ltd &bull; devhousesoftware.inc@gmail.com
    </div>
  </div>
</body>
</html>
  `;

  return { subject, text, html };
}

/**
 * Generates auto-reply confirmation email to customer
 */
export function buildCustomerConfirmationEmail({ contactDoc, serviceName }) {
  const isVi = (contactDoc.meta?.locale || 'vi') === 'vi';
  const name = escapeHtml(contactDoc.name);
  const service = escapeHtml(serviceName || (isVi ? 'giải pháp phần mềm' : 'software solutions'));

  const subject = isVi
    ? 'Dev House Software — Chúng tôi đã nhận được yêu cầu tư vấn của bạn'
    : 'Dev House Software — We received your consultation request';

  const text = isVi
    ? `Kính gửi ${contactDoc.name},\n\nCảm ơn bạn đã liên hệ với Dev House Software.\nChúng tôi đã nhận được thông tin yêu cầu tư vấn về dịch vụ "${serviceName || 'Giải pháp phần mềm'}" của bạn.\n\nĐội ngũ chuyên viên của Dev House sẽ xem xét chi tiết và liên hệ lại với bạn trong vòng 24 giờ làm việc.\n\nNếu có vấn đề khẩn cấp, bạn có thể gửi phản hồi trực tiếp qua email: devhousesoftware.inc@gmail.com.\n\nTrân trọng,\nĐội ngũ Dev House Software\nhttps://devhouse.vn`
    : `Dear ${contactDoc.name},\n\nThank you for reaching out to Dev House Software.\nWe have successfully received your inquiry regarding "${serviceName || 'Software Solutions'}".\n\nOur team is reviewing your requirements and will get back to you within 24 business hours.\n\nIf you have any urgent inquiries, please reply directly to devhousesoftware.inc@gmail.com.\n\nBest regards,\nDev House Software Team\nhttps://devhouse.vn`;

  const html = isVi
    ? `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #1e40af; color: #ffffff; padding: 24px; text-align: left; }
    .body { padding: 24px; font-size: 15px; line-height: 1.6; color: #334155; }
    .footer { background: #f8fafc; padding: 16px 24px; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0; font-size: 18px; color: #ffffff;">Dev House Software</h2>
    </div>
    <div class="body">
      <p>Kính gửi <strong>${name}</strong>,</p>
      <p>Cảm ơn bạn đã liên hệ với <strong>Dev House Software</strong>. Chúng tôi đã nhận được thông tin yêu cầu tư vấn về dịch vụ <strong>${service}</strong> của bạn.</p>
      <p>Đội ngũ chuyên viên kỹ thuật và tư vấn giải pháp của chúng tôi sẽ phân tích yêu cầu và liên hệ lại với bạn qua thông tin đã cung cấp trong vòng <strong>24 giờ làm việc</strong>.</p>
      <p>Nếu bạn có thêm tài liệu hoặc câu hỏi cần giải đáp khẩn cấp, vui lòng phản hồi trực tiếp qua email này.</p>
      <p style="margin-top: 24px;">Trân trọng,<br><strong>Đội ngũ Dev House Software</strong></p>
    </div>
    <div class="footer">
      Dev House Software &bull; Email: devhousesoftware.inc@gmail.com<br>
      Website: <a href="https://devhouse.vn" style="color: #2563eb; text-decoration: none;">devhouse.vn</a>
    </div>
  </div>
</body>
</html>
    `
    : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #1e40af; color: #ffffff; padding: 24px; text-align: left; }
    .body { padding: 24px; font-size: 15px; line-height: 1.6; color: #334155; }
    .footer { background: #f8fafc; padding: 16px 24px; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0; font-size: 18px; color: #ffffff;">Dev House Software</h2>
    </div>
    <div class="body">
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for contacting <strong>Dev House Software</strong>. We have received your consultation inquiry regarding <strong>${service}</strong>.</p>
      <p>Our solution engineering team is reviewing your requirements and will reach back out to you within <strong>24 business hours</strong>.</p>
      <p>If you have any further questions or project briefs, feel free to reply directly to this email.</p>
      <p style="margin-top: 24px;">Best regards,<br><strong>Dev House Software Team</strong></p>
    </div>
    <div class="footer">
      Dev House Software &bull; Email: devhousesoftware.inc@gmail.com<br>
      Website: <a href="https://devhouse.vn" style="color: #2563eb; text-decoration: none;">devhouse.vn</a>
    </div>
  </div>
</body>
</html>
    `;

  return { subject, text, html };
}
