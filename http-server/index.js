const http = require("http");
const fs = require("fs");
const args = require("minimist")(process.argv.slice(2));



let manihomeContent = "";
let maniprojectContent = "";
let maniregistrationContent = "";

fs.readFile("home.html", (err, home) => {
  if (err) {
    throw err;
  }
  manihomeContent = home;
});

fs.readFile("project.html", (err, project) => {
  if (err) {
    throw err;
  }
  maniprojectContent = project;
});

fs.readFile("registration.html", (err, registration) => {
  if (err) {
    throw err;
  }
  maniregistrationContent = registration;
});

http.server = http.createServer((request, response) => {
  let url = request.url;
  response.writeHeader(200, { "Content-Type": "text/html" });
  switch (url) {
    case "/project":
      response.write(maniprojectContent);
      response.end();
      break;
    case "/registration":
      response.write(maniregistrationContent);
      response.end();
      break;
    default:
      response.write(manihomeContent);
      response.end();
      break;
  }
})

.listen(args["port"])
