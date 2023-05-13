var express = require('express');
var router = express.Router();

const {PrismaClient, Prisma} = require("@prisma/client")
var prisma = new PrismaClient

/* GET admin page. */
router.get('/admin/admindashboard', async function(req, res, next) {
  var users = await prisma.user.findMany()

  res.render('admin/admindashboard', { title: 'Admin', users: users, isEmpty: users.length === 0 });
});

/* GET manager page. */
router.get('/admin/managerdashboard', async function(req, res, next) {
  var users = await prisma.User.findMany()
  res.render('admin/managerdashboard', { title: 'Manager Dashboard', users: users, isEmpty: users.length === 0 });
});

/* GET user page. */
router.get('/admin/userdashboard', async function(req, res, next) {
  var users = await prisma.User.findMany()
  res.render('admin/userdashboard', { title: 'User Dashboard', users: users, isEmpty: users.length === 0 });
});

module.exports = router;
