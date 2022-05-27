var vars = {};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    key = decodeURIComponent(key); // removes URI encoding if present
    vars[key] = value;
});

return vars;