import { handle } from '@astrojs/cloudflare/handler';
import { publishDue } from './lib/schedule';

type CronContext = { waitUntil(promise: Promise<unknown>): void };

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handle(request, env, ctx);
  },
  scheduled(_controller: ScheduledController, env: Env, ctx: CronContext) {
    ctx.waitUntil(publishDue(env));
  },
};
