export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, lockerNumber, guestName, checkoutToken } = req.body;

  if (!to || !lockerNumber || !checkoutToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  const checkoutUrl = `https://72park-luggage.vercel.app/?checkout=${lockerNumber}&key=${checkoutToken}`;
  const msgBody = `Locker #${lockerNumber} @ 72 Park. Tap to request pickup:\n${checkoutUrl}`;

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accjson`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: fromNumber, Body: msgBody }).toString(),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Twilio error');
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
