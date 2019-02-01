'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CommonMonkAPIRouter = undefined;

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommonMonkAPIRouter = exports.CommonMonkAPIRouter = function (_Router) {
    _inherits(CommonMonkAPIRouter, _Router);

    function CommonMonkAPIRouter(monkCollection) {
        _classCallCheck(this, CommonMonkAPIRouter);

        /*
            paging => ?limit=N&offset=N*(page-1)
            filter  => ?fieldName=val1&field2=val2
            sort => ?sort=fieldName Or ?sort=-fieldName
        */
        var _this = _possibleConstructorReturn(this, (CommonMonkAPIRouter.__proto__ || Object.getPrototypeOf(CommonMonkAPIRouter)).call(this));

        _this.router.get('/', function (req, res) {
            var limit = req.query.limit ? Number.parseInt(req.query.limit) : 50;
            var offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
            var sort = req.query.sort ? req.query.sort : '';
            delete req.query.limit;
            delete req.query.offset;
            delete req.query.sort;
            monkCollection.find(req.query, { limit: limit, skip: offset, sort: sort }).then(function (docs) {
                _this.sendResponse(req, res, docs);
            }).catch(function (err) {
                err = err.toString();
                _this.sendResponse(req, res, { error: err != null && err != "" ? err : "Null" }, 500);
            });
        });
        _this.router.get('/:_id/', function (req, res) {
            monkCollection.getOne(req.params._id).then(function (doc) {
                _this.sendResponse(req, res, doc);
            }).catch(function (err) {
                err = err.toString();
                _this.sendResponse(req, res, { error: err != null && err != "" ? err : "Null" }, 500);
            });
        });
        _this.router.post('/new', function (req, res) {
            delete req.body._id;
            req.body.createdAt = _this.now();
            req.body.updatedAt = "";
            monkCollection.insert(req.body).then(function (doc) {
                _this.sendResponse(req, res, doc);
            }).catch(function (err) {
                err = err.toString();
                _this.sendResponse(req, res, { error: err != null && err != "" ? err : "Null" }, 500);
            });
        });
        _this.router.post('/edit/:_id/', function (req, res) {
            delete req.body._id;
            req.body.updatedAt = _this.now();
            monkCollection.editOne(req.params._id, { $set: req.body }).then(function (result) {
                if (result.ok != 1) {
                    _this.sendResponse(req, res, { error: JSON.stringify(result) }, 500);
                    return;
                }
                monkCollection.getOne(req.params._id).then(function (doc) {
                    _this.sendResponse(req, res, doc);
                }).catch(function (err) {
                    err = err.toString();
                    _this.sendResponse(req, res, { error: err != null && err != "" ? err : "Null" }, 500);
                });
            }).catch(function (err) {
                err = err.toString();
                _this.sendResponse(req, res, { error: err != null && err != "" ? err : "Null" }, 500);
            });
        });
        _this.router.all('/delete/:_id/', function (req, res) {
            console.log(req.params._id);
            monkCollection.deleteOne(req.params._id).then(function (result) {
                _this.sendResponse(req, res, result);
            }).catch(function (err) {
                err = err.toString();
                _this.sendResponse(req, res, { error: err != null && err != "" ? err : "Null" }, 500);
            });;
        });
        return _this;
    }

    return CommonMonkAPIRouter;
}(_router2.default);