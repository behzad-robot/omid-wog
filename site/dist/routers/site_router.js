"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _router = require("../libs/router");

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SiteRouter = function (_Router) {
    _inherits(SiteRouter, _Router);

    function SiteRouter(modules) {
        _classCallCheck(this, SiteRouter);

        //bind functions:
        var _this = _possibleConstructorReturn(this, (SiteRouter.__proto__ || Object.getPrototypeOf(SiteRouter)).call(this));

        _this.requireLogin = _this.requireLogin.bind(_this);
        _this.renderTemplate = _this.renderTemplate.bind(_this);
        return _this;
    }

    _createClass(SiteRouter, [{
        key: "requireLogin",
        value: function requireLogin() {}
    }, {
        key: "renderTemplate",
        value: function renderTemplate(req, res, fileName, data) {
            console.log('renderTEmplate');
            if (!fileName.includes("public/")) fileName = "public/" + fileName;
            try {
                var view_str = fileSystem.readFileSync(path.resolve(fileName)).toString();
                data.head = fileSystem.readFileSync(path.resolve('public/head.html'));
                // data.actionbar = fileSystem.readFileSync(path.resolve('public/nav-bar.html'));
                // data.footer = fileSystem.readFileSync(path.resolve('public/footer.html'));
                console.log(data);
                // return mustache.render(view_str, data);
                res.send(mustache.render(view_str, data));
            } catch (err) {
                res.send("render file failed =>" + err);
            }
        }
    }]);

    return SiteRouter;
}(_router2.default);

exports.default = SiteRouter;