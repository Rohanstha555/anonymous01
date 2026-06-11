import * as React from 'react';
import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
  Hr,
} from "react-email";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Preview>Your verification code: {otp}</Preview>

      {/* Outer bg */}
      <Section style={{ backgroundColor: '#18181b', padding: '40px 0' }}>

        {/* Card */}
        <Section style={{
          maxWidth: '420px',
          margin: '0 auto',
          backgroundColor: '#27272a',
          border: '1px solid #3f3f46',
          borderRadius: '16px',
          padding: '40px 36px',
        }}>

          {/* Logo */}
          <Row>
            <Section style={{ marginBottom: '28px' }}>
              <table>
                <tr>
                  <td>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ color: '#a3e635', fontSize: '14px', margin: '0', lineHeight: '28px', textAlign: 'center' }}>✦</Text>
                    </div>
                  </td>
                  <td style={{ paddingLeft: '8px' }}>
                    <Text style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600', margin: '0' }}>Feedback</Text>
                  </td>
                </tr>
              </table>
            </Section>
          </Row>

          {/* Heading */}
          <Row>
            <Heading as="h2" style={{
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: '600',
              margin: '0 0 8px',
              letterSpacing: '-0.3px',
            }}>
              Verify your email
            </Heading>
          </Row>

          <Row>
            <Text style={{ color: '#71717a', fontSize: '14px', margin: '0 0 28px', lineHeight: '1.6' }}>
              Hi <span style={{ color: '#d4d4d8', fontWeight: '500' }}>@{username}</span>, use the code below to complete your signup. It expires in 10 minutes.
            </Text>
          </Row>

          {/* OTP Box */}
          <Row>
            <Section style={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '28px',
            }}>
              <Text style={{ color: '#71717a', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                Verification code
              </Text>
              <Text style={{
                color: '#a3e635',
                fontSize: '36px',
                fontWeight: '700',
                letterSpacing: '0.2em',
                margin: '0',
                fontFamily: 'monospace',
              }}>
                {otp}
              </Text>
            </Section>
          </Row>

          {/* CTA Button */}
          <Row>
            <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
              <Button
                href={`http://localhost:3000/verify/${username}`}
                style={{
                  backgroundColor: '#a3e635',
                  color: '#18181b',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '10px 28px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Verify my account →
              </Button>
            </Section>
          </Row>

          <Hr style={{ borderColor: '#3f3f46', margin: '0 0 24px' }} />

          {/* Footer note */}
          <Row>
            <Text style={{ color: '#52525b', fontSize: '12px', margin: '0', lineHeight: '1.6' }}>
              If you didn't create a Feedback account, you can safely ignore this email. This code will expire in 10 minutes.
            </Text>
          </Row>

        </Section>

        {/* Bottom footer */}
        <Section style={{ maxWidth: '420px', margin: '20px auto 0', textAlign: 'center' }}>
          <Text style={{ color: '#3f3f46', fontSize: '11px', margin: '0' }}>
            © 2024 Feedback · All rights reserved
          </Text>
        </Section>

      </Section>
    </Html>
  );
}