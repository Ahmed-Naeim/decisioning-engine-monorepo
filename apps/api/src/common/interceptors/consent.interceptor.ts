import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DecisionRequest } from '@palm-interview/shared';

@Injectable()
export class ConsentInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const body: DecisionRequest = request.body;

    if (body && body.consent) {
      // If marketing consent is explicitly false, strip PII
      if (body.consent.marketing === false) {
        console.log(
          '[PII Shield]: Marketing consent false. visitorId stripped.',
        );
        // Mutate the original reference so the @Body() decorator sees it
        body.visitorId = undefined as any;
        body.userId = undefined as any;
        (body as any).userId_pii_stripped_by_privacy_by_design = true;
        // if nested objects have PII, we'd clean them too. For this exercise, visitorId is explicitly requested.
      }
    }

    return next.handle();
  }
}
