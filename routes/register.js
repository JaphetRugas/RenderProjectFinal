const express = require('express');
const router = express.Router();
const session = require('express-session');
const crypto = require('crypto');
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Initialize the session middleware
router.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

/* GET register page. */
router.get('/register', async function(req, res, next) {
  // Check if user is authenticated
  if (req.session.user) {
    var users = await prisma.user.findMany()
    res.render('register', { title: 'Register', users: users });
  } else {
    res.redirect('/login');
  }
});

/* POST register page. */
router.post('/register', async function(req, res, next) {
  const { firstname, lastname, email, password, usertype } = req.body;

  // Encrypt password using SHA256
  const hash = crypto.createHash('sha256');
  hash.update(password);
  const encryptedPassword = hash.digest('hex');

  try { 
    const user = await prisma.user.create({
      data: {
        firstname, 
        lastname, 
        email,
        password: encryptedPassword, // Store encrypted password
        usertype
      },
    });
    res.redirect('/register');
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).render('register', { title: 'Register', error: 'Email already exists.' });
    } else {
      console.error(error);
      res.status(500).render('register', { title: 'Register', error: 'Something went wrong. Please try again later.' });
    }
  }
});

module.exports = router;
