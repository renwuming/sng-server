const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const cors = require("koa2-cors");

const IS_DEV = process.env.NODE_ENV === "DEV";
// mongodb
const dbStr = IS_DEV
  ? "mongodb://localhost/sng"
  : "mongodb://rwuser:RSYDX-wlcgj1024@192.168.0.247:8635,192.168.0.87:8635/sng?authSource=admin&replSet=true";
const mongoose = require("mongoose");
global.mongoose = mongoose.connect(dbStr, { useUnifiedTopology: true });
global.db = mongoose.connection;

const index = require("./routes/index");

// cors
app.use(
  cors({
    origin: function (ctx) {
      return ctx.request.header.origin;
    },
    maxAge: 5,
    credentials: true,
  })
);

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
