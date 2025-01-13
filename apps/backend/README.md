# TODO CF Backend

```bash
bunx drizzle-kit generate

bunx wrangler d1 create todo-db
# fix wrangler.toml [[d1_databases]]
bunx wrangler d1 execute todo-db --file=./drizzle/migrations/0000_rainy_wolf_cub.sql
bunx wrangler d1 execute todo-db --file=./drizzle/migrations/0000_rainy_wolf_cub.sql --remote

# for dev
cp .dev.vars.sample .dev.vars
# edit .dev.vars
bun dev

# for prod
# edit wrangler.toml [env.production.vars]
bun run deploy
```
