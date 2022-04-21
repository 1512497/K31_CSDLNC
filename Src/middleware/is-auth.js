module.exports = (req, res, next) => {
    return !req.session.isLoggedIn ? res.redirect('/login') : next();
};
