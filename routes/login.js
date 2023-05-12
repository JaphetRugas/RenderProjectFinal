var express = require('express');
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
var prisma = new PrismaClient();

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
    
    if (user.password === password) {
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
