var express = require('express');
var router = express.Router();

const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

/* GET admin page. */
router.get('/admin/admindashboard', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }
    
    const query = req.query.q // Get the value of the 'q' parameter from the query string
    const users = await prisma.user.findMany()
    let filteredUsers = users.filter(user => user.usertype === 'Admin')

    if (query) { // If a search query is provided, filter the results
      filteredUsers = filteredUsers.filter(user => {
        const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`
        return fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase())
      })
    }

    res.render('admin/admindashboard', { title: 'Admin', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
  } catch (err) {
    console.error(err)
    next(err)
  }
});

/* GET manager page. */
router.get('/admin/managerdashboard', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }
    const query = req.query.q // Get the value of the 'q' parameter from the query string
    const users = await prisma.user.findMany()
    let filteredUsers = users.filter(user => user.usertype === 'Manager')

    if (query) { // If a search query is provided, filter the results
      filteredUsers = filteredUsers.filter(user => {
        const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`
        return fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase())
      })
    }

    res.render('admin/managerdashboard', { title: 'Manager', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
  } catch (err) {
    console.error(err)
    next(err)
  }
});

/* GET user page. */
router.get('/admin/userdashboard', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }
    const query = req.query.q // Get the value of the 'q' parameter from the query string
    const users = await prisma.user.findMany()
    let filteredUsers = users.filter(user => user.usertype === 'User')

    if (query) { // If a search query is provided, filter the results
      filteredUsers = filteredUsers.filter(user => {
        const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`
        return fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase())
      })
    }

    res.render('admin/userdashboard', { title: 'User', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
  } catch (err) {
    console.error(err)
    next(err)
  }
});

/* GET admin profile page. */ 
router.get('/admin/adminprofile', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }

    res.render('admin/adminprofile', { title: 'Admin Profile', user: user });
  } catch (err) {
    console.error(err)
    next(err)
  }
});

/* GET admin profile delete confirmation page. */ 
router.get('/admin/adminprofiledelete', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }

    res.render('admin/adminprofiledelete', { title: 'Delete Admin Profile', user: user });
  } catch (err) {
    console.error(err)
    next(err)
  }
});

/* POST admin profile delete confirmation page. */
router.post('/admin/adminprofiledeleteconfirm', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session

    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }

    // Delete the user account from the database
    await prisma.user.delete({
      where: { id: user.id }
    });

    // Clear the user data from the session and redirect to login page
    req.session.user = null;
    res.redirect('/login');
  } catch (err) {
    console.error(err)
    next(err)
  }
});


/* GET logout page. */
router.get('/admin/logout', function(req, res, next) {
  req.session.destroy(err => {
    if (err) {
      console.error(err)
    } else {
      res.redirect('/login')
    }
  })
});

module.exports = router;
