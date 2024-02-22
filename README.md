# Fun-Todo

> [!WARNING]\
>  This project incorporates new and experimental features as part of ongoing
> development. While these features bring exciting possibilities, it's important
> to note that they may not work perfectly or as expected in all scenarios.

A todo list application designed with project-centric organization in mind, 
allowing users to efficiently manage tasks by grouping them into projects. 
With the flexibility to categorize tasks using groups and tags, users can 
further organize their tasks.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development](#development)
3. [Production](#production)

## Getting Started

Follow these steps to get started with the Fun-Todo project:

1. Clone the Git repository:

```shell
git clone https://github.com/hitusss/fun-todo.git
```

2. Create a .env file based on the .env.example provided.

3. Install project dependencies:

```shell
pnpm install
```

## Development

To prepare the database for development run command:

```shell
pnpm run setup
```

This command should generate Prisma Client, deploy migration and seed database.
The seed script create the main user `me@funtodo.com` and 64 other.

To run the development server, use the following command:

```shell
pnpm run dev
```

If you want to run Prisma Studio for database management with the development
server, you can do so with:

```shell
pnpm run dx
```

## Production

To build the project for production, run:

```shell
pnpm run build
```

Once the build is complete, start the production server with:

```shell
pnpm run start
```

Make sure to configure your production environment variables in the .env file.
