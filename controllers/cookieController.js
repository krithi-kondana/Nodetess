let cookielicious = {};
cookielicious.addCookie = (res, cookieName, cookieValue) =>
{
    res.setHeader('credentials','include');
    
    res.cookie(cookieName, cookieValue,
    {
        'maxAge': 1000*60*60*24*7, // expires after 7 days, it can be changed
        'path':'/',
        'httpOnly':true
    });
    return res;
}
cookielicious.deleteCookie = (res,cookieName) =>
{
    res.setHeader('credentials','include');
        
    res.cookie(cookieName, '',
    {
        'maxAge': 0, // expires immediately
        'path':'/',
        'httpOnly':true
    });
    return res;
}
cookielicious.readCookie = (req, cookieName) =>
{
    return req.cookies[cookieName];
}
module.exports = cookielicious;