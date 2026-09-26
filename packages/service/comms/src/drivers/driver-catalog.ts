import type { CommsChannel } from "../core/types.js";

export const COMMS_PRESET_VENDORS = [
  "sendgrid",
  "postmark",
  "mailgun",
  "twilio",
  "vonage",
  "meta_whatsapp",
  "memory",
] as const;

export type CommsPresetVendor = (typeof COMMS_PRESET_VENDORS)[number];

export type CommsPresetVendorMeta = {
  id: CommsPresetVendor;
  label: string;
  channels: CommsChannel[];
  factory: string;
  exportPath: string;
};

export const COMMS_PRESET_VENDOR_CATALOG: readonly CommsPresetVendorMeta[] = [
  {
    id: "sendgrid",
    label: "SendGrid",
    channels: ["email"],
    factory: "createSendGridEmailDriver",
    exportPath: "@eristack/comms/sendgrid",
  },
  {
    id: "postmark",
    label: "Postmark",
    channels: ["email"],
    factory: "createPostmarkEmailDriver",
    exportPath: "@eristack/comms/postmark",
  },
  {
    id: "mailgun",
    label: "Mailgun",
    channels: ["email"],
    factory: "createMailgunEmailDriver",
    exportPath: "@eristack/comms/mailgun",
  },
  {
    id: "twilio",
    label: "Twilio",
    channels: ["sms", "whatsapp"],
    factory: "createTwilioDriver",
    exportPath: "@eristack/comms/twilio",
  },
  {
    id: "vonage",
    label: "Vonage (Nexmo)",
    channels: ["sms"],
    factory: "createVonageSmsDriver",
    exportPath: "@eristack/comms/vonage",
  },
  {
    id: "meta_whatsapp",
    label: "Meta WhatsApp Cloud",
    channels: ["whatsapp"],
    factory: "createMetaWhatsAppDriver",
    exportPath: "@eristack/comms/meta-whatsapp",
  },
] as const;
