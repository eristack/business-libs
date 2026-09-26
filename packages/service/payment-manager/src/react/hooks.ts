import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { PaymentManagerClient } from "../client/create-client.js";
import type { CreateIntentBody, PaymentIntentBody } from "../rest/types.js";

export function paymentIntentQueryKey(id: string) {
  return ["payment-intent", id] as const;
}

export function usePaymentIntent(
  client: PaymentManagerClient,
  id: string | undefined,
  options?: Omit<UseQueryOptions<PaymentIntentBody>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: paymentIntentQueryKey(id ?? ""),
    queryFn: () => client.getIntent(id!),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreatePaymentIntent(
  client: PaymentManagerClient,
  options?: UseMutationOptions<PaymentIntentBody, Error, CreateIntentBody>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => client.createIntent(input),
    onSuccess: (intent, ...rest) => {
      queryClient.setQueryData(paymentIntentQueryKey(intent.id), intent);
      options?.onSuccess?.(intent, ...rest);
    },
    ...options,
  });
}
