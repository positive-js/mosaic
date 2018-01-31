
var stylesRegex = /styles *:(\s*\[[^\]]*?\])/g;

module.exports = function (source) {

    var newSource = source.replace(stylesRegex, function (str) {

        if (!str.match(/(\.css)/g)) {
            return str;
        }

        return str.replace(/(\.css)/g, function () {

            return ".scss";
        });
    });

    return newSource;
};
