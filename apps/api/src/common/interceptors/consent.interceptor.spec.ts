import { ConsentInterceptor } from './consent.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ConsentInterceptor', () => {
  let interceptor: ConsentInterceptor;

  beforeEach(() => {
    interceptor = new ConsentInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should nullify visitorId and userId if marketing is false', (done) => {
    const mockRequest = {
      body: {
        id: 'req-1',
        visitorId: 'visitor-123',
        userId: 'user-456',
        consent: { marketing: false, analytics: true, necessary: true },
        context: { country: 'US' },
        timestamp: 123456789,
      },
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of('next handler reached'),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toBe('next handler reached');
        expect(mockRequest.body.visitorId).toBeNull();
        expect(mockRequest.body.userId).toBeNull();
        expect(mockRequest.body.userId_pii_stripped_by_privacy_by_design).toBe(
          true,
        );
        done();
      },
    });
  });

  it('should NOT nullify visitorId if marketing is true', (done) => {
    const mockRequest = {
      body: {
        visitorId: 'visitor-123',
        consent: { marketing: true },
      },
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of('next handler reached'),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        expect(mockRequest.body.visitorId).toBe('visitor-123');
        done();
      },
    });
  });

  it('should handle requests without consent cleanly', (done) => {
    const mockRequest = {
      body: {
        visitorId: 'visitor-123',
      },
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of('ok'),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        expect(mockRequest.body.visitorId).toBe('visitor-123');
        done();
      },
    });
  });
});
