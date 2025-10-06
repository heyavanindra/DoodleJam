# DoodleJam - a collaborative board app

## how to setup this project

- clone this repo
- Run `pnpm install` in parent folder
- create a .env file in database, http, websocket and websocket folder
- Paste DB connection string as shown below

```javascript
DATABASE_URL= // Your connection string goes here
```

- Run `pnpm prisma migrate dev` in `package/database` folder
- Run ` pnpx prisma generate` to generate prisma client
- Now run `pnpm run dev` in parent folder

## API Testing with Postman (Coming soon)