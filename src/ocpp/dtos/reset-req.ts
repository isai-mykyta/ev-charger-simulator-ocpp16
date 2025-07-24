import { IsEnum, IsNotEmpty } from "class-validator";

import { ResetType } from "../types";

export class ResetReqDto {
  @IsNotEmpty()
  @IsEnum(ResetType)
  public type: ResetType;
}
