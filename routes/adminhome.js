var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const {PrismaClient} = require("@prisma/client");
const { clearScreenDown } = require('readline');
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
    
    // Check if the user email matches the email to be protected
    if (user.email === 'mjjrrugas@tip.edu.ph') {
      // Redirect to admin profile page
      res.redirect('/admin/adminprofile');
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

    const password = req.body.password; // Get the password from the request body

    // Retrieve the hashed password from the database
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const storedPassword = dbUser.password;

    // Hash the entered password using SHA256
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const enteredPassword = hash.digest('hex');

    // Check if the entered password matches the stored password
    if (enteredPassword !== storedPassword) {
      // If passwords don't match, render the delete confirmation page with an error message
      return res.render('admin/adminprofiledelete', { title: 'Delete Admin Profile', user: user, error: 'Incorrect password. Deletion failed.' });
    }

    if (user.email === 'mjjrrugas@tip.edu.ph') {
      // If the user's email is mjjrrugas@tip.edu.ph, do not delete the account
      return res.render('admin/adminprofiledelete', { title: 'Delete Admin Profile', user: user, error: 'Deletion of this account is not allowed.' });
    }

    // Delete the user account from the database
    await prisma.user.delete({
      where: { id: user.id }
    });

    // Clear the user data from the session and redirect to login page
    req.session.user = null;
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    next(err);
  }
});




/* POST update password page. */
router.post('/admin/updatepassword', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Check if the old password matches the registered password
    const hash = crypto.createHash('sha256');
    hash.update(oldPassword);
    const encryptedOldPassword = hash.digest('hex');
    if (encryptedOldPassword !== user.password) {
      // If the old password does not match, show an error message
      res.render('admin/adminprofile', { error: 'Incorrect old password.' });
      return;
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      // If the new password and confirm password do not match, show an error message
      res.render('admin/adminprofile', { error: 'New password and confirm password do not match.' });
      return;
    }

    // Encrypt the new password using SHA256
    const hash2 = crypto.createHash('sha256');
    hash2.update(newPassword);
    const encryptedNewPassword = hash2.digest('hex');

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: encryptedNewPassword }
    });

    // Redirect to dashboard page with success message
    res.render('admin/adminprofile', { success: 'Password updated successfully.' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});
 
/* POST delete manager record */
router.post('/admin/admindeletemanager', async function(req, res, next) {
  try {
    const { userId, password } = req.body;
    const adminUser = req.session.user;
    if (!adminUser || adminUser.usertype !== 'Admin') {
      res.redirect('/login');
      return;
    }

    // Encrypt the entered password using SHA256
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const encryptedPassword = hash.digest('hex');

    // Compare the encrypted password with the stored encrypted password
    if (encryptedPassword !== adminUser.password) {
      res.redirect('/admin/managerdashboard');
      return;
    }

    // Delete the manager record from the database
    await prisma.user.delete({ where: { id: userId } });
    res.redirect('/admin/managerdashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/managerdashboard', { title: 'Manager Dashboard', user: adminUser, error: 'Error occurred during deletion. Please try again.' });
  }
});




// GET admin edit manager page
router.post('/admin/admineditmanager', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }

    const { userId } = req.body; // Retrieve the user ID from the request body

    // Fetch the user record from the database
    const selectedUser = await prisma.user.findUnique({
      where: { id: String(userId) } // Convert id to string
    });

    res.render('admin/admineditmanager', {
      title: 'Edit Manager Data',
      user: selectedUser,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});



// POST admin edit manager record
router.post('/admin/admineditmanagerrecord', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }

    const { userId, email, usertype } = req.body; // Retrieve the form data

    // Update the user record in the database
    const updatedUser = await prisma.user.update({
      where: { id: String(userId) }, // Convert id to string
      data: { email, usertype }
    });
    
     // Render the edit manager page with the updated user data
     res.render('admin/admineditmanager', {
      title: 'Edit Manager Data',
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// POST admin update manager password
router.post('/admin/adminupdatemanagerpassword', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }

    const { userId, newPassword, confirmPassword } = req.body; // Retrieve the form data

    if (newPassword !== confirmPassword) {
      // Passwords don't match, handle the error
      res.render('admin/admineditmanager', {
        title: 'Update Manager Password',
        user: { id: userId },
        error: 'Passwords do not match.'
      });
      return;
    }

    // Encrypt the entered password using SHA256
    const hash = crypto.createHash('sha256');
    hash.update(newPassword);
    const encryptedPassword = hash.digest('hex');

    // Update the user password in the database
    const updatedUser = await prisma.user.update({
      where: { id: String(userId) }, // Convert id to string
      data: { password: encryptedPassword }
    });

    // Render the edit manager page with the updated user data
    res.render('admin/admineditmanager', {
      title: 'Edit Manager Data',
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});



/* POST delete user record */
router.post('/admin/admindeleteuser', async function(req, res, next) {
  try {
    const { userId, password } = req.body;
    const userUser = req.session.user;
    if (!userUser || userUser.usertype !== 'Admin') {
      res.redirect('/login');
      return;
    }

    // Encrypt the entered password using SHA256
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const encryptedPassword = hash.digest('hex');

    // Compare the encrypted password with the stored encrypted password
    if (encryptedPassword !== userUser.password) {
      res.redirect('/admin/userdashboard');
      return;
    }

    // Delete the User record from the database
    await prisma.user.delete({ where: { id: userId } });
    res.redirect('/admin/userdashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/userdashboard', { title: 'User Dashboard', user: userUser, error: 'Error occurred during deletion. Please try again.' });
  }
});




// GET admin edit user page
router.post('/admin/adminedituser', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }

    const { userId } = req.body; // Retrieve the user ID from the request body

    // Fetch the user record from the database
    const selectedUser = await prisma.user.findUnique({
      where: { id: String(userId) } // Convert id to string
    });

    res.render('admin/adminedituser', {
      title: 'Edit User Data',
      user: selectedUser,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});



// POST admin edit user record
router.post('/admin/adminedituserrecord', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }

    const { userId, email, usertype } = req.body; // Retrieve the form data

    // Update the user record in the database
    const updatedUser = await prisma.user.update({
      where: { id: String(userId) }, // Convert id to string
      data: { email, usertype }
    });
    
     // Render the edit user page with the updated user data
     res.render('admin/adminedituser', {
      title: 'Edit User Data',
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// POST admin update user password
router.post('/admin/adminupdateuserpassword', async function(req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/login');
      return;
    }

    const { userId, newPassword, confirmPassword } = req.body; // Retrieve the form data

    if (newPassword !== confirmPassword) {
      // Passwords don't match, handle the error
      res.render('admin/adminedituser', {
        title: 'Update User Password',
        user: { id: userId },
        error: 'Passwords do not match.'
      });
      return;
    }

    // Encrypt the entered password using SHA256
    const hash = crypto.createHash('sha256');
    hash.update(newPassword);
    const encryptedPassword = hash.digest('hex');

    // Update the user password in the database
    const updatedUser = await prisma.user.update({
      where: { id: String(userId) }, // Convert id to string
      data: { password: encryptedPassword }
    });

    // Render the edit user page with the updated user data
    res.render('admin/adminedituser', {
      title: 'Edit User Data',
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    next(err);
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
