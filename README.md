<div align="center">

# Short Resource Locator

[![Live Website](https://img.shields.io/badge/Live_Website-Online-success)](https://app.shorturlhub.online)

</div>

A full-stack link management and analytics platform built with Java Spring Boot and Next.js. It handles link shortening while tracking clicks in real-time. Instead of building a monolith, the traffic for link redirection and analytics processing is decoupled using a microservices pattern, preventing high-volume redirects from crashing the database.

**Check out the website at [app.shorturlhub.online](https://app.shorturlhub.online)**



## Architecture

The project is split into four distinct applications:

1. **Dashboard Service (`srlDashboard`)**
   The REST API for users managing their links. Built with Spring Boot 3.5, it handles user authentication (JWT), caching via Redis, and email notifications through Resend. It stores link metadata in MongoDB.

2. **Redirect Service (`shortResourceLocator`)**
   A lean, high-throughput Spring Boot service focused completely on redirecting short links to their original destinations. When a link is clicked, this service fetches the target URL from MongoDB and fires off a message to RabbitMQ with the click metadata before redirecting the user. 

3. **Analytics Service (`srlAnalytics`)**
   This Spring Boot application listens to the RabbitMQ queues. It asynchronously parses the visitor's User-Agent data using `uap-java` and saves detailed metrics to a PostgreSQL database.

4. **Frontend (`frontend`)**
   A Next.js 16 user interface. It connects to the APIs to let users create links and view metrics on interactive visualizations powered by Chart.js and React Simple Maps.

## Tech stack

**Frontend**
- Next.js 16 & React 19
- Chart.js & react-chartjs-2
- react-simple-maps

**Backend**
- Java 25 & Spring Boot 3.5.4
- Spring Security + JWT
- `response-projection-engine` for dynamic REST payloads

**Data and infrastructure**
- MongoDB (Link & User storage)
- PostgreSQL (Analytics storage)
- Redis (Caching)
- RabbitMQ (Asynchronous message processing)

*Note for future scaling: Because the architecture is decoupled, it's possible to upgrade to databases like **ClickHouse** (for analytics) and **Cassandra** (for link storage) if extreme performance is ever needed.*
