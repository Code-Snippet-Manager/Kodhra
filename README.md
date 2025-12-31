# Kodhra – Code Snippet Manager

Kodhra is a privately developed **Code Snippet Management platform** created to support structured, long-term code reuse for professional development workflows.

This repository is **informational** in nature and documents the technologies and architecture used to build the system.
It is **not intended as a starter template or cloneable project**.

---

## Purpose

Kodhra was built to solve a personal and professional problem:

* Code logic scattered across projects
* Difficulty reusing verified snippets
* Lack of structure in long-term code storage

The application focuses on **clarity, structure, and reliability**, following traditional web development principles.

---

## Technologies Used

### Frontend

* **HTML5**
* **EJS (Server-Side Rendering)**
* **SCSS (compiled using `sass`)**
* **Vanilla JavaScript**
* **CodeMirror** (syntax highlighting)

> No frontend frameworks or CSS utility libraries are used.

---

### Backend

* **Node.js**
* **Express.js**
* **MongoDB** with **Mongoose**
* **JWT Authentication**
* **Session & Cookie Management**
* **Redis** (session storage & caching)
* **Socket.IO** (real-time features)

---

### Infrastructure & Services

* **Cloudinary** – media storage
* **Nodemailer** – email services
* **Razorpay** – payment integration
* **Archiver** – data export
* **Electron** – desktop packaging
* **esbuild** – bundling & optimization
* **Jest + Supertest** – testing

---

## Development Approach

* Traditional MVC-style backend architecture
* Server-rendered views for SEO and stability
* Minimal client-side abstraction
* Custom SCSS instead of UI frameworks
* Explicit control over data flow and rendering
* Focus on maintainability over trends

---

## Usage Notice

This project is **not provided as an open-source boilerplate**.

* Cloning, redistributing, or using this project as a base template is **not intended**
* Code is shared **for reference and documentation purposes only**
* Business logic, structure, and implementation are proprietary

---

## Ownership

All design decisions, architecture, and implementation are original and part of an ongoing private product.
<h3><b>Kodhra</b> is actively developed and maintained by <strong>Codewithajoydas</strong></h3>

---

## API Endpoints

| Method | Endpoint       | Description                 |
| ------ | -------------- | --------------------------- |
| POST   | `/auth/signup` | Register a new user         |
| POST   | `/auth/login`  | Login user and return token |
| GET    | `/card`        | Get all snippets            |
| POST   | `/card       ` | Create a new snippet        |
| PUT    | `/card/:id`    | Update existing snippet     |
| DELETE | `/card/:id`    | Delete a snippet            |
| GET    | `/card/:id`    | Get a specific snippet      |

---

## Authentication

Kodhra uses **JWT (JSON Web Token)** for secure authentication. Tokens are stored in HTTP-only cookies to prevent client-side tampering.

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
SECRET=your_jwt_secret_key
```

Optional:

```
NODE_ENV=development
```

---

## Screenshots

- Dashboard View
  <img width="1365" height="633" alt="image" src="https://github.com/user-attachments/assets/0bc37a10-b0de-48d0-bf75-ca421b7f50db" />
- Snippet Editor
- <img width="1365" height="635" alt="image" src="https://github.com/user-attachments/assets/6f6ed48b-3731-4d49-9f6c-a46db5cd5bee" />

- Snippets Results
- <img width="1365" height="636" alt="image" src="https://github.com/user-attachments/assets/36b7e9a2-46e2-434f-88c1-3b12f073b4d3" />

---

## Future Plans

- Add AI-powered snippet suggestions.
- Implement syntax-based search.
- Introduce user collaboration and sharing features.
- Support for multiple code editors (VSCode-like experience).
- Offline support with IndexedDB or LocalForage.

---

## Contributing

Contributions are always welcome.
To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to your fork and open a Pull Request.

Follow standard commit message formats and coding conventions.

---

## License

This project is licensed under the **MIT License**.
See the [LICENSE](./LICENSE) file for details.

---

## Author

**Developed by Codewithajoydas**
Passionate about clean, structured, and purposeful code.






 
>>>>>>> feature/draft-sync
