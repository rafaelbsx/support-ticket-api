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

function sendJson(response, statusCode, data) {
  response.statusCode = statusCode;
  response.end(JSON.stringify(data));
}
function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}
function routeNotFound(response) {
  sendJson(response, 404, { message: "Route not found" });
}
function listTickets(response) {
  sendJson(response, 200, { tickets });
}

function getTicketById(request, response) {
  const id = Number(request.url.split("/")[2]);
  const ticket = tickets.find((item) => item.id === id);

  if (!ticket) {
    return sendJson(response, 404, { message: "Ticket not found" });
  }
  sendJson(response, 200, { ticket });
}

async function createTicket(request, response) {
  try {
    const data = await readJsonBody(request);

    if (typeof data.title !== "string" || data.title.trim() === "") {
      return sendJson(response, 400, { message: "Title is required" });
    }
    const ticket = {
      id: tickets.length + 1,
      title: data.title,
      status: "open",
    };

    tickets.push(ticket);

    return sendJson(response, 201, { ticket });
  } catch {
    return sendJson(response, 400, { message: "Invalid JSON" });
  }
}

async function updateTicketStatus(request, response) {
  const id = Number(request.url.split("/")[2]);
  const ticket = tickets.find((item) => item.id === id);

  if (!ticket) {
    return sendJson(response, 404, { message: "Ticket not found" });
  }

  try {
    const data = await readJsonBody(request);
    const allowedStatuses = ["open", "closed"];

    if (!allowedStatuses.includes(data.status)) {
      return sendJson(response, 400, { message: "Invalid status" });
    }
    ticket.status = data.status;

    sendJson(response, 200, { ticket });
  } catch {
    sendJson(response, 400, { message: "Invalid JSON" });
  }
}

const server = http.createServer((request, response) => {
  response.setHeader("content-type", "application/json");

  if (request.method === "GET" && request.url === "/tickets") {
    return listTickets(response);
  }

  if (request.method === "GET" && request.url.startsWith("/tickets/")) {
    return getTicketById(request, response);
  }

  if (request.method === "POST" && request.url === "/tickets") {
    return createTicket(request, response);
  }

  if (
    request.method === "PUT" &&
    request.url.startsWith("/tickets/") &&
    request.url.endsWith("/status")
  ) {
    return updateTicketStatus(request, response);
  }

  return routeNotFound(response);
});

server.listen(3000, () => {
  console.log("Servidor disponível em http://localhost:3000");
});
