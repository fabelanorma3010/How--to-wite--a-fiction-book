function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function welcomeEmail(name: string, siteUrl: string): { subject: string; html: string; text: string } {
  const displayName = name.trim() || 'there'
  const safeName = escapeHtml(displayName)
  const quizUrl = `${siteUrl}/#quiz`

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#fdf4ff;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf4ff;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:24px;">
            <tr>
              <td style="padding:32px 32px 8px;text-align:center;">
                <span style="font-size:28px;font-weight:800;color:#4a044e;">📖 Storyburst</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px;">
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#1f0a24;">Welcome, ${safeName}! 🎉</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b3a4f;">
                  You're all set. Storyburst has genre tips, story generators, an auto-saving notebook, and a
                  step-by-step publishing guide — everything you need to go from idea to finished book.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:9999px;background-color:#e879f9;">
                      <a
                        href="${quizUrl}"
                        style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#4a044e;text-decoration:none;"
                      >
                        Take the Quiz →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 32px;border-top:1px solid #f3e8ff;">
                <p style="margin:0;font-size:12px;color:#9b8ba0;">You're receiving this because you signed up at Storyburst.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = `Welcome, ${displayName}!

You're all set. Storyburst has genre tips, story generators, an auto-saving notebook, and a step-by-step publishing guide — everything you need to go from idea to finished book.

Take the quiz: ${quizUrl}`

  return { subject: 'Welcome to Storyburst! 📖', html, text }
}
