const http = require("http");
const fs = require("fs");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));
const port = args.port || 3000; 
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

const server = http.createServer((request, response) => {
  let url = request.url;
  response.writeHeader(200, { "Content-Type": "text/html" });
  switch (url) {
    case "/project.html":
      response.write(maniprojectContent);
      response.end();
      break;
    case "/registration.html":
      response.write(maniregistrationContent);
      response.end();
      break;
    default:
      response.write(manihomeContent);
      response.end();
      break;
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
