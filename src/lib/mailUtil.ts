/* eslint-disable @typescript-eslint/restrict-template-expressions */
import nodemailer, { Transporter } from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();
const user = process.env.MAIL_ID || '';
const pass = process.env.MAIL_PASSWORD || '';
const frontUrl = process.env.FRONT_URL || '';

// nodemailer를 사용하여 Gmail SMTP 서버로 메일을 보내는 transporter 생성
const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: user,
    pass: pass,
  },
});

// GET 요청을 처리하는 라우트 핸들러
export const sendMail = (userids: Array<string>, messages: Array<Record<string, any>>) => {
  if (user === '') {
    return;
  }
  for (let i = 0, length = userids.length; i < length; i++) {
    const userid = userids[i];
    const message = messages[i];
    const mailOptions = {
      from: user,
      to: `${userid}@uvc.co.kr`,
      subject: `[MCS] ${message.message}`,
      // 여기서 확인해주세요: <a href="${frontUrl}/apps/${message.url}/id/${message.detailId}?documentBox=${message.documentBox}">이동 <br><br>
      html: `<p> [MCS 알람] ${message.message} <br><br>
         로그 확인 경로: <a href="${frontUrl}">이동 <br><br>
         </a> 문의사항은 MCS 개발팀으로 문의주시기 바랍니다.</p>`,
    };

    // nodemailer의 sendMail 메서드를 사용하여 메일을 보냄
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(info);
      }
    });
  }
};
