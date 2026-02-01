const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de correo
const EMAIL_CONFIG = {
    FROM_EMAIL: 'notificaciones@coordinacioncaas.com',
    FROM_NAME: 'notificaciones@coordinacioncaas.com'
};

// Inicializar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Ruta para enviar correos a través de SendGrid con Domain Authentication
app.post('/api/send-email', async (req, res) => {
    try {
        const { email, name, subject, message } = req.body;

        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SENDGRID_API_KEY no está configurada');
        }

        const msg = {
            to: email,
            from: {
                email: EMAIL_CONFIG.FROM_EMAIL,
                name: EMAIL_CONFIG.FROM_NAME
            },
            replyTo: email,
            subject: subject,
            text: message,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <pre style="white-space: pre-wrap; word-wrap: break-word;">${message}</pre>
                    <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;">
                    <small style="color: #999;">
                        Este es un mensaje automático del Sistema de Gestión SENA.
                        Por favor no responda a este correo.
                    </small>
                </div>
            `
        };

        await sgMail.send(msg);

        res.json({ success: true, message: 'Correo enviado exitosamente' });
    } catch (error) {
        console.error('Error enviando correo:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
