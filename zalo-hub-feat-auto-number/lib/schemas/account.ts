import { z } from "zod";

const toNumber = (val: any) =>
  val === null || val === undefined || val === "" ? undefined : Number(val);

export const createAccountSchema = z.object({
  userZaloId: z.string().optional(),
  accountStatus: z.preprocess(toNumber, z.number()).optional(),
  avatar: z.string().optional(),
  bgavatar: z.string().optional(),
  bizPkg: z
    .object({
      label: z.union([z.string(), z.any()]).nullable(),
      pkgId: z.preprocess(toNumber, z.number()),
    })
    .optional(),
  cover: z.string().optional(),
  createdTs: z.preprocess(toNumber, z.number()).optional(),
  displayName: z.string().optional(),
  dob: z.preprocess(toNumber, z.number()).optional(),
  gender: z.preprocess(toNumber, z.number()).optional(),
  globalId: z.string().optional(),
  isActive: z.preprocess(toNumber, z.number()).optional(),
  isActivePC: z.preprocess(toNumber, z.number()).optional(),
  isActiveWeb: z.preprocess(toNumber, z.number()).optional(),
  isBlocked: z.preprocess(toNumber, z.number()).optional(),
  isFr: z.preprocess(toNumber, z.number()).optional(),
  isValid: z.preprocess(toNumber, z.number()).optional(),
  accountKey: z.preprocess(toNumber, z.number()).optional(),
  lastActionTime: z.preprocess(toNumber, z.number()).optional(),
  lastUpdateTime: z.preprocess(toNumber, z.number()).optional(),
  oaInfo: z.any().optional(),
  oa_status: z.any().optional(),
  phoneNumber: z.string().optional(),
  sdob: z.string().optional(),
  status: z.string().optional(),
  type: z.preprocess(toNumber, z.number()).optional(),
  userKey: z.string().optional(),
  user_mode: z.preprocess(toNumber, z.number()).optional(),
  username: z.string().optional(),
  zaloName: z.string().optional(),
  imei: z.string().optional(),
  cookies: z.string().optional(),
  userAgent: z.string().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema.partial();
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
