const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const crypto = require('crypto');
const prisma = new PrismaClient();

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});
 
/* POST login. */
router.post('/login', async function(req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      res.status(401).send("Invalid email or password");
      return;
    }

    // Encrypt the password entered by the user
    const encryptedPassword = crypto.createHash('sha256').update(password).digest('hex');

    if (user.password === encryptedPassword) {
      // Redirect user based on their userType
      switch (user.usertype) {
        case "Admin":
          res.redirect("/admin");
          break;
        case "Manager":
          res.redirect("/manager");
          break;
        case "User":
          res.redirect("/user");
          break;
        default:
          res.status(400).send("Invalid userType");
      }
    } else {
      res.status(401).send("Invalid email or password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
