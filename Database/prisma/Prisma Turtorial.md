# - Prisma Turtorial
- npm install prisma --save-dev => npx prisma =>npx prisma init =>npx prisma db pull
- mkdir -p prisma/migrations/0_init
- npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
- npx prisma migrate resolve --applied 0_init
- npm install @prisma/client
# This command reads your Prisma schema and generates your Prisma Client library:
- npx prisma generate 




# Note 
- Convert SQL file encoding to UTF8 Encoding
- Make sure cmd has system administrator rights


# 參考官網 https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgresql




