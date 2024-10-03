import resend from '../config/resend';
import { NODE_ENV } from '../constants/env';

type Params = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

// const getFromEmail = () =>
//   NODE_ENV === 'development' ? 'onboarding@resend.dev' : EMAIL_SENDER;
const getToEmail = (to: string) =>
  NODE_ENV === 'development' ? 'delivered@resend.dev' : to;

export const sendMail = async ({ to, subject, text, html }: Params) => {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: getToEmail(to),
    subject,
    text,
    html,
  });

  return { data, error };
};
