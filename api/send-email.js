console.log("🚀 ENTRO AL ENDPOINT send-email");

export default async function handler(req, res) {
    // Solo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { email, name, subject, message, templateId, templateData } = req.body;

        console.log('📧 Datos recibidos:', { 
            email, 
            name, 
            templateId,
            hasTemplateData: !!templateData 
        });

        // Validar datos según si usa plantilla o mensaje directo
        if (!email) {
            return res.status(400).json({ error: 'Email es requerido' });
        }

        // Si usa plantilla de SendGrid
        if (templateId && templateData) {
            console.log('✅ Usando plantilla SendGrid:', templateId);
            console.log('📋 Template data:', JSON.stringify(templateData, null, 2));
            
            const payload = {
                personalizations: [
                    {
                        to: [{ email, name }],
                        dynamic_template_data: templateData
                    }
                ],
                from: {
                    email: 'notificaciones@coordinacioncaas.com',
                    name: 'Sistema de Gestión SENA'
                },
                reply_to: {
                    email: 'notificaciones@coordinacioncaas.com'
                },
                template_id: templateId
            };

            console.log('📤 Enviando a SendGrid:', JSON.stringify(payload, null, 2));

            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('📥 Respuesta de SendGrid:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error de SendGrid:', errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                throw new Error(errorData.errors?.[0]?.message || errorText || 'Error en SendGrid');
            }

            console.log('✅ Correo enviado exitosamente con plantilla');
            return res.status(200).json({ success: true });
        }

        // Si usa mensaje directo (modo legacy)
        console.log('📝 Usando mensaje directo (sin plantilla)');
        if (!subject || !message) {
            return res.status(400).json({ error: 'Subject y message son requeridos para envío directo' });
        }

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
                    email: 'notificaciones@coordinacioncaas.com',
                    name: 'Sistema de Gestión SENA'
                },
                reply_to: {
                    email: 'notificaciones@coordinacioncaas.com'
                },
                content: [
                    {
                        type: 'text/plain',
                        value: message
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.message || 'Error en SendGrid');
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('❌ Error completo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
