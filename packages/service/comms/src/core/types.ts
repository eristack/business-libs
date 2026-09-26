export type CommsChannel = "email" | "sms" | "whatsapp";

export type CommsMessageStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "failed"
  | "bounced";

export type HeaderBag = {
  get(name: string): string | null | undefined;
};

export type CommsMessageRecord = {
  id: string;
  channel: CommsChannel;
  vendor: string;
  idempotencyKey: string;
  status: CommsMessageStatus;
  to: string;
  subject?: string;
  providerMessageId?: string;
  metadataJson?: string;
  createdAt: string;
  updatedAt: string;
};

export type CommsDeliveryEventRecord = {
  id: string;
  vendor: string;
  eventType: string;
  providerEventId?: string;
  messageId?: string;
  payloadJson: string;
  receivedAt: string;
};

export type SendCommsInput = {
  channel: CommsChannel;
  vendor: string;
  idempotencyKey: string;
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  from?: string;
  metadata?: Record<string, string>;
};

export type SendCommsDriverInput = Omit<SendCommsInput, "vendor">;

export type CommsDriverSendResult = {
  providerMessageId: string;
  status: CommsMessageStatus;
};

export type CommsWebhookEvent = {
  eventType: string;
  providerEventId?: string;
  providerMessageId?: string;
  status?: CommsMessageStatus;
  raw: unknown;
};

export type CommsDriver = {
  vendor: string;
  channels: readonly CommsChannel[];
  send(input: SendCommsDriverInput): Promise<CommsDriverSendResult>;
  verifyWebhook?(input: {
    rawBody: string | Buffer | Record<string, unknown>;
    headers: HeaderBag;
  }): boolean | Promise<boolean>;
  parseWebhook?(input: {
    rawBody: string | Buffer | Record<string, unknown>;
    headers: HeaderBag;
  }): Promise<CommsWebhookEvent[]>;
};

export type CommsStore = {
  findMessageByIdempotencyKey(
    vendor: string,
    idempotencyKey: string,
  ): Promise<CommsMessageRecord | null>;
  insertMessage(input: {
    id: string;
    channel: CommsChannel;
    vendor: string;
    idempotencyKey: string;
    status: CommsMessageStatus;
    to: string;
    subject?: string;
    providerMessageId?: string;
    metadataJson?: string;
  }): Promise<CommsMessageRecord>;
  getMessageById(id: string): Promise<CommsMessageRecord | null>;
  updateMessage(
    id: string,
    patch: Partial<Pick<CommsMessageRecord, "status" | "providerMessageId">>,
  ): Promise<CommsMessageRecord>;
  appendDeliveryEvent(input: {
    id: string;
    vendor: string;
    eventType: string;
    providerEventId?: string;
    messageId?: string;
    payloadJson: string;
  }): Promise<CommsDeliveryEventRecord>;
  findMessageByProviderId(
    vendor: string,
    providerMessageId: string,
  ): Promise<CommsMessageRecord | null>;
};

export type CommsHubConfig = {
  drivers: Record<string, CommsDriver>;
  store: CommsStore;
};

export type CommsHub = {
  send(input: SendCommsInput): Promise<CommsMessageRecord>;
  getMessage(id: string): Promise<CommsMessageRecord>;
  handleWebhook(input: {
    vendor: string;
    rawBody: string | Buffer | Record<string, unknown> | object;
    headers: HeaderBag;
  }): Promise<{ events: CommsDeliveryEventRecord[] }>;
};
