console.log("🚀 ENTRO AL ENDPOINT send-email");

export default async function handler(req, res) {
    // Solo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { email, name, subject, message } = req.body;

        // Validar datos
        if (!email || !subject || !message) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
console.log("📤 VOY A LLAMAR A SENDGRID");

        // Llamar a SendGrid API
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [{ email, name }],
                        subject
                    }
                ],
                from: {
                    email: 'envioprogramacionsenahp@pm.me',
                    name: 'Sistema de Gestión SENA'
                },
                reply_to: {
                    email: 'envioprogramacionsenahp@pm.me'
                },
                content: [
                    {
                        type: 'text/plain',
                        value: message
                    }
                ]
            })
        });
console.log("📬 RESPUESTA SENDGRID:", sgRes?.status);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.message || 'Error en SendGrid');
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
