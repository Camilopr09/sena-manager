const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta para enviar correos a través de Formspree
app.post('/api/send-email', async (req, res) => {
    try {
        const { email, name, subject, message } = req.body;

        const response = await axios.post('https://formspree.io/f/xojwnkdy', {
            email,
            name,
            subject,
            message
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error enviando correo:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
