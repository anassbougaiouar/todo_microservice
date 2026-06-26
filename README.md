TP microservices pour gerer des utilisateurs, une connexion simple et des taches TODO.

## Services

- `user-service` : CRUD des utilisateurs avec Flask et PostgreSQL
- `auth-service` : connexion et generation de token avec Spring Boot et MySQL
- `todo-service` : CRUD des taches avec Spring Boot et MySQL
- `api-gateway` : routage NGINX
- `frontend` : interface Angular

## Demarrage

```bash
docker compose up --build
```

- Frontend : `http://localhost:4200`

La commande lance tous les conteneurs, y compris le frontend.
Les exemples ci-dessous utilisent l'URL `http://localhost:8080`.

## Fonctionnement

- `user-service` est la seule source des donnees utilisateurs.
- `auth-service` verifie `username/password` en appelant `user-service`.
- `auth-service` retourne un token simple apres connexion.
- `todo-service` exige `Authorization: Bearer <token>` sur toutes les routes `/todos`.

## Endpoints

### Auth

- `POST /auth/login`
- `GET /auth/validate`

### Users

- `POST /users`
- `GET /users`
- `GET /users/{id}`
- `PUT /users/{id}`
- `DELETE /users/{id}`
- `POST /users/verify`

### Todos

- `POST /todos`
- `GET /todos`
- `GET /todos/user/{userId}`
- `PUT /todos/{id}`
- `DELETE /todos/{id}`

## Exemples `curl`

### Creer un utilisateur

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "1234"
  }'
```

### Se connecter

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "1234"
  }'
```

Reponse attendue :

```json
{
  "message": "Login reussi",
  "token": "....",
  "username": "alice",
  "userId": 1
}
```

### Lister les utilisateurs

```bash
curl http://localhost:8080/users
```

### Ajouter une tache

```bash
curl -X POST http://localhost:8080/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "title": "Faire le TP",
    "description": "Finir la partie microservices",
    "completed": false,
    "userId": 1
  }'
```

### Lister les taches

```bash
curl http://localhost:8080/todos \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Modifier une tache

```bash
curl -X PUT http://localhost:8080/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "title": "Faire le TP",
    "description": "TP termine",
    "completed": true,
    "userId": 1
  }'
```

### Supprimer une tache

```bash
curl -X DELETE http://localhost:8080/todos/1 \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

## Frontend

- `/login` : connexion
- `/users` : ajout et liste des utilisateurs
- `/todos` : gestion des taches

Le frontend appelle uniquement l'API Gateway.
