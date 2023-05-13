var express = require('express');
var router = express.Router();

const {PrismaClient, Prisma} = require("@prisma/client")
var prisma = new PrismaClient

/* GET home page. */
router.get('/manager/manager', async function(req, res, next) {
  var users = await prisma.User.findMany()

  res.render('manager/manager', { title: 'Express', users: users });
});


module.exports = router;
