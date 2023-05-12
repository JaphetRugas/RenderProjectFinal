var express = require('express');
var router = express.Router();

const {PrismaClient, Prisma} = require("@prisma/client")
var prisma = new PrismaClient()

/* GET home page. */
router.get('/register', async function(req, res, next) {
  var users = await prisma.user.findMany()

  res.render('register', { title: 'Express', users: users });
});

/* POST register page. */
router.post('/register', async function(req, res, next) {
  const { firstname, middlename, lastname, age, gender, contact_number, email, password, usertype } = req.body;
  
  try {
    const ageInt = parseInt(age, 10);
    const user = await prisma.user.create({
      data: {
        firstname,
        middlename,
        lastname,
        age: ageInt,
        gender,
        contact_number,
        email,
        password,
        usertype
      },
    });
    res.redirect('/index');
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).render('register', { title: 'Express', error: 'Email already exists.' });
    } else {
      console.error(error);
      res.status(500).render('register', { title: 'Express', error: 'Something went wrong. Please try again later.' });
    }
  }
});

module.exports = router;
