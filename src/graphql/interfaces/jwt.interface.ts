import { JWTHeader } from "./jwt-header.interface";
import { JWTPayload } from "./jwt-payload.interface";

export interface JWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;

}