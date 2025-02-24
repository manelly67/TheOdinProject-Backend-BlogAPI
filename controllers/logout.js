async function get(req, res, next) {
  req.logout((err) => {
    if (err) {
      next(err);
    }
      return res.status(200).json({
      text: 'successful logout',
      user: undefined,
      token: undefined,
    });
  });
}

module.exports = {
  get,
};
