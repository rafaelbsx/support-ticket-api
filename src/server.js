const http = require("node:http");
const tickets = [
  {
    id: 1,
    title: "User cannot access the system",
    status: "open",
  },
  {
    id: 2,
    title: "Report is not loading",
    status: "closed",
  },
];

const server = http.createServer((request, response) => {
  response.setHeader("content-type", "application/json");

  if (request.method === "GET" && request.url === "/tickets") {
    response.statusCode = 200;
    response.end(JSON.stringify({ tickets }));
    return;
  }

  if (request.method === "GET" && request.url.startsWith("/tickets/")) {
    const id = Number(request.url.split("/")[2]);
    const ticket = tickets.find((item) => item.id === id);

    if (!ticket) {
      response.statusCode = 404;
      response.end(JSON.stringify({ message: "Ticket not found" }));
      return;
    }

    response.statusCode = 200;
    response.end(JSON.stringify({ ticket }));
    return;
  }

  if (request.method === "POST" && request.url === "/tickets") {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (typeof data.title !== "string" || data.title.trim() === "") {
          response.statusCode = 400;
          response.end(JSON.stringify({ message: "Title is required" }));
          return;
        }
        const ticket = {
          id: tickets.length + 1,
          title: data.title,
          status: "open",
        };

        tickets.push(ticket);

        response.statusCode = 201;
        response.end(JSON.stringify({ ticket }));
      } catch {
        response.statusCode = 400;
        response.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });

    return;
  }

  if (
    request.method === "PUT" &&
    request.url.startsWith("/tickets/") &&
    request.url.endsWith("/status")
  ) {
    const id = Number(request.url.split("/")[2]);
    const ticket = tickets.find((item) => item.id === id);

    if (!ticket) {
      response.statusCode = 404;
      response.end(JSON.stringify({ message: "Ticket not found" }));
      return;
    }

    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      try {
        const data = JSON.parse(body);
        const allowedStatuses = ["open", "closed"];

        if (!allowedStatuses.includes(data.status)) {
          response.statusCode = 400;
          response.end(JSON.stringify({ message: "Invalid status" }));
          return;
        }
        ticket.status = data.status;

        response.statusCode = 200;
        response.end(JSON.stringify({ ticket }));
      } catch {
        response.statusCode = 400;
        response.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(3000, () => {
  console.log("Servidor disponível em http://localhost:3000");
});
