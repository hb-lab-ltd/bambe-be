const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FLW_PUBLIC_KEY = 'FLWPUBK_TEST-d073fe1e0d5a955ccd680d5fdbf6f476-X';
const FLW_SECRET_KEY = 'FLWSECK_TEST-a640972e93b278ffe7dd8fdb99bdd95b-X';
const FLW_ENCRYPTION_KEY = 'FLWSECK_TESTbea851a011f3';
const nodemailer = require('nodemailer');

// Register
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                username,
                email,
                password_hash: hashedPassword
            }
        });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Agent Registration (public)
exports.registerAgent = async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
        // Check if agent already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Agent with this email already exists.' });
        }
        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({ where: { username: name } });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username is already taken. Please choose another.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const agent = await prisma.user.create({
            data: {
                username: name,
                email,
                phone,
                password_hash: hashedPassword,
                role: 'agent',
                status: 'pending',
            }
        });
        // Send registration notification email
        if (agent && agent.email) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: agent.email,
                subject: 'Your Agent Account Registration on Umuhuza',
                text: `Hello ${agent.username},\n\nYour agent account has been created. Please pay 5000 RWF with Flutterwave to activate your account and start adding products.`,
                html: `<p>Hello <b>${agent.username}</b>,</p><p>Your agent account on <b>Umuhuza</b> has been created.<br><b>To activate your account and start adding products, please pay <span style='color:#38B496;'>5000 RWF</span> with Flutterwave.</b></p>`
            });
        }
        res.status(201).json({ id: agent.id, message: 'Agent registered. Please pay to activate your account.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Initiate Flutterwave payment for agent
exports.agentPay = async (req, res) => {
    const { agentId, phone } = req.body;
    try {
        // Get agent info
        const agent = await prisma.user.findUnique({ where: { id: Number(agentId) } });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });
        // Create payment link
        const paymentData = {
            tx_ref: `agent-activation-${agentId}-${Date.now()}`,
            amount: 5000,
            currency: 'RWF',
            redirect_url: `https://umuhuzaonline.com/agent-payment?agentId=${agentId}`,
            customer: {
                email: agent.email,
                phonenumber: phone,
                name: agent.username
            },
            customizations: {
                title: 'Agent Account Activation',
                description: 'Pay 5000 RWF to activate your agent account',
                logo: 'https://www.hblab.rw/assets/logo-icon-CEE7uAZO.png'
            }
        };
        const flwRes = await axios.post(
            'https://api.flutterwave.com/v3/payments',
            paymentData,
            { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
        );
        if (flwRes.data && flwRes.data.status === 'success') {
            // Store tx_ref for later status check
            global.agentPayments = global.agentPayments || {};
            global.agentPayments[agentId] = { tx_ref: paymentData.tx_ref, status: 'pending' };
            return res.json({ status: 'pending', link: flwRes.data.data.link });
        } else {
            return res.status(500).json({ error: 'Failed to create payment link' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Payment initiation failed', details: err.message });
    }
};

// Check Flutterwave payment status
exports.agentPaymentStatus = async (req, res) => {
    const agentId = req.params.agentId;
    global.agentPayments = global.agentPayments || {};
    const payment = global.agentPayments[agentId];
    if (!payment) return res.json({ status: 'not_found' });
    try {
        // Check payment status from Flutterwave
        const verifyRes = await axios.get(
            `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${payment.tx_ref}`,
            { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
        );
        if (verifyRes.data && verifyRes.data.status === 'success' && verifyRes.data.data.status === 'successful') {
            // Update agent status to active
            await prisma.user.update({ where: { id: Number(agentId) }, data: { status: 'active' } });
            payment.status = 'success';
            // Send activation email to agent
            const agent = await prisma.user.findUnique({ where: { id: Number(agentId) } });
            if (agent && agent.email) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: agent.email,
                    subject: 'Your Agent Account is Activated!',
                    text: `Hello ${agent.username},\n\nYour agent account on Umuhuza has been activated. You can now add products and manage your listings.`,
                    html: `<p>Hello <b>${agent.username}</b>,</p><p>Your agent account on <b>Umuhuza</b> has been <span style='color:#38B496;font-weight:bold;'>activated</span>!<br>You can now add products and manage your listings.</p>`
                });
            }
            return res.json({ status: 'success' });
        } else {
            return res.json({ status: 'pending' });
        }
    } catch (err) {
        return res.json({ status: 'pending' });
    }
};
