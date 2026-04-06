const express = require('express');
const router = express.Router();
const mailer = require('../utils/mailer');

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
  }

  try {
    const mailOptions = {
      from: `"${name}" <${email}>`, // Note: When using Gmail SMTP, the 'from' address might be rewritten to the authenticated user.
      to: process.env.CONTACT_EMAIL_USER,
      subject: `[Liên hệ mới] ${subject}`,
      text: `Bạn nhận được một liên hệ mới từ nền tảng Tình Nguyện Xanh.\n\nThông tin người gửi:\n- Họ và Tên: ${name}\n- Email: ${email}\n\nChủ đề: ${subject}\n\nNội dung liên hệ:\n${message}`,
    };

    await mailer.sendMail(mailOptions);
    res.status(200).json({ message: 'Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.' });
  } catch (error) {
    console.error('Lỗi khi gửi email liên hệ:', error);
    res.status(500).json({ message: 'Không thể gửi liên hệ vào lúc này. Vui lòng thử lại sau.' });
  }
});

module.exports = router;
