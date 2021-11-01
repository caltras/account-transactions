module.exports = (res, error) => {
    res.status(error.status || 500);
    res.send(error.message);
}